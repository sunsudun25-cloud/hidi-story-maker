import React from 'react'
import { useNavigate } from 'react-router-dom'
import './Welcome.css'

const Welcome: React.FC = () => {
  const navigate = useNavigate()

  const handleStart = () => {
    navigate('/onboarding')
  }

  return (
    <div className="welcome-container">
      <div className="welcome-content">
        <div className="welcome-header">
          <h1 className="welcome-title">AI 스토리 메이커</h1>
          <p className="welcome-subtitle">AI와 함께 만드는 특별한 이야기</p>
        </div>
        
        <button className="welcome-start-button" onClick={handleStart}>
          시작하기
        </button>
      </div>
    </div>
  )
}

export default Welcome
