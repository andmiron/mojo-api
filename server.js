import Fastify from 'fastify'
import build from './app.js'
import closeWithGrace from 'close-with-grace'

const server = Fastify({
  logger: {
    transport: {
      target: 'pino-pretty'
    }
  }
})

server.register(build)

closeWithGrace(async function ({ signal, err, manual }) {
  if (err) {
    server.log.fatal({ err }, 'server closing with error')
  } else {
    server.log.warn(`${signal} received, server closing`)
  }
  await server.close()
})

try {
  await server.listen({ port: process.env.PORT })
} catch (err) {
  server.log.fatal(err.message)
  await server.close()
}
