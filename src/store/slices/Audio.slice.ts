import { createAsyncThunk, createSlice, Draft } from '@reduxjs/toolkit'
import { MAX_VOLUME, DEFAULT_NUMBER_OF_VOICES } from '@src/constants'
import { times, wait } from '@src/functions'

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

function parseURLParams(): { mode: MODES } {
  const params = new URLSearchParams(window.location.search)

  const settings: { mode: MODES } = {
    mode: 'harmonics'
  }

  if (params.has('mode')) {
    const mode = params.get('mode') as string
    if (mode === 'harmonics' || mode === 'subharmonics') {
      settings.mode = mode
    }
  }

  return settings
}

export function getBaseFrequency(mode: MODES): number {
  if (mode === 'harmonics') {
    return 440 / 4
  } else {
    return 440 * 4
  }
}

export function calculateFrequency(mode: MODES, harmonic: number): number {
  if (mode === 'harmonics') {
    return getBaseFrequency(mode) * harmonic
  } else {
    return getBaseFrequency(mode) / harmonic
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

// TODO: move this into state
export const { mode } = parseURLParams()

export type AudioState = {
  ctx?: AudioContext
  voices: Voice[]
  // TODO: move mode here instead of having it in a variable
}

const initialState: AudioState = {
  ctx: undefined,
  voices: times(
    (idx) => ({
      frequency: calculateFrequency(mode, idx + (mode === 'harmonics' ? 1 : 4)),
      volume: 0,
      transition: 'idle'
    }),
    DEFAULT_NUMBER_OF_VOICES
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
