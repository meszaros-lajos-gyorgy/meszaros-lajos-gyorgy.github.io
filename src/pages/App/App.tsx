import React, { type FC } from 'react'
import { Voices } from '@components/Voices/Voices'
import { MAX_BASE_FREQUENCY, MIN_BASE_FREQUENCY } from '@src/constants'
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

  function changeBaseFrequency() {
    const newFrequency = roundToNDecimals(2, randomBetween(MIN_BASE_FREQUENCY, MAX_BASE_FREQUENCY))
    dispatch(setBaseFrequency({ frequency: newFrequency }))
  }

  return (
    <div className={s.App}>
      <a
        className={s.modeLink}
        href={`?mode=${
          mode === 'harmonics' ? 'subharmonics' : 'harmonics'
        }&base-frequency=${baseFrequency}&number-of-voices=${numberOfVoices}`}
      >
        {mode === 'harmonics' ? 'subharmonics' : 'harmonics'}
      </a>

      <h2>Voices ({mode})</h2>

      <button type="button" onClick={changeBaseFrequency}>
        randomize base frequency: {baseFrequency} Hz
      </button>

      <Voices />
    </div>
  )
}
