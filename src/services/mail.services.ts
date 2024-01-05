import { sendEmail } from '@utils/mail'
import config from '@config/index'

const mailService = {
  sendMail: async (email: string, message: string) => {
    const mailResponse = sendEmail(
      [config.mail.receiver],
      'User Feedback Message',
      `<p>From: ${email}</p>
      <p>${message}</p>`
    )
    return {
      ok: true,
      data: mailResponse,
      message: 'Mail sent successfully!'
    }
  }
}

export default mailService
