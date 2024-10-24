import * as argon2 from 'argon2'

export default async function loginRoute (fastify, opts) {
  fastify.route({
    method: 'POST',
    url: '/login',
    schema: {
      description: 'User login route',
      tags: ['auth'],
      body: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email: { type: 'string', format: 'email', maxLength: 255 },
          password: { type: 'string', minLength: 8, maxLength: 255 },
          rememberMe: { type: 'boolean', default: false }
        }
      },
      response: {
        200: {
          description: 'User login success',
          type: 'object',
          properties: {
            success: { type: 'boolean', default: true },
            message: { type: 'string' },
            data: {
              type: 'object',
              properties: {
                userId: { type: 'string', format: 'uuid' },
                accessToken: { type: 'string' }
              }
            }
          }
        },
        400: {
          description: 'User signup failed: email already exists',
          $ref: 'HttpError'
        },
        500: {
          description: 'Internal server error',
          $ref: 'HttpError'
        }
      }
    },
    handler: async function (request, reply) {
      const { email, password } = request.body
      const query = 'SELECT password,id from users WHERE email=$1'
      const userPasswordQueryResult = await fastify.pg.query(query, [email])
      if (!userPasswordQueryResult.rows.length) throw fastify.httpErrors.unauthorized('Invalid email or password')
      const { password: hash, id: userId } = userPasswordQueryResult.rows[0]
      const isPasswordValid = await argon2.verify(hash, password)
      if (!isPasswordValid) throw fastify.httpErrors.unauthorized('Invalid email or password')
      const accessToken = request.generateToken({ email, userId })
      await reply
        .setCookie('accessToken', accessToken, {
          path: '/',
          maxAge: 24 * 60 * 60,
          httpOnly: true,
          sameSite: true
        })
        .send({
          success: true,
          message: 'User logged in',
          data: {
            userId,
            accessToken
          }
        })
    }
  })
}
