import { Document, model, Schema } from 'mongoose'
import { IRole } from 'interfaces/role'
export const roles = ['ADMIN', 'USER', 'TRAINER']
const status = ['ACTIVE', 'INACTIVE', 'BANNED']

const UserSchema = new Schema(
  {
    firstName: String,
    lastName: String,
    avatar: String,

    email: {
      type: String,
      required: true
    },
    password: {
      type: String,
      select: false,
      required: true,
      minLength: 8
    },

    profileCompleted: {
      type: Boolean,
      default: false
    },
    role: {
      type: String,
      enum: roles,
      default: 'USER'
    },
    authProviderId: String,
    status: {
      type: String,
      enum: status,
      default: 'INACTIVE'
    },

  },
  { timestamps: true }
)
export interface IUser extends Document {
  firstName: string
  lastName: string
  avatar: string
  email: string
  password: string
  userSecret?: string
  profileCompleted: boolean
  role: IRole
  status: string
}

const User = model<IUser>('User', UserSchema)

export default User
