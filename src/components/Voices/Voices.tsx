import React, { FC } from 'react'
import { Voice } from '@components/Voice/Voice'
import { NUMBER_OF_VOICES } from '@src/constants'
import s from './Voices.module.scss'

type VoicesProps = {}

export const Voices: FC<VoicesProps> = () => {
  return (
    <section className={s.Voices}>
      <h2>Voices</h2>
      {'x'
        .repeat(NUMBER_OF_VOICES)
        .split('')
        .map((_, idx) => {
          return <Voice key={idx} idx={idx} />
        })}
    </section>
  )
}
