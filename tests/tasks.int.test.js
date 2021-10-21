const request = require('supertest')
const utils = require('./utils')

const app = utils.app
const db = utils.db

let token
let token2


beforeAll(async () => {
  await utils.setup()
  //  this is for user 1
  token = await utils.registerUser()

  // this is for user 2
  token2 = await utils.registerUser({email:'user2@gmail.com',password:'testing_password'})

  // this is for user 3
})

afterAll(async () => {
  await utils.teardown()
})



describe('GET /todolists', () => {
  describe('given no todolists in db', () => {
    beforeAll(async () => {
      await db.clearTodoListTables()
      await db.clearTaskTables()
    })


    it('should return an empty array for user 1', async () => {

      return await request(app)
        .get('/todolists')
        .set('Authorization', token)
        .expect(200)
        .then(response => {
          console.log('response',response)
          expect(response.body).toEqual([])
        })
    })

    it('should return an empty array for user 2', async () => {

      return await request(app)
        .get('/todolists')
        .set('Authorization', token2)
        .expect(200)
        .then(response => {
          console.log('response',response)
          expect(response.body).toEqual([])
        })
    })

  })
})


describe('POST /todolists/:todo_id/tasks', () => {

  let id
  describe('create an todolist first for user 1', () => {
    
    const todo = {
      title: 'test_item_1',
      date_due: '2021-12-30'
    }
  
    const todoReturn = { title: 'test_item_1', date_due: '2021-12-29T16:00:00.000Z', is_completed : false, author_id:1, is_deleted: false, todo_id: 1 }
  
  
    it('should return 201 for user 1', async () => {
      return await request(app)
        .post('/todolists')
        .set('Authorization', token)
        .send(todo)
        .expect(201)
        .then(response => {
          // id = response.body
          id = response.body[1].todo_id
          // console.log('response.body',response.body[1].todo_id)
          expect(response.body).toContainEqual(todoReturn)
        })
    })
  
    it('should return the item for user 1', async () => {
      return request(app)
        .get(`/todolists/${id}`)
        .set('Authorization', token)
        .expect(200)
        .then(response => {
          expect(response.body).toEqual(todoReturn)
        })
    })
  })

  describe('create some tasks for user 1 and todolist 1', () => {
    const tasks = [
      { title: 'test_task_1', detail :'smaller details 1', date_due: '2021-12-30' },
      { title: 'test_task_2', detail :'smaller details 2', date_due: '2021-12-30' }
    ]
    const tasksReturn = [
      { title: 'test_task_1', detail: 'smaller details 1', date_due: '2021-12-29T16:00:00.000Z', task_id: 1, is_completed : false, author_id:1,todo_id: 1 },
      { title: 'test_task_2', detail: 'smaller details 2',date_due: '2021-12-29T16:00:00.000Z', task_id: 2, is_completed : false, author_id:1,todo_id: 1  }
    ]

    beforeAll(async () => {
      await db.clearTaskTables()
      await Promise.all(
        tasks.map(item => {
          return request(app)
            .post(`/todolists/${id}/tasks`)
            .set('Authorization', token)
            .send(item)
        })
      )
    })

    it('should return all tasks to user 1 of todolist 1', async () => {
      return request(app)
        .get('/tasks')
        .set('Authorization', token)
        .expect(200)
        .then(response => {
          // expect(response.body).toEqual(
          expect(response.body).toEqual(
            expect.arrayContaining(
              tasksReturn.map(item => {
                return expect.objectContaining({
                  title: item.title,
                  date_due: item.date_due,
                  todo_id: item.todo_id,
                  is_completed : item.is_completed
                })
              })
            )
          )
        })
    })

    it('should return empty todolist to user 2', async () => {
      return request(app)
        .get('/tasks')
        .set('Authorization', token2)
        .expect(200)
        .then(response => {
          expect(response.body).toEqual([])
        })
    })


  })

  // this is for user 2
  describe('create an todolist also for user 2', () => {
    
    const todo = {
      title: 'test_item_2',
      date_due: '2021-12-30'
    }
  
    const todoReturn = { title: 'test_item_2', date_due: '2021-12-29T16:00:00.000Z', is_completed : false, author_id:2, is_deleted: false, todo_id: 2 }
  
  
    it('should return 201 for user 2', async () => {
      return await request(app)
        .post('/todolists')
        .set('Authorization', token2)
        .send(todo)
        .expect(201)
        .then(response => {
          // id = response.body
          id = response.body[1].todo_id
          // console.log('response.body',response.body[1].todo_id)
          expect(response.body).toContainEqual(todoReturn)
        })
    })
  
    it('should return the item for user 2', async () => {
      return request(app)
        .get(`/todolists/${id}`)
        .set('Authorization', token2)
        .expect(200)
        .then(response => {
          expect(response.body).toEqual(todoReturn)
        })
    })
  })

  describe('create some tasks for user 2 and todolist 2', () => {
    const tasks = [
      { title: 'test_task_1', detail :'smaller details 1', date_due: '2021-12-30' },
      { title: 'test_task_2', detail :'smaller details 2', date_due: '2021-12-30' }
    ]
    const tasksReturn = [
      { title: 'test_task_1', detail: 'smaller details 1', date_due: '2021-12-29T16:00:00.000Z', task_id: 3, is_completed : false, author_id:1,todo_id: 2},
      { title: 'test_task_2', detail: 'smaller details 2',date_due: '2021-12-29T16:00:00.000Z', task_id: 4, is_completed : false, author_id:1,todo_id: 2}
    ]

    beforeAll(async () => {
      // await db.clearTaskTables()
      await Promise.all(
        tasks.map(item => {
          return request(app)
            .post(`/todolists/${id}/tasks`)
            .set('Authorization', token2)
            .send(item)
        })
      )
    })

    it('should return all tasks to user 2 of todolist 2', async () => {
      return request(app)
        .get('/tasks')
        .set('Authorization', token2)
        .expect(200)
        .then(response => {
          // expect(response.body).toEqual(
          expect(response.body).toEqual(
            expect.arrayContaining(
              tasksReturn.map(item => {
                return expect.objectContaining({
                  title: item.title,
                  date_due: item.date_due,
                  todo_id: item.todo_id,
                  is_completed : item.is_completed
                })
              })
            )
          )
        })
    })

    it('should return empty todolist to user 1', async () => {
      return request(app)
        .get('/tasks/3')
        .set('Authorization', token)
        .expect(200)
        .then(response => {
          expect(response.body).toEqual([])
        })
    })


  })
})


describe('PUT /tasks', () => {
  beforeAll(async () => {
    await db.clearTodoListTables()
    await db.clearTaskTables()
  })

  let todolist_id
  describe('create an todolist for user 1', () => {
    
    const todo = {
      title: 'test_todo_1',
      date_due: '2021-12-30'
    }
  
    it('should return 201 for user 1', async () => {
      return await request(app)
        .post('/todolists/')
        .set('Authorization', token)
        .send(todo)
        .expect(201)
        .then(response => {
          // id = response.body
          todolist_id = response.body[1].todo_id
        })
    })


    it('should return the item for user 1', async () => {
      return request(app)
        .get(`/todolists/${todolist_id}`)
        .set('Authorization', token)
        .expect(200)
        .then(response => {
          // expect(response.body).toEqual(todoReturn)
          expect(response.body).toBeDefined()
        })
    })



    describe('update a task user 1', () => {
      let task_id
      const task = {
        title: 'test_tasking',
        detail: 'plant the trees',
        date_due: '2021-11-10'
      }
      const toUpdateTask = {
        title: 'shut down the tasking',
        detail: 'chop down the trees',
        date_due: '2021-11-11'  
      }
      const updatedTask = {
        title: 'shut down the tasking',
        detail: 'chop down the trees',
        date_due:'2021-11-10T16:00:00.000Z',
        task_id: 1,
        author_id:1,
        is_completed: false,
        todo_id: 1,
        is_deleted: false
      }
 
      beforeAll(async () => {
        return request(app)
          .post(`/todolists/${todolist_id}/tasks`)
          .set('Authorization', token)
          .send(task)
          .then(response => {
            task_id = response.body.task_id
            // console.log('[DEBUG] id = response.body.task_id', response.body)
          })
      })

      it('should return 200 user 1', async () => {
        return request(app)
          .put(`/tasks/${task_id}/`)
          .set('Authorization', token)
          .send(toUpdateTask)
          .expect(200)
          .then(response => {
            expect(response.body).toMatchObject(updatedTask)
          })
      })

      it('should return the updated task user 1', async () => {
        return request(app)
          .get(`/tasks/${task_id}/`)
          .set('Authorization', token)
          .expect(200)
          .then(response => {
            expect(response.body).toContainEqual(updatedTask)
          })
      })

      it('should return the none for user 2', async () => {
        return request(app)
          .get(`/tasks/${task_id}/`)
          .set('Authorization', token2)
          .expect(200)
          .expect(200)
          .then(response => {
            expect(response.body).toEqual([])
          })
      })

    })
  })
})

describe('DELETE /tasks', () => {
  beforeAll(async () => {
    await db.clearTodoListTables()
    await db.clearTaskTables()
  })

  let todolist_id
  describe('create an todolist for user 1', () => {
    
    const todo = {
      title: 'test_todo_1',
      date_due: '2021-12-30'
    }
  
    it('should return 201 for user 1', async () => {
      return await request(app)
        .post('/todolists/')
        .set('Authorization', token)
        .send(todo)
        .expect(201)
        .then(response => {
          // id = response.body
          todolist_id = response.body[1].todo_id
        })
    })


    it('should return the item for user 1', async () => {
      return request(app)
        .get(`/todolists/${todolist_id}`)
        .set('Authorization', token)
        .expect(200)
        .then(response => {
          // expect(response.body).toEqual(todoReturn)
          expect(response.body).toBeDefined()
        })
    })


    let task_id
    describe('create a task user 1', () => {
      

      const newTask = {
        title: 'shut down the tasking',
        detail: 'chop down the trees',
        date_due: '2021-11-11'  
      }
      const returnTask = {
        title: 'shut down the tasking',
        detail: 'chop down the trees',
        date_due:'2021-11-10T16:00:00.000Z',
        task_id: 1,
        author_id:1,
        is_completed: false,
        todo_id: 1,
        is_deleted: false
      }
 
      beforeAll(async () => {
        return request(app)
          .post(`/todolists/${todolist_id}/tasks`)
          .set('Authorization', token)
          .send(newTask)
          .then(response => {
            task_id = response.body.task_id
            // console.log('[DEBUG] id = response.body.task_id', response.body)
          })
      })

      it('should return the updated task user 1', async () => {
        return request(app)
          .get(`/tasks/${task_id}/`)
          .set('Authorization', token)
          .expect(200)
          .then(response => {
            expect(response.body).toContainEqual(returnTask)
          })
      })
    })


    describe('deleting task', () => {

      it('should return 403 with user 2', async () => {
        return request(app)
          .delete(`/tasks/${task_id}/`)
          .set('Authorization', token2)
          .expect(403)
      })


      it('should return 200', async () => {
        return request(app)
          .delete(`/tasks/${task_id}/`)
          .set('Authorization', token)
          .expect(200)
      })  

      it('should return empty 200 when getting task after deletion but empty', async () => {
        return request(app)
          .get(`/tasks/${task_id}`)
          .set('Authorization', token)
          .expect(200)        
          .then(response => {
            expect(response.body).toEqual([])
          })
      })

      it('should return 400 when deleting non-existent item', async () => {
        return request(app)
          .delete(`/tasks/${task_id}`)
          .set('Authorization', token)
          .expect(403)
      })
    })
  })
})