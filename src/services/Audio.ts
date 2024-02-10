import { MAX_VOLUME, NUMBER_OF_VOICES } from '@src/constants'
import { times, wait } from '@src/functions'

type Voice = {
  nodes?: {
    oscillator: OscillatorNode
    gain: GainNode
  }
  frequency: number
  volume: number
}

type InitializedVoice = {
  nodes: {
    oscillator: OscillatorNode
    gain: GainNode
  }
  frequency: number
  volume: number
}

export type MODES = 'harmonics' | 'subharmonics'

export let mode: MODES = 'harmonics'

export const getBaseFrequency = () => {
  if (mode === 'harmonics') {
    return 110
  } else {
    return 1760
  }
}

export const getInitialHarmonic = () => {
  if (mode === 'harmonics') {
    return 4 // 110 * 4 = 440
  } else {
    return 4 // 1760 / 4 = 440
  }
}

export const calculateFrequency = (harmonic: number) => {
  if (mode === 'harmonics') {
    return getBaseFrequency() * harmonic
  } else {
    return getBaseFrequency() / harmonic
  }
}

let ctx: AudioContext
const voices: Voice[] = times(
  () => ({
    frequency: calculateFrequency(getInitialHarmonic()),
    volume: 0
  }),
  NUMBER_OF_VOICES
)

const initCtx = () => {
  if (typeof ctx !== 'undefined') {
    return
  }

  ctx = new AudioContext()

  voices.forEach((voice) => {
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
}

export const soundOn = async (voiceIdx: number) => {
  initCtx()

  const transitionInMs = 500

  const endTime = ctx.currentTime + transitionInMs / 1000
  const endVolume = MAX_VOLUME / NUMBER_OF_VOICES

  const voice = voices[voiceIdx] as InitializedVoice

  voice.nodes.gain.gain.value = voice.volume
  voice.nodes.gain.gain.linearRampToValueAtTime(endVolume, endTime)

  await wait(transitionInMs)
  voice.nodes.gain.gain.value = endVolume
  voice.volume = endVolume

  // TODO: adjust other voices too, so that the overall volume is the same
  // endVolume = MAX_VOLUME / numberOfActiveVoices
}

export const soundOff = async (voiceIdx: number) => {
  initCtx()

  const transitionInMs = 500

  const endTime = ctx.currentTime + transitionInMs / 1000
  const endVolume = 0

  const voice = voices[voiceIdx] as InitializedVoice

  voice.nodes.gain.gain.value = voice.volume
  voice.nodes.gain.gain.linearRampToValueAtTime(endVolume, endTime)

  await wait(transitionInMs)
  voice.nodes.gain.gain.value = endVolume
  voice.volume = endVolume

  // TODO: adjust other voices too, so that the overall volume is the same
  // startVolume = MAX_VOLUME / numberOfActiveVoices
}

export const setFrequency = async (frequency: number, voiceIdx: number) => {
  const transitionInMs = 50

  if (typeof ctx !== 'undefined') {
    const voice = voices[voiceIdx] as InitializedVoice

    const endTime = ctx.currentTime + transitionInMs / 1000

    voice.nodes.oscillator.frequency.value = voice.frequency
    voice.nodes.oscillator.frequency.linearRampToValueAtTime(frequency, endTime)

    await wait(transitionInMs)
    voice.nodes.oscillator.frequency.value = frequency
  }

  voices[voiceIdx].frequency = frequency
}
