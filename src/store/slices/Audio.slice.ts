import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import type { Draft } from '@reduxjs/toolkit'
import {
  MAX_VOLUME,
  DEFAULT_NUMBER_OF_VOICES,
  DEFAULT_BASE_FREQUENCY,
  MIN_BASE_FREQUENCY,
  MAX_BASE_FREQUENCY,
  DEFAULT_MODE,
  MIN_NUMBER_OF_VOICES,
  MAX_NUMBER_OF_VOICES
} from '@src/constants'
import { clamp, times, wait } from '@src/functions'

export type Voice = {
  nodes?: {
    oscillator: OscillatorNode
    gain: GainNode
  }
  frequency: number
  volume: number
  transition: 'ramping-up' | 'ramping-down' | 'idle'
}

type InitializedVoice = {
  nodes: {
    oscillator: OscillatorNode
    gain: GainNode
  }
  frequency: number
  volume: number
  transition: 'ramping-up' | 'ramping-down' | 'idle'
}

export type MODES = 'harmonics' | 'subharmonics'

type ParsedURLParams = {
  mode: MODES
  baseFrequency: number
  numberOfVoices: number
}

function parseURLParams(): ParsedURLParams {
  const params = new URLSearchParams(window.location.search)

  const settings: ParsedURLParams = {
    mode: DEFAULT_MODE,
    baseFrequency: DEFAULT_BASE_FREQUENCY,
    numberOfVoices: DEFAULT_NUMBER_OF_VOICES
  }

  if (params.has('mode')) {
    const mode = params.get('mode') as string
    if (mode === 'harmonics' || mode === 'subharmonics') {
      settings.mode = mode
    }
  }

  if (params.has('base-frequency')) {
    const rawBaseFrequency = params.get('base-frequency') as string
    const baseFrequency = Number.parseInt(rawBaseFrequency, 10)

    if (!Number.isNaN(baseFrequency)) {
      settings.baseFrequency = clamp(MIN_BASE_FREQUENCY, MAX_BASE_FREQUENCY, baseFrequency)
    }
  }

  if (params.has('number-of-voices')) {
    const rawNumberOfVoices = params.get('number-of-voices') as string
    const numberOfVoices = Number.parseInt(rawNumberOfVoices, 10)

    if (!Number.isNaN(numberOfVoices)) {
      settings.numberOfVoices = clamp(MIN_NUMBER_OF_VOICES, MAX_NUMBER_OF_VOICES, numberOfVoices)
    }
  }

  return settings
}

export function adjustBaseFrequency(mode: MODES, baseFrequency: number): number {
  if (mode === 'harmonics') {
    // harmonics go too high too quickly
    return baseFrequency / 4
  } else {
    // subharmonics go too deep too quickly
    return baseFrequency * 4
  }
}

export function calculateFrequency(mode: MODES, harmonic: number, baseFrequency: number): number {
  if (mode === 'harmonics') {
    return adjustBaseFrequency(mode, baseFrequency) * harmonic
  } else {
    return adjustBaseFrequency(mode, baseFrequency) / harmonic
  }
}

function initCtx(state: Draft<AudioState>) {
  if (state.ctx !== undefined) {
    return
  }

  const ctx = new AudioContext()

  state.voices.forEach((voice) => {
    voice.nodes = {
      oscillator: ctx.createOscillator(),
      gain: ctx.createGain()
    }

    const oscillator = voice.nodes.oscillator
    oscillator.frequency.value = voice.frequency
    oscillator.type = 'sine'

    const gain = voice.nodes.gain
    gain.gain.value = voice.volume

    oscillator.connect(gain)
    gain.connect(ctx.destination)

    oscillator.start()
  })

  state.ctx = ctx
}

export function getStarterHarmonic(mode: MODES): number {
  if (mode === 'harmonics') {
    return 1
  } else {
    // opinionated step: subharmonics start to get interesting at the 4th step
    return 4
  }
}

const volumeChangeTransitionInMs = 500
const frequencyChangeTransitionInMs = 50

export const soundOn = createAsyncThunk<void, number, {}>('audio/soundOn', async () => {
  await wait(volumeChangeTransitionInMs)
})

export const soundOff = createAsyncThunk<void, number, {}>('audio/soundOff', async () => {
  await wait(volumeChangeTransitionInMs)
})

export const setFrequency = createAsyncThunk<void, { frequency: number; voiceIdx: number }, {}>(
  'audio/setFrequency',
  async (payload, { getState }) => {
    const { audio } = getState() as { audio: AudioState }

    if (audio.ctx !== undefined) {
      await wait(frequencyChangeTransitionInMs)
    }
  }
)

// TODO: move "mode" into AudioState
export const { mode, baseFrequency, numberOfVoices } = parseURLParams()

export type AudioState = {
  ctx?: AudioContext
  baseFrequency: number
  voices: Voice[]
}

const initialState: AudioState = {
  ctx: undefined,
  baseFrequency,
  voices: times(
    (idx) => ({
      frequency: calculateFrequency(mode, idx + getStarterHarmonic(mode), baseFrequency),
      volume: 0,
      transition: 'idle'
    }),
    numberOfVoices
  )
}

export const AudioSlice = createSlice({
  name: 'audio',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(soundOn.pending, (state: AudioState, { meta: { arg } }) => {
      initCtx(state)

      const endVolume = MAX_VOLUME / state.voices.length
      const endTime = (state.ctx as AudioContext).currentTime + volumeChangeTransitionInMs / 1000

      const voiceIdx = arg
      const voice = state.voices[voiceIdx] as InitializedVoice

      if (voice.volume === endVolume) {
        return
      }

      voice.nodes.gain.gain.value = voice.volume
      voice.nodes.gain.gain.linearRampToValueAtTime(endVolume, endTime)
      voice.transition = 'ramping-up'
    })

    builder.addCase(soundOn.fulfilled, (state: AudioState, { meta: { arg } }) => {
      const endVolume = MAX_VOLUME / state.voices.length

      const voiceIdx = arg
      const voice = state.voices[voiceIdx] as InitializedVoice

      voice.nodes.gain.gain.value = endVolume
      voice.volume = endVolume
      voice.transition = 'idle'
    })

    // ---

    builder.addCase(soundOff.pending, (state: AudioState, { meta: { arg } }) => {
      initCtx(state)

      const endVolume = 0
      const endTime = (state.ctx as AudioContext).currentTime + volumeChangeTransitionInMs / 1000

      const voiceIdx = arg
      const voice = state.voices[voiceIdx] as InitializedVoice

      if (voice.volume === endVolume) {
        return
      }

      voice.nodes.gain.gain.value = voice.volume
      voice.nodes.gain.gain.linearRampToValueAtTime(endVolume, endTime)
      voice.transition = 'ramping-down'
    })

    builder.addCase(soundOff.fulfilled, (state: AudioState, { meta: { arg } }) => {
      const endVolume = 0

      const voiceIdx = arg
      const voice = state.voices[voiceIdx] as InitializedVoice

      voice.nodes.gain.gain.value = endVolume
      voice.volume = endVolume
      voice.transition = 'idle'
    })

    // ---

    builder.addCase(setFrequency.pending, (state: AudioState, { meta: { arg } }) => {
      const { voiceIdx, frequency } = arg
      if (state.ctx === undefined) {
        return
      }

      const endTime = state.ctx.currentTime + frequencyChangeTransitionInMs / 1000

      const voice = state.voices[voiceIdx] as InitializedVoice

      voice.nodes.oscillator.frequency.value = voice.frequency
      voice.nodes.oscillator.frequency.linearRampToValueAtTime(frequency, endTime)
    })

    builder.addCase(setFrequency.fulfilled, (state: AudioState, { meta: { arg } }) => {
      const { voiceIdx, frequency } = arg

      if (state.ctx === undefined) {
        const voice = state.voices[voiceIdx]
        voice.frequency = frequency
      } else {
        const voice = state.voices[voiceIdx] as InitializedVoice
        voice.nodes.oscillator.frequency.value = frequency
        voice.frequency = frequency
      }
    })
  }
})

export default AudioSlice.reducer
