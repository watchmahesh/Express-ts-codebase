import User from '@models/user.model'
import bcrypt from 'bcryptjs'
import crypto from 'crypto'

const users = [
  {
    firstName: 'ADMIN',
    lastName: 'USER',
    email: 'admin@gmail.com',
    password: bcrypt.hashSync('hello123', 10),
    userSecret: crypto.randomBytes(32).toString('hex'),
    role: 'ADMIN',
    status: 'ACTIVE'
  },

]

export default async function seedUsers() {
  await User.insertMany(users)

  console.log('Users seeded ✅✅✅')
}
