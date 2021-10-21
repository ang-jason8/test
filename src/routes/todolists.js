const express = require('express')
const Todolist = require('../models/todolist')
const Task = require('../models/task')
const lib =  require('../lib/library')

// const amqplib = require('amqplib')
const CREATOR_TEXT = 'creator'

module.exports = (db, amqpService) => {
  const router = express.Router()
 
  
  // for testing only
  router.post('/:todo_id/testemail', async (req, res, next) => {
    const uid = req.uid // this is author id
    console.log('uid',uid)
    const todo_id = req.params.todo_id
    const { role } = req.body
    console.log(req.body)


    const message = {
      email: req.body.email,
      author_id:uid,
      todo_id: todo_id,
      testing: 'this is testing mode',
      role: role
    }

    try {
    // console.log('message',message)
      await amqpService.publishMessage(message)
      res.status(200).send(`share success ${todo_id}`)

    } catch (e) {
      res.status(400).send(e)
    }
  })




  // for testing only
  router.get('/completed', async (req, res, next) => {
    const uid = req.uid // this is author id
    console.log('uid',uid)
    // const {  todo_id } = req.body
    console.log(req.body)
    // console.log(email,role,todo_id)
    const countTodolistCompleted = await db.countTodolistCompleted()
    const countTasksCompleted = await db.countTaskCompleted()

    const message = { 
      datetime: lib.getDateTime() , 
      TodolistsCompleted: countTodolistCompleted,
      TasksCompleted: countTasksCompleted,
   
    }
    console.log(message)
    res.status(200).send(message)
  })



  /**
   * @openapi
   * components:
   *  schemas:
   *    Todolist:
   *      type: object
   *      required:
   *        - title
   *        - date_due
   *      properties:
   *        title:
   *          type: string
   *        date_due:
   *          type: string
   */

  /**
   * @openapi
   * components:
   *  schemas:
   *    TodolistResponse:
   *      type: object
   *      properties:
   *        todo_id:
   *          type: integer
   *        title:
   *          type: string
   *        date_due:
   *          type: string
   *        is_completed:
   *          type: boolean
   *        author_id:
   *           type: integer
   *        is_deleted:
   *           type: boolean
   */


  /**
   * @openapi
   * components:
   *  schemas:
   *    TodolistCompleted:
   *      type: object
   *      properties:
   *        is_completed:
   *          type: boolean
   */

  /**
   * @openapi
   * components:
   *  schemas:
   *    TodolistShare:
   *      type: object
   *      required:
   *        - email
   *        - role
   *      properties:
   *        email:
   *          type: string
   *          format: email
   *        role:
   *          type: string
   *          enum: [collaborator, creator]
   */


  /**
   * @openapi
   * /todolists:
   *  post:
   *    tags:
   *    - todolists
   *    description: Create a Todolist
   *    requestBody:
   *      required: true
   *      content:
   *        application/json:
   *          schema:
   *            $ref: '#/components/schemas/Todolist'
   *          example:
   *             title: Title of the todolist
   *             date_due: "YYYY-MM-DD"
   * 
   * 
   *    responses:
   *      201:
   *        description: Created
   *        content:
   *          application/json:
   *            schema:
   *              $ref: '#/components/schemas/TodolistResponse'
   *            example:
   *              - status : success
   *              - todo_id: 1
   *                title: Title of the todolist
   *                date_due: "2021-10-19T16:00:00.000Z"
   *                is_completed : false
   *                author_id : 3
   *                is_deleted: false
   */
  router.post('/', async (req, res, next) => {
    // console.log(req)
    const uid = req.uid // this is author id
    console.log('uid',uid)
    const { title, date_due } = req.body
    const newTodo = new Todolist({ title, date_due, author_id:uid })
    console.log(newTodo)
    const todo = await db.insertTodo(newTodo)

    // res.status(201).send(todo)
    const access = await db.insertAccessUser({author_id:uid, todo_id:todo.todo_id,role:CREATOR_TEXT})  
    // const access = 'send to DB....' 
    access && res.status(201).send([{status:'success'}, todo,access])
    
  })

  /**
   * @openapi
   * /todolists:
   *  get:
   *    tags:
   *    - todolists
   *    description: Get all Todolists
   *    responses:
   *      200:
   *        description: OK
   *        content:
   *          application/json:
   *            schema:
   *              type: array
   *              items:
   *                $ref: '#/components/schemas/TodolistResponse'
   *            example:
   *              - todo_id: 1
   *                title: To make Hainanese Chicken Rice
   *                date_due: "2021-10-19T16:00:00.000Z"
   *                is_completed : false
   *                author_id : 3
   *                is_deleted: false
   *              - todo_id: 2
   *                title: Put the clothes to washing
   *                date_due: "2021-10-19T16:00:00.000Z"
   *                is_completed : false
   *                author_id : 3
   *                is_deleted: false
   * 
   */
  router.get('/', async (req, res, next) => {
    const uid = req.uid // this is author id
    // console.log('uid',uid)
    const todo = await db.findAllTodoAuthUsers(uid)
    console.log(todo)
    return res.send(todo)

  })

  /**
   * @openapi
   * /todolists/{id}:
   *  get:
   *    tags:
   *    - todolists
   *    description: Get Todolists by id
   *    parameters:
   *      - in: path
   *        name: id
   *        schema:
   *          type: integer
   *        required: true
   *    responses:
   *      200:
   *        description: OK
   *        content:
   *          application/json:
   *            schema:
   *              $ref: '#/components/schemas/TodolistResponse'
   */
  router.get('/:id', async (req, res, next) => {
    const id = req.params.id
    const uid = req.uid // this is author id
    // console.log('uid',uid)
    const todoAuthor = await db.findTodoAuthUser(id,uid)
    // const todo = await db.findTodo(id)
    console.log(todoAuthor)
    if (todoAuthor){
      res.send(todoAuthor)
    }else{
      res.status(400).send(`forbidden todos ${uid}`)
    }

    // if (todo) {
    //   res.send(todo)
    // } else {
    //   res.status(400).send(`Todolist id ${id} not found`)
    // }
  })

  /**
   * @openapi
   * /todolists/{id}:
   *  put:
   *    tags:
   *    - todolists
   *    description: Update a Todolists
   *    parameters:
   *      - in: path
   *        name: id
   *        schema:
   *          type: integer
   *        required: true
   *    requestBody:
   *      required: true
   *      content:
   *        application/json:
   *          schema:
   *            oneOf:
   *              - $ref: '#/components/schemas/Todolist'
   *              - $ref: '#/components/schemas/TodolistCompleted'
   *          example:
   *            oneOf:
   *              - title: Title of the todolist 1
   *                date_due: "2021-11-23"
   *              - is_completed : false
   * 
   * 
   * 
   * 
   *    responses:
   *      200:
   *        description: OK
   *        content:
   *          application/json:
   *            schema:
   *              oneOf:
   *               - $ref: '#/components/schemas/Todolist'
   *               - $ref: '#/components/schemas/TodolistCompleted'
   */

  router.put('/:id', async (req, res, next) => {
    const uid = req.uid
    const id = req.params.id
    // console.log("req",req)
    const bodyLength=Object.keys(req.body).length
    console.log('bodyLength',bodyLength)


    const isAuthor = await db.findAccessUserByTodo({todo_id:id})
    console.log('isAuthor',isAuthor)
    // this is to check if the author is the list
    const authorOnly = (element) => element.author_id === uid
    console.log('isUID in isAuthorlist',isAuthor.some(authorOnly))

    if (!isAuthor.some(authorOnly)){
      // if not true
      return res.status(403).send(`forbidden todos ${uid}`)
    }



    if (bodyLength>1){
      const { title, date_due } = req.body
      const updatedTodo = new Todolist({ title, date_due, is_completed: false})
      const todo = await db.updateTodo( id, updatedTodo)
      res.send(todo)
    }
    else{
      if (bodyLength==1){
        const { is_completed } = req.body
        console.log('is_completed',is_completed)
        const updatedTodo = new Todolist({ is_completed })
        const todo = await db.updateTodoComplete( id, updatedTodo)
        res.send(todo)
      }

    }
  })



  /**
   * @openapi
   * /todolists/{id}/done:
   *  post:
   *    tags:
   *    - todolists
   *    description: Post a Todolists to complete
   *    parameters:
   *      - in: path
   *        name: id
   *        schema:
   *          type: integer
   *        required: true
   *    requestBody:
   *      required: true
   *      content:
   *        application/json:
   *          schema:
   *            $ref: '#/components/schemas/TodolistCompleted'
   *          example:
   *            is_completed : false
   * 
   * 
   * 
   * 
   *    responses:
   *      200:
   *        description: OK
   *        content:
   *          application/json:
   *            schema:
   *              $ref: '#/components/schemas/TodolistCompleted'
   */


  router.post('/:id/done', async (req, res, next) => {
    const uid = req.uid
    const id = req.params.id
    const { is_completed } = req.body
    // console.log('is_completed',is_completed)


    const isAuthor = await db.findAccessUserByTodo({todo_id:id})
    console.log('isAuthor',isAuthor)
    // this is to check if the author is the list
    const authorOnly = (element) => element.author_id === uid
    console.log('isUID in isAuthorlist',isAuthor.some(authorOnly))

    if (!isAuthor.some(authorOnly)){
      // if not true
      return res.status(403).send(`forbidden todos ${uid}`)
    }


    const updatedTodo = new Todolist({ is_completed })
    const todo = await db.updateTodoComplete( id, updatedTodo)
    res.send(todo)

  })



  /**
   * @openapi
   * /todolists/{id}:
   *  delete:
   *    tags:
   *    - todolists
   *    description: Delete a Todolists (soft delete) only true author can delete
   *    parameters:
   *      - in: path
   *        name: id
   *        schema:
   *          type: integer
   *        required: true
   *    responses:
   *      200:
   *        description: OK
   */




  //change to soft delete
  router.delete('/:id', async (req, res, next) => {
    const id = req.params.id
    const uid = req.uid
    // console.log(id, uid)


    const isAuthor = await db.findAccessUserByTodo({todo_id:id})
    console.log('isAuthor',isAuthor)
    // this is to check if the author is the list
    const authorOnly = (element) => element.author_id === uid

    console.log((isAuthor[0].author_id !== uid))

    console.log('isUID in isAuthorlist',isAuthor.some(authorOnly))

    if (!isAuthor.some(authorOnly) || (isAuthor[0].author_id !== uid)){
      // if not true
      return res.status(403).send(`forbidden todos ${uid}`)
    }

  
    const todo = await db.findTodoDelete(id)
    console.log('todo_is_deleted',todo.is_deleted)
    console.log((todo!== null) )
    console.log((todo.todo_id == id))

    if ((todo!== null) && (todo.is_deleted === false) &&  (todo.todo_id == id)) {
      const success = await db.deleteTodo({ id, uid })
      if (success) {
        res.status(200).send(`Deleted Todolist ${id} successfully`)
      }else{
        res.status(200).send(`Todolist ${id} delete unsuccessful`)
      }
    }else {
      res.status(400).send(`Todolist id ${id} not found`)
    }
  })





  /**
   * @openapi
   * /todolists/{todo_id}/tasks:
   *  post:
   *    tags:
   *    - tasks
   *    description: Create a Task sunder a TodoLists
   *    parameters:
   *      - in: path
   *        name: todo_id
   *        schema:
   *          type: integer
   *        required: true
   *    requestBody:
   *      required: true
   *      content:
   *        application/json:
   *          schema:
   *            $ref: '#/components/schemas/Task'
   *          example:
   *            title: Title of Task of the Todolist 1
   *            detail: Further Description of the Task
   *            date_due: "2021-11-23"
   * 
   * 
   *    responses:
   *      201:
   *        description: Created
   *        content:
   *          application/json:
   *            schema:
   *              $ref: '#/components/schemas/Task'
   */
  router.post('/:todo_id/tasks', async (req, res, next) => {
    // console.log(req)
    // console.log('in task')
    const todo_id = req.params.todo_id
    const uid = req.uid // this is author id
    console.log(uid,req.body,todo_id)
    const { title, detail, date_due } = req.body


    const isAuthor = await db.findAccessUserByTodo({todo_id})
    console.log('isAuthor',isAuthor)
    // this is to check if the author is the list
    const authorOnly = (element) => element.author_id === uid
    console.log('isUID in isAuthorlist',isAuthor.some(authorOnly))

    if (!isAuthor.some(authorOnly)){
      // if not true
      return res.status(403).send(`forbidden todos ${uid}`)
    }

    const newTask = new Task({ title, detail, date_due, author_id:uid, todo_id })
    console.log(newTask)
    const task = await db.insertTask(newTask)
    return res.status(201).send(task)
  })


  /**
   * @openapi
   * /todolists/{todo_id}/share:
   *  post:
   *    tags:
   *    - todolists
   *    description: Share a TodoList with another user by email
   *    parameters:
   *      - in: path
   *        name: todo_id
   *        schema:
   *          type: integer
   *        required: true
   *    requestBody:
   *      required: true
   *      content:
   *        application/json:
   *          schema:
   *            $ref: '#/components/schemas/TodolistShare'
   *    responses:
   *      201:
   *        description: Created
   *        content:
   *          application/json:
   *            schema:
   *              $ref: '#/components/schemas/TodolistShare'
   */
  
  router.post('/:todo_id/share', async (req, res, next) => {
    // console.log(req)
    const uid = req.uid // this is author id
    // console.log('uid',uid)
    const { email, role } = req.body
    // console.log(email,role,todo_id)
    const todo_id = req.params.todo_id

    // check if to_do is valid?
    const todo_idCheck = await db.findTodo(todo_id)   
    if (todo_idCheck ===null){
      console.log('Invalid todo ${todo_id}')
      return res.status(400).send(`Invalid todo_id ${todo_id}`)
    }

    // Check for request user is author of todo
    const isAuthor = await db.findTodoAuthor(todo_id,uid)
    console.log('isAuthor',isAuthor)
    if (isAuthor){
      console.log('I AM THE AUTHOR')
      //assumed the email is in the system
      const emailCheck = await db.findUserByEmail(email)
      // console.log('emailCheck',emailCheck.id)
      if (emailCheck ===null){
        console.log('No such email in system')
        res.status(400).send(`Invalid share ${uid}`) 
      } else{
        console.log('email is in system',emailCheck)
        const author_id = emailCheck.id
        console.log('SEND TO DB')
        
        const access1 = await db.findAccessByTodoUser({author_id, todo_id})  
        // console.log('access1',access1)
        if (!access1)
        {

          const message = {
            email: req.body.email,
            author_id:author_id,
            todo_id: todo_id,
            role: role
          }
          console.log('message',access1)
          try {
          // console.log('message',message)
            await amqpService.publishMessage(message)
            return res.status(200).send(`share success ${todo_id}`)

          } catch (e) {
            return res.status(400).send(e)
          }
        }else
        {
          console.log('already submitted')
          return res.status(201).send({status: 'success'})
        }
      }
    }else{
      return res.status(403).send(`forbidden share ${uid}`) 
    }

  })



  return router
}