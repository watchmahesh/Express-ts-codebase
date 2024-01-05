import User from '@models/user.model'
import bcrypt from 'bcryptjs'


export const getCredentialsUser = async (email: string, password: string) => {
  const user = await User.findOne({ email })
    .select('email password userSecret authProvider')
    .lean()

  if (!user) {
    const err = new Error()
    err.name = 'user'
    err.message = 'User not found'
    throw err
  }

  const isValid = bcrypt.compareSync(password, user?.password)
  if (!isValid) {
    {
      const err = new Error()
      err.name = 'user'
      err.message = 'Email or password is invalid'
      throw err
    }
  }
  delete user['password']
  return { ...user }
}
