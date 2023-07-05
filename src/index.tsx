import React, { FC } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from '@src/components/App'
import { onReady } from '@src/functions'
import './style.scss'

onReady(async () => {
  const wrapper = document.getElementById('app')

  if (wrapper !== null) {
    const root = createRoot(wrapper)
    setTimeout(() => {
      root.render(<App />)
    }, 1000)
  }
})
