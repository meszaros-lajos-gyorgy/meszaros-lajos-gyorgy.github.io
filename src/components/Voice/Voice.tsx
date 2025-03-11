import React, { useState } from 'react'
import type { FC } from 'react'
import { Slider } from '@components/Slider/Slider'
import { ToggleSwitch } from '@components/ToggleSwitch/ToggleSwitch'
import { roundToNDecimals } from '@src/functions'
import { useDispatch, useSelector } from '@src/store/hooks'
import {
  calculateFrequency,
  getStarterHarmonic,
  MODES,
  setFrequency,
  soundOff,
  soundOn
} from '@src/store/slices/Audio.slice'
import s from './Voice.module.scss'

type VoiceProps = {
  idx: number
}

type SoundState = 'ramping-up' | 'ramping-down' | 'on' | 'off'

export const Voice: FC<VoiceProps> = ({ idx }) => {
  const mode = useSelector<MODES>((state) => {
    return state.audio.mode
  })

  const soundState = useSelector<SoundState>((state) => {
    const voice = state.audio.voices[idx]

    if (voice.transition !== 'idle') {
      return voice.transition
    }

    return voice.volume > 0 ? 'on' : 'off'
  })

  const baseFrequency = useSelector<number>((state) => {
    return state.audio.baseFrequency
  })

  const dispatch = useDispatch()

  const [harmonic, setHarmonic] = useState(idx + getStarterHarmonic(mode))

  async function toggleSoundOn(): Promise<void> {
    if (soundState === 'on') {
      await dispatch(soundOff(idx)).unwrap()
      return
    }

    if (soundState === 'off') {
      await dispatch(soundOn(idx)).unwrap()
    }
  }

  async function changeHarmonic(newHarmonic: number): Promise<void> {
    if (newHarmonic === harmonic) {
      return
    }

    await dispatch(
      setFrequency({
        frequency: calculateFrequency(mode, newHarmonic, baseFrequency),
        voiceIdx: idx
      })
    ).unwrap()

    setHarmonic(newHarmonic)
  }

  const switchLabels: Record<SoundState, string> = {
    on: 'on',
    off: 'off',
    'ramping-up': 'turning on',
    'ramping-down': 'turning off'
  }

  return (
    <div className={s.Voice}>
      <span>
        <ToggleSwitch
          onClick={toggleSoundOn}
          isOn={soundState === 'ramping-up' || soundState === 'on'}
          label={switchLabels[soundState]}
        />
      </span>
      <Slider
        min={1}
        max={16}
        value={harmonic}
        onChange={changeHarmonic}
        isActive={soundState === 'ramping-up' || soundState === 'on'}
      />
      <span className={s.frequency}>{roundToNDecimals(1, calculateFrequency(mode, harmonic, baseFrequency))} Hz</span>
    </div>
  )
}
