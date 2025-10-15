import { useState } from 'react'

const Blog = ({ blog, handleLike, handleDelete, user }) => {
  const [hidden, setHidden] = useState(true)
  const toggleView = (event) => {
    event.preventDefault()
    setHidden(!hidden)
  }
  const isUserBlog = user.username === blog?.user?.username

  return (
    <div className='blogpost'>
      {blog.title} - {blog.author}{' '}
      <button onClick={toggleView}>{hidden ? 'view' : 'hide'}</button>
      {!hidden && <div>{blog.url}</div>}
      {!hidden && (
        <div>
          likes: {blog.likes}{' '}
          <button onClick={() => handleLike(blog.id)}>like</button>
        </div>
      )}
      {!hidden && <div>{blog?.user?.name}</div>}
      {!hidden && isUserBlog &&
        <button onClick={() => handleDelete(blog.id)} className='deleteBlog'>remove</button>}
    </div>
  )
}

export default Blog
