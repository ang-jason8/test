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

  describe('given some todolists in db', () => {
    const items = [
      { title: 'test_item_1', date_due: '2021-12-30' },
      { title: 'test_item_2', date_due: '2021-12-30' }
    ]
    const itemsReturn = [
      { title: 'test_item_1', date_due: '2021-12-30T00:00:00.000Z', todo_id: 1, is_completed : false, author_id:1 },
      { title: 'test_item_2', date_due: '2021-12-30T00:00:00.000Z', todo_id: 2, is_completed : false, author_id:1 }
    ]

    beforeAll(async () => {
      await db.clearTodoListTables()
      await Promise.all(
        items.map(item => {
          return request(app)
            .post('/todolists')
            .set('Authorization', token)
            .send(item)
        })
      )
    })

    it('should return all todolists to user 1', async () => {
      return request(app)
        .get('/todolists')
        .set('Authorization', token)
        .expect(200)
        .then(response => {
          // expect(response.body).toEqual(
          expect(response.body).toEqual(
            expect.arrayContaining(
              itemsReturn.map(item => {
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
        .get('/todolists')
        .set('Authorization', token2)
        .expect(200)
        .then(response => {
          expect(response.body).toEqual([])
        })
    })


  })
})

describe('POST /todolists', () => {
  beforeAll(async () => {
    await db.clearTodoListTables()
  })

  describe('create an todolist', () => {
    let id
    const todo = {
      title: 'test_item_1',
      date_due: '2021-12-30'
    }

    const todoReturn = { title: 'test_item_1', date_due: '2021-12-30T00:00:00.000Z', is_completed : false, author_id:1, is_deleted: false, todo_id: 1 }


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

    const todoReturn2 = { title: 'test_item_1', date_due: '2021-12-30T00:00:00.000Z', is_completed : false, author_id:2, is_deleted: false, todo_id: 2 }

    // for user 2
    // this test author_Id = 2 and todo_id = 2
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
          expect(response.body).toContainEqual(todoReturn2)
        })
    })

    it('should return the item for user 2', async () => {
      return request(app)
        .get(`/todolists/${id}`)
        .set('Authorization', token2)
        .expect(200)
        .then(response => {
          expect(response.body).toEqual(todoReturn2)
        })
    })


  })
})

describe('PUT /todolists', () => {
  beforeAll(async () => {
    await db.clearTodoListTables()
  })

  describe('update an item', () => {
    let id
    const todo = {
      title: 'test_item',
      date_due: '2021-11-10'
    }
    const toUpdateTodo = {
      title: 'long way to go',
      date_due: '2021-11-11'  
    }
    const updatedTodo = {
      title: 'long way to go',
      date_due:'2021-11-11T00:00:00.000Z'
    }
 
    beforeAll(async () => {
      return request(app)
        .post('/todolists')
        .set('Authorization', token)
        .send(todo)
        .then(response => {
          id = response.body[1].todo_id
          console.log(' id = response.body.id', response.body)
        })
    })

    it('should return 200', async () => {
      return request(app)
        .put(`/todolists/${id}`)
        .set('Authorization', token)
        .send(toUpdateTodo)
        .expect(200)
        .then(response => {
          expect(response.body).toMatchObject(updatedTodo)
        })
    })

    it('should return the updated item', async () => {
      return request(app)
        .get(`/todolists/${id}`)
        .set('Authorization', token)
        .expect(200)
        .then(response => {
          expect(response.body).toMatchObject(updatedTodo)
        })
    })
  })
})

describe('DELETE /todolists', () => {
  beforeAll(async () => {
    await db.clearTodoListTables()
  })

  describe('delete an item', () => {
    let id
    const todo = {
      title: 'test_item',
      date_due: '2021-11-10'
    }

    beforeAll(async () => {
      return request(app)
        .post('/todolists')
        .set('Authorization', token)
        .send(todo)
        .then(response => {
          id = response.body[1].todo_id
        })
    })

    it('should return 200', async () => {
      return request(app)
        .delete(`/todolists/${id}`)
        .set('Authorization', token)
        .expect(200)
    })

    it('should return 400 when getting item after deletion', async () => {
      return request(app)
        .get(`/todolists/${id}`)
        .set('Authorization', token)
        .expect(400)
    })

    it('should return 400 when deleting non-existent item', async () => {
      return request(app)
        .delete(`/todolists/${id}`)
        .set('Authorization', token)
        .expect(400)
    })
  })
})