export const onReady = (fn: () => void) => {
  if (document.readyState !== 'loading') {
    fn()
  } else {
    document.addEventListener('DOMContentLoaded', fn)
  }
}

export const wait = (delayInMs: number): Promise<void> => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve(undefined)
    }, delayInMs)
  })
}

export const clamp = (min: number, max: number, n: number) => {
  if (n < min) {
    return min
  }

  if (n > max) {
    return max
  }

  return n
}

export const times = <T>(fn: (index: number) => T, repetitions: number): T[] => {
  return [...Array(repetitions)].map((value, index) => fn(index))
}

export const roundToNDecimals = (decimals: number, x: number) => {
  return Math.round(x * 10 ** decimals) / 10 ** decimals
}
