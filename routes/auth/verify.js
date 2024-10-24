export default async function verifyRoute (fastify, opts) {
  fastify.route({
    method: 'GET',
    url: '/verify',
    schema: {
      description: 'User verification through email',
      tags: ['auth'],
      querystring: {
        type: 'object',
        properties: {
          token: {
            description: 'Verification token',
            type: 'string'
          }
        },
        required: ['token']
      },
      response: {
        200: {
          description: 'User successfully verified',
          type: 'object',
          properties: {
            success: { type: 'boolean', default: true },
            message: { type: 'string' },
            data: {
              type: 'object',
              properties: {
                userId: { type: 'string', format: 'uuid' }
              }
            }
          }
        },
        400: { description: 'Token is invalid or expired', $ref: 'HttpError' }
      }
    },
    handler: async function (request, reply) {
      const { token: confirmationToken } = request.query
      const verifyUserQuery = `
            UPDATE users
            SET is_confirmed=TRUE, confirmation_token=NULL, confirmation_token_expires_at=NULL
            WHERE confirmation_token=$1
            AND confirmation_token_expires_at > NOW()
            AND is_confirmed=FALSE
            RETURNING id,email;
         `
      const queryResult = await fastify.pg.query(verifyUserQuery, [
        confirmationToken
      ])
      if (!queryResult.rows.length) throw fastify.httpErrors.badRequest('Token is invalid or expired')
      const verifiedUserId = queryResult.rows[0].id
      await reply.send({
        success: true,
        message: 'User successfully verified',
        data: {
          userId: verifiedUserId
        }
      })
    }
  })
}
