const Task = require('../models/task')
const TaskSpecial = require('../models/task')


module.exports = (pool) => {
  const db = {}

  db.insertTask = async (task) => {
    console.log(task)
    const res = await pool.query(
      'INSERT INTO Task (title, detail, date_due,todo_id,author_id) VALUES ($1,$2,$3,$4,$5) RETURNING *',
      [task.title, task.detail,task.date_due, task.todo_id, task.author_id]
    )
    return new Task(res.rows[0])
  }
  
  db.findAllTask = async () => {
    const res = await pool.query(
      'SELECT * FROM Task'
    )
    return res.rows.map(row => new Task(row))
  }


  // find all Tasks with Auth users
  db.findAllTaskAuthUsers = async (auth_id) => {
    console.log('author_id', auth_id)
    const res = await pool.query(
      'select * from Task INNER JOIN access_roles ON Task.todo_id = access_roles.todo_id where access_roles.author_id = $1 and Task.is_deleted = false',
      [auth_id]
    )
    return res.rows.map(row => new Task(row))
  }


  // find Task with Auth users
  db.findTaskAuthUsers = async (id,auth_id) => {
    // console.log('author_id', auth_id)
    const res = await pool.query(
      'SELECT * FROM Task INNER JOIN access_roles ON Task.todo_id = access_roles.todo_id where Task.task_id = $1 and access_roles.author_id = $2 and Task.is_deleted = false',
      [ id,auth_id]
    )
    return res.rows.map(row => new Task(row))
  }




  db.findAllTaskAuthor = async (author_id) => {
    const res = await pool.query(
      'SELECT * FROM Task WHERE author_id = $1',
      [author_id]
    )
    return res.rows.map(row => new Task(row))
  }




  db.findTask = async (id) => {
    const res = await pool.query(
      'SELECT * FROM Task WHERE task_id = $1',
      [id]
    )
    return res.rowCount ? new Task(res.rows[0]) : null
  }



  db.findTaskDelete = async (id) => {
    const res = await pool.query(
      'SELECT * FROM Task WHERE task_id = $1',
      [id]
    )
    return res.rowCount ? new TaskSpecial(res.rows[0]) : null
  }






  db.findTaskAuthor = async (id,author_id) => {
    const res = await pool.query(
      'SELECT * FROM Task WHERE task_id = $1 and author_id = $2',
      [id,author_id]
    )
    return res.rowCount ? new Task(res.rows[0]) : null
  }


  db.updateTask = async (id, task) => {
    console.log(task, typeof(task))
    const res = await pool.query(
      'UPDATE Task SET title=$2, detail=$3, date_due=$4, author_id = $5, is_completed=$6 WHERE task_id=$1 RETURNING *',
      [id, task.title, task.detail ,task.date_due, task.author_id, task.is_completed]
    )
    return new Task(res.rows[0])
  }

  db.updateTaskComplete = async (id, task) => {
    // console.log(todo, typeof(todo))
    const res = await pool.query(
      'UPDATE Task SET is_completed=$2 WHERE task_id=$1 AND author_id=$3 RETURNING *',
      [id, task.is_completed, task.author_id]
    )
    return new Task(res.rows[0])
  }


  // change to soft delete
  db.deleteTask = async (ids) => {
    // console.log(ids)
    const res = await pool.query(
      'UPDATE Task SET is_deleted=TRUE WHERE task_id=$1 AND author_id=$2 RETURNING *',
      [ids.id, ids.uid]
    )
    return new Task(res.rows[0])
  }


  // to count the completed todolists
  db.countTaskCompleted= async () => {
    const res = await pool.query(
      'SELECT count(1) FROM Task WHERE is_completed = true',
      []
    )

    return res.rowCount ? res.rows[0] : null
  }








  return db
}