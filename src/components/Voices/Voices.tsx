import React from 'react'
import type { FC } from 'react'
import { ToggleSwitch } from '@components/ToggleSwitch/ToggleSwitch'
import { Voice } from '@components/Voice/Voice'
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

  const numberOfVoices = useSelector((state) => {
    return state.audio.voices.length
  })

  const dispatch = useDispatch()

  async function soundOnAll() {
    return Promise.all(
      times((idx) => {
        return dispatch(soundOn(idx))
      }, numberOfVoices)
    )
  }

  async function soundOffAll() {
    return Promise.all(
      times((idx) => {
        return dispatch(soundOff(idx))
      }, numberOfVoices)
    )
  }

  return (
    <section className={s.Voices}>
      <a className={s.modeLink} href={`?mode=${mode === 'harmonics' ? 'subharmonics' : 'harmonics'}`}>
        {mode === 'harmonics' ? 'subharmonics' : 'harmonics'}
      </a>

      <h2>Voices ({mode})</h2>

      <div className={s.allChannelControls}>
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
      }, numberOfVoices)}
    </section>
  )
}
