import fs from 'fs'
import path from 'path'

export const unlinkMedia = (mediaPath: string): void => {
  try {
    if (!mediaPath) return null
    return fs.unlinkSync(
      path.join(__dirname, '..', '..', 'public/') + mediaPath
    )
  } catch (err) {
    return err
  }
}
