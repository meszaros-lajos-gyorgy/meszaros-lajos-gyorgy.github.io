import React, { ChangeEvent, FC, useState } from 'react'
import { setFrequency, soundOff, soundOn } from '@services/Audio'
import { ToggleSwitch } from '@components/ToggleSwitch/ToggleSwitch'
import { clamp } from '@src/functions'
import s from './style.module.scss'

type VoiceProps = {
  idx: number
}

export const Voice: FC<VoiceProps> = ({ idx }) => {
  // TODO: move this to redux

  const [harmonic, setHarmonic] = useState(2)
  const [isHarmonicSwitching, setIsHarmonicSwitching] = useState(false)

  const toggleSoundOn = async (isOn: boolean) => {
    if (isOn) {
      await soundOff(idx)
    } else {
      await soundOn(idx)
    }
  }

  const changeHarmonic = async (e: ChangeEvent<HTMLInputElement>) => {
    if (isHarmonicSwitching) {
      return
    }

    let newHarmonic = parseInt(e.target.value)
    if (isNaN(newHarmonic)) {
      newHarmonic = 1
    } else {
      newHarmonic = clamp(1, 16, newHarmonic)
    }

    if (newHarmonic != harmonic) {
      setIsHarmonicSwitching(true)

      const baseFrequency = 100
      await setFrequency(newHarmonic * baseFrequency, idx)
      setHarmonic(newHarmonic)
      setIsHarmonicSwitching(false)
    }
  }

  return (
    <div className={s.Voice}>
      <span>
        <ToggleSwitch onClick={toggleSoundOn} />
      </span>
      <span>
        <input type="range" min={1} max={16} value={harmonic} onInput={changeHarmonic} />
        {harmonic * 100}&nbsp;Hz
      </span>
    </div>
  )
}
