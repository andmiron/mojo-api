import fp from 'fastify-plugin'
import FastifyJWT from '@fastify/jwt'

async function authPlugin (fastify, opts) {
  await fastify.register(FastifyJWT, {
    secret: process.env.JWT_SECRET,
    cookie: {
      cookieName: 'accessToken',
      signed: false
    },
    sign: {
      expiresIn: process.env.JWT_EXPIRES_IN
    }
  })

  fastify.decorateRequest('generateToken', function (payload) {
    return fastify.jwt.sign({ ...payload })
  })

  fastify.decorate('authenticate', async function (request, reply) {
    try {
      const { accessToken } = request.cookies
      await request.jwtVerify(accessToken)
    } catch (err) {
      fastify.log.error('JWT verification error', err)
      throw fastify.httpErrors.unauthorized('Invalid or expired token!')
    }
  })
}

export default fp(authPlugin, { name: 'auth-plugin' })
