import React from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import { App } from '@pages/App/App'
import { onReady } from '@src/functions'
import { store } from '@src/store/store'
import './style.scss'

onReady(async () => {
  const wrapper = document.getElementById('app')

  if (wrapper !== null) {
    const root = createRoot(wrapper)
    root.render(
      <Provider store={store}>
        <App />
      </Provider>
    )
  }
})
