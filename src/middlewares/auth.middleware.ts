import User from '@models/user.model'
import { verifyAccessToken, verifyUserToken, IDecodedToken } from '@utils/jwt'
import {
  tokenError,
  keyError,
  accountStatusError
} from '@constants/auth.constant'
import asyncWrapper from '@utils/asyncWrapper'
import { IRole } from '@interfaces/role'
import { returnResponse } from '@utils/returnResponse'
import config from '@config/index'
import { ACTIVE_STATUS } from '@constants/status.constant'

export const verifyRequest = asyncWrapper(async (req, res, next) => {
  const keyHeader = req.headers['api-key'] as string
  const keyQuery = req.query['api-key'] as string

  if (!keyHeader && !keyQuery)
    return returnResponse(res, {
      ok: false,
      status: keyError.notFound.status,
      message: keyError.notFound.msg
    })

  const configHeader = config.app.headerToken
  const configQuery = config.app.queryToken
  if (keyHeader === configHeader || keyQuery === configQuery) {
    next()
  } else {
    return returnResponse(res, {
      ok: false,
      status: keyError.invalid.status,
      message: keyError.invalid.msg
    })
  }
})

export const verifyTokenOnly = asyncWrapper(async (req, res, next) => {
  const { authorization } = req.headers
  const accessToken = authorization?.split('Bearer ')[1]
  if (!accessToken)
    return returnResponse(res, {
      ok: false,
      status: tokenError.invalid.status,
      message: tokenError.invalid.msg
    })

  const decoded = (await verifyAccessToken(accessToken)) as IDecodedToken
  const user = await User.findById(decoded._id).select('+userSecret -password')
  if (!user)
    return returnResponse(res, {
      ok: false,
      status: tokenError.notFound.status,
      message: tokenError.notFound.msg
    })



  req.user = user
  next()
})

export const verifyToken = asyncWrapper(async (req, res, next) => {
  const { authorization, usersecret } = req.headers
  const accessToken = authorization?.split('Bearer ')[1]
  if (!accessToken)
    return returnResponse(res, {
      ok: false,
      status: tokenError.invalid.status,
      message: tokenError.invalid.msg
    })

  const decoded = (await verifyAccessToken(accessToken)) as IDecodedToken
  const user = await User.findById(decoded._id).select('+userSecret -password')
  if (!user)
    return returnResponse(res, {
      ok: false,
      status: tokenError.notFound.status,
      message: tokenError.notFound.msg
    })

  //decode user once access token is verified
  await verifyUserToken(usersecret?.toString(), user.userSecret)
  if (!user)
    return returnResponse(res, {
      ok: false,
      status: tokenError.notFound.status,
      message: tokenError.notFound.msg
    })

  if (user.status !== ACTIVE_STATUS)
    return returnResponse(res, {
      ok: false,
      status: accountStatusError.invalid.status,
      message: accountStatusError.invalid.msg
    })
  req.user = user
  next()
})

export const hasRole = (roles: IRole[]) => {
  return asyncWrapper(async (req, res, next) => {
    const { role } = req.user
    if (!roles.includes(role)) {
      return returnResponse(res, {
        ok: false,
        status: 401,
        message: `You don't have enought permission`
      })
    }
    next()
  })
}
