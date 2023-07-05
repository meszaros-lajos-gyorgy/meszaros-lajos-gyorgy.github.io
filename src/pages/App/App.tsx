import React, { FC } from 'react'
import { Header } from '@components/Header/Header'
import { Voices } from '@components/Voices/Voices'
import s from './style.module.scss'

type AppProps = {}

export const App: FC<AppProps> = () => {
  return (
    <div className={s.App}>
      <Header />
      <Voices />
    </div>
  )
}
