import { Document, model, Schema } from 'mongoose'
import config from '../config'
import { IUser } from './user.model'

const tokenType = ['forgot-password', 'verification']

const TokenSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', index: true },
    token: { type: String, index: true },
    key: { type: String },
    count: { type: Number, default: 0 },
    type: {
      type: String,
      enum: tokenType,
      required: true,
      index: true
    }
  },
  { timestamps: true }
)
TokenSchema.index(
  { createdAt: 1 },
  { expireAfterSeconds: config.mail.token_ttl }
)

export interface IToken extends Document {
  user: IUser['_id']
  token: string
  type: string
  key?: string
  count?: number
}

const Token = model<IToken>('Token', TokenSchema)
export default Token
