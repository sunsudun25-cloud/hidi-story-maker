import { useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import { downloadImage, shareImage, copyImageToClipboard } from "../../services/imageService";
import "./ImageMake.css";

export default function Result() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const [isDownloading, setIsDownloading] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [isCopying, setIsCopying] = useState(false);

  if (!state || !state.image) {
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

  const { image, prompt, style, mood } = state;

  // 이미지 다운로드
  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      await downloadImage(image, `ai-image-${Date.now()}.png`);
      alert("✅ 이미지가 다운로드되었습니다!");
    } catch (error) {
      console.error("다운로드 오류:", error);
      alert("다운로드 중 오류가 발생했습니다.");
    } finally {
      setIsDownloading(false);
    }
  };

  // 이미지 공유
  const handleShare = async () => {
    setIsSharing(true);
    try {
      await shareImage(image, "AI로 만든 그림");
      alert("✅ 공유가 완료되었습니다!");
    } catch (error) {
      console.error("공유 오류:", error);
      alert("공유 기능을 사용할 수 없습니다. 다운로드를 이용해주세요.");
    } finally {
      setIsSharing(false);
    }
  };

  // 이미지 복사
  const handleCopy = async () => {
    setIsCopying(true);
    try {
      await copyImageToClipboard(image);
      alert("✅ 이미지가 클립보드에 복사되었습니다!");
    } catch (error) {
      console.error("복사 오류:", error);
      alert("복사 중 오류가 발생했습니다.");
    } finally {
      setIsCopying(false);
    }
  };

  return (
    <div className="image-make-container">
      {/* 상단 헤더 */}
      <div className="image-make-header">
        <button className="back-btn" onClick={() => navigate(-1)}>
          ← 뒤로
        </button>
        <h1 className="image-make-title">✨ 완성된 그림</h1>
        <button className="home-btn" onClick={() => navigate("/")}>
          🏠
        </button>
      </div>

      <div className="image-make-content">
        {/* 이미지 표시 */}
        <div className="result-image-container">
          <img src={image} alt="생성된 이미지" className="result-image" />
        </div>

        {/* 프롬프트 정보 */}
        <div className="info-card">
          <div className="info-item">
            <span className="info-label">📝 설명:</span>
            <span className="info-value">{prompt}</span>
          </div>
          {style && (
            <div className="info-item">
              <span className="info-label">🎨 스타일:</span>
              <span className="info-value">{style}</span>
            </div>
          )}
          {mood && (
            <div className="info-item">
              <span className="info-label">✨ 분위기:</span>
              <span className="info-value">{mood}</span>
            </div>
          )}
        </div>

        {/* 액션 버튼 */}
        <div className="action-buttons">
          <button
            className="action-btn download-btn"
            onClick={handleDownload}
            disabled={isDownloading}
          >
            {isDownloading ? "⏳ 다운로드 중..." : "💾 다운로드"}
          </button>

          <button
            className="action-btn share-btn"
            onClick={handleShare}
            disabled={isSharing}
          >
            {isSharing ? "⏳ 공유 중..." : "📤 공유하기"}
          </button>

          <button
            className="action-btn copy-btn"
            onClick={handleCopy}
            disabled={isCopying}
          >
            {isCopying ? "⏳ 복사 중..." : "📋 복사"}
          </button>
        </div>

        {/* 다시 만들기 버튼 */}
        <div className="retry-section">
          <button
            className="retry-btn"
            onClick={() => navigate("/image/practice")}
          >
            🔄 다시 만들기
          </button>
          <button
            className="retry-btn custom-btn"
            onClick={() => navigate("/image/custom")}
          >
            🖌️ 직접 만들기
          </button>
        </div>
      </div>
    </div>
  );
}
