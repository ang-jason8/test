require('dotenv').config()
const db = require('../src/db')



//db.initialise()
// db.preinitialise().then(() => {
//   console.log('Database drop table complete')


// }).catch((err) => {
//   console.log(err)
//   console.log('Database migration failed')
//   process.exit(1)
// })



db.preinitialise().then(() => {
  console.log('Database drop table complete')
}).then(() => {

  db.initialise().then(() => {
    console.log('Database migration completed')
    process.exit()
  })
}).catch((err) => {
  console.log(err)
  console.log('Database migration failed')
  process.exit(1)
})
