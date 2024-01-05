import { Request, Response, NextFunction, RequestHandler } from 'express'
import { IUser } from '@models/user.model'

declare global {
  namespace Express {
    interface Request {
      user: IUser
    }
  }
}

type AsyncRequestHandler = (
  req: Request,
  res: Response,
  next: NextFunction
) => Promise<void>

function asyncWrapper(fn: AsyncRequestHandler): RequestHandler {
  return (req: Request, res: Response, next: NextFunction): void => {
    fn(req, res, next).catch(err => {
      if (process.env.NODE_ENV != 'production') console.log(err)
      switch (err?.name) {
        case 'ValidationError':
          res.status(400).json({
            ok: false,
            status: 400,
            error: true,
            data: null,
            message: err?.message || 'something went wrong',
            stack: err?.stack
          })
          break
        case 'user':
          res.status(401).json({
            ok: false,
            status: 401,
            error: true,
            data: null,
            message: err?.message || 'Something went wrong',
            stack: err?.stack
          })
          break
        case 'JsonWebTokenError':
          res.status(401).json({
            ok: false,
            status: 401,
            error: true,
            data: null,
            message: 'Session expired, Please login again',
            stack: err?.stack
          })
          break
        case 'TokenExpiredError':
          res.status(401).json({
            ok: false,
            status: 401,
            error: true,
            data: null,
            message: 'Session expired, Please login again',
            stack: err?.stack
          })
          break
        default:
          res.status(400).json({
            ok: false,
            status: 400,
            error: true,
            data: null,
            message: err?.message || 'something went wrong',
            stack: err?.stack
          })
          break
      }
    })
  }
}

export default asyncWrapper
