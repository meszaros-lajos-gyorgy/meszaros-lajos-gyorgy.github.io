import React, { type FC } from 'react'
import { Slider } from '@components/Slider/Slider'
import { ToggleSwitch } from '@components/ToggleSwitch/ToggleSwitch'
import { roundToNDecimals } from '@src/functions'
import { useDispatch, useSelector } from '@src/store/hooks'
import { setVoiceHarmonic, soundOff, soundOn } from '@src/store/slices/Audio.slice'
import s from './Voice.module.scss'

type VoiceProps = {
  idx: number
}

type SoundState = 'ramping-up' | 'ramping-down' | 'on' | 'off'

const switchLabels: Record<SoundState, string> = {
  on: 'on',
  off: 'off',
  'ramping-up': 'turning on',
  'ramping-down': 'turning off'
}

export const Voice: FC<VoiceProps> = ({ idx }) => {
  const soundState = useSelector<SoundState>((state) => {
    const voice = state.audio.voices[idx]

    if (voice.transition !== 'idle') {
      return voice.transition
    }

    return voice.volume > 0 ? 'on' : 'off'
  })

  const frequency = useSelector<number>((state) => {
    return state.audio.voices[idx].frequency
  })

  const harmonic = useSelector<number>((state) => {
    return state.audio.voices[idx].harmonic
  })

  const dispatch = useDispatch()

  function toggleSoundOn(): void {
    if (soundState === 'on') {
      dispatch(soundOff(idx))
    } else if (soundState === 'off') {
      dispatch(soundOn(idx))
    }
  }

  function changeHarmonic(newHarmonic: number): void {
    if (newHarmonic === harmonic) {
      return
    }

    dispatch(
      setVoiceHarmonic({
        harmonic: newHarmonic,
        voiceIdx: idx
      })
    )
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

      <span className={s.frequency}>{roundToNDecimals(1, frequency)} Hz</span>
    </div>
  )
}
