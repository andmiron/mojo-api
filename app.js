import path from 'path'
import AutoLoad from '@fastify/autoload'
import { fileURLToPath } from 'url'
import * as dotenv from 'dotenv'
dotenv.config()

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export default async function (fastify, opts) {
  await fastify.register(AutoLoad, {
    dir: path.join(__dirname, 'plugins')
  })

  await fastify.register(AutoLoad, {
    dir: path.join(__dirname, 'routes'),
    options: Object.assign({ prefix: '/api/v1' }, opts)
  })
}
