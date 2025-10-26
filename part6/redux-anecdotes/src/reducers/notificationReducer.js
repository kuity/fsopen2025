import { createSlice } from '@reduxjs/toolkit'

const notificationSlice = createSlice({
  name: 'notification',
  initialState: '',
  reducers: {
    changeNotification(_state, action) {
      return action.payload
    }
  }
})

export const { changeNotification } = notificationSlice.actions

let timeoutId = null

export const setNotification = (message, seconds = 5) => {
  return dispatch => {
    if (timeoutId) {
      clearTimeout(timeoutId)
    }
    dispatch(changeNotification(message))
    timeoutId = setTimeout(() => {
      dispatch(changeNotification(''))
    }, seconds * 1000)
  }
}

export default notificationSlice.reducer
