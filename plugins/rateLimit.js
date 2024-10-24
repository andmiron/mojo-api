import fp from 'fastify-plugin'
import rateLimit from '@fastify/rate-limit'

async function rateLimitPlugin (fastify, opts) {
  fastify.register(rateLimit)
}

export default fp(rateLimitPlugin)
