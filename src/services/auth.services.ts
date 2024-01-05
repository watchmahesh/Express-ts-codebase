import {
  getCredentialsUser,
} from '@helpers/auth'
import { successAuth, errorAuth, passwordError } from '@constants/auth.constant'
import bcrypt from 'bcryptjs'
import User, { IUser } from '@models/user.model'
import { genAccessToken } from '@utils/jwt'
import { genRandomNumber } from '@helpers/generator'
import { IReturnResponse } from '@interfaces/response'
import Token from '@models/token.model'
import crypto from 'crypto'
import { ACTIVE_STATUS } from '@constants/status.constant'
import { ADMIN_ROLE, USER_ROLE } from '@constants/role.constant'
import { sendEmail } from '@utils/mail'
import config from '@config/index'
import { unlinkMedia } from '@helpers/unlink'
import { updateUserSecret } from '@utils/jwt'
import { isPasswordStrong } from '@helpers/password'

const userAuthservice = {
  login: async (email: string, password: string): Promise<IReturnResponse> => {
    let userData: Partial<IUser> = {}
    let queryParam = {}
    userData = await getCredentialsUser(email, password)
    queryParam = { email: userData.email }
    if (!userData) {
      return {
        ok: false,
        status: 401,
        data: {},
        message: errorAuth.login.authProvider.notFound
      }
    }

    const user = await User.findOneAndUpdate(
      queryParam,
      {
        $setOnInsert: {
          ...userData
        }
      },
      { new: true, upsert: true }
    )
      .select('email name  status role ')
      .lean()
    const accessToken = await genAccessToken(user)
    const refreshToken = await genAccessToken(user, true)
    return {
      ok: true,
      status: successAuth.login.status,
      message: successAuth.login.msg,
      data: {
        ...user,
        accessToken: accessToken,
        refreshToken: refreshToken
      }
    }
  },

  //test only
  deleteUser: async (userId: string): Promise<IReturnResponse> => {
    await User.findOneAndDelete({ _id: userId })
    return {
      ok: true,
      data: {},
      message: 'User deleted successfully'
    }
  },

  //user registration based on credentials only
  register: async (userInfo: IUser): Promise<IReturnResponse> => {
    const user = await User.findOne({ email: userInfo.email })
    if (user)
      return {
        ok: false,
        data: {},
        status: errorAuth.login.alreadyExist.detail.status,
        message: errorAuth.login.alreadyExist.detail.msg
      }
    const hashedPassword = bcrypt.hashSync(userInfo.password)
    delete userInfo['userSecret']
    delete userInfo['status']
    if (!new Array(USER_ROLE).includes(userInfo['role']))
      userInfo['role'] = USER_ROLE
    const newUser = await User.create({
      ...userInfo,
      password: hashedPassword
    })
    return {
      ok: true,
      status: successAuth.register.status,
      message: successAuth.register.msg,
      data: {
        email: newUser.email,
        role: newUser.role
      }
    }
  },
  profile: async (
    user: IUser['_id'],
    role: string
  ): Promise<IReturnResponse> => {
    const currentUser = await User.findOne({ _id: user }).exec()
    return {
      ok: true,
      data: currentUser
    }
  },
  removeImage: async (
    user: IUser['_id'],
    userRole: IUser['role'],
    info: {
      certificate: string
      image: string
    }
  ): Promise<IReturnResponse> => {
    const { certificate, image } = info
    unlinkMedia(certificate)
    unlinkMedia(image)
    const prevResult = await User.findOne({ _id: user }).exec()
    await prevResult.save()

    return {
      ok: true,
      data: prevResult,
      message: 'Image removed successfully'
    }
  },
  updateProfile: async (
    userId: IUser['_id'],
    userInfo: IUser,
    userRole: string
  ): Promise<IReturnResponse> => {
    const prevProfile = await User.findOne({ _id: userId }).exec()

    if (userInfo) {
      delete userInfo['password']
      delete userInfo['status']
      delete userInfo['role']
      delete userInfo['userSecret']
      delete userInfo['email']
    }

    let params: { [key: string]: any } = prevProfile.toObject()
    let updateParams: { [key: string]: any } = {}

    delete params['status']
    delete params['profileCompleted']
    if (userRole === ADMIN_ROLE) {
      updateParams['$unset'] = { trainerInfo: 1, userInfo: 1 }

    }
    if (userRole === USER_ROLE) {
      updateParams['$unset'] = { trainerInfo: 1 }
    }



    const currentUser = await User.findOneAndUpdate(
      { _id: userId },
      { ...updateParams, ...params },
      { new: true }
    ).exec()

    if (userInfo.avatar && prevProfile.avatar != userInfo.avatar) {
      unlinkMedia(prevProfile.avatar)
    }

    return {
      ok: true,
      data: currentUser
    }
  },
  updateCredential: async (
    userId: IUser['_id'],
    oldPassword: string,
    newPassword: string
  ): Promise<IReturnResponse> => {
    const checkUser = await User.findOne({ _id: userId }).select('password')
    if (!checkUser) {
      return {
        ok: false,
        message: 'User not found',
        status: 404,
        data: {}
      }
    }
    const comparePassword = bcrypt.compareSync(oldPassword, checkUser.password)
    if (!comparePassword) {
      return {
        ok: false,
        message: 'Old password not matched !',
        status: 401,
        data: {}
      }
    }
    const generatedPassword = bcrypt.hashSync(newPassword, 10)
    await updateUserSecret(checkUser._id)
    const updatedUser = await User.findOneAndUpdate(
      { _id: checkUser._id },
      {
        password: generatedPassword
      }
    )
    return {
      ok: true,
      data: updatedUser
    }
  },

  verificationRequest: async (email: string) => {
    const user = await User.findOne({
      email
    })
    if (!user) {
      return {
        ok: false,
        status: 404,
        data: {},
        message: 'User not found'
      }
    }
    if (user.status === ACTIVE_STATUS) {
      return {
        ok: false,
        status: 400,
        data: {},
        message: 'Your account is already verified'
      }
    }
    await Token.findOneAndDelete({
      user: user._id,
      type: 'verification'
    })
    // Create a verification token for this user
    const token = await Token.create({
      user: user.id,
      token: genRandomNumber(),
      key: crypto.randomBytes(32).toString('hex'),
      type: 'verification'
    })
    const mailRes = await sendEmail(
      [user.email],
      'Account verification code',
      `<p>Your verification code is: ${token.token}</p>
      <p>Note: This verification code will be expired after 5minutes</p>`
    )
    return {
      ok: true,
      status: mailRes.status,
      data: { key: token.key },
      message: mailRes.msg
    }
  },

  verifyUser: async (key: string, token: string) => {
    const dbToken = await Token.findOne({
      key: key,
      token: token,
      type: 'verification'
    })
    if (!dbToken) {
      return {
        ok: false,
        data: {},
        message: 'Token expired or invalid',
        status: 400
      }
    }
    await User.findByIdAndUpdate(dbToken.user, {
      status: ACTIVE_STATUS
    })
    await Token.findOneAndDelete({
      token: token,
      type: 'verification'
    })
    return {
      ok: true,
      data: {},
      message: 'Account verified successfully'
    }
  },

  requestForgotPassword: async (email: string) => {
    const user = await User.findOne({
      email
    })
    if (!user) {
      return {
        ok: false,
        status: 404,
        data: {},
        message: 'User not found'
      }
    }
    await Token.findOneAndDelete({
      user: user._id,
      type: 'forgot-password'
    })
    // Create a verification token for this user
    const token = await Token.create({
      user: user.id,
      token: genRandomNumber(),
      key: crypto.randomBytes(32).toString('hex'),
      type: 'forgot-password'
    })
    const mailRes = await sendEmail(
      user.role === ADMIN_ROLE ? [config.mail.receiver] : [user.email],
      'Password verification code',
      `<p>Your confirmation code is: ${token.token}</p>
      <p>Note: This verification code will be expired after 5minutes</p>`
    )
    return {
      ok: true,
      status: mailRes.status,
      data: { key: token.key },
      message: mailRes.msg
    }
  },
  requestTokenForPasswordChanges: async (key: string, code: string) => {
    const dbToken = await Token.findOneAndUpdate(
      {
        key: key,
        type: 'forgot-password'
      },
      {
        $inc: {
          count: 1
        }
      },
      {
        new: true
      }
    )

    if (!dbToken) {
      return {
        ok: false,
        status: 400,
        data: {},
        message: 'Code expired or invalid'
      }
    }

    if (dbToken.count > 5) {
      dbToken.deleteOne()
      return {
        ok: false,
        data: {},
        message: 'Too many requests'
      }
    }
    if (dbToken.token !== String(code)) {
      return {
        ok: false,
        status: 400,
        data: {},
        message: 'Invalid code, Please try again'
      }
    }

    await Token.findOneAndDelete({
      key: key,
      type: 'forgot-password'
    })
    // Create a verification token for this user
    const token = await Token.create({
      user: dbToken.user,
      token: crypto.randomBytes(32).toString('hex'),
      type: 'forgot-password'
    })
    return {
      ok: true,
      data: {
        token: token.token
      }
    }
  },
  changePasswordFromToken: async (token: string, newPassword: string) => {
    const dbToken = await Token.findOne({
      token: token,
      type: 'forgot-password'
    })
    if (!dbToken) {
      return {
        ok: false,
        data: {},
        message: 'Token expired or invalid',
        status: 400
      }
    }

    await User.findByIdAndUpdate(dbToken.user, {
      password: bcrypt.hashSync(newPassword, 10)
    })
    await Token.findOneAndDelete({
      token: token,
      type: 'forgot-password'
    })
    await updateUserSecret(dbToken.user)
    return {
      ok: true,
      data: {},
      message: 'Password changed successfully'
    }
  },
  changePassword: async (
    userId: IUser['_id'],
    oldPassword: string,
    newPassword: string
  ): Promise<IReturnResponse> => {
    if (!oldPassword || !newPassword) {
      return {
        ok: false,
        status: 400,
        data: {},
        message: 'Please provide your old and new password'
      }
    }

    const user = await User.findById(userId).select('password')
    if (!user) {
      return {
        ok: false,
        status: 404,
        data: {},
        message: 'User not found'
      }
    }

    const isOldPasswordCorrect = await bcrypt.compare(
      oldPassword,
      user.password
    )
    if (!isOldPasswordCorrect) {
      return {
        ok: false,
        status: 400,
        data: {},
        message: 'Old password is incorrect. Please try again'
      }
    }

    const isNewPasswordSameAsOld = await bcrypt.compare(
      newPassword,
      user.password
    )
    if (isNewPasswordSameAsOld) {
      return {
        ok: false,
        status: 400,
        data: {},
        message: 'New password cannot be same as old password'
      }
    }

    if (!isPasswordStrong(newPassword)) {
      return {
        ok: false,
        status: passwordError.notStrongEnough.status,
        message: passwordError.notStrongEnough.msg,
        data: {}
      }
    }

    const newHashedPassword = await bcrypt.hash(newPassword, 10)
    await updateUserSecret(user._id)
    user.password = newHashedPassword
    await user.save()

    return {
      ok: true,
      status: 200,
      message: 'Password changed successfully. Please login again',
      data: {}
    }
  }
}

export default userAuthservice
