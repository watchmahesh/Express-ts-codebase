import asyncWrapper from '@utils/asyncWrapper'
import userAuthservice from '@services/auth.services'
import { returnResponse } from '@utils/returnResponse'

export const login = asyncWrapper(async (req, res) => {
  const { email, password } = req.body
  const returns = await userAuthservice.login(
    email,
    password,
  )
  returnResponse(res, returns)
})

export const register = asyncWrapper(async ({ body }, res) => {
  const returns = await userAuthservice.register(body)
  returnResponse(res, returns)
})

export const verificationRequest = asyncWrapper(async (req, res) => {
  const returns = await userAuthservice.verificationRequest(req.user.email)
  returnResponse(res, returns)
})

export const verifyUser = asyncWrapper(async ({ body }, res) => {
  const { key, code } = body
  const returns = await userAuthservice.verifyUser(key, code)
  returnResponse(res, returns)
})

export const profile = asyncWrapper(async (req, res) => {
  const user = req.user
  const returns = await userAuthservice.profile(user._id, user.role)
  returnResponse(res, returns)
})

export const updateProfile = asyncWrapper(async (req, res) => {
  const user = req.user
  const resBody = req.body
  const returns = await userAuthservice.updateProfile(
    user._id,
    resBody,
    user.role
  )
  returnResponse(res, returns)
})

export const removeImages = asyncWrapper(async (req, res) => {
  const user = req.user
  const resBody = req.body
  const returns = await userAuthservice.removeImage(
    user._id,
    user.role,
    resBody
  )
  returnResponse(res, returns)
})

//test
export const deleteUser = asyncWrapper(async ({ params: { userId } }, res) => {
  const returns = await userAuthservice.deleteUser(userId)
  returnResponse(res, returns)
})

export const credManager = asyncWrapper(async (req, res) => {
  const user = req.user
  const { oldPassword, newPassword } = req.body
  const returns = await userAuthservice.updateCredential(
    user._id,
    oldPassword,
    newPassword
  )
  returnResponse(res, returns)
})

export const forgotPasswordRequest = asyncWrapper(async (req, res) => {
  const email = req.body.email as string
  const returns = await userAuthservice.requestForgotPassword(email)
  returnResponse(res, returns)
})

export const forgotPasswordTokenRequest = asyncWrapper(async (req, res) => {
  const { key, code } = req.body
  const returns = await userAuthservice.requestTokenForPasswordChanges(
    key,
    code
  )
  returnResponse(res, returns)
})

export const changeForgotPassword = asyncWrapper(async (req, res) => {
  const { token, newPassword } = req.body
  const returns = await userAuthservice.changePasswordFromToken(
    token,
    newPassword
  )
  returnResponse(res, returns)
})

export const changePassword = asyncWrapper(async (req, res) => {
  const { oldPassword, newPassword } = req.body as {
    oldPassword: string
    newPassword: string
  }
  const response = await userAuthservice.changePassword(
    req.user._id,
    oldPassword,
    newPassword
  )
  returnResponse(res, response)
})
