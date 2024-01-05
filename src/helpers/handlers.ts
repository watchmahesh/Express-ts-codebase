import { NextFunction, Request, Response } from 'express'
import config from '../config'

export interface IError extends Error {
  statusCode?: number
  fieldname?: string
}

export const notFoundHandlers = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const error: IError = new Error(`API path ${req.originalUrl} not found`)
  error.statusCode = 404
  next(error)
}

export const globalErrorHandlers = (
  error: IError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const { fieldname, statusCode, message, stack } = error
  console.log(error)
  res.status(statusCode || 500).json({
    ok: false,
    error: true,
    fieldname,
    message: message || 'Server Error',
    stack: config.app.isDev ? stack : undefined
  })
  next()
}
