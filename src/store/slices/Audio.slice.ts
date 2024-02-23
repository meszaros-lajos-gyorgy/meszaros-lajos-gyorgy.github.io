import { createAsyncThunk, createSlice, Draft, PayloadAction } from '@reduxjs/toolkit'
import { MAX_VOLUME, NUMBER_OF_VOICES } from '@src/constants'
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

export type AudioState = {
  ctx?: AudioContext
  voices: Voice[]
  // TODO: move mode here instead of having it in a variable
}

export type MODES = 'harmonics' | 'subharmonics'

const loadModeFromUrl = (): MODES => {
  const params = new URLSearchParams(window.location.search)
  if (!params.has('mode')) {
    return 'harmonics'
  }

  const mode = params.get('mode') as string
  if (mode !== 'harmonics' && mode !== 'subharmonics') {
    return 'harmonics'
  }

  return mode
}

export const mode = loadModeFromUrl()

export const getBaseFrequency = () => {
  if (mode === 'harmonics') {
    return 110
  } else {
    return 1760
  }
}

export const calculateFrequency = (harmonic: number) => {
  if (mode === 'harmonics') {
    return getBaseFrequency() * harmonic
  } else {
    return getBaseFrequency() / harmonic
  }
}

const initialState: AudioState = {
  ctx: undefined,
  voices: times(
    (idx) => ({
      frequency: calculateFrequency(idx + (mode === 'harmonics' ? 1 : 4)),
      volume: 0,
      transition: 'idle'
    }),
    NUMBER_OF_VOICES
  )
}

const initCtx = (state: Draft<AudioState>) => {
  if (typeof state.ctx !== 'undefined') {
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

    if (typeof audio.ctx !== 'undefined') {
      await wait(frequencyChangeTransitionInMs)
    }
  }
)

export const AudioSlice = createSlice({
  name: 'audio',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(soundOn.pending, (state: AudioState, { meta: { arg } }) => {
      initCtx(state)

      const endVolume = MAX_VOLUME / NUMBER_OF_VOICES
      const endTime = (state.ctx as AudioContext).currentTime + volumeChangeTransitionInMs / 1000

      const voiceIdx = arg
      const voice = state.voices[voiceIdx] as InitializedVoice

      voice.nodes.gain.gain.value = voice.volume
      voice.nodes.gain.gain.linearRampToValueAtTime(endVolume, endTime)
      voice.transition = 'ramping-up'
    })
    builder.addCase(soundOn.fulfilled, (state: AudioState, { meta: { arg } }) => {
      const endVolume = MAX_VOLUME / NUMBER_OF_VOICES

      const voiceIdx = arg
      const voice = state.voices[voiceIdx] as InitializedVoice

      voice.nodes.gain.gain.value = endVolume
      voice.volume = endVolume
      voice.transition = 'idle'
    })

    builder.addCase(soundOff.pending, (state: AudioState, { meta: { arg } }) => {
      initCtx(state)

      const endVolume = 0
      const endTime = (state.ctx as AudioContext).currentTime + volumeChangeTransitionInMs / 1000

      const voiceIdx = arg
      const voice = state.voices[voiceIdx] as InitializedVoice

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

    builder.addCase(setFrequency.pending, (state: AudioState, { meta: { arg } }) => {
      const { voiceIdx, frequency } = arg
      if (typeof state.ctx === 'undefined') {
        return
      }

      const endTime = state.ctx.currentTime + frequencyChangeTransitionInMs / 1000

      const voice = state.voices[voiceIdx] as InitializedVoice

      voice.nodes.oscillator.frequency.value = voice.frequency
      voice.nodes.oscillator.frequency.linearRampToValueAtTime(frequency, endTime)
    })
    builder.addCase(setFrequency.fulfilled, (state: AudioState, { meta: { arg } }) => {
      const { voiceIdx, frequency } = arg

      if (typeof state.ctx === 'undefined') {
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
