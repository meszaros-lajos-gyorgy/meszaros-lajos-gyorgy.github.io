import React, { FC } from 'react'
import { mode } from '@services/Audio'
import { Voice } from '@components/Voice/Voice'
import { NUMBER_OF_VOICES } from '@src/constants'
import { times } from '@src/functions'
import s from './Voices.module.scss'

type VoicesProps = {}

export const Voices: FC<VoicesProps> = () => {
  return (
    <section className={s.Voices}>
      <a
        style={{ float: 'right', marginTop: 15, marginRight: 8 }}
        href={mode === 'harmonics' ? '?mode=subharmonics' : '?mode=harmonics'}
      >
        {mode === 'harmonics' ? 'subharmonics' : 'harmonics'}
      </a>
      <h2>{mode === 'harmonics' ? 'Voices (harmonics)' : 'Voices (subharmonics)'}</h2>
      {times((idx) => {
        return <Voice key={idx} idx={idx} />
      }, NUMBER_OF_VOICES)}
    </section>
  )
}
