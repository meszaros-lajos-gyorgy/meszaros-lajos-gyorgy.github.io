/**
 * The number of different sounds the app can make.
 * Each voice has an oscillator and a gain.
 */
export const DEFAULT_NUMBER_OF_VOICES = 8
export const MIN_NUMBER_OF_VOICES = 4
export const MAX_NUMBER_OF_VOICES = 16

/**
 * The maximum voice the whole app will emit when all voices are enabled.
 * The range of this constant goes between 0.0 (no sound) and 1.0 (max sound).
 * Should be kept slightly below 1.0 to prevent clipping.
 */
export const MAX_VOLUME = 0.8

export const DEFAULT_MODE = 'harmonics'

export const DEFAULT_BASE_FREQUENCY = 440
export const MIN_BASE_FREQUENCY = 200
export const MAX_BASE_FREQUENCY = 2000

export const volumeChangeTransitionInMs = 500
export const frequencyChangeTransitionInMs = 50
