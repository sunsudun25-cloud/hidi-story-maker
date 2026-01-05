import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { generateStoryImage, SupportedModel } from "../../services/imageService";
import "./ImageMake.css";

export default function Practice() {
  const navigate = useNavigate();
  const [text, setText] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  
  // ✅ 모델 선택 State 추가
  const [selectedModel, setSelectedModel] = useState<SupportedModel>("dall-e-3");

  const examplePrompts = [
    "강아지가 공원에서 뛰노는 모습",
    "노란 풍선을 든 아이",
    "바닷가 노을 풍경",
    "달빛 아래 서 있는 고양이",
  ];

  const createImage = async (prompt: string) => {
    if (!prompt.trim()) {
      alert("텍스트를 입력해주세요!");
      return;
    }

    setIsGenerating(true);

    try {
      console.log("🎨 이미지 생성 시작:", { prompt, model: selectedModel });
      
      const image = await generateStoryImage(prompt, {
        style: "동화 스타일",
        mood: "따뜻하고 부드러운",
        model: selectedModel  // ✅ 선택한 모델 전달
      });
      
      navigate("/image/result", {
        state: { image, prompt },
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

        {/* ✅ 모델 선택 드롭다운 */}
        <div className="model-selection-section" style={{
          marginBottom: '20px',
          padding: '16px',
          backgroundColor: '#f8f9fa',
          borderRadius: '12px',
          border: '2px solid #e9ecef'
        }}>
          <label 
            htmlFor="model-select" 
            className="input-label" 
            style={{ 
              display: 'block', 
              marginBottom: '8px',
              fontSize: '16px',
              fontWeight: '600',
              color: '#495057'
            }}
          >
            🤖 이미지 생성 모델
          </label>
          <select
            id="model-select"
            value={selectedModel}
            onChange={(e) => setSelectedModel(e.target.value as SupportedModel)}
            style={{
              width: '100%',
              padding: '12px 16px',
              fontSize: '16px',
              border: '2px solid #dee2e6',
              borderRadius: '8px',
              backgroundColor: 'white',
              cursor: 'pointer',
              fontWeight: '500'
            }}
          >
            <option value="dall-e-3">DALL-E 3 (기본, 고품질)</option>
            <option value="gpt-image-1.5">GPT-Image 1.5 (차세대 모델) ⚡</option>
            <option value="gpt-image-1">GPT-Image 1 (표준)</option>
            <option value="gpt-image-1-mini">GPT-Image Mini (빠른 생성)</option>
          </select>
          <p style={{
            marginTop: '8px',
            fontSize: '13px',
            color: '#6c757d',
            lineHeight: '1.4'
          }}>
            💡 {selectedModel === "dall-e-3" 
              ? "안정적인 기본 모델입니다" 
              : selectedModel === "gpt-image-1.5"
              ? "최신 고품질 모델입니다 (실패 시 자동으로 DALL-E 3로 전환)"
              : selectedModel === "gpt-image-1"
              ? "빠르고 표준 품질의 모델입니다"
              : "가장 빠른 생성 속도의 모델입니다"}
          </p>
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
