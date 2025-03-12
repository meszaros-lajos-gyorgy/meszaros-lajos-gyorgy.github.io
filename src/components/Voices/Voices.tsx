import React, { type FC } from 'react'
import { ToggleSwitch } from '@components/ToggleSwitch/ToggleSwitch'
import { Voice } from '@components/Voice/Voice'
import { MAX_BASE_FREQUENCY, MIN_BASE_FREQUENCY } from '@src/constants'
import { randomBetween, roundToNDecimals, times } from '@src/functions'
import { useDispatch, useSelector } from '@src/store/hooks'
import { MODES, setBaseFrequency, soundOff, soundOn } from '@src/store/slices/Audio.slice'
import s from './Voices.module.scss'

type VoicesProps = {}

export const Voices: FC<VoicesProps> = () => {
  const areAnyVoicesOn = useSelector<boolean>((state) => {
    return state.audio.voices.some((voice) => {
      if (voice.transition === 'ramping-up') {
        return true
      }

      if (voice.transition === 'idle' && voice.volume > 0) {
        return true
      }

      return false
    })
  })

  const numberOfVoices = useSelector<number>((state) => {
    return state.audio.voices.length
  })

  const baseFrequency = useSelector<number>((state) => {
    return state.audio.baseFrequency
  })

  const mode = useSelector<MODES>((state) => {
    return state.audio.mode
  })

  const dispatch = useDispatch()

  async function soundOnAll() {
    return Promise.all(
      times((idx) => {
        return dispatch(soundOn(idx))
      }, numberOfVoices)
    )
  }

  async function soundOffAll() {
    return Promise.all(
      times((idx) => {
        return dispatch(soundOff(idx))
      }, numberOfVoices)
    )
  }

  function changeBaseFrequency() {
    const newFrequency = roundToNDecimals(2, randomBetween(MIN_BASE_FREQUENCY, MAX_BASE_FREQUENCY))
    dispatch(setBaseFrequency({ frequency: newFrequency }))
  }

  return (
    <section className={s.Voices}>
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

      <div className={s.allChannelControls}>
        <ToggleSwitch
          isOn={areAnyVoicesOn}
          label={areAnyVoicesOn ? 'turn all off' : 'turn all on'}
          onClick={() => {
            if (areAnyVoicesOn) {
              soundOffAll()
            } else {
              soundOnAll()
            }
          }}
        />
      </div>

      {times((idx) => {
        return <Voice key={idx} idx={idx} />
      }, numberOfVoices)}
    </section>
  )
}
