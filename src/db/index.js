const { Pool } = require('pg')


let pool

if (process.env.MYHEROKU == true) {
  // Heroku enviroment
  pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false
    }
  })
} else {
  // local environment 
  pool = new Pool({connectionString: process.env.DATABASE_URL})
}


// let pool = new Pool({
//   connectionString: process.env.DATABASE_URL
// })

const db = {
  ...require('./todolists')(pool),
  ...require('./users')(pool),
  ...require('./tasks')(pool),
  ...require('./accessroles')(pool)
}

db.preinitialise = async () => {

  await pool.query(`
    DROP TABLE IF EXISTS Task CASCADE;
    `)

  await pool.query(`
    DROP TABLE IF EXISTS Todolist CASCADE ;
    `)

  await pool.query(`
  DROP TABLE IF EXISTS Users CASCADE;
  `)

  await pool.query(`
  DROP TABLE IF EXISTS access_roles CASCADE;
  `)

  await pool.query(`
  DROP FUNCTION IF EXISTS last_upd_trig() CASCADE;
  `)

}


db.initialise = async () => {


  await pool.query(`
  CREATE FUNCTION last_upd_trig() RETURNS trigger
  LANGUAGE plpgsql AS
  $$BEGIN
    NEW.updated_at := CURRENT_TIMESTAMP;
    RETURN NEW;
  END;$$;
  `)



  await pool.query(`
    CREATE TABLE IF NOT EXISTS Users (
      id SERIAL PRIMARY KEY,
      email VARCHAR(100) NOT NULL,
      password_hash VARCHAR(100) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `)


  await pool.query(`
  CREATE TRIGGER last_upd_trigger
    BEFORE INSERT OR UPDATE ON Users
    FOR EACH ROW
    EXECUTE PROCEDURE last_upd_trig();
  `)

  // //PostgreSQL does have a boolean data type. others might not.
  await pool.query(`
    CREATE TABLE IF NOT EXISTS Todolist (
      todo_id SERIAL PRIMARY KEY,
      title VARCHAR(200) NOT NULL,
      date_due DATE NULL,
      author_id INTEGER NOT NULL,
      FOREIGN KEY (author_id) REFERENCES Users(id) ON DELETE CASCADE,
      is_completed BOOLEAN DEFAULT FALSE,
      is_deleted BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `)

  await pool.query(`
  CREATE TRIGGER last_upd_trigger
    BEFORE INSERT OR UPDATE ON Todolist
    FOR EACH ROW
    EXECUTE PROCEDURE last_upd_trig();
  `)



  await pool.query(`
    CREATE TABLE IF NOT EXISTS Task (
      task_id SERIAL PRIMARY KEY,
      title VARCHAR(200) NOT NULL,
      detail VARCHAR(255) NULL,
      date_due DATE NULL,
      todo_id INTEGER NOT NULL,
      FOREIGN KEY (todo_id) REFERENCES Todolist(todo_id) ON DELETE CASCADE,
      author_id INTEGER NOT NULL,
      FOREIGN KEY (author_id) REFERENCES Users(id) ON DELETE CASCADE,
      is_completed BOOLEAN DEFAULT FALSE,
      is_deleted BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `)

  await pool.query(`
  CREATE TRIGGER last_upd_trigger
    BEFORE INSERT OR UPDATE ON Task
    FOR EACH ROW
    EXECUTE PROCEDURE last_upd_trig();
  `)


  await pool.query(`
  DROP TYPE IF EXISTS the_roles;
  CREATE TYPE the_roles AS ENUM ('creator', 'collaborator', 'reader');
  `)

  
  await pool.query(`
    CREATE TABLE IF NOT EXISTS access_roles (
      access_id SERIAL PRIMARY KEY,
      author_id INTEGER NOT NULL,
      FOREIGN KEY (author_id) REFERENCES Users(id) ON DELETE CASCADE,
      todo_id INTEGER NOT NULL,
      FOREIGN KEY (todo_id) REFERENCES Todolist(todo_id) ON DELETE CASCADE,
      role the_roles NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `)

  await pool.query(`
  CREATE TRIGGER last_upd_trigger
    BEFORE INSERT OR UPDATE ON access_roles
    FOR EACH ROW
    EXECUTE PROCEDURE last_upd_trig();
  `)

}








db.clearTaskTables = async () => {
  await pool.query('DELETE FROM Task')
  await pool.query('ALTER SEQUENCE task_task_id_seq RESTART')
}

db.clearTodoListTables = async () => {
  await pool.query('DELETE FROM Todolist') 
  await pool.query('ALTER SEQUENCE todolist_todo_id_seq RESTART')

}

db.clearUsersTables = async () => {
  await pool.query('DELETE FROM Users')
  await pool.query('ALTER SEQUENCE users_id_seq RESTART')
}

db.clearAccessRolesTables = async () => {
  await pool.query('DELETE FROM access_roles')
  await pool.query('ALTER SEQUENCE access_roles_access_id_seq RESTART')
}


db.end = async () => {
  await pool.end()
}

module.exports = db