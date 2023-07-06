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
