import * as argon2 from 'argon2'
import { randomBytes } from 'node:crypto'

export default async function signupRoute (fastify, opts) {
  fastify.route({
    method: 'POST',
    url: '/signup',
    schema: {
      description: 'User signup route',
      tags: ['auth'],
      body: {
        type: 'object',
        required: ['email', 'password'],
        additionalProperties: false,
        properties: {
          email: { type: 'string', format: 'email', maxLength: 255 },
          password: { type: 'string', minLength: 8, maxLength: 255 }
        }
      },
      response: {
        201: {
          description: 'User signed up successfully',
          type: 'object',
          properties: {
            success: { type: 'boolean', default: true },
            message: { type: 'string' },
            data: {
              type: 'object',
              properties: {
                userId: { type: 'string', format: 'uuid' },
                email: { type: 'string', format: 'email' }

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
      const hashedPassword = await argon2.hash(password)
      const confirmationToken = randomBytes(32).toString('hex')
      const insertUserQuery = 'INSERT INTO users (email, password, confirmation_token) VALUES ($1,$2,$3) RETURNING id, email'
      const newUserParams = [email, hashedPassword, confirmationToken]
      try {
        const insertQueryResult = await fastify.pg.query(insertUserQuery, newUserParams)
        const { id: newUserId, email: newUserEmail } = insertQueryResult.rows[0]
        await fastify.emailQueue.add('sendEmail', {
          email,
          subject: 'Confirmation email',
          token: confirmationToken,
          host: request.host,
          protocol: request.protocol
        })
        await reply.code(201).send({
          success: true,
          data: {
            userId: newUserId,
            email: newUserEmail
          },
          message: 'User successfully signed up'
        })
      } catch (err) {
        if (err.code === '23505') {
          throw fastify.httpErrors.badRequest('User with this email already exists')
        } else {
          request.log.error('Error signing up user', err)
          throw fastify.httpErrors.internalServerError('Error signing up a user')
        }
      }
    }
  })
}
