import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ensureLearner, saveCurrentLearner } from '../services/classroomService'
import './OnboardingLogin.css'

const OnboardingLogin: React.FC = () => {
  const navigate = useNavigate()
  const [showClassCodeInput, setShowClassCodeInput] = useState(false)
  const [useUnifiedCode, setUseUnifiedCode] = useState(false)
  const [classCode, setClassCode] = useState('')
  const [learnerCode, setLearnerCode] = useState('')
  const [learnerName, setLearnerName] = useState('')
  const [unifiedCode, setUnifiedCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleGuestLogin = () => {
    navigate('/home')
  }

  const handleClassCodeLogin = async () => {
    // 통합 코드 모드 처리
    let finalClassCode = classCode
    let finalLearnerCode = learnerCode
    
    if (useUnifiedCode) {
      if (unifiedCode.length !== 8) {
        setError('8자리 코드를 입력해주세요 (예: 10040001)')
        return
      }
      finalClassCode = unifiedCode.slice(0, 4)
      finalLearnerCode = unifiedCode.slice(4, 8)
    } else {
      if (!classCode.trim() || !learnerCode.trim() || !learnerName.trim()) {
        setError('수업 코드, 학생 번호, 이름을 모두 입력해주세요')
        return
      }
      
      // 수업 코드 형식 검증 (영문 1글자 + 숫자 4자리)
      if (!/^[A-Z]\d{4}$/.test(classCode.trim())) {
        setError('수업 코드는 영문 1글자 + 숫자 4자리 형식이어야 합니다 (예: C8683)')
        return
      }
    }

    setLoading(true)
    setError('')

    try {
      console.log('🔐 수업 코드 로그인 시도:', { 
        classCode: finalClassCode, 
        learnerCode: finalLearnerCode 
      })
      
      // Firebase Functions API 호출
      const learnerInfo = await ensureLearner(
        finalClassCode.toUpperCase().trim(),
        finalLearnerCode.trim(),
        learnerName.trim() || undefined
      )

      // 로컬 스토리지에 저장
      saveCurrentLearner(learnerInfo)

      console.log('✅ 수업 코드 로그인 성공:', learnerInfo)
      
      // 홈으로 이동
      navigate('/home')
    } catch (err: any) {
      console.error('❌ 수업 코드 로그인 실패:', err)
      setError(err.message || '로그인에 실패했습니다. 수업 코드를 확인해주세요.')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleLogin = () => {
    // TODO: Google 로그인 구현
    console.log('Google 로그인')
  }

  const handleKakaoLogin = () => {
    // TODO: 카카오 로그인 구현
    console.log('카카오 로그인')
  }

  return (
    <div className="onboarding-container">
      <div className="onboarding-content">
        <div className="onboarding-header">
          <h1 className="onboarding-title">환영합니다!</h1>
        </div>

        <div className="onboarding-buttons">
          {/* 수업 코드 입력 섹션 */}
          {!showClassCodeInput ? (
            <>
              {/* 수업 코드로 시작하기 버튼 */}
              <button 
                className="onboarding-btn class-code-btn" 
                onClick={() => setShowClassCodeInput(true)}
                style={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white',
                  fontSize: '18px',
                  fontWeight: 'bold',
                  padding: '16px',
                  marginBottom: '12px'
                }}
              >
                <span className="btn-text">🎓 수업 코드로 시작하기</span>
              </button>

              {/* 비회원 버튼 */}
              <button className="onboarding-btn guest-btn" onClick={handleGuestLogin}>
                <span className="btn-text">비회원로그인</span>
              </button>
            </>
          ) : (
            <div className="class-code-input-section" style={{
              background: '#f8f9fa',
              padding: '24px',
              borderRadius: '12px',
              marginBottom: '16px'
            }}>
              <h3 style={{ marginBottom: '16px', fontSize: '18px', fontWeight: 'bold', color: '#333' }}>
                🎓 수업 코드 입력
              </h3>

              {/* 입력 모드 전환 */}
              <div style={{ 
                display: 'flex', 
                gap: '8px', 
                marginBottom: '16px',
                background: '#fff',
                padding: '4px',
                borderRadius: '8px'
              }}>
                <button
                  onClick={() => setUseUnifiedCode(false)}
                  style={{
                    flex: 1,
                    padding: '8px',
                    fontSize: '14px',
                    background: !useUnifiedCode ? '#667eea' : 'transparent',
                    color: !useUnifiedCode ? 'white' : '#666',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontWeight: !useUnifiedCode ? 'bold' : 'normal'
                  }}
                >
                  분리 입력
                </button>
                <button
                  onClick={() => setUseUnifiedCode(true)}
                  style={{
                    flex: 1,
                    padding: '8px',
                    fontSize: '14px',
                    background: useUnifiedCode ? '#667eea' : 'transparent',
                    color: useUnifiedCode ? 'white' : '#666',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontWeight: useUnifiedCode ? 'bold' : 'normal'
                  }}
                >
                  통합 입력
                </button>
              </div>
              
              {error && (
                <div style={{
                  background: '#fee',
                  color: '#c33',
                  padding: '12px',
                  borderRadius: '8px',
                  marginBottom: '12px',
                  fontSize: '14px'
                }}>
                  {error}
                </div>
              )}

              {/* 통합 코드 입력 모드 */}
              {useUnifiedCode ? (
                <div style={{ marginBottom: '16px' }}>
                  <input
                    type="tel"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    className="unified-code-input"
                    placeholder="8자리 코드 (예: 10040001)"
                    value={unifiedCode}
                    onChange={(e) => {
                      const value = e.target.value.replace(/[^0-9]/g, '')
                      setUnifiedCode(value)
                    }}
                    maxLength={8}
                    disabled={loading}
                    style={{
                      width: '100%',
                      padding: '16px',
                      fontSize: '28px',
                      textAlign: 'center',
                      letterSpacing: '6px',
                      fontWeight: 'bold',
                      border: '2px solid #ddd',
                      borderRadius: '8px',
                      fontFamily: 'monospace'
                    }}
                  />
                  <div style={{ 
                    fontSize: '13px', 
                    color: '#666', 
                    marginTop: '8px',
                    textAlign: 'center',
                    lineHeight: '1.5'
                  }}>
                    💡 수업코드(4자리) + 학생번호(4자리)<br/>
                    <span style={{ color: '#667eea', fontWeight: 'bold' }}>
                      {unifiedCode.length >= 4 && `${unifiedCode.slice(0, 4)}-${unifiedCode.slice(4)}`}
                    </span>
                  </div>
                </div>
              ) : (
                <>
                  <div style={{ marginBottom: '12px' }}>
                <input
                  type="text"
                  inputMode="text"
                  className="class-code-input"
                  placeholder="수업 코드 (예: C8683)"
                  value={classCode}
                  onChange={(e) => {
                    const value = e.target.value.replace(/[^0-9A-Z]/gi, '')
                    setClassCode(value.toUpperCase())
                  }}
                  maxLength={5}
                  disabled={loading}
                  style={{
                    fontSize: '24px',
                    textAlign: 'center',
                    letterSpacing: '4px',
                    fontWeight: 'bold'
                  }}
                />
                <div style={{ 
                  fontSize: '12px', 
                  color: '#666', 
                  marginTop: '4px',
                  textAlign: 'center'
                }}>
                  💡 영문 1글자 + 숫자 4자리 (예: C8683)
                </div>
              </div>

              <div style={{ marginBottom: '12px' }}>
                <input
                  type="tel"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  className="learner-code-input"
                  placeholder="학생 번호 4자리 (예: 0001)"
                  value={learnerCode}
                  onChange={(e) => {
                    const value = e.target.value.replace(/[^0-9]/g, '')
                    setLearnerCode(value)
                  }}
                  maxLength={4}
                  disabled={loading}
                  style={{
                    fontSize: '24px',
                    textAlign: 'center',
                    letterSpacing: '4px',
                    fontWeight: 'bold'
                  }}
                />
                <div style={{ 
                  fontSize: '12px', 
                  color: '#666', 
                  marginTop: '4px',
                  textAlign: 'center'
                }}>
                  💡 학생 번호 (예: 0001=1번)
                </div>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <input
                  type="text"
                  className="learner-name-input"
                  placeholder="이름 (예: 홍길동)"
                  value={learnerName}
                  onChange={(e) => setLearnerName(e.target.value)}
                  disabled={loading}
                  style={{
                    width: '100%',
                    padding: '14px',
                    fontSize: '16px',
                    textAlign: 'center',
                    border: '2px solid #ddd',
                    borderRadius: '8px',
                    boxSizing: 'border-box'
                  }}
                />
                <div style={{ 
                  fontSize: '12px', 
                  color: '#666', 
                  marginTop: '4px',
                  textAlign: 'center'
                }}>
                  💡 본인의 이름을 입력해주세요
                </div>
              </div>
                </>
              )}

              <button
                onClick={handleClassCodeLogin}
                disabled={loading || (useUnifiedCode ? unifiedCode.length !== 8 : (!classCode.trim() || !learnerCode.trim() || !learnerName.trim()))}
                style={{
                  width: '100%',
                  padding: '14px',
                  fontSize: '16px',
                  fontWeight: 'bold',
                  background: loading ? '#ccc' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  marginBottom: '12px'
                }}
              >
                {loading ? '로그인 중...' : '✓ 입장하기'}
              </button>

              <button
                onClick={() => {
                  setShowClassCodeInput(false)
                  setClassCode('')
                  setLearnerCode('')
                  setError('')
                }}
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '12px',
                  fontSize: '14px',
                  background: 'transparent',
                  color: '#666',
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  cursor: loading ? 'not-allowed' : 'pointer'
                }}
              >
                ← 뒤로 가기
              </button>
            </div>
          )}

          {/* 소셜 로그인 섹션 */}
          <div className="social-login-section">
            <div className="divider">
              <span className="divider-text">또는</span>
            </div>

            {/* Google 로그인 */}
            <button className="onboarding-btn google-btn" onClick={handleGoogleLogin}>
              <span className="btn-icon">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M19.8 10.2273C19.8 9.51819 19.7364 8.83637 19.6182 8.18182H10.2V12.05H15.5818C15.35 13.3 14.6273 14.3591 13.5409 15.0682V17.5773H16.8182C18.7091 15.8364 19.8 13.2727 19.8 10.2273Z" fill="#4285F4"/>
                  <path d="M10.2 20C12.9 20 15.1727 19.1045 16.8182 17.5773L13.5409 15.0682C12.6182 15.6682 11.4909 16.0227 10.2 16.0227C7.59545 16.0227 5.38182 14.2636 4.56364 11.9H1.18182V14.4909C2.81818 17.7591 6.27273 20 10.2 20Z" fill="#34A853"/>
                  <path d="M4.56364 11.9C4.36364 11.3 4.25 10.6591 4.25 10C4.25 9.34091 4.36364 8.7 4.56364 8.1V5.50909H1.18182C0.509091 6.85909 0.136364 8.38636 0.136364 10C0.136364 11.6136 0.509091 13.1409 1.18182 14.4909L4.56364 11.9Z" fill="#FBBC04"/>
                  <path d="M10.2 3.97727C11.6136 3.97727 12.8727 4.48182 13.8636 5.42727L16.7545 2.53636C15.1682 1.05909 12.8955 0.136364 10.2 0.136364C6.27273 0.136364 2.81818 2.37727 1.18182 5.50909L4.56364 8.1C5.38182 5.73636 7.59545 3.97727 10.2 3.97727Z" fill="#EA4335"/>
                </svg>
              </span>
              <span className="btn-text">Google로 로그인</span>
            </button>

            {/* 카카오 로그인 */}
            <button className="onboarding-btn kakao-btn" onClick={handleKakaoLogin}>
              <span className="btn-icon">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M10 0C4.477 0 0 3.667 0 8.182c0 2.91 1.929 5.458 4.828 6.91-.199.73-.67 2.521-.769 2.908-.12.466.171.46.36.334.143-.095 2.318-1.569 3.309-2.24C8.495 16.281 9.235 16.364 10 16.364c5.523 0 10-3.667 10-8.182S15.523 0 10 0z" fill="#000000"/>
                </svg>
              </span>
              <span className="btn-text">카카오로 로그인</span>
            </button>
          </div>
        </div>

        {/* 하단 브랜드 정보 */}
        <div className="onboarding-footer">
          <div style={{ fontSize: "18px", fontWeight: "bold", color: "#333", marginBottom: "6px" }}>
            HI-DI Edu
          </div>
          <p className="footer-text">모든 세대를 잇는 AI 스토리 플랫폼</p>
        </div>
      </div>
    </div>
  )
}

export default OnboardingLogin
