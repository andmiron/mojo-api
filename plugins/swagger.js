import fp from 'fastify-plugin'
import swagger from '@fastify/swagger'
import swaggerUI from '@fastify/swagger-ui'

async function swaggerPlugin (fastify, opts) {
  const swaggerOptions = {
    swagger: {
      info: {
        title: 'MOJO',
        description: 'Documentation for API endpoints.',
        version: '1.0.0'
      },
      tags: [
        { name: 'auth', description: 'Authentication related end-points' },
        {
          name: 'healthcheck',
          description: 'API and database health check'
        }
      ],
      schemes: ['http', 'https'],
      consumes: ['application/json'],
      produces: ['application/json']
    }
  }
  const swaggerUiOptions = {
    routePrefix: '/docs',
    exposeRoute: true
  }

  fastify.register(swagger, swaggerOptions)
  fastify.register(swaggerUI, swaggerUiOptions)
}

export default fp(swaggerPlugin)
