import { useState } from 'react'

const BlogForm = ({ handleNewBlog }) => {
  const [newTitle, setNewTitle] = useState('')
  const [newAuthor, setNewAuthor] = useState('')
  const [newUrl, setNewUrl] = useState('')
  const onSubmit = (event) => {
    event.preventDefault()
    handleNewBlog({ title: newTitle, author: newAuthor, url: newUrl })
    setNewTitle('')
    setNewAuthor('')
    setNewUrl('')
  }

  return (
    <form onSubmit={onSubmit}>
      <div>
        <label>
          title:
          <input
            type="text"
            value={newTitle}
            onChange={({ target }) => setNewTitle(target.value)}
          />
        </label>
      </div>
      <div>
        <label>
          author:
          <input
            type="text"
            value={newAuthor}
            onChange={({ target }) => setNewAuthor(target.value)}
          />
        </label>
      </div>
      <div>
        <label>
          url:
          <input
            type="text"
            value={newUrl}
            onChange={({ target }) => setNewUrl(target.value)}
          />
        </label>
      </div>
      <button type="submit">create</button>
    </form>
  )
}

export default BlogForm
