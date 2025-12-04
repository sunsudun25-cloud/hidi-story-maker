import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { generateStoryImage } from "../../services/imageService";
import "./ImageMake.css";

export default function Custom() {
  const navigate = useNavigate();
  const [prompt, setPrompt] = useState("");
  const [style, setStyle] = useState("동화 스타일");
  const [mood, setMood] = useState("따뜻하고 부드러운");
  const [isGenerating, setIsGenerating] = useState(false);

  const styleOptions = [
    "동화 스타일",
    "수채화 스타일",
    "만화 스타일",
    "사실적인 스타일",
    "추상적 스타일",
  ];

  const moodOptions = [
    "따뜻하고 부드러운",
    "밝고 즐거운",
    "차분하고 평화로운",
    "신비롭고 환상적인",
    "활기차고 역동적인",
  ];

  const createImage = async () => {
    if (!prompt.trim()) {
      alert("그림에 대한 설명을 입력해주세요!");
      return;
    }

    setIsGenerating(true);

    try {
      const image = await generateStoryImage(prompt, {
        style,
        mood
      });
      
      navigate("/image/result", {
        state: { image, prompt, style, mood },
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
        <h1 className="image-make-title">🖌️ 직접 만들기</h1>
        <button className="home-btn" onClick={() => navigate("/")}>
          🏠
        </button>
      </div>

      <div className="image-make-content">
        <p className="description-text">
          원하는 그림을 자세히 설명하고 스타일을 선택하세요
        </p>

        {/* 프롬프트 입력 */}
        <div className="custom-input-section">
          <label className="input-label">✍️ 그림 설명</label>
          <textarea
            className="custom-textarea"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="예: 봄날 꽃밭에서 나비와 놀고 있는 토끼"
            rows={4}
          />
        </div>

        {/* 스타일 선택 */}
        <div className="option-section">
          <label className="input-label">🎨 그림 스타일</label>
          <select
            className="option-select"
            value={style}
            onChange={(e) => setStyle(e.target.value)}
          >
            {styleOptions.map((opt, idx) => (
              <option key={idx} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>

        {/* 분위기 선택 */}
        <div className="option-section">
          <label className="input-label">✨ 그림 분위기</label>
          <select
            className="option-select"
            value={mood}
            onChange={(e) => setMood(e.target.value)}
          >
            {moodOptions.map((opt, idx) => (
              <option key={idx} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>

        {/* 생성 버튼 */}
        <button
          className="generate-btn"
          onClick={createImage}
          disabled={isGenerating || !prompt.trim()}
        >
          {isGenerating ? "⏳ 그림 만드는 중..." : "🎨 맞춤 그림 만들기"}
        </button>
      </div>
    </div>
  );
}
