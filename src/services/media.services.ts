import { unlinkMedia } from '@helpers/unlink'

const mediaService = {
  deleteMedia: async (path: string) => {
    unlinkMedia(path)
    return {
      ok: true,
      status: 200,
      data: {},
      message: 'File deleted successfully'
    }
  }
}

export default mediaService
