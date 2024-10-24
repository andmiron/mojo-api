import fp from 'fastify-plugin'

async function healthcheckRoute (fastify, opts) {
  fastify.get(
    '/health',
    {
      schema: {
        description: 'Health check request',
        tags: ['healthcheck'],
        response: {
          200: {
            description: 'API and DB are healthy',
            type: 'object',
            properties: {
              success: { type: 'boolean', default: true },
              message: { type: 'string' }
            }
          },
          500: {
            description: 'API or DB error',
            $ref: 'HttpError'
          }
        }
      }
    },
    async (request, reply) => {
      try {
        const client = await fastify.pg.connect()
        await client.query('SELECT 1')
        client.release()
        await reply.send({
          success: true,
          message: 'API and database are ok'
        })
      } catch (err) {
        await reply
          .code(500)
          .send({ status: 'ERROR', message: err.message })
      }
    }
  )
}

export default fp(healthcheckRoute)
