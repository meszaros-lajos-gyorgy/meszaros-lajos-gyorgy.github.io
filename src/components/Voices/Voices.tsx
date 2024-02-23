import React, { FC } from 'react'
import { ToggleSwitch } from '@components/ToggleSwitch/ToggleSwitch'
import { Voice } from '@components/Voice/Voice'
import { NUMBER_OF_VOICES } from '@src/constants'
import { times } from '@src/functions'
import { useDispatch, useSelector } from '@src/store/hooks'
import { mode, soundOff, soundOn } from '@src/store/slices/Audio.slice'
import s from './Voices.module.scss'

type VoicesProps = {}

export const Voices: FC<VoicesProps> = () => {
  const areAnyVoicesOn = useSelector((state) => {
    return state.audio.voices.some((voice) => {
      if (voice.transition === 'ramping-up') {
        return true
      }

      if (voice.transition === 'idle' && voice.volume > 0) {
        return true
      }

      return false
    })
  })

  const dispatch = useDispatch()

  const soundOnAll = async () => {
    return Promise.all(times((idx) => dispatch(soundOn(idx)), NUMBER_OF_VOICES))
  }

  const soundOffAll = async () => {
    return Promise.all(times((idx) => dispatch(soundOff(idx)), NUMBER_OF_VOICES))
  }

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
          isOn={areAnyVoicesOn}
          label={areAnyVoicesOn ? 'turn all off' : 'turn all on'}
          onClick={() => {
            if (areAnyVoicesOn) {
              soundOffAll()
            } else {
              soundOnAll()
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
