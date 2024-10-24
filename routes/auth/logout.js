export default async function logoutRoute (fastify, opts) {
  fastify.route({
    method: 'POST',
    url: '/logout',
    schema: {
      description: 'User logout route',
      tags: ['auth'],
      headers: {
        type: 'object',
        properties: {
          cookie: {
            description: 'JWT access token in cookie headers as "accessToken=token"',
            type: 'string',
            pattern: 'accessToken=.*'
          }
        },
        required: ['cookie']
      },
      response: {
        200: {
          description: 'User successfully logged out',
          type: 'object',
          properties: {
            success: { type: 'boolean', default: true },
            message: { type: 'string' }
          }
        },
        401: {
          description: 'User is not logged in',
          $ref: 'HttpError'
        },
        500: {
          description: 'Internal server error',
          $ref: 'HttpError'
        }
      }
    },
    onRequest: [fastify.authenticate],
    handler: async function (request, reply) {
      try {
        reply.clearCookie('accessToken').send({
          success: true,
          message: 'Logged out successfully'
        })
      } catch (err) {
        throw fastify.httpErrors.internalServerError('Error logging out')
      }
    }
  })
}
