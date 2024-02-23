import React, { FC, useState } from 'react'
import { Slider } from '@components/Slider/Slider'
import { ToggleSwitch } from '@components/ToggleSwitch/ToggleSwitch'
import { roundToNDecimals } from '@src/functions'
import { useDispatch, useSelector } from '@src/store/hooks'
import { calculateFrequency, mode, setFrequency, soundOff, soundOn } from '@src/store/slices/Audio.slice'
import s from './Voice.module.scss'

type VoiceProps = {
  idx: number
}

export const Voice: FC<VoiceProps> = ({ idx }) => {
  const [harmonic, setHarmonic] = useState(idx + (mode === 'harmonics' ? 1 : 4))

  const soundState = useSelector((state) => {
    const voice = state.audio.voices[idx]

    if (voice.transition !== 'idle') {
      return voice.transition
    }

    return voice.volume > 0 ? 'on' : 'off'
  })

  const dispatch = useDispatch()

  const toggleSoundOn = async () => {
    if (soundState === 'on') {
      await dispatch(soundOff(idx)).unwrap()
      return
    }

    if (soundState === 'off') {
      await dispatch(soundOn(idx)).unwrap()
    }
  }

  const changeHarmonic = async (newHarmonic: number) => {
    if (newHarmonic != harmonic) {
      await dispatch(setFrequency({ frequency: calculateFrequency(newHarmonic), voiceIdx: idx })).unwrap()
      setHarmonic(newHarmonic)
    }
  }

  const switchLabels = {
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
      <span className={s.frequency}>{roundToNDecimals(1, calculateFrequency(harmonic))} Hz</span>
    </div>
  )
}
