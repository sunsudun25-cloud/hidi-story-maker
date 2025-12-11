import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import { StoryProvider } from './context/StoryContext'
import { StorybookProvider } from './context/StorybookContext'
import { FontSizeProvider } from './context/FontSizeContext'
import './styles/design-system.css'  // ⭐ 디자인 시스템 최우선
import './styles/screen.css'         // ⭐ 공통 페이지 스타일
import './styles/theme.css'
import './styles/global.css'
import './styles/canva-theme.css'
import './index.css'

// 환경변수 디버깅 (개발 환경에서만)
if (import.meta.env.DEV) {
  console.log("🌍 ENV CHECK (Dev Only)", {
    mode: import.meta.env.MODE,
    hasGeminiKey: !!import.meta.env.VITE_GEMINI_API_KEY
  });
}

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
