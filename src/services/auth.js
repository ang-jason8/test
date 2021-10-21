const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const User = require('../models/user')

const SALT_ROUNDS = parseInt(process.env.SALT_ROUNDS)
const JWT_SECRET = process.env.JWT_SECRET
const JWT_EXPIRY = parseInt(process.env.JWT_EXPIRY)

module.exports = (db) => {
  const service = {}

  service.generateToken = (uid) => {
    return jwt.sign({ uid }, JWT_SECRET, { expiresIn: JWT_EXPIRY })
  }

  service.registerUser = async (email, password) => {
    const user = await db.findUserByEmail(email)
    if (user) {
      return null
    } else {
      const passwordHash = await bcrypt.hash(password, SALT_ROUNDS)
      const newUser = new User({ email, password_hash: passwordHash })
      const user = await db.insertUser(newUser)
      return service.generateToken(user.id)
    }
  }

  service.updatePass = async (email, password) => {
    const user = await db.findUserByEmail(email)
    // console.log(user)
    if(user) {
      const passwordHash = await bcrypt.hash(password, SALT_ROUNDS)
      const newChange = { password_hash: passwordHash }
      const newUser = await db.updatePass(user.id,newChange)
      return service.generateToken(newUser.id)
    } else
    {
      return null
    }
  }


  service.loginUser = async (email, password) => {
    try{
      const user = await db.findUserByEmail(email)
      console.log('user',user)
      if (user) {
        const isValid = await bcrypt.compare(password, user.password_hash)
        if (isValid) {
          return service.generateToken(user.id)
        }
      }
    }catch (err) {
      return null
    }
  }

  service.adminLogin = async (email) => {
    try{
      const user = await db.findUserByEmail(email)
      if (user) {
        return service.generateToken(user.id)
      }
    }catch (err) {
      return null
    }
  }




  service.verifyToken = (token) => {
    try {
      const decoded = jwt.verify(token, JWT_SECRET)
      return decoded.uid
    } catch (err) {
      return null
    }
  }

  return service
}