import multer from 'multer'
import { Request } from 'express'
import config from '@config/index'
import fs from 'fs'
import path from 'path'

interface IError extends Error {
  statusCode?: number
  fieldname?: string
}

const MAX_IMAGE_SIZE = parseInt(config.upload.maxSize) * 1024 * 1024

const imageStorage = (): multer.StorageEngine => {
  return multer.diskStorage({
    destination(_, file: Express.Multer.File, cb: CallableFunction) {
      const fileType = file.mimetype.startsWith('image') ? 'img' : 'docs'
      try {
        const upload_folder = `public/uploads/${fileType}`
        if (!fs.existsSync(upload_folder)) {
          fs.mkdirSync(upload_folder, { recursive: true })
        }
      } catch (error) {
        console.error(error)
        cb(new Error('Error with storage'), `public/uploads/${fileType}`)
      }
      cb(null, `public/uploads/${fileType}`)
    },
    filename(req: Request, file: Express.Multer.File, cb: CallableFunction) {
      cb(
        null,
        `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`
      )
    }
  })
}

const fileFilter = (
  req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  if (
    file.mimetype.startsWith('application/pdf') ||
    file.mimetype.startsWith('image')
  ) {
    return cb(null, true)
  } else {
    const error: IError = new Error('Not an image! Please upload only images')
    error.statusCode = 409
    error.fieldname = file.fieldname
    cb(error)
  }
}

const uploadImage = multer({
  storage: imageStorage(),
  fileFilter: fileFilter,
  limits: { fileSize: MAX_IMAGE_SIZE }
})

export default uploadImage
