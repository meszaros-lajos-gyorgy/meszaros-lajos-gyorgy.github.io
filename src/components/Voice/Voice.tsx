import React, { FC, useState } from 'react'
import { setFrequency, soundOff, soundOn } from '@services/Audio'
import { Slider } from '@components/Slider/Slider'
import { ToggleSwitch } from '@components/ToggleSwitch/ToggleSwitch'
import s from './style.module.scss'

type VoiceProps = {
  idx: number
}

export const Voice: FC<VoiceProps> = ({ idx }) => {
  // TODO: move this to redux

  const [isSoundOn, setIsSoundOn] = useState(false)
  const [harmonic, setHarmonic] = useState(2)

  const toggleSoundOn = async () => {
    if (isSoundOn) {
      await soundOff(idx)
    } else {
      await soundOn(idx)
    }
    setIsSoundOn(!isSoundOn)
  }

  const changeHarmonic = async (newHarmonic: number) => {
    if (newHarmonic != harmonic) {
      const baseFrequency = 100
      await setFrequency(newHarmonic * baseFrequency, idx)
      setHarmonic(newHarmonic)
    }
  }

  return (
    <div className={s.Voice}>
      <span>
        <ToggleSwitch isOn={isSoundOn} onClick={toggleSoundOn} />
      </span>
      <Slider min={1} max={16} value={harmonic} onChange={changeHarmonic} />
      <span className={s.frequency}>{harmonic * 100} Hz</span>
    </div>
  )
}
