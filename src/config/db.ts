import mongoose from 'mongoose'
import config from '../config'
const MONGO_URI = config.db.mongo_uri

mongoose.set('debug', config.app.isDev)
mongoose.set('strictQuery', config.db.strictDB)
mongoose.connect(MONGO_URI).catch(console.error)
const db = mongoose.connection

export default db
