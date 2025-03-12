import type { SetOptional } from 'type-fest'
import { createAsyncThunk, createSlice, type PayloadAction, type Draft } from '@reduxjs/toolkit'
import {
  MAX_VOLUME,
  DEFAULT_NUMBER_OF_VOICES,
  DEFAULT_BASE_FREQUENCY,
  MIN_BASE_FREQUENCY,
  MAX_BASE_FREQUENCY,
  DEFAULT_MODE,
  MIN_NUMBER_OF_VOICES,
  MAX_NUMBER_OF_VOICES,
  volumeChangeTransitionInMs,
  frequencyChangeTransitionInMs
} from '@src/constants'
import { clamp, times, wait } from '@src/functions'

type InitializedVoice = {
  nodes: {
    oscillator: OscillatorNode
    gain: GainNode
  }
  frequency: number
  harmonic: number
  isLocked: boolean
  volume: number
  transition: 'ramping-up' | 'ramping-down' | 'idle'
}

export type Voice = SetOptional<InitializedVoice, 'nodes'>

export type MODES = 'harmonics' | 'subharmonics'

export type AudioState = {
  ctx?: AudioContext
  baseFrequency: number
  mode: MODES
  voices: Voice[]
}

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

function generateInitialState(): AudioState {
  const { mode, baseFrequency, numberOfVoices } = parseURLParams()

  return {
    ctx: undefined,
    baseFrequency,
    mode,
    voices: times<Voice>((idx) => {
      const harmonic = idx + getStarterHarmonic(mode)

      const voice: Voice = {
        harmonic,
        frequency: calculateFrequency(mode, harmonic, baseFrequency),
        volume: 0,
        isLocked: false,
        transition: 'idle'
      }

      return voice
    }, numberOfVoices)
  }
}

// --------------------------
// functions to calculate stuff based on modes

// TODO: abstract MODES into a list of values in a scale
// https://github.com/meszaros-lajos-gyorgy/meszaros-lajos-gyorgy.github.io/issues/5

export function adjustBaseFrequency(mode: MODES, baseFrequency: number): number {
  if (mode === 'harmonics') {
    // harmonics go too high too quickly -> baseFrequency is moved lower 2 octaves
    return baseFrequency / 4
  } else {
    // subharmonics go too deep too quickly -> baseFrequency is moved higher 2 octaves
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

export function getStarterHarmonic(mode: MODES): number {
  if (mode === 'harmonics') {
    return 1
  } else {
    // opinionated step: subharmonics start to get interesting at the 4th step
    return 4
  }
}

// --------------------------
// actions

export const soundOn = createAsyncThunk<void, { voiceIdx: number }, {}>(
  'audio/soundOn',
  async (payload, { getState }) => {
    const { audio } = getState() as { audio: AudioState }

    const voice = audio.voices[payload.voiceIdx]
    if (voice.isLocked) {
      throw new Error('voice locked')
    }

    await wait(volumeChangeTransitionInMs)
  }
)

export const soundOff = createAsyncThunk<void, { voiceIdx: number }, {}>(
  'audio/soundOff',
  async (payload, { getState }) => {
    const { audio } = getState() as { audio: AudioState }

    const voice = audio.voices[payload.voiceIdx]
    if (voice.isLocked) {
      throw new Error('voice locked')
    }

    await wait(volumeChangeTransitionInMs)
  }
)

export const setVoiceHarmonic = createAsyncThunk<void, { harmonic: number; voiceIdx: number }, {}>(
  'audio/setVoiceHarmonic',
  async (payload, { getState }) => {
    const { audio } = getState() as { audio: AudioState }

    const voice = audio.voices[payload.voiceIdx]
    if (voice.isLocked) {
      throw new Error('voice locked')
    }

    if (audio.ctx === undefined) {
      return
    }

    await wait(frequencyChangeTransitionInMs)
  }
)

export const setBaseFrequency = createAsyncThunk<void, { frequency: number }, {}>(
  'audio/setBaseFrequency',
  async (payload, { getState }) => {
    const { audio } = getState() as { audio: AudioState }

    if (audio.ctx === undefined) {
      return
    }

    await wait(frequencyChangeTransitionInMs)
  }
)

// TODO: create an action for changing mode

// --------------------------

export const AudioSlice = createSlice({
  name: 'audio',
  initialState: generateInitialState(),
  reducers: {
    lock: (state, action: PayloadAction<{ voiceIdx: number }>) => {
      const { voiceIdx } = action.payload
      state.voices[voiceIdx].isLocked = true
    },
    unlock: (state, action: PayloadAction<{ voiceIdx: number }>) => {
      const { voiceIdx } = action.payload
      state.voices[voiceIdx].isLocked = false
    }
  },
  extraReducers: (builder) => {
    builder.addCase(soundOn.pending, (state: AudioState, { meta: { arg } }) => {
      initCtx(state)

      const endVolume = MAX_VOLUME / state.voices.length
      const endTime = (state.ctx as AudioContext).currentTime + volumeChangeTransitionInMs / 1000

      const { voiceIdx } = arg
      const voice = state.voices[voiceIdx] as InitializedVoice

      if (voice.isLocked) {
        throw new Error('voice locked')
      }

      if (voice.volume === endVolume) {
        return
      }

      voice.nodes.gain.gain.value = voice.volume
      voice.nodes.gain.gain.linearRampToValueAtTime(endVolume, endTime)
      voice.transition = 'ramping-up'
    })

    builder.addCase(soundOn.fulfilled, (state: AudioState, { meta: { arg } }) => {
      const endVolume = MAX_VOLUME / state.voices.length

      const { voiceIdx } = arg
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

      const { voiceIdx } = arg
      const voice = state.voices[voiceIdx] as InitializedVoice

      if (voice.isLocked) {
        throw new Error('voice locked')
      }

      if (voice.volume === endVolume) {
        return
      }

      voice.nodes.gain.gain.value = voice.volume
      voice.nodes.gain.gain.linearRampToValueAtTime(endVolume, endTime)
      voice.transition = 'ramping-down'
    })

    builder.addCase(soundOff.fulfilled, (state: AudioState, { meta: { arg } }) => {
      const endVolume = 0

      const { voiceIdx } = arg
      const voice = state.voices[voiceIdx] as InitializedVoice

      voice.nodes.gain.gain.value = endVolume
      voice.volume = endVolume
      voice.transition = 'idle'
    })

    // ---

    builder.addCase(setVoiceHarmonic.pending, (state: AudioState, { meta: { arg } }) => {
      const { voiceIdx, harmonic } = arg
      if (state.ctx === undefined) {
        return
      }

      const endTime = state.ctx.currentTime + frequencyChangeTransitionInMs / 1000
      const newFrequency = calculateFrequency(state.mode, harmonic, state.baseFrequency)

      const voice = state.voices[voiceIdx] as InitializedVoice

      if (voice.isLocked) {
        throw new Error('voice locked')
      }

      voice.nodes.oscillator.frequency.value = voice.frequency
      voice.nodes.oscillator.frequency.linearRampToValueAtTime(newFrequency, endTime)
    })

    builder.addCase(setVoiceHarmonic.fulfilled, (state: AudioState, { meta: { arg } }) => {
      const { voiceIdx, harmonic } = arg

      const newFrequency = calculateFrequency(state.mode, harmonic, state.baseFrequency)

      if (state.ctx === undefined) {
        const voice = state.voices[voiceIdx]
        voice.frequency = newFrequency
        voice.harmonic = harmonic
      } else {
        const voice = state.voices[voiceIdx] as InitializedVoice
        voice.nodes.oscillator.frequency.value = newFrequency
        voice.frequency = newFrequency
        voice.harmonic = harmonic
      }
    })

    // ---

    builder.addCase(setBaseFrequency.pending, (state: AudioState, { meta: { arg } }) => {
      const { frequency } = arg
      if (state.ctx === undefined) {
        return
      }

      const endTime = state.ctx.currentTime + frequencyChangeTransitionInMs / 1000

      const voices = state.voices as InitializedVoice[]
      voices.forEach((voice) => {
        const newFrequency = calculateFrequency(state.mode, voice.harmonic, frequency)

        voice.nodes.oscillator.frequency.value = voice.frequency
        voice.nodes.oscillator.frequency.linearRampToValueAtTime(newFrequency, endTime)
      })
    })

    builder.addCase(setBaseFrequency.fulfilled, (state: AudioState, { meta: { arg } }) => {
      const { frequency } = arg

      state.baseFrequency = frequency

      // TODO: sync baseFrequency to URL
      // https://github.com/meszaros-lajos-gyorgy/meszaros-lajos-gyorgy.github.io/issues/8

      if (state.ctx === undefined) {
        const voices = state.voices
        voices.forEach((voice) => {
          const newFrequency = calculateFrequency(state.mode, voice.harmonic, frequency)

          voice.frequency = newFrequency
        })
      } else {
        const voices = state.voices as InitializedVoice[]
        voices.forEach((voice) => {
          const newFrequency = calculateFrequency(state.mode, voice.harmonic, frequency)

          voice.nodes.oscillator.frequency.value = newFrequency
          voice.frequency = newFrequency
        })
      }
    })
  }
})

export default AudioSlice.reducer

export const { lock: lockVoice, unlock: unlockVoice } = AudioSlice.actions
