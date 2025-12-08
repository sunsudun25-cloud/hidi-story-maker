import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import { StoryProvider } from './context/StoryContext'
import { StorybookProvider } from './context/StorybookContext'
import { FontSizeProvider } from './context/FontSizeContext'
import './styles/theme.css'
import './styles/global.css'
import './styles/canva-theme.css'
import './index.css'

// 환경변수 디버깅
console.log("🌍 ENV CHECK", import.meta.env);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <FontSizeProvider>
      <StoryProvider>
        <StorybookProvider>
          <App />
        </StorybookProvider>
      </StoryProvider>
    </FontSizeProvider>
  </React.StrictMode>,
)
