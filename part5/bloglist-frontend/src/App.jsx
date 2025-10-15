import { useState, useEffect } from 'react'
import BlogList from './components/BlogList'
import BlogForm from './components/BlogForm'
import Togglable from './components/Togglable'
import LoginForm from './components/Login'
import Notification from './components/Notification'
import blogService from './services/blogs'
import loginService from './services/login'

const App = () => {
  const [blogs, setBlogs] = useState([])
  const [user, setUser] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const LOCAL_STORAGE_KEY = 'loggedNoteappUser'

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const blogs = await blogService.getAll()
        setBlogs(blogs)
      } catch (error) {
        console.error('Error fetching blogs:', error)
      }
    }
    fetchBlogs()
  }, [])

  useEffect(() => {
    const loggedUserJSON = window.localStorage.getItem(LOCAL_STORAGE_KEY)
    if (loggedUserJSON) {
      const user = JSON.parse(loggedUserJSON)
      setUser(user)
      blogService.setToken(user.token)
    }
  }, [])

  const setMessage = (message, isSuccess) => {
    if (!isSuccess) {
      setErrorMessage(message)
      setTimeout(() => {
        setErrorMessage(null)
      }, 5000)
    } else {
      setSuccessMessage(message)
      setTimeout(() => {
        setSuccessMessage(null)
      }, 5000)
    }
  }

  const handleLogin = async (event) => {
    event.preventDefault()
    try {
      console.log(`logging in with creds ${username} and ${password}`)
      const user = await loginService.login({ username, password })
      window.localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(user))
      blogService.setToken(user.token)
      setUser(user)
      setUsername('')
      setPassword('')
    } catch {
      setMessage('wrong credentials', false)
    }
  }

  const handleDelete = async (blogId) => {
    const blog = blogs.find(b => b.id === blogId)
    const confirmDelete = window.confirm(`Delete blog "${blog.title}" by ${blog.author}?`)

    if (confirmDelete) {
      try {
        await blogService.remove(blogId)
        setBlogs(blogs.filter(blog => blog.id !== blogId))
        setMessage(`Blog "${blog.title}" deleted successfully`, true)
      } catch(error) {
        setMessage(error.toString(), false)
      }
    }
  }

  const handleLogout = () => {
    setUser('')
    window.localStorage.removeItem(LOCAL_STORAGE_KEY)
  }

  const handleNewBlog = async (blogData) => {
    try {
      const response = await blogService.create(blogData)
      setMessage(`New blog '${blogData.title}' added successfully`, true)
      setBlogs(blogs.concat(response))
    } catch (error) {
      setMessage(error.toString(), false)
    }
  }

  const handleLike = async (blogId) => {
    try {
      const blogToUpdate = blogs.find(b => b.id === blogId)
      const updatedBlog = await blogService.update(blogId, {
        title: blogToUpdate.title,
        author: blogToUpdate.author,
        url: blogToUpdate.url,
        likes: blogToUpdate.likes + 1,
        user: blogToUpdate.user.id || blogToUpdate.user
      })
      setBlogs(blogs.map(blog => blog.id === blogId ? updatedBlog : blog))
    } catch (error) {
      setMessage(error.toString(), false)
    }
  }

  const userDisplay = () => (
    <div>
      <p>{user.name} logged in</p>
      <button onClick={handleLogout}>log out</button>
    </div>
  )

  return (
    <div>
      <h2>Blogs</h2>
      <Notification message={errorMessage} messageClass="error" />
      <Notification message={successMessage} messageClass="success" />

      {!user && (
        <LoginForm
          handleLogin={handleLogin}
          username={username}
          password={password}
          handleUsernameChange={({ target }) => setUsername(target.value)}
          handlePasswordChange={({ target }) => setPassword(target.value)}
        />
      )}
      {user && userDisplay()}
      {user && (
        <Togglable buttonLabel="Create Blog">
          <BlogForm handleNewBlog={handleNewBlog} />
        </Togglable>
      )}
      {user && <BlogList blogs={blogs} handleLike={handleLike} handleDelete={handleDelete} user={user}/>}
    </div>
  )
}

export default App
