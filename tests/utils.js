require('dotenv').config({ path: '.env.test' })
const App = require('../src/app')
const Router = require('../src/routes')
const AuthMiddleware = require('../src/middlewares/auth')
const AuthService = require('../src/services/auth')
const db = require('../src/db')
const AmqpService = require('../src/services/amqp')



const utils = {}

const amqpService = AmqpService()

const authService = AuthService(db)
const authMiddleware = AuthMiddleware(authService)
const router = Router(authMiddleware, authService, amqpService, db)
const app = App(router)

utils.app = app
utils.db = db

utils.setup = async () => {
  await db.preinitialise()
  await db.initialise()
  // await db.clearUsersTables()
  // await db.clearTaskTables()
  // await db.clearTodoListTables()
  // await db.clearAccessRolesTables()
}




utils.teardown = async () => {
  await db.end()
}

utils.registerUser = async (email = 'test_user@gmail.com', password = 'test_password') => {
  const token = await authService.registerUser(email, password)
  return `Bearer ${token}`
}

module.exports = utils