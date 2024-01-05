export interface IReturnResponse {
  ok: boolean
  message?: string
  status?: number
  data?: any
  currentPage?: number
  totalPage?: number
  limit?: number
  total?: number
}
