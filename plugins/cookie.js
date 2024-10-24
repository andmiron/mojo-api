import fp from 'fastify-plugin'
import fastifyCookie from '@fastify/cookie'

export default fp(async function (fastify, opts) {
  fastify.register(fastifyCookie)
})
