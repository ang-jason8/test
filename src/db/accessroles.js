const AccessRole = require('../models/accessrole')

module.exports = (pool) => {
  const db = {}

  db.insertAccessUser = async (user) => {
    console.log('user',user)
    const res = await pool.query(
      'INSERT INTO access_roles (author_id, todo_id, role ) VALUES ($1,$2,$3) RETURNING *',
      [ user.author_id,user.todo_id, user.role]
    )
    return new AccessRole(res.rows[0])
  }


  db.findAccessByTodoUser = async (user) => {
    console.log('user',user)
    const res = await pool.query(
      'SELECT * FROM access_roles WHERE todo_id = $1 and author_id = $2',
      [user.todo_id, user.author_id]
    )
  
    return res.rowCount ? res.rows : null
  }



  db.findAccessUserByTodo = async (user) => {
    console.log('user',user)
    const res = await pool.query(
      'SELECT author_id, role FROM access_roles WHERE todo_id = $1',
      [user.todo_id]
    )
  
    return res.rowCount ? res.rows : null
  }

  db.findAccessCreatorByTodo = async (user) => {
    // console.log('user',user)
    const res = await pool.query(
      'SELECT author_id, role FROM access_roles WHERE role = "creator"',
      []
    )
  
    return res.rows.map(row => new AccessRole(row))
  }




  return db
}