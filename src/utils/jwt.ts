import jwt, { verify } from 'jsonwebtoken'
import config from '@config/index'
import crypto from 'crypto'
import User, { IUser } from '@models/user.model'

export interface IDecodedToken {
  _id: string
  name: string
  email: string
  role: string
  iat: number
  exp: number
  aud: string
}

export const genAccessToken = (user: IUser | any,isPrivate: boolean = false) => {
  return new Promise((resolve, reject) => {
    try {
      const accessToken = jwt.sign(
        { _id: user._id || user.authProviderId }, config.jwt.secretAccess,
        {
          expiresIn: config.jwt.token_access_ttl,
          issuer: config.jwt.issuer,
          audience: user.toString()
        }
      )
      resolve(accessToken)
    } catch (err) {
      reject(err)
    }
  })
}

export const verifyAccessToken = (token: string) => {
  return new Promise((resolve, reject) => {
    try {
      const decodedToken = verify(token, config.jwt.secretAccess, {
        issuer: config.jwt.issuer
      }) as IDecodedToken
      resolve(decodedToken)
    } catch (err) {
      reject(err)
    }
  })
}

export const verifyUserToken = (
  token: string,
  userSecret: IUser['userSecret']
) => {
  return new Promise((resolve, reject) => {
    try {
      const decodedToken = verify(token, userSecret, {
        issuer: config.jwt.issuer
      }) as IDecodedToken
      resolve(decodedToken)
    } catch (err) {
      reject(err)
    }
  })
}

export const updateUserSecret = (user: IUser['_id']) => {
  return new Promise(async (resolve, reject) => {
    try {
      const newSecret = crypto.randomBytes(32).toString('hex')
      await User.findOneAndUpdate({ _id: user._id }, { userSecret: newSecret })
      resolve(newSecret)
    } catch (err) {
      reject(err)
    }
  })
}
