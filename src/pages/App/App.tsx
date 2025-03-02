import React from 'react'
import type { FC } from 'react'
import { Provider } from 'react-redux'
import { Voices } from '@components/Voices/Voices'
import { store } from '@src/store/store'

type AppProps = {}

export const App: FC<AppProps> = () => {
  return (
    <Provider store={store}>
      <Voices />
    </Provider>
  )
}
