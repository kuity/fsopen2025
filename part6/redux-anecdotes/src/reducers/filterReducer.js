import { createSlice } from '@reduxjs/toolkit'

const filterSlice = createSlice({
  name: 'filter',
  initialState: '',
  reducers: {
    filterChange(_state, action) {
      return action.payload
    }
  }
})

export const { filterChange } = filterSlice.actions
export default filterSlice.reducer
