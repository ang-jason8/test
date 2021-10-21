const Todolist = require('../models/todolist')
const TodolistSpecial = require('../models/todolist')

module.exports = (pool) => {
  const db = {}

  db.insertTodo = async (todo) => {
    console.log(todo)
    const res = await pool.query(
      'INSERT INTO Todolist (title,date_due,author_id) VALUES ($1,$2,$3) RETURNING *',
      [todo.title, todo.date_due, todo.author_id]
    )
    return new Todolist(res.rows[0])
  }
  
  db.findAllTodo = async () => {
    const res = await pool.query(
      'SELECT * FROM Todolist'
    )
    return res.rows.map(row => new Todolist(row))
  }

  // find all Todos with Author
  db.findAllTodoAuthor = async (author_id) => {
    console.log('author_id', author_id)
    const res = await pool.query(
      'SELECT * FROM Todolist WHERE author_id = $1',
      [author_id]
    )
    return res.rows.map(row => new Todolist(row))
  }

  // find all Todos with Auth users
  db.findAllTodoAuthUsers = async (auth_id) => {
    console.log('author_id', auth_id)
    const res = await pool.query(
      'SELECT * FROM Todolist A INNER JOIN access_roles B on A.todo_id = B.todo_id WHERE B.author_id = $1 and A.is_deleted = FALSE',
      [auth_id]
    )
    return res.rows.map(row => new Todolist(row))
  }



  db.findTodo = async (id) => {
    const res = await pool.query(
      'SELECT * FROM Todolist WHERE todo_id = $1',
      [id]
    )
    return res.rowCount ? new Todolist(res.rows[0]) : null
  }

  db.findTodoDelete = async (id) => {
    const res = await pool.query(
      'SELECT * FROM Todolist WHERE todo_id = $1',
      [id]
    )
    return res.rowCount ? new TodolistSpecial(res.rows[0]) : null
  }


  db.findTodoAuthor = async (id,author_id) => {
    const res = await pool.query(
      'SELECT * FROM Todolist WHERE todo_id = $1 and author_id = $2 and is_deleted = FALSE',
      [id, author_id]
    )
    return res.rowCount ? new Todolist(res.rows[0]) : null
  }

  db.findTodoAuthUser = async (id,auth_id) => {
    const res = await pool.query(
      'SELECT * FROM Todolist A INNER JOIN access_roles B on A.todo_id = B.todo_id WHERE B.todo_id = $1 and B.author_id = $2 and A.is_deleted = FALSE',
      [id, auth_id]
    )
    return res.rowCount ? new Todolist(res.rows[0]) : null
  }



  db.updateTodo = async (id, todo) => {
    console.log(todo, typeof(todo))
    const res = await pool.query(
      'UPDATE Todolist SET title=$2, date_due=$3, is_completed=$4 WHERE todo_id=$1 RETURNING *',
      [id, todo.title, todo.date_due, todo.is_completed]
    )
    return new Todolist(res.rows[0])
  }

  db.updateTodoComplete = async (id, todo) => {
    // console.log(todo, typeof(todo))
    const res = await pool.query(
      'UPDATE Todolist SET is_completed=$2 WHERE todo_id=$1 RETURNING *',
      [id, todo.is_completed]
    )
    return new Todolist(res.rows[0])
  }


  // change to soft delete
  db.deleteTodo = async (ids) => {
    // console.log(ids)
    const res = await pool.query(
      'UPDATE Todolist SET is_deleted=TRUE WHERE todo_id=$1 AND author_id=$2 RETURNING *',
      [ids.id, ids.uid]
    )
    return new Todolist(res.rows[0])
  }


  // to count the completed todolists
  db.countTodolistCompleted= async () => {
    const res = await pool.query(
      'SELECT count(1) FROM Todolist WHERE is_completed = true',
      []
    )

    return res.rowCount ? res.rows[0] : null
  }




  return db
}