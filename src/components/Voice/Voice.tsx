import React, { ChangeEvent, FC, useState } from 'react'
import cn from 'classnames'
import { setFrequency, soundOff, soundOn } from '@services/Audio'
import s from './style.module.scss'

type VoiceProps = {
  idx: number
}

export const Voice: FC<VoiceProps> = ({ idx }) => {
  // TODO: move this to redux
  const [isSoundOn, setIsSoundOn] = useState(false)
  const [isSoundSwitching, setIsSoundSwitching] = useState(false)
  const [harmonic, setHarmonic] = useState(2)
  const [isHarmonicSwitching, setIsHarmonicSwitching] = useState(false)

  const toggleSoundOn = async () => {
    if (isSoundSwitching) {
      return
    }

    setIsSoundSwitching(true)
    if (isSoundOn) {
      await soundOff(idx)
    } else {
      await soundOn(idx)
    }
    setIsSoundOn(!isSoundOn)
    setIsSoundSwitching(false)
  }

  const changeHarmonic = async (e: ChangeEvent<HTMLInputElement>) => {
    if (isHarmonicSwitching) {
      return
    }

    let newHarmonic = parseInt(e.target.value)
    if (isNaN(newHarmonic) || newHarmonic < 1) {
      newHarmonic = 1
    } else if (newHarmonic > 16) {
      newHarmonic = 16
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
      <span>{idx + 1}</span>
      <span>
        <button
          onClick={toggleSoundOn}
          className={cn({
            [s.on]: isSoundOn,
            [s.off]: !isSoundOn,
            [s.changing]: isSoundSwitching
          })}
        >
          {isSoundSwitching ? 'turning ' + (isSoundOn ? 'off' : 'on') : isSoundOn ? 'on' : 'off'}
        </button>
      </span>
      <span>
        <input type="range" min={1} max={16} value={harmonic} onInput={changeHarmonic} />
        {harmonic * 100}&nbsp;Hz
      </span>
    </div>
  )
}
