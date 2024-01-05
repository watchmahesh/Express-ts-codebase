import config from '@config/index'
import { CorsOptions } from 'cors'

const originRegex = new RegExp(config.app.originRegex)
const allowedOrigins = config.app.allowedOrigins.split(',')

export const corsOption: CorsOptions = {
  credentials: true,
  methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
  origin: function (origin, callback) {
    if (!origin) {
      callback(null, true)
      return
    }
    if (allowedOrigins.indexOf(origin) !== -1 || originRegex.test(origin)) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  }
}
