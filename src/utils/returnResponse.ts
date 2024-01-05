import { Response } from 'express'
import { IReturnResponse } from '@interfaces/response'

export const returnResponse = async (
  res: Response,
  returns: IReturnResponse
): Promise<void> => {
  const { ok, status } = returns
  if (ok && !status) returns['status'] = 200
  if (!ok && !status) returns['status'] = 500
  if (!ok && status) returns['status'] = status < 501 ? status : 500
  res.status(returns['status']).json(returns)
  return
}
