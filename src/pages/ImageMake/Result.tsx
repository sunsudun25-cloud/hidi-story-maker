import { useLocation, useNavigate } from "react-router-dom";
import { downloadImage } from "../../services/imageService";
import { useState } from "react";
import "./ImageMake.css";

export default function Result() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const [isSaving, setIsSaving] = useState(false);

  const { image, prompt } = state || {};

  // 이미지가 없는 경우
  if (!image) {
    return (
      <div className="image-make-container">
        <div className="empty-state">
          <h2>⚠️ 이미지가 없습니다</h2>
          <p>먼저 이미지를 생성해주세요.</p>
          <button className="btn-primary" onClick={() => navigate("/image/practice")}>
            그림 만들러 가기
          </button>
        </div>
      </div>
    );
  }

  // 저장하기 (다운로드)
  const handleSave = async () => {
    setIsSaving(true);
    try {
      await downloadImage(image, `ai-image-${Date.now()}.png`);
      alert("✅ 이미지가 저장되었습니다!");
    } catch (error) {
      console.error("저장 오류:", error);
      alert("저장 중 오류가 발생했습니다.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="image-make-container">
      {/* 상단 헤더 */}
      <div className="image-make-header">
        <button className="back-btn" onClick={() => navigate(-1)}>
          ← 뒤로
        </button>
        <h1 className="image-make-title">🎉 그림 완성!</h1>
        <button className="home-btn" onClick={() => navigate("/")}>
          🏠
        </button>
      </div>

      <div className="image-make-content result-content">
        {/* 이미지 표시 */}
        <div className="result-image-container">
          <img
            src={image}
            alt="생성된 그림"
            className="result-image"
          />
        </div>

        {/* 프롬프트 정보 */}
        <p className="result-prompt">
          생성 요청: <strong>{prompt}</strong>
        </p>

        {/* 액션 버튼 */}
        <div className="result-actions">
          <button
            className="result-btn retry-btn"
            onClick={() => navigate(-1)}
          >
            🔄 다시 만들기
          </button>

          <button
            className="result-btn save-btn"
            onClick={handleSave}
            disabled={isSaving}
          >
            {isSaving ? "⏳ 저장 중..." : "💾 저장하기"}
          </button>

          <button
            className="result-btn storybook-btn"
            onClick={() => navigate("/storybook")}
          >
            📕 동화책에 넣기
          </button>

          <button
            className="result-btn home-btn-large"
            onClick={() => navigate("/")}
          >
            🏠 홈으로 가기
          </button>
        </div>
      </div>
    </div>
  );
}
