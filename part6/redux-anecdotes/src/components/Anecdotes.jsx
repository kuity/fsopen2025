import { useDispatch, useSelector } from 'react-redux'
import { voteAnecdote } from '../reducers/anecdoteReducer'
import { setNotification } from '../reducers/notificationReducer'

const Anecdote = ({ anecdote }) => {
  const dispatch = useDispatch()
  const vote = (id) => {
    console.log('vote', id)
    dispatch(voteAnecdote(id))
    dispatch(setNotification(`You voted '${anecdote.content}'`))
  }

  return (
    <div>
      <div>{anecdote.content}</div>
      <div>
        has {anecdote.votes}
        <button onClick={() => vote(anecdote.id)}>vote</button>
      </div>
    </div>
  )
}

const Anecdotes = () => {
  const anecdotes = useSelector(({ anecdotes, filter }) =>
    anecdotes
      .filter((s) =>
        s.content.toLowerCase().includes(filter.trim().toLowerCase())
      )
      .toSorted((a, b) => b.votes - a.votes)
  )

  return (
    <div>
      {anecdotes.map((anecdote) => (
        <Anecdote key={anecdote.id} anecdote={anecdote} />
      ))}
    </div>
  )
}

export default Anecdotes
