import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { generateStoryImage } from "../../services/imageService";
import "./ImageMake.css";

export default function Custom() {
  const navigate = useNavigate();
  const [text, setText] = useState("");
  const [style, setStyle] = useState("soft watercolor");
  const [isGenerating, setIsGenerating] = useState(false);

  const createImage = async () => {
    if (!text.trim()) {
      alert("그림에 대한 설명을 입력해주세요!");
      return;
    }

    setIsGenerating(true);

    try {
      const prompt = `(${style} 스타일) ${text}`;
      const image = await generateStoryImage(prompt);

      navigate("/image/result", {
        state: { image, prompt, style },
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
        <h1 className="image-make-title">✏️ 직접 만들기</h1>
        <button className="home-btn" onClick={() => navigate("/")}>
          🏠
        </button>
      </div>

      <div className="image-make-content">
        {/* 텍스트 입력 */}
        <div className="custom-input-section">
          <label className="input-label">어떤 그림을 만들까요?</label>
          <textarea
            className="custom-textarea"
            placeholder="예: 해변에서 파도와 노는 아이"
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={5}
          ></textarea>
        </div>

        {/* 스타일 선택 */}
        <div className="option-section">
          <label className="input-label">그림 스타일</label>
          <select
            className="option-select"
            value={style}
            onChange={(e) => setStyle(e.target.value)}
          >
            <option value="soft watercolor">부드러운 수채화</option>
            <option value="kids illustration">아이들 그림책 스타일</option>
            <option value="warm pastel">따뜻한 파스텔톤</option>
            <option value="pencil art">연필 드로잉 스타일</option>
          </select>
        </div>

        {/* 생성 버튼 */}
        <button
          className="generate-btn custom-generate-btn"
          onClick={createImage}
          disabled={isGenerating || !text.trim()}
        >
          {isGenerating ? "⏳ 그림 만드는 중..." : "🎨 그림 만들기"}
        </button>
      </div>
    </div>
  );
}
