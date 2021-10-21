const express = require('express')
const Task = require('../models/task')

module.exports = (db) => {
  const router = express.Router()
  
  /**
   * @openapi
   * components:
   *  schemas:
   *    Task:
   *      type: object
   *      required:
   *        - title
   *        - date_due
   *        - detail
   *      properties:
   *        title:
   *          type: string
   *        detail:
   *          type: string
   *        date_due:
   *          type: string

   */

  /**
   * @openapi
   * components:
   *  schemas:
   *    TaskResponse:
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
   *    TaskCompleted:
   *      type: object
   *      properties:
   *        is_completed:
   *          type: boolean
   */





  /**
   * @openapi
   * /tasks:
   *  get:
   *    tags:
   *    - tasks
   *    description: Get all Tasks and their associated todo_id
   *    responses:
   *      200:
   *        description: OK
   *        content:
   *          application/json:
   *            schema:
   *              type: array
   *              items:
   *                $ref: '#/components/schemas/TaskResponse'
   *            example:
   *              - task_id: 1
   *                title: Cook Chicken Rice
   *                detail: clean and chop up the chicken
   *                date_due: "2021-10-19T16:00:00.000Z"
   *                is_completed : false
   *                todo_id: 1
   *                author_id : 3
   *                is_deleted: false
   *              - task_id: 1
   *                title: Wash and cut the vetables
   *                detail: Put only the leavy parts of the vetagebles
   *                date_due: "2021-10-19T16:00:00.000Z"
   *                is_completed : false
   *                todo_id: 1
   *                author_id : 3
   *                is_deleted: false
   * 
   */



  router.get('/', async (req, res, next) => {
    const uid = req.uid
    // console.log('uid',uid)

    const task = await db.findAllTaskAuthUsers(uid)

    // const isAuthor = await db.findAccessCreatorByTodo()
    // console.log('isAuthor',todo)
    //// this is to check if the author is the list
    // const authorOnly = (element) => element.author_id === uid
    // console.log('isUID in isAuthorlist',isAuthor.some(authorOnly))

    // if (!isAuthor.some(authorOnly)){
    //   // if not true
    //   return res.status(403).send(`forbidden todos ${uid}`)
    // }

    // const task = await db.findAllTaskAuthor(uid)
    res.send(task)
  })

  /**
   * @openapi
   * /tasks/{id}:
   *  get:
   *    tags:
   *    - tasks
   *    description: Get Tasks by id
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
   *              $ref: '#/components/schemas/TaskResponse'
   */
  router.get('/:id', async (req, res, next) => {
    const id = req.params.id
    const uid = req.uid // this is author id
    const taskAuthor = await db.findTaskAuthUsers(id,uid)
    // if (task) {
    //   res.send(task)
    // } else {
    //   res.status(400).send(`Task id ${id} not found`)
    // }
    console.log(taskAuthor)
    if (taskAuthor){
      return res.send(taskAuthor)
    }else{
      return res.status(400).send(`forbidden tasks ${uid}`)
    }
  })

  /**
   * @openapi
   * /tasks/{id}:
   *  put:
   *    tags:
   *    - tasks
   *    description: Update a Tasks
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
   *              - $ref: '#/components/schemas/Task'
   *              - $ref: '#/components/schemas/TaskCompleted'
   *          example:
   *            oneOf:
   *              - title: Prepare the fresh chicken
   *                detail:  Rub the chicken first with salt
   *                date_due: "2021-10-23"
   *              - is_completed : false
   *
   * 
   *    responses:
   *      200:
   *        description: OK
   *        content:
   *          application/json:
   *            schema:
   *              oneOf:
   *                - $ref: '#/components/schemas/Task'
   *                - $ref: '#/components/schemas/TaskCompleted'
   */
  router.put('/:id', async (req, res, next) => {
    const uid = req.uid
    const id = req.params.id
    // console.log("req",req)


    const taskAuthor = await db.findTaskAuthUsers(id,uid)
    if (!taskAuthor){
      return res.status(403).send(`forbidden tasks ${uid}`)
    }


    const bodyLength=Object.keys(req.body).length
    console.log('bodyLength',bodyLength)
    if (bodyLength>1){
      const { title, detail, date_due } = req.body
      const updatedTask = new Task({ title,detail, date_due, author_id:uid, is_completed: false})
      const task = await db.updateTask( id, updatedTask)
      res.send(task)
    }
    else{
      if (bodyLength==1){
        const { is_completed } = req.body
        console.log('is_completed',is_completed)
        const updatedTask = new Task({ author_id:uid ,is_completed })
        const task = await db.updateTaskComplete( id, updatedTask)
        res.send(task)
      }

    }
  })

  /**
   * @openapi
   * /tasks/{id}/done:
   *  post:
   *    tags:
   *    - tasks
   *    description: Post a Task to complete
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
   *            $ref: '#/components/schemas/Task'
   *          example:
   *            is_completed : false
   *
   * 
   *    responses:
   *      200:
   *        description: OK
   *        content:
   *          application/json:
   *            schema:
   *              $ref: '#/components/schemas/TaskCompleted'
   */
  router.post('/:id/done', async (req, res, next) => {
    const uid = req.uid
    const id = req.params.id
    const { is_completed } = req.body

    const taskAuthor = await db.findTaskAuthUsers(id,uid)
    if (!taskAuthor){
      return res.status(403).send(`forbidden tasks ${uid}`)
    }

    // console.log('is_completed',is_completed)
    const updatedTask = new Task({ author_id:uid ,is_completed })
    const task = await db.updateTaskComplete( id, updatedTask)
    res.send(task)

  })





  /**
   * @openapi
   * /tasks/{id}:
   *  delete:
   *    tags:
   *    - tasks
   *    description: Delete a Task (soft delete) only true author can delete
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
    
    const taskAuthor = await db.findTaskAuthUsers(id,uid)
    console.log ('taskAuthor',taskAuthor)
    if (taskAuthor.length === 0 )
    {
      return res.status(403).send(`forbidden tasks ${uid}`)
    }

    const task = await db.findTaskDelete(id)
    console.log('(debug)task',task,id)
    // console.log((task!== null),task.is_deleted === false,(task.task_id == id))
    if ((task!== null) && (task.author_id == uid) && (task.is_deleted === false) && (task.task_id == id)) {
      const success = await db.deleteTask({ id, uid })
      // const success = "try"
      if (success) {
        res.status(200).send(`Deleted Tasks ${id} successfully`)
      }else{
        res.status(200).send(`Tasks ${id} delete unsuccessful`)
      }
    }else {
      res.status(400).send(`Tasks id ${id} not found`)
    }
  })

  return router
}