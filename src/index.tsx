import React from 'react'
import { createRoot } from 'react-dom/client'
import { App } from '@pages/App/App'
import { onReady } from '@src/functions'
import './style.scss'

onReady(async () => {
  const wrapper = document.getElementById('app')

  if (wrapper !== null) {
    const root = createRoot(wrapper)
    root.render(<App />)
  }
})
