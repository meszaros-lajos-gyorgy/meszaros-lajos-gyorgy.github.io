import React, { FC, useState } from 'react'
import { setFrequency, soundOff, soundOn } from '@services/Audio'
import { Slider } from '@components/Slider/Slider'
import { ToggleSwitch } from '@components/ToggleSwitch/ToggleSwitch'
import { BASE_FREQUENCY, INITIAL_HARMONIC } from '@src/constants'
import s from './Voice.module.scss'

type VoiceProps = {
  idx: number
}

export const Voice: FC<VoiceProps> = ({ idx }) => {
  // TODO: move this to redux

  const [isSoundChanging, setIsSoundChanging] = useState(false)
  const [isSoundOn, setIsSoundOn] = useState(false)
  const [harmonic, setHarmonic] = useState(INITIAL_HARMONIC)

  const toggleSoundOn = async () => {
    setIsSoundChanging(true)
    if (isSoundOn) {
      await soundOff(idx)
    } else {
      await soundOn(idx)
    }
    setIsSoundChanging(false)
    setIsSoundOn(!isSoundOn)
  }

  const changeHarmonic = async (newHarmonic: number) => {
    if (newHarmonic != harmonic) {
      await setFrequency(newHarmonic * BASE_FREQUENCY, idx)
      setHarmonic(newHarmonic)
    }
  }

  return (
    <div className={s.Voice}>
      <span>
        <ToggleSwitch isOn={isSoundOn} onClick={toggleSoundOn} />
      </span>
      <Slider
        min={1}
        max={16}
        value={harmonic}
        onChange={changeHarmonic}
        isActive={(!isSoundOn && isSoundChanging) || (isSoundOn && !isSoundChanging)}
      />
      <span className={s.frequency}>{harmonic * BASE_FREQUENCY} Hz</span>
    </div>
  )
}
