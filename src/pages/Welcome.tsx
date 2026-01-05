import React from 'react'
import { useNavigate } from 'react-router-dom'
import './Welcome.css'
import '../components/Layout.css'

const Welcome: React.FC = () => {
  const navigate = useNavigate()

  const handleStart = () => {
    navigate('/onboarding')
  }

  return (
    <div className="welcome-container">
      <div className="welcome-content">
        {/* 회사 로고 및 슬로건 - 최상단으로 이동 */}
        <div className="welcome-company">
          <div className="company-name">HI-DI Edu</div>
          <div className="company-slogan">모든 세대를 잇는 AI 스토리 플랫폼</div>
        </div>

        {/* AI 아이콘 */}
        <div className="welcome-icon">
          <div className="icon-box">
            <span className="icon-text">AI</span>
          </div>
        </div>

        {/* 타이틀 섹션 */}
        <div className="welcome-header">
          <h1 className="welcome-title">스토리 메이커</h1>
          <p className="welcome-subtitle">AI와 함께 만드는 특별한 이야기</p>
        </div>
        
        {/* 시작하기 버튼 */}
        <button className="welcome-start-button" onClick={handleStart}>
          시작하기
        </button>

        {/* 하단 안내 */}
        <div className="welcome-features">
          <div className="feature-item">
            <span className="feature-dot green"></span>
            <span className="feature-text">무료로 시작</span>
          </div>
          <div className="feature-item">
            <span className="feature-dot orange"></span>
            <span className="feature-text">회원가입 불필요</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Welcome
