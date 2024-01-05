import { uploadImages, removeFile } from '@controllers/upload.controller'
import validateImage from '@middlewares/upload.middleware'
import { verifyToken } from '@middlewares/auth.middleware'
import { Router } from 'express'

const uploadRouter = Router()

uploadRouter.use(verifyToken)
uploadRouter.post('/', validateImage.array('files'), uploadImages)
uploadRouter.delete('/remove', removeFile)

export default uploadRouter
