import React, { FC, useState } from 'react'
import { areAnyVoicesOn, mode, soundOffAll, soundOnAll } from '@services/Audio'
import { ToggleSwitch } from '@components/ToggleSwitch/ToggleSwitch'
import { Voice } from '@components/Voice/Voice'
import { NUMBER_OF_VOICES } from '@src/constants'
import { times } from '@src/functions'
import s from './Voices.module.scss'

type VoicesProps = {}

export const Voices: FC<VoicesProps> = () => {
  const [anyVoicesOn, setAnyVoicesOn] = useState(areAnyVoicesOn())

  return (
    <section className={s.Voices}>
      <a
        style={{ float: 'right', marginTop: 15, marginRight: 8 }}
        href={mode === 'harmonics' ? '?mode=subharmonics' : '?mode=harmonics'}
      >
        {mode === 'harmonics' ? 'subharmonics' : 'harmonics'}
      </a>

      <h2>{mode === 'harmonics' ? 'Voices (harmonics)' : 'Voices (subharmonics)'}</h2>

      <div style={{ padding: '11px', margin: '0 0 -5px 0' }}>
        <ToggleSwitch
          isOn={anyVoicesOn}
          onClick={() => {
            if (areAnyVoicesOn()) {
              soundOffAll()
              setAnyVoicesOn(false)
            } else {
              soundOnAll()
              setAnyVoicesOn(true)
            }
          }}
        />
      </div>
      {times((idx) => {
        return <Voice key={idx} idx={idx} />
      }, NUMBER_OF_VOICES)}
    </section>
  )
}
