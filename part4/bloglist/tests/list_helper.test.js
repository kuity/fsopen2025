const { test, describe } = require('node:test')
const assert = require('node:assert')
const listHelper = require('../utils/list_helper')

test('dummy returns one', () => {
  const blogs = []

  const result = listHelper.dummy(blogs)
  assert.strictEqual(result, 1)
})

describe('total likes', () => {
  const listWithOneBlog = [
    {
      _id: '5a422aa71b54a676234d17f8',
      title: 'Go To Statement Considered Harmful',
      author: 'Edsger W. Dijkstra',
      url: 'https://homepages.cwi.nl/~storm/teaching/reader/Dijkstra68.pdf',
      likes: 5,
      __v: 0,
    },
  ]

  const listWithMoreBlogs = [
    {
      _id: '123',
      title: 'title1',
      author: 'author1',
      url: 'url1',
      likes: 1,
      __v: 0,
    },
    {
      _id: '345',
      title: 'title2',
      author: 'author2',
      url: 'url2',
      likes: 5,
      __v: 0,
    },
    {
      _id: '456',
      title: 'title3',
      author: 'author3',
      url: 'url3',
      likes: 15,
      __v: 0,
    },
  ]

  test('of empty list is zero', () => {
    const result = listHelper.totalLikes([])
    assert.strictEqual(result, 0)
  })

  test('when list has only one blog, equals the likes of that', () => {
    const result = listHelper.totalLikes(listWithOneBlog)
    assert.strictEqual(result, 5)
  })

  test('when list has more blogs, equals the likes of that', () => {
    const result = listHelper.totalLikes(listWithMoreBlogs)
    assert.strictEqual(result, 21)
  })
})

// TODO: complete tests