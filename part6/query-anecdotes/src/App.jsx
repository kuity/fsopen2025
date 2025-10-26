import AnecdoteForm from './components/AnecdoteForm'
import Notification from './components/Notification'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getAnecDotes, updateAnecdote } from './requests'
import NotificationContext from './context/NotificationContext'
import { useContext } from 'react'

const App = () => {
  const queryClient = useQueryClient()
  const { notificationDispatch } = useContext(NotificationContext)
  const updateAnecdoteMutation = useMutation({
    mutationFn: updateAnecdote,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['anecdotes'] })
    },
  })

  const handleVote = (anecdote) => {
    updateAnecdoteMutation.mutate({ ...anecdote, votes: anecdote.votes + 1 })
    notificationDispatch({
      type: 'SHOW',
      payload: `voted for anecdote: "${anecdote.content}"`,
    })
    console.log('vote')
  }

  const result = useQuery({
    queryKey: ['anecdotes'],
    queryFn: getAnecDotes,
    refetchOnWindowFocus: false,
  })

  console.log(JSON.parse(JSON.stringify(result)))

  if (result.isLoading) {
    return <div>loading data...</div>
  }

  const anecdotes = result.data

  return (
    <div>
      <h3>Anecdote app</h3>

      <Notification />
      <AnecdoteForm />

      {anecdotes.map((anecdote) => (
        <div key={anecdote.id}>
          <div>{anecdote.content}</div>
          <div>
            has {anecdote.votes}
            <button onClick={() => handleVote(anecdote)}>vote</button>
          </div>
        </div>
      ))}
    </div>
  )
}

export default App
