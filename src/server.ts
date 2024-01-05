import express, { Express } from 'express'
import cors from 'cors'
import morgan from 'morgan'
import 'module-alias/register'
import config from '@config/index'
import v1Router from '@routes/index'
import db from '@config/db'
import { Server } from 'socket.io'
import { createServer } from 'http'
import { corsOption } from '@utils/cors'
import { globalErrorHandlers, notFoundHandlers } from '@helpers/handlers'

const app: Express = express()
const httpServer = createServer(app)

const PORT = config.app.port
const HOST = config.app.host
export const IO = new Server(httpServer, {
  cors: corsOption
})

app.use(express.static('public'))
app.use(morgan(config.app.morganLevel))

app.use(cors(corsOption))
app.use(express.json())
app.use('/api', v1Router)
app.use(notFoundHandlers)
app.use(globalErrorHandlers)
db.on('error', console.error.bind(console, 'MongoDB connection error:'))
db.on('close', () => {
  console.log('DB connection is close')
})
db.once('open', () => {
  console.log('Connected to MongoDB database!')
})

const server = httpServer.listen(PORT, () => {
  console.log(`⚡️[server]: Server is running at http://${HOST}:${PORT} 🚀`)
})

process.on('unhandledRejection', () => {
  console.log('UNHANDLED REJECTION! Shutting down...')
  server.close(() => {
    process.exit(1)
  })
})

process.on('uncaughtException', err => {
  console.log('ERROR: ', err)
  console.log('UNCAUGHT EXCEPTION! Shutting down...')
  process.exit(1)
})
