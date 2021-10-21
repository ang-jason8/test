const express = require('express')
const cron = require('node-cron')
const enableWs = require('express-ws')
const lib =  require('../lib/library')

module.exports = (db) => {
  const router = express.Router()



  enableWs(router)

  router.ws('/completed', (wsInside, req) => {
    wsInside.send('Conntected to BD CRUD Todolist service ...')

    wsInside.on('message', (msg) => {
      wsInside.send('Ping ping server heartbeat..')
    })
    // for demo, remove 5 mins
    cron.schedule('*/5 * * * *', async () => {
    // cron.schedule('*/10 * * * * *', async () => {
      const countTodolistCompleted = await db.countTodolistCompleted()
      const countTasksCompleted = await db.countTaskCompleted()

      const message = { 
        datetime: lib.getDateTime() , 
        TodolistsCompleted: countTodolistCompleted,
        TasksCompleted: countTasksCompleted,
      }
      console.log(message)
      wsInside.send(JSON.stringify(message))
    })  
  })
    
  return router
}