const { test, after, beforeEach, describe } = require('node:test')
const assert = require('node:assert')
const app = require('../app')
const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const supertest = require('supertest')
const Blog = require('../models/blog')
const User = require('../models/user')
const api = supertest(app)

let testToken = ''

const initialBlogs = [
  {
    title: 'title1',
    author: 'author1',
    url: 'url1',
    likes: 1,
  },
  {
    title: 'title2',
    author: 'author2',
    url: 'url2',
    likes: 5,
  },
  {
    title: 'title3',
    author: 'author3',
    url: 'url3',
    likes: 15,
  },
]

const blogsInDb = async () => {
  const blogs = await Blog.find({})
  return blogs.map((blog) => blog.toJSON())
}

beforeEach(async () => {
  await Blog.deleteMany({})
  await User.deleteMany({})

  // Create test user
  const passwordHash = await bcrypt.hash('testpassword', 10)
  const user = new User({
    username: 'testuser',
    name: 'Test User',
    passwordHash
  })
  const savedUser = await user.save()

  // Generate real token for the user
  testToken = jwt.sign({ id: savedUser._id }, process.env.SECRET)

  // Create blogs with user reference
  await Blog.insertMany(
    initialBlogs.map(blogData => ({ ...blogData, user: savedUser._id }))
  )
})

describe('get blog', () => {
  test('returns correct number of blog posts', async () => {
    const response = await api.get('/api/blogs')
    assert.strictEqual(response.body.length, 3)
  })

  test('has correctly named id property', async () => {
    const response = await api.get('/api/blogs')
    assert('id' in response.body[0])
  })
})

describe('post blog', () => {
  test('saves new blog post successfully', async () => {
    const newPost = {
      title: 'newPost',
      author: 'author',
      url: 'url',
      likes: 0,
    }
    const response = await api
      .post('/api/blogs')
      .set('Authorization', `Bearer ${testToken}`)
      .send(newPost)
    assert.strictEqual(response.status, 201)
    assert.strictEqual(response.body.title, newPost.title)
    assert.strictEqual(response.body.author, newPost.author)
    assert.strictEqual(response.body.url, newPost.url)
    assert.strictEqual(response.body.likes, newPost.likes)
    assert('id' in response.body)
    const getResponse = await api.get('/api/blogs')
    assert.strictEqual(getResponse.body.length, 4)
  })

  test('defaults new post with no likes to 0', async () => {
    const newPost = {
      title: 'newPost',
      author: 'author',
      url: 'url',
    }
    const response = await api
      .post('/api/blogs')
      .set('Authorization', `Bearer ${testToken}`)
      .send(newPost)
    assert.strictEqual(response.status, 201)
    assert.strictEqual(response.body.likes, 0)
  })

  test('title or url missing will have right error status', async () => {
    const newPost = {
      author: 'author',
      url: 'url',
    }
    const response = await api
      .post('/api/blogs')
      .set('Authorization', `Bearer ${testToken}`)
      .send(newPost)
    assert.strictEqual(response.status, 400)

    const newPost2 = {
      title: 'newPost',
      author: 'author',
    }
    const response2 = await api
      .post('/api/blogs')
      .set('Authorization', `Bearer ${testToken}`)
      .send(newPost2)
    assert.strictEqual(response2.status, 400)
  })

  test('fails with 401 if token is missing', async () => {
    const newPost = {
      title: 'newPost',
      author: 'author',
      url: 'url',
    }
    const response = await api.post('/api/blogs').send(newPost)
    assert.strictEqual(response.status, 401)
    assert(response.body.error.includes('token missing'))
  })
})

describe('delete blog', () => {
  test('succeeds with status code 204 if id is valid', async () => {
    const blogsAtStart = await blogsInDb()
    const blogToDelete = blogsAtStart[0]

    await api
      .delete(`/api/blogs/${blogToDelete.id}`)
      .set('Authorization', `Bearer ${testToken}`)
      .expect(204)

    const blogsAtEnd = await blogsInDb()
    assert.strictEqual(blogsAtEnd.length, initialBlogs.length - 1)
  })

  test('fails with 401 if token is missing', async () => {
    const blogsAtStart = await blogsInDb()
    const blogToDelete = blogsAtStart[0]

    const response = await api
      .delete(`/api/blogs/${blogToDelete.id}`)
      .expect(401)

    assert(response.body.error.includes('token missing'))

    // Verify blog was not deleted
    const blogsAtEnd = await blogsInDb()
    assert.strictEqual(blogsAtEnd.length, blogsAtStart.length)
  })

  test('fails with 401 if token is invalid', async () => {
    const blogsAtStart = await blogsInDb()
    const blogToDelete = blogsAtStart[0]

    const response = await api
      .delete(`/api/blogs/${blogToDelete.id}`)
      .set('Authorization', 'Bearer invalidtoken')
      .expect(401)

    assert(response.body.error.includes('token invalid'))

    // Verify blog was not deleted
    const blogsAtEnd = await blogsInDb()
    assert.strictEqual(blogsAtEnd.length, blogsAtStart.length)
  })

  test('fails with 401 if user tries to delete another user\'s blog', async () => {
    // Create another user
    const passwordHash = await bcrypt.hash('anotherpassword', 10)
    const anotherUser = new User({
      username: 'anotheruser',
      name: 'Another User',
      passwordHash
    })
    const savedAnotherUser = await anotherUser.save()

    // Create token for another user
    const anotherToken = jwt.sign({ id: savedAnotherUser._id }, process.env.SECRET)

    const blogsAtStart = await blogsInDb()
    const blogToDelete = blogsAtStart[0] // This belongs to testuser

    const response = await api
      .delete(`/api/blogs/${blogToDelete.id}`)
      .set('Authorization', `Bearer ${anotherToken}`)
      .expect(401)

    assert(response.body.error.includes('unauthorized'))

    // Verify blog was not deleted
    const blogsAtEnd = await blogsInDb()
    assert.strictEqual(blogsAtEnd.length, blogsAtStart.length)
  })

  test('fails with 404 if blog does not exist', async () => {
    const validNonExistingId = new mongoose.Types.ObjectId()

    await api
      .delete(`/api/blogs/${validNonExistingId}`)
      .set('Authorization', `Bearer ${testToken}`)
      .expect(404)
  })
})

describe('update blog', () => {
  test('succeeds with valid data and returns updated blog', async () => {
    const blogsAtStart = await blogsInDb()
    const blogToUpdate = blogsAtStart[0]

    const updatedData = {
      title: 'Updated Title',
      author: 'Updated Author',
      url: 'http://updated-url.com',
      likes: 999
    }

    const response = await api
      .put(`/api/blogs/${blogToUpdate.id}`)
      .set('Authorization', `Bearer ${testToken}`)
      .send(updatedData)
      .expect(200)

    // Verify response contains updated data
    assert.strictEqual(response.body.title, updatedData.title)
    assert.strictEqual(response.body.author, updatedData.author)
    assert.strictEqual(response.body.url, updatedData.url)
    assert.strictEqual(response.body.likes, updatedData.likes)
    assert.strictEqual(response.body.id, blogToUpdate.id)

    // Verify database was actually updated
    const blogsAtEnd = await blogsInDb()
    const updatedBlog = blogsAtEnd.find(blog => blog.id === blogToUpdate.id)
    assert.strictEqual(updatedBlog.title, updatedData.title)
    assert.strictEqual(updatedBlog.likes, updatedData.likes)
  })

  test('allows partial updates of fields', async () => {
    const blogsAtStart = await blogsInDb()
    const blogToUpdate = blogsAtStart[0]

    // Only update likes, keep other fields
    const partialUpdate = {
      likes: 1000
    }

    const response = await api
      .put(`/api/blogs/${blogToUpdate.id}`)
      .set('Authorization', `Bearer ${testToken}`)
      .send(partialUpdate)
      .expect(200)

    // Should keep original title, author, url but update likes
    assert.strictEqual(response.body.title, blogToUpdate.title)
    assert.strictEqual(response.body.author, blogToUpdate.author)
    assert.strictEqual(response.body.url, blogToUpdate.url)
    assert.strictEqual(response.body.likes, 1000)
  })

  test('fails with 404 if blog does not exist', async () => {
    const validNonExistingId = new mongoose.Types.ObjectId()

    const updatedData = {
      title: 'Updated Title',
      author: 'Updated Author',
      url: 'http://updated-url.com',
      likes: 10
    }

    await api
      .put(`/api/blogs/${validNonExistingId}`)
      .set('Authorization', `Bearer ${testToken}`)
      .send(updatedData)
      .expect(404)
  })

  test('fails with 401 if token is missing', async () => {
    const blogsAtStart = await blogsInDb()
    const blogToUpdate = blogsAtStart[0]

    const updatedData = {
      title: 'Updated Title',
      author: 'Updated Author',
      url: 'http://updated-url.com',
      likes: 10
    }

    const response = await api
      .put(`/api/blogs/${blogToUpdate.id}`)
      .send(updatedData)
      .expect(401)

    assert(response.body.error.includes('token missing'))
  })

  test('fails with 401 if user tries to update another user\'s blog', async () => {
    // Create another user
    const passwordHash = await bcrypt.hash('anotherpassword', 10)
    const anotherUser = new User({
      username: 'anotheruserput',
      name: 'Another User Put',
      passwordHash
    })
    const savedAnotherUser = await anotherUser.save()

    // Create token for another user
    const anotherToken = jwt.sign({ id: savedAnotherUser._id }, process.env.SECRET)

    const blogsAtStart = await blogsInDb()
    const blogToUpdate = blogsAtStart[0] // This belongs to testuser

    const updatedData = {
      title: 'Unauthorized Update',
      author: 'Hacker',
      url: 'http://malicious.com',
      likes: 666
    }

    const response = await api
      .put(`/api/blogs/${blogToUpdate.id}`)
      .set('Authorization', `Bearer ${anotherToken}`)
      .send(updatedData)
      .expect(401)

    assert(response.body.error.includes('unauthorized'))

    // Verify blog was not updated
    const blogsAtEnd = await blogsInDb()
    const unchangedBlog = blogsAtEnd.find(blog => blog.id === blogToUpdate.id)
    assert.strictEqual(unchangedBlog.title, blogToUpdate.title)
    assert.strictEqual(unchangedBlog.author, blogToUpdate.author)
  })
})

after(async () => {
  await mongoose.connection.close()
})