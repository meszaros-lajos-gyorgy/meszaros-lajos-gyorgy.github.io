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
