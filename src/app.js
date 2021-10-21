const express = require('express')
const logger = require('morgan')
const enableWs = require('express-ws')


module.exports = (router) => {
  const app = express()

  // added websocket
  enableWs(app)

  app.use(express.json())
  app.use(logger('common'))
  app.use(router)
  return app
}