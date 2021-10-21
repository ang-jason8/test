const User = require('../models/user')

module.exports = (pool) => {
  const db = {}

  db.insertUser = async (user) => {
    const res = await pool.query(
      'INSERT INTO Users (email,password_hash) VALUES ($1,$2) RETURNING *',
      [user.email, user.password_hash]
    )
    return new User(res.rows[0])
  }

  db.updatePass = async (id,user) => {
    const res = await pool.query(
      'UPDATE Users SET password_hash=$2 WHERE id=$1 RETURNING *',
      [id, user.password_hash]
    )
    return new User(res.rows[0])
  }


  db.findUserByEmail= async (email) => {
    // const res = await pool.query(
    //   'SELECT * FROM Users WHERE email = $1',
    //   [email]
    // )
    const res = await pool.query(
      'SELECT * FROM Users WHERE email = $1',
      [email]
    )

    return res.rowCount ? new User(res.rows[0]) : null
  }

  return db
}