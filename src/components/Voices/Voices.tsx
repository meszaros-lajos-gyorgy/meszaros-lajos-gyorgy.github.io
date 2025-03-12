import React, { type FC } from 'react'
import { ToggleSwitch } from '@components/ToggleSwitch/ToggleSwitch'
import { Voice } from '@components/Voice/Voice'
import { times } from '@src/functions'
import { useDispatch, useSelector } from '@src/store/hooks'
import { soundOff, soundOn } from '@src/store/slices/Audio.slice'
import s from './Voices.module.scss'

type VoicesProps = {}

export const Voices: FC<VoicesProps> = () => {
  const areAnyVoicesOn = useSelector<boolean>((state) => {
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

  const numberOfVoices = useSelector<number>((state) => {
    return state.audio.voices.length
  })

  const dispatch = useDispatch()

  function soundOnAll() {
    times((idx) => {
      return dispatch(soundOn(idx))
    }, numberOfVoices)
  }

  function soundOffAll() {
    times((idx) => {
      return dispatch(soundOff(idx))
    }, numberOfVoices)
  }

  function toggleAllVoices() {
    if (areAnyVoicesOn) {
      soundOffAll()
    } else {
      soundOnAll()
    }
  }

  return (
    <section className={s.Voices}>
      <div className={s.allChannelControls}>
        <ToggleSwitch isOn={areAnyVoicesOn} smooth onClick={toggleAllVoices}>
          {areAnyVoicesOn ? 'turn all off' : 'turn all on'}
        </ToggleSwitch>
      </div>

      {times((idx) => {
        return <Voice key={idx} idx={idx} />
      }, numberOfVoices)}
    </section>
  )
}
