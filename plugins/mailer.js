import fp from 'fastify-plugin'
import fastifyMailer from 'fastify-mailer'

async function mailerPlugin (fastify, opts) {
  fastify.register(fastifyMailer, {
    transport: {
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      auth: {
        user: process.env.SMTP_USERNAME,
        pass: process.env.SMTP_PASSWORD
      }
    }
  })
}

export default fp(mailerPlugin)
