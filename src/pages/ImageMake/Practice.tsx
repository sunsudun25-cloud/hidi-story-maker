import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { generateStoryImage } from "../../services/imageService";
import "./ImageMake.css";

export default function Practice() {
  const navigate = useNavigate();
  const [text, setText] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

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
      const image = await generateStoryImage(prompt, {
        style: "동화 스타일",
        mood: "따뜻하고 부드러운"
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
