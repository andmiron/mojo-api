import { Queue, Worker } from 'bullmq'
import fp from 'fastify-plugin'

async function bullPlugin (fastify, opts) {
  const connection = {
    connection: {
      host: process.env.REDIS_HOST,
      port: process.env.REDIS_PORT,
      password: process.env.REDIS_PASSWORD
    }
  }
  const emailQueue = new Queue('emailQueue', connection)

  const sendConfirmationEmailWorker = new Worker('emailQueue', async job => {
    const { email: to, subject, token, host, protocol } = job.data
    const confirmationLink = `${protocol}://${host}/verify?token=${token}`
    const emailInfo = await fastify.mailer.sendMail({
      from: 'MOJO',
      to,
      subject,
      text: confirmationLink,
      html: `<a>${confirmationLink}</a>`
    })
    return emailInfo.accepted[0]
  }, connection)

  sendConfirmationEmailWorker.on('completed', (job, returnValue) => {
    fastify.log.info(`Confirmation email has been sent to: ${returnValue}`)
  })

  sendConfirmationEmailWorker.on('failed', (job, error) => {
    fastify.log.warn('Error sending a confirmation link', error)
  })

  fastify.decorate('emailQueue', emailQueue)
}

export default fp(bullPlugin)
