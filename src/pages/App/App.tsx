import React, { type FC } from 'react'
import { Voices } from '@components/Voices/Voices'
import { DEFAULT_BASE_FREQUENCY, MAX_BASE_FREQUENCY, MIN_BASE_FREQUENCY } from '@src/constants'
import { randomBetween, roundToNDecimals } from '@src/functions'
import { useDispatch, useSelector } from '@src/store/hooks'
import { MODES, setBaseFrequency } from '@src/store/slices/Audio.slice'
import s from './App.module.scss'

type AppProps = {}

export const App: FC<AppProps> = () => {
  const baseFrequency = useSelector<number>((state) => {
    return state.audio.baseFrequency
  })

  const mode = useSelector<MODES>((state) => {
    return state.audio.mode
  })

  const numberOfVoices = useSelector<number>((state) => {
    return state.audio.voices.length
  })

  const dispatch = useDispatch()

  function randomizeBaseFrequency() {
    const newFrequency = roundToNDecimals(2, randomBetween(MIN_BASE_FREQUENCY, MAX_BASE_FREQUENCY))
    dispatch(setBaseFrequency({ frequency: newFrequency }))
  }

  function resetBaseFrequency() {
    dispatch(setBaseFrequency({ frequency: DEFAULT_BASE_FREQUENCY }))
  }

  const nextMode = mode === 'harmonics' ? 'subharmonics' : 'harmonics'

  const linkToNextMode = `?mode=${nextMode}&base-frequency=${baseFrequency}&number-of-voices=${numberOfVoices}`

  return (
    <div className={s.App}>
      <a className={s.modeLink} href={linkToNextMode}>
        {nextMode}
      </a>

      <h2>Voices ({mode})</h2>

      <p className={s.infoWithButtons}>
        Base Frequency: {baseFrequency} Hz
        <button type="button" onClick={randomizeBaseFrequency}>
          randomize
        </button>
        <button type="button" onClick={resetBaseFrequency}>
          reset to {DEFAULT_BASE_FREQUENCY} Hz
        </button>
      </p>

      <Voices />
    </div>
  )
}
