/**
 * The number of different sounds the app can make.
 * Each voice has an oscillator and a gain.
 */
export const DEFAULT_NUMBER_OF_VOICES = 8

/**
 * The maximum voice the whole app will emit when all voices are enabled.
 * The range of this constant goes between 0.0 (no sound) and 1.0 (max sound).
 * Should be kept slightly below 1.0 to prevent clipping.
 */
export const MAX_VOLUME = 0.8
