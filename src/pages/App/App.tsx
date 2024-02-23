import React, { FC } from 'react'
import { Provider } from 'react-redux'
import { Header } from '@components/Header/Header'
import { Voices } from '@components/Voices/Voices'
import { store } from '@src/store/store'

type AppProps = {}

export const App: FC<AppProps> = () => {
  return (
    <Provider store={store}>
      <Header />
      <Voices />
    </Provider>
  )
}
