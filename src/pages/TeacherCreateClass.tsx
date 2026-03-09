import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function TeacherCreateClass() {
  const navigate = useNavigate();
  const [className, setClassName] = useState('');
  const [teacherName, setTeacherName] = useState('');
  const [teacherInitial, setTeacherInitial] = useState('');
  const [teacherPin, setTeacherPin] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [generatedCode, setGeneratedCode] = useState('');

  const handleCreateClass = async () => {
    // 입력 검증
    if (!className.trim()) {
      setError('수업 이름을 입력해주세요');
      return;
    }

    if (!teacherName.trim()) {
      setError('강사 이름을 입력해주세요');
      return;
    }

    if (!teacherInitial.trim() || !/^[A-Z]$/.test(teacherInitial.trim())) {
      setError('강사 이니셜은 영문 대문자 1글자만 입력해주세요 (예: C, K, P)');
      return;
    }

    if (!/^\d{6}$/.test(teacherPin)) {
      setError('PIN 번호는 6자리 숫자여야 합니다 (예: 123456)');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Firebase Functions API 호출
      const response = await fetch(
        'https://asia-northeast1-story-make-fbbd7.cloudfunctions.net/classCreate',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            className: className.trim(),
            teacherName: teacherName.trim(),
            teacherInitial: teacherInitial.trim().toUpperCase(),
            teacherPin: teacherPin.trim(),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || '수업 생성에 실패했습니다');
      }

      // 생성 성공
      setGeneratedCode(data.classCode);
      console.log('✅ 수업 생성 완료:', data);

    } catch (err: any) {
      console.error('❌ 수업 생성 오류:', err);
      setError(err.message || '수업 생성 중 오류가 발생했습니다');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setClassName('');
    setTeacherName('');
    setTeacherInitial('');
    setTeacherPin('');
    setGeneratedCode('');
    setError('');
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div style={{
        background: '#ffffff',
        borderRadius: '20px',
        padding: '40px',
        maxWidth: '500px',
        width: '100%',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
      }}>
        {/* 헤더 */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>👨‍🏫</div>
          <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: '#333', marginBottom: '8px' }}>
            수업 코드 생성
          </h1>
          <p style={{ fontSize: '14px', color: '#666' }}>
            강사용 수업 생성 페이지
          </p>
        </div>

        {!generatedCode ? (
          <>
            {/* 입력 폼 */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '600',
                color: '#333',
                marginBottom: '8px'
              }}>
                수업 이름 *
              </label>
              <input
                type="text"
                value={className}
                onChange={(e) => setClassName(e.target.value)}
                placeholder="예: 국어 수업, 창작 수업"
                style={{
                  width: '100%',
                  padding: '14px',
                  fontSize: '16px',
                  border: '2px solid #ddd',
                  borderRadius: '12px',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '600',
                color: '#333',
                marginBottom: '8px'
              }}>
                강사 이름 *
              </label>
              <input
                type="text"
                value={teacherName}
                onChange={(e) => setTeacherName(e.target.value)}
                placeholder="예: 최선호, Kim"
                style={{
                  width: '100%',
                  padding: '14px',
                  fontSize: '16px',
                  border: '2px solid #ddd',
                  borderRadius: '12px',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '600',
                color: '#333',
                marginBottom: '8px'
              }}>
                강사 이니셜 * <span style={{ fontSize: '12px', color: '#999' }}>(영문 대문자 1글자)</span>
              </label>
              <input
                type="text"
                value={teacherInitial}
                onChange={(e) => setTeacherInitial(e.target.value.toUpperCase())}
                placeholder="예: C, K, P"
                maxLength={1}
                style={{
                  width: '100%',
                  padding: '14px',
                  fontSize: '24px',
                  fontWeight: 'bold',
                  textAlign: 'center',
                  border: '2px solid #ddd',
                  borderRadius: '12px',
                  boxSizing: 'border-box',
                  textTransform: 'uppercase'
                }}
              />
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '600',
                color: '#333',
                marginBottom: '8px'
              }}>
                PIN 번호 * <span style={{ fontSize: '12px', color: '#999' }}>(6자리 숫자)</span>
              </label>
              <input
                type="text"
                value={teacherPin}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '');
                  if (value.length <= 6) {
                    setTeacherPin(value);
                  }
                }}
                placeholder="예: 123456"
                maxLength={6}
                style={{
                  width: '100%',
                  padding: '14px',
                  fontSize: '24px',
                  fontWeight: 'bold',
                  textAlign: 'center',
                  border: '2px solid #ddd',
                  borderRadius: '12px',
                  boxSizing: 'border-box',
                  letterSpacing: '4px'
                }}
              />
            </div>

            {/* 오류 메시지 */}
            {error && (
              <div style={{
                padding: '12px',
                background: '#fee',
                border: '1px solid #fcc',
                borderRadius: '8px',
                color: '#c33',
                fontSize: '14px',
                marginBottom: '20px'
              }}>
                ⚠️ {error}
              </div>
            )}

            {/* 버튼 */}
            <button
              onClick={handleCreateClass}
              disabled={loading}
              style={{
                width: '100%',
                padding: '16px',
                fontSize: '18px',
                fontWeight: 'bold',
                background: loading ? '#ccc' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: '#ffffff',
                border: 'none',
                borderRadius: '12px',
                cursor: loading ? 'not-allowed' : 'pointer',
                marginBottom: '12px'
              }}
            >
              {loading ? '⏳ 생성 중...' : '🎓 수업 생성하기'}
            </button>

            <button
              onClick={() => navigate('/onboarding')}
              style={{
                width: '100%',
                padding: '14px',
                fontSize: '16px',
                background: '#f5f5f5',
                color: '#666',
                border: 'none',
                borderRadius: '12px',
                cursor: 'pointer'
              }}
            >
              학생 입장 페이지로
            </button>
          </>
        ) : (
          <>
            {/* 생성 완료 화면 */}
            <div style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              borderRadius: '16px',
              padding: '32px',
              textAlign: 'center',
              marginBottom: '24px'
            }}>
              <div style={{ fontSize: '64px', marginBottom: '16px' }}>✅</div>
              <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#ffffff', marginBottom: '16px' }}>
                수업 생성 완료!
              </h2>
              <div style={{
                background: 'rgba(255,255,255,0.2)',
                borderRadius: '12px',
                padding: '16px',
                marginBottom: '16px'
              }}>
                <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.9)', marginBottom: '8px' }}>
                  수업 코드
                </p>
                <p style={{
                  fontSize: '48px',
                  fontWeight: 'bold',
                  color: '#ffffff',
                  letterSpacing: '4px',
                  margin: 0
                }}>
                  {generatedCode}
                </p>
              </div>
              <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.9)', lineHeight: '1.6' }}>
                이 코드를 학생들에게 알려주세요!
              </p>
            </div>

            {/* 안내 메시지 */}
            <div style={{
              background: '#FFF3CD',
              padding: '16px',
              borderRadius: '12px',
              marginBottom: '20px',
              fontSize: '14px',
              lineHeight: '1.6',
              color: '#856404'
            }}>
              <p style={{ margin: 0, fontWeight: '600', marginBottom: '8px' }}>
                📢 학생들에게 안내하세요
              </p>
              <p style={{ margin: 0 }}>
                "www.story-maker.kr 접속 후<br />
                수업 코드 <strong>{generatedCode}</strong>를 입력하세요!"
              </p>
            </div>

            {/* 버튼 */}
            <button
              onClick={handleReset}
              style={{
                width: '100%',
                padding: '16px',
                fontSize: '18px',
                fontWeight: 'bold',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: '#ffffff',
                border: 'none',
                borderRadius: '12px',
                cursor: 'pointer',
                marginBottom: '12px'
              }}
            >
              ➕ 다른 수업 만들기
            </button>

            <button
              onClick={() => navigate('/home')}
              style={{
                width: '100%',
                padding: '14px',
                fontSize: '16px',
                background: '#f5f5f5',
                color: '#666',
                border: 'none',
                borderRadius: '12px',
                cursor: 'pointer'
              }}
            >
              홈으로 이동
            </button>
          </>
        )}

        {/* 하단 안내 */}
        <div style={{
          marginTop: '24px',
          padding: '16px',
          background: '#f8f9fa',
          borderRadius: '12px',
          fontSize: '12px',
          color: '#666',
          lineHeight: '1.6'
        }}>
          <p style={{ margin: 0, fontWeight: '600', marginBottom: '4px' }}>
            💡 안내사항
          </p>
          <p style={{ margin: 0 }}>
            • PIN 번호는 수업 관리에 사용됩니다<br />
            • 잊어버리지 않도록 메모해두세요<br />
            • 생성된 코드는 고유하며 중복되지 않습니다
          </p>
        </div>
      </div>
    </div>
  );
}
