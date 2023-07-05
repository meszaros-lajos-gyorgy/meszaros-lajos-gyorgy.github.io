import { wait } from '@src/functions'

let ctx: AudioContext

// TODO: move this to redux
const oscillators: OscillatorNode[] = []
const gains: GainNode[] = []

const voiceFrequencies: number[] = []
const voiceGains: number[] = []

export const NUMBER_OF_VOICES = 8
const MAX_VOLUME = 0.8

const initCtx = () => {
  if (typeof ctx !== 'undefined') {
    return
  }

  ctx = new AudioContext()

  for (let i = 0; i < NUMBER_OF_VOICES; i++) {
    voiceFrequencies.push(200)
    voiceGains.push(0)

    const oscillator = ctx.createOscillator()
    oscillator.frequency.value = voiceFrequencies[i]
    oscillator.type = 'sine'
    oscillators.push(oscillator)

    const gain = ctx.createGain()
    gain.gain.value = voiceGains[i]
    gains.push(gain)

    oscillator.connect(gain)
    gain.connect(ctx.destination)

    oscillator.start()
  }
}

export const soundOn = async (voiceIdx: number) => {
  initCtx()

  const transitionInMs = 500

  const endTime = ctx.currentTime + transitionInMs / 1000
  const endVolume = MAX_VOLUME / NUMBER_OF_VOICES

  gains[voiceIdx].gain.value = voiceGains[voiceIdx]
  gains[voiceIdx].gain.linearRampToValueAtTime(endVolume, endTime)

  await wait(transitionInMs)
  gains[voiceIdx].gain.value = endVolume
  voiceGains[voiceIdx] = endVolume

  // TODO: adjust other voices too, so that the overall volume is the same
  // endVolume = MAX_VOLUME / numberOfActiveVoices
}

export const soundOff = async (voiceIdx: number) => {
  initCtx()

  const transitionInMs = 500

  const endTime = ctx.currentTime + transitionInMs / 1000
  const endVolume = 0

  gains[voiceIdx].gain.value = voiceGains[voiceIdx]
  gains[voiceIdx].gain.linearRampToValueAtTime(endVolume, endTime)

  await wait(transitionInMs)
  gains[voiceIdx].gain.value = endVolume
  voiceGains[voiceIdx] = endVolume

  // TODO: adjust other voices too, so that the overall volume is the same
  // startVolume = MAX_VOLUME / numberOfActiveVoices
}

export const setFrequency = async (frequency: number, voiceIdx: number) => {
  initCtx()

  const transitionInMs = 50

  const endTime = ctx.currentTime + transitionInMs / 1000

  oscillators[voiceIdx].frequency.value = voiceFrequencies[voiceIdx]
  oscillators[voiceIdx].frequency.linearRampToValueAtTime(frequency, endTime)

  await wait(transitionInMs)
  oscillators[voiceIdx].frequency.value = frequency
  voiceFrequencies[voiceIdx] = frequency
}
