const express = require('express')
const swaggerUi = require('swagger-ui-express')
const swaggerJsdoc = require('swagger-jsdoc')

module.exports = (authMiddleware, authService, amqpService, db) => {
  const router = express.Router()

  /**
   * @openapi
   * /:
   *  get:
   *    description: Default route
   *    security:
   *	     jwt: [] 
   *    responses:
   *      200:
   *        description: OK
   */
  router.get('/', (req, res, next) => {
    // res.send('Hello world! j650n 6b-integration-tests+jwt')
    res.send('Hello world! j650n')
  })



  // webscoket for completed tasks and todolists
  router.use('/', require('./is_completed')(db))


  // Auth
  router.use('/', require('./auth')(authService))

  // Swagger Docs
  const options = {
    definition: {
      openapi: '3.0.0',
      info: {
        title: 'BD-CRUD-Todo-List',
        version: '8.1.8',
        description: 'This is an interpretation of CRUD Todo List',
        contact: {
          name : 'Contact Placeholder',
          url : 'http://www.google.com/',
          email: 'j650n@example.com'
        },
        license: {
          name: 'License Placeholder',
          url: 'https://www.apache.org/licenses/LICENSE-2.0.html'
        },
      },
      components: {
        securitySchemes: {
          jwt: {
            type: 'http',
            scheme: 'bearer',
            in: 'header',
            bearerFormat: 'JWT'
          },
        }
      }
      ,
      security: [{
        jwt: []
      }],
    }, 

    apis: ['./src/routes/*.js'],
    
    
  }
  const swaggerSpec = swaggerJsdoc(options)
  router.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec))

  // All routes from this point will use the auth middleware
  router.use(authMiddleware)

  router.use('/todolists', require('./todolists')(db,amqpService))
  router.use('/tasks', require('./tasks')(db))


  return router
}
