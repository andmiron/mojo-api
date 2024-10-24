import fp from 'fastify-plugin'
import cors from '@fastify/cors'

async function corsPlugin (fastify, opts) {
  await fastify.register(cors)
}

export default fp(corsPlugin)
