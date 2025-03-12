export function onReady(fn: () => void): void {
  if (document.readyState !== 'loading') {
    fn()
  } else {
    document.addEventListener('DOMContentLoaded', fn)
  }
}

export function wait(delayInMs: number): Promise<void> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve(undefined)
    }, delayInMs)
  })
}

export function clamp(min: number, max: number, n: number): number {
  if (n < min) {
    return min
  }

  if (n > max) {
    return max
  }

  return n
}

export function times<T>(fn: (index: number) => T, repetitions: number): T[] {
  return [...Array(repetitions)].map((value, index) => fn(index))
}

export function roundToNDecimals(decimals: number, x: number): number {
  return Math.round(x * 10 ** decimals) / 10 ** decimals
}

/**
 * creates a random floating point number between a (inclusive) and b (exclusive)
 */
export function randomBetween(a: number, b: number): number {
  return a + Math.random() * (b - a)
}
