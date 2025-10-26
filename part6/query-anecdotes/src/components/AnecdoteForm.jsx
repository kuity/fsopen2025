import { createAnecdote } from '../requests'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import NotificationContext from '../context/NotificationContext'
import { useContext } from 'react'

const AnecdoteForm = () => {
  const queryClient = useQueryClient()
  const { notificationDispatch } = useContext(NotificationContext)
  const newAnecdoteMutation = useMutation({
    mutationFn: createAnecdote,
    onSuccess: (newAnecdote) => {
      queryClient.invalidateQueries({ queryKey: ['anecdotes'] })
      notificationDispatch({
        type: 'SHOW',
        payload: `created anecdote: "${newAnecdote.content}"`,
      })
    },
    onError: () => {
      notificationDispatch({
        type: 'SHOW',
        payload: 'too short anecdote, must have length 5 or more',
      })
    },
  })

  const onCreate = (event) => {
    event.preventDefault()
    const content = event.target.anecdote.value
    event.target.anecdote.value = ''
    newAnecdoteMutation.mutate({ content, votes: 0 })
    console.log('new anecdote')
  }

  return (
    <div>
      <h3>create new</h3>
      <form onSubmit={onCreate}>
        <input name="anecdote" />
        <button type="submit">create</button>
      </form>
    </div>
  )
}

export default AnecdoteForm
