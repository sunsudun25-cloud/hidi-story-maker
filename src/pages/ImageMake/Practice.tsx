import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { generateImageViaCloudflare } from "../../services/cloudflareImageApi";
import { buildAutoPrompt } from "../../utils/promptBuilder";
import { purposeConfig, purposeKeyMap } from "../../utils/purposeConfig";
import "./ImageMake.css";

export default function Practice() {
  const navigate = useNavigate();
  const [text, setText] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  
  // 목적 선택 State
  const [selectedPurpose, setSelectedPurpose] = useState<string>('이야기/동화');

  const examplePrompts = [
    "강아지가 공원에서 뛰노는 모습",
    "노란 풍선을 든 아이",
    "바닷가 노을 풍경",
    "달빛 아래 서 있는 고양이",
  ];

  const createImage = async (userPromptText: string) => {
    if (!userPromptText.trim()) {
      alert("텍스트를 입력해주세요!");
      return;
    }

    setIsGenerating(true);

    try {
      // 한글 목적 → PurposeKey 변환
      const purposeKey = purposeKeyMap[selectedPurpose] || 'memory';
      const mood = 'warm';  // 기본 분위기
      const styleLabel = undefined;  // 스타일은 목적에서 자동 결정
      
      // ✅ 통일된 프롬프트 빌더 사용
      const { finalPrompt, resolvedStyleLabel } = buildAutoPrompt({
        userText: userPromptText,
        purpose: purposeKey,
        mood,
        styleLabel
      });
      
      // ✅ 목적별 size/quality 자동 설정
      const { size, quality } = purposeConfig[purposeKey];
      
      console.log("[GEN_REQUEST]", {
        purpose: purposeKey,
        mood,
        selectedStyle: styleLabel,
        resolvedStyleLabel,
        size,
        quality,
        promptPreview: finalPrompt.slice(0, 140)
      });
      
      // ✅ generateImageViaCloudflare 직접 호출 (DrawDirect와 동일)
      const imageBase64 = await generateImageViaCloudflare(
        finalPrompt,
        resolvedStyleLabel,
        { model: "dall-e-3", size, quality }
      );
      
      console.log("✅ 이미지 생성 완료", { imageLength: imageBase64.length });
      
      navigate("/image/result", {
        state: { 
          image: imageBase64, 
          prompt: userPromptText,
          style: resolvedStyleLabel
        },
      });
    } catch (error) {
      console.error("이미지 생성 오류:", error);
      alert("이미지 생성 중 오류가 발생했습니다. 다시 시도해주세요.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="image-make-container">
      {/* 상단 헤더 */}
      <div className="image-make-header">
        <button className="back-btn" onClick={() => navigate(-1)}>
          ← 뒤로
        </button>
        <h1 className="image-make-title">🎨 그림 연습하기</h1>
        <button className="home-btn" onClick={() => navigate("/")}>
          🏠
        </button>
      </div>

      <div className="image-make-content">
        <p className="description-text">
          아래 예시 중 하나를 선택해 그림을 만들어보세요
        </p>

        {/* ✅ 목적 선택 UI */}
        <div className="purpose-selection-section" style={{
          marginBottom: '24px'
        }}>
          <h3 style={{
            fontSize: '18px',
            fontWeight: '600',
            color: '#212529',
            marginBottom: '16px',
            textAlign: 'center'
          }}>
            어떤 목적으로 쓰나요?
          </h3>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '12px',
            marginBottom: '8px'
          }}>
            {[
              { key: '이야기/동화', icon: '🏫', label: '이야기/동화', desc: '동화책 만들기, 스토리텔링' },
              { key: '감정/추억', icon: '💭', label: '감정/추억', desc: '기억 표현, 감성 일러스트' },
              { key: '발표/수업', icon: '📊', label: '발표/수업', desc: '프레젠테이션, 교육 자료' },
              { key: '사진 느낌', icon: '📷', label: '사진 느낌', desc: '현실적인 일러스트' }
            ].map((purpose) => (
              <button
                key={purpose.key}
                onClick={() => setSelectedPurpose(purpose.key)}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '16px 12px',
                  border: selectedPurpose === purpose.key ? '2px solid #3b82f6' : '2px solid #e5e7eb',
                  borderRadius: '12px',
                  background: selectedPurpose === purpose.key ? '#eff6ff' : 'white',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  fontSize: '14px'
                }}
                onMouseEnter={(e) => {
                  if (selectedPurpose !== purpose.key) {
                    e.currentTarget.style.borderColor = '#3b82f6';
                    e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (selectedPurpose !== purpose.key) {
                    e.currentTarget.style.borderColor = '#e5e7eb';
                    e.currentTarget.style.boxShadow = 'none';
                  }
                }}
              >
                <span style={{ fontSize: '32px' }}>{purpose.icon}</span>
                <span style={{ fontWeight: '600', color: '#111827' }}>{purpose.label}</span>
                <span style={{ 
                  fontSize: '12px', 
                  color: '#6b7280', 
                  textAlign: 'center',
                  lineHeight: '1.3'
                }}>{purpose.desc}</span>
              </button>
            ))}
          </div>
        </div>

        {/* 예시 프롬프트 */}
        <div className="prompt-grid">
          {examplePrompts.map((item, idx) => (
            <div
              key={idx}
              className="prompt-card"
              onClick={() => createImage(item)}
            >
              <span className="prompt-icon">🎨</span>
              <p className="prompt-text">{item}</p>
            </div>
          ))}
        </div>

        {/* 직접 입력 */}
        <div className="custom-input-section">
          <label className="input-label">✍️ 직접 입력하기</label>
          <textarea
            className="custom-textarea"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="예: 숲속에서 놀고 있는 토끼"
            rows={3}
          />
        </div>

        {/* 생성 버튼 */}
        <button
          className="generate-btn"
          onClick={() => createImage(text || "예쁜 풍경 그림")}
          disabled={isGenerating}
        >
          {isGenerating ? "⏳ 그림 만드는 중..." : "🎨 AI에게 그림 만들어달라고 하기"}
        </button>
      </div>
    </div>
  );
}
