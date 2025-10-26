import { createSlice } from '@reduxjs/toolkit'
import anecdoteService from '../services/anecdotes'

const anecdoteSlice = createSlice({
  name: 'anecdotes',
  initialState: [],
  reducers: {
    createAnecdote(state, action) {
      state.push(action.payload)
    },
    updateAnecdote(state, action) {
      const updatedAnecdote = action.payload
      return state.map((anecdote) =>
        anecdote.id !== updatedAnecdote.id ? anecdote : updatedAnecdote
      )
    },
    setAnecdotes(_state, action) {
      return action.payload
    }
  }
})

export const { setAnecdotes, createAnecdote, updateAnecdote } =
  anecdoteSlice.actions

export const initializeAnecdotes = () => {
  return async (dispatch) => {
    const anecdotes = await anecdoteService.getAll()
    dispatch(setAnecdotes(anecdotes))
  }
}

export const appendAnecdote = (content) => {
  return async (dispatch) => {
    const anecdote = await anecdoteService.createNew(content)
    dispatch(createAnecdote(anecdote))
  }
}

export const voteAnecdote = (id) => {
  return async (dispatch, getState) => {
    const anecdoteToVote = getState().anecdotes.find((a) => a.id === id)
    const updatedAnecdote = {
      ...anecdoteToVote,
      votes: anecdoteToVote.votes + 1
    }
    const returnedAnecdote = await anecdoteService.update(id, updatedAnecdote)
    dispatch(updateAnecdote(returnedAnecdote))
  }
}

export default anecdoteSlice.reducer
