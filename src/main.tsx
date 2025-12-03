import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import { StoryProvider } from './context/StoryContext'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <StoryProvider>
      <App />
    </StoryProvider>
  </React.StrictMode>,
)
