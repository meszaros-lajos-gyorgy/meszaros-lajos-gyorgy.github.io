import React, { FC } from 'react'
import { Voice } from '@components/Voice/Voice'
import { NUMBER_OF_VOICES } from '@src/constants'
import { times } from '@src/functions'
import s from './Voices.module.scss'

type VoicesProps = {}

export const Voices: FC<VoicesProps> = () => {
  return (
    <section className={s.Voices}>
      <h2>Voices</h2>
      {times((idx) => {
        return <Voice key={idx} idx={idx} />
      }, NUMBER_OF_VOICES)}
    </section>
  )
}
