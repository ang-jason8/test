const express = require('express')

module.exports = (service) => {
  const router = express.Router()

  /**
   * @openapi
   * components:
   *  schemas:
   *    User:
   *      type: object
   *      required:
   *        - email
   *        - password
   *      properties:
   *        email:
   *          type: string
   *          format: email
   *        password:
   *          type: string
   */

  /**
   * @openapi
   * /register:
   *  post:
   *    tags:
   *    - auth
   *    description: Register a user
   *    requestBody:
   *      required: true
   *      content:
   *        application/json:
   *          schema:
   *            $ref: '#/components/schemas/User'
   *    security:
   *	     jwt: []
   *    responses:
   *      200:
   *        description: OK
   *      400:
   *        description: Username already exists
   */
  router.post('/register', async (req, res, next) => {
    const { email, password } = req.body
    const token = await service.registerUser(email, password)
    if (token) {
      res.send({ token: token })
    } else {
      res.status(400).send(`Email ${email} already exists`)
    }
  })

  /**
   * @openapi
   * /login:
   *  post:
   *    tags:
   *    - auth
   *    description: Login a user
   *    requestBody:
   *      required: true
   *      content:
   *        application/json:
   *          schema:
   *            $ref: '#/components/schemas/User'
   *    responses:
   *      200:
   *        description: OK
   *      400:
   *        description: Invalid login credentials
   */
  router.post('/login', async (req, res, next) => {
    const { email, password } = req.body
    const token = await service.loginUser(email, password)
    console.log('token',token)
    if (token) {
      res.send({ token: token })
    } else {
      res.status(400).send('Invalid login credentials')
    }
  })

  router.post('/adminlogin', async (req, res, next) => {
    const { email } = req.body
    const token = await service.adminLogin(email)
    if (token) {
      res.send({ token: token })
    } else {
      res.status(400).send('Invalid login admin')
    }
  })

  /**
   * @openapi
   * /loginchange:
   *  post:
   *    tags:
   *    - auth
   *    description: Change the password for registered user
   *    requestBody:
   *      required: true
   *      content:
   *        application/json:
   *          schema:
   *            $ref: '#/components/schemas/User'
   *    responses:
   *      200:
   *        description: OK
   *      400:
   *        description: Invalid login credentials
   */

  router.post('/loginchange', async (req, res, next) => {
    const { email, password } = req.body
    // console.log(req.body)
    const authHeader = req.headers.authorization
    const token = authHeader && authHeader.split(' ')[1]
    if (token) {
      const uid = service.verifyToken(token)
      if (uid !== null) {
        const reponse = await service.updatePass(email, password)
        console.log('response',reponse)
        if (reponse) {
          res.send({ request: 'success' })
          return next()
        } else {
          res.status(400).send(`request ${email} issue`)
        }
      }

      res.status(403).send('Invalid login credentials request')
    }
  })


  return router
}