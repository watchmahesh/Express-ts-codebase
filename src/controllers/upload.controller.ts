import asyncWrapper from '@utils/asyncWrapper'
import { returnResponse } from '@utils/returnResponse'
import mediaService from '@services/media.services'

export const uploadImages = asyncWrapper(async (req, res) => {
  if (!req.files.length) throw new Error('Error uploading image')
  const files = req.files as Express.Multer.File[]
  const filePaths = files.map(
    (item: Express.Multer.File) =>
      `uploads/${item.mimetype.startsWith('image') ? 'img' : 'docs'}/${
        item.filename
      }`
  )
  res.status(201).json({
    path: filePaths
  })
})

export const removeFile = asyncWrapper(async (req, res) => {
  const path = req.query.path as string
  const returns = await mediaService.deleteMedia(path)
  returnResponse(res, returns)
})
