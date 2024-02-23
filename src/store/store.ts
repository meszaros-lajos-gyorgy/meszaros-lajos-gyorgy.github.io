import { configureStore } from '@reduxjs/toolkit'
import AudioSlice from './slices/Audio.slice'

export const store = configureStore({
  reducer: {
    audio: AudioSlice
  }
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
