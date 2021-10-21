require('dotenv').config()
const bcrypt = require('bcrypt')
const AuthService = require('./auth')

const SALT_ROUNDS = parseInt(process.env.SALT_ROUNDS)
const email = 'test_user@gmail.com'
const password = 'test_password'

const db = {
  findUserByEmail: jest.fn(async () => {
    return {
      id: 1,
      email: email,
      password_hash: await bcrypt.hash(password, SALT_ROUNDS)
    }
  }),
  insertUser: jest.fn(() => {
    return { id: 1 }
  })
}

const authService = AuthService(db)

describe('Register user', () => {
  describe('given a new email and password', () => {
    it('should return a token', async () => {
      db.findUserByEmail.mockResolvedValueOnce(null)
      const token = await authService.registerUser(email, password)
      expect(token).toBeTruthy()
    })
  })

  describe('given an existing email', () => {
    it('should return null', async () => {
      const token = await authService.registerUser(email, password)
      expect(token).toBeFalsy()
    })
  })
})

describe('Login user', () => {
  describe('given a valid email and password', () => {
    it('should return a token', async () => {
      const token = await authService.loginUser(email, password)
      expect(token).toBeTruthy()
    })
  })

  describe('given an invalid password', () => {
    it('should return null', async () => {
      const token = await authService.loginUser(email, 'wrong_password')
      expect(token).toBeFalsy()
    })
  })

  describe('given an invalid username', () => {
    it('should return null', async () => {
      db.findUserByEmail.mockResolvedValueOnce(null)
      const token = await authService.loginUser('wrong_email', password)
      expect(token).toBeFalsy()
    })
  })
})

describe('Verify token', () => {
  describe('given a valid token for a particular uid', () => {
    it('should return the same uid', async () => {
      const uid = 2
      const token = authService.generateToken(uid)
      const ret = await authService.verifyToken(token)
      expect(ret).toEqual(uid)
    })
  })

  describe('given an invalid token', () => {
    it('should return null', async () => {
      const token = 'gibberish'
      const ret = await authService.verifyToken(token)
      expect(ret).toBeNull()
    })
  })
})

