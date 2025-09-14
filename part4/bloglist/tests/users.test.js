const { test, after, beforeEach, describe } = require('node:test')
const assert = require('node:assert')
const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const app = require('../app')
const supertest = require('supertest')
const User = require('../models/user')
const api = supertest(app)

const initialUsers = [
  {
    username: 'testuser1',
    name: 'Test User One',
    password: 'password123'
  },
  {
    username: 'testuser2',
    name: 'Test User Two',
    password: 'secretpass'
  }
]

const usersInDb = async () => {
  const users = await User.find({})
  return users.map(user => user.toJSON())
}

beforeEach(async () => {
  await User.deleteMany({})

  for (const user of initialUsers) {
    const passwordHash = await bcrypt.hash(user.password, 10)
    const userObject = new User({
      username: user.username,
      name: user.name,
      passwordHash
    })
    await userObject.save()
  }
})

describe('get users', () => {
  test('returns correct number of users', async () => {
    const response = await api.get('/api/users')
    assert.strictEqual(response.status, 200)
    assert.strictEqual(response.body.length, initialUsers.length)
  })

  test('users have correct structure', async () => {
    const response = await api.get('/api/users')
    const user = response.body[0]

    assert('id' in user)
    assert('username' in user)
    assert('name' in user)

    // Should NOT have passwordHash
    assert(!('passwordHash' in user))
    assert(!('_id' in user))
    assert(!('__v' in user))
  })
})

describe('create user', () => {
  test('succeeds with valid user data', async () => {
    const usersAtStart = await usersInDb()

    const newUser = {
      username: 'newuser',
      name: 'New User',
      password: 'validpassword'
    }

    const response = await api
      .post('/api/users')
      .send(newUser)
      .expect(201)

    assert.strictEqual(response.body.username, newUser.username)
    assert.strictEqual(response.body.name, newUser.name)

    const usersAtEnd = await usersInDb()
    assert.strictEqual(usersAtEnd.length, usersAtStart.length + 1)

    const usernames = usersAtEnd.map(user => user.username)
    assert(usernames.includes(newUser.username))
  })

  test('fails with status 400 if password is too short', async () => {
    const usersAtStart = await usersInDb()

    const userWithShortPassword = {
      username: 'shortpass',
      name: 'Short Password User',
      password: 'ab'
    }

    const response = await api
      .post('/api/users')
      .send(userWithShortPassword)
      .expect(400)

    assert(response.body.error.includes('Password must be at least 3 characters long'))

    const usersAtEnd = await usersInDb()
    assert.strictEqual(usersAtEnd.length, usersAtStart.length)
  })

  test('fails with status 400 if username is missing', async () => {
    const usersAtStart = await usersInDb()

    const userWithoutUsername = {
      name: 'No Username User',
      password: 'validpassword'
    }

    await api
      .post('/api/users')
      .send(userWithoutUsername)
      .expect(400)

    const usersAtEnd = await usersInDb()
    assert.strictEqual(usersAtEnd.length, usersAtStart.length)
  })

  test('fails with status 400 if username already exists', async () => {
    const usersAtStart = await usersInDb()

    const userWithDuplicateUsername = {
      username: 'testuser1', // Already exists in initialUsers
      name: 'Duplicate Username User',
      password: 'validpassword'
    }

    await api
      .post('/api/users')
      .send(userWithDuplicateUsername)
      .expect(400)

    const usersAtEnd = await usersInDb()
    assert.strictEqual(usersAtEnd.length, usersAtStart.length)
  })
})

describe('delete user', () => {
  test('succeeds with status code 204 if id is valid', async () => {
    const usersAtStart = await usersInDb()
    const userToDelete = usersAtStart[0]

    await api
      .delete(`/api/users/${userToDelete.id}`)
      .expect(204)

    const usersAtEnd = await usersInDb()
    assert.strictEqual(usersAtEnd.length, initialUsers.length - 1)

    const usernames = usersAtEnd.map(user => user.username)
    assert(!usernames.includes(userToDelete.username))
  })

  test('fails with status 404 if user does not exist', async () => {
    const validNonExistingId = new mongoose.Types.ObjectId()

    await api
      .delete(`/api/users/${validNonExistingId}`)
      .expect(404)
  })
})

after(async () => {
  await mongoose.connection.close()
})