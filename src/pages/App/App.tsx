import React, { FC } from 'react'
import { Header } from '@components/Header/Header'
import { Voices } from '@components/Voices/Voices'

type AppProps = {}

export const App: FC<AppProps> = () => {
  return (
    <>
      <Header />
      <Voices />
    </>
  )
}
