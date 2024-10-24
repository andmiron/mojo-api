import fp from 'fastify-plugin'
import postgresPlugin from '@fastify/postgres'

async function plugin (fastify, opts) {
  fastify.register(postgresPlugin, {
    connectionString: process.env.PG_CONN_STRING,
    ssl: {
      rejectUnauthorized: false
    }
  })

  fastify.after(async (err) => {
    if (err) fastify.log.error(err.message)
    try {
      await fastify.pg.query('SELECT 1')
      fastify.log.info('Postgres connection is ok')
    } catch (err) {
      fastify.log.warn(err, 'Postgres connection error')
    }
  })
}

export default fp(plugin)
