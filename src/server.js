require('dotenv').config()
const App = require('./app')
const Router = require('./routes')
const AuthMiddleware = require('./middlewares/auth')
const AuthService = require('./services/auth')
const db = require('./db')
const AmqpService = require('./services/amqp')
const ConsumerServiceEmail = require('./services/consumer-email')

const amqpService = AmqpService()
const consumerServiceEmail = ConsumerServiceEmail(db)
const authService = AuthService(db)
const authMiddleware = AuthMiddleware(authService)

const router = Router(authMiddleware, authService, amqpService,db)

const app = App(router)

consumerServiceEmail.consumeEmail()

const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`)
})