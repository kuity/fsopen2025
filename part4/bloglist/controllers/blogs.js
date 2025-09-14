const blogsRouter = require('express').Router()
const Blog = require('../models/blog')
const middleware = require('../utils/middleware')

blogsRouter.get('/', async (request, response) => {
  const blogs = await Blog.find({})
  return response.json(blogs)
})

blogsRouter.post('/', middleware.userExtractor, async (request, response) => {
  const user = request.user
  const blog = new Blog({
    ...request.body,
    user: user._id
  })

  const savedBlog = await blog.save()
  user.blogs.push(savedBlog._id)
  await user.save()
  await savedBlog.populate('user')
  response.status(201).json(savedBlog)
})

blogsRouter.delete('/:id', middleware.userExtractor, async (request, response) => {
  const user = request.user
  const blog = await Blog.findById(request.params.id)
  if (!blog) {
    return response.status(404).end()
  }

  if (user._id.toString() !== blog.user.toString()) {
    return response.status(401).json({ error: 'unauthorized - you can only delete your own blogs' })
  }
  await blog.deleteOne()
  user.blogs = user.blogs.filter(blogId => blogId.toString() !== request.params.id)
  await user.save()
  response.status(204).end()
})

blogsRouter.put('/:id', middleware.userExtractor, async (request, response) => {
  const user = request.user
  const blog = await Blog.findById(request.params.id)

  if (!blog) {
    return response.status(404).end()
  }

  if (user._id.toString() !== blog.user.toString()) {
    return response.status(401).json({ error: 'unauthorized - you can only update your own blogs' })
  }

  const updatedBlog = await Blog.findByIdAndUpdate(
    request.params.id,
    request.body,
    { new: true, runValidators: true }
  )

  response.status(200).json(updatedBlog)
})

module.exports = blogsRouter