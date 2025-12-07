import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import { StoryProvider } from './context/StoryContext'
import { StorybookProvider } from './context/StorybookContext'
import './styles/global.css'
import './index.css'

// 환경변수 디버깅
console.log("🌍 ENV CHECK", import.meta.env);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <StoryProvider>
      <StorybookProvider>
        <App />
      </StorybookProvider>
    </StoryProvider>
  </React.StrictMode>,
)
