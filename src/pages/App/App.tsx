import React, { type FC } from 'react'
import { Button } from '@components/Button/Button'
import { Voices } from '@components/Voices/Voices'
import { DEFAULT_BASE_FREQUENCY, MAX_BASE_FREQUENCY, MIN_BASE_FREQUENCY } from '@src/constants'
import { randomBetween, roundToNDecimals } from '@src/functions'
import { useDispatch, useSelector } from '@src/store/hooks'
import { type MODES, setBaseFrequency } from '@src/store/slices/Audio.slice'
import s from './App.module.scss'

type AppProps = {}

export const App: FC<AppProps> = () => {
  const baseFrequency = useSelector<number>((state) => {
    return state.audio.baseFrequency
  })

  const numberOfVoices = useSelector<number>((state) => {
    return state.audio.voices.length
  })

  const mode = useSelector<MODES>((state) => {
    return state.audio.mode
  })

  const nextMode = useSelector<string>((state) => {
    return mode === 'harmonics' ? 'subharmonics' : 'harmonics'
  })

  const linkToNextMode = useSelector<string>((state) => {
    const params = new URLSearchParams({
      mode: nextMode,
      'base-frequency': baseFrequency.toString(),
      'number-of-voices': numberOfVoices.toString()
    })

    return '?' + params.toString()
  })

  const dispatch = useDispatch()

  function randomizeBaseFrequency() {
    const newFrequency = roundToNDecimals(2, randomBetween(MIN_BASE_FREQUENCY, MAX_BASE_FREQUENCY))
    dispatch(setBaseFrequency({ frequency: newFrequency }))
  }

  function resetBaseFrequency() {
    dispatch(setBaseFrequency({ frequency: DEFAULT_BASE_FREQUENCY }))
  }

  return (
    <div className={s.App}>
      <a className={s.modeLink} href={linkToNextMode}>
        {nextMode}
      </a>

      <h2>Voices ({mode})</h2>

      <p className={s.infoWithButtons}>
        Base Frequency: {baseFrequency} Hz
        <Button onClick={randomizeBaseFrequency}>randomize</Button>
        <Button onClick={resetBaseFrequency}>reset to {DEFAULT_BASE_FREQUENCY} Hz</Button>
      </p>

      <Voices />
    </div>
  )
}
