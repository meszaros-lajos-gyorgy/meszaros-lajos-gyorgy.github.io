import React, { FC } from 'react'
import { NUMBER_OF_VOICES } from '@services/Audio'
import { Voice } from '@components/Voice/Voice'
import s from './style.module.scss'

type AppProps = {}

export const App: FC<AppProps> = () => {
  return (
    <div className={s.App}>
      <h2>Voices</h2>
      {'x'
        .repeat(NUMBER_OF_VOICES)
        .split('')
        .map((_, idx) => {
          return <Voice key={idx} idx={idx} />
        })}
    </div>
  )
}
