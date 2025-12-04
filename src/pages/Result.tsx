import { useLocation, useNavigate } from "react-router-dom";
import { saveImageAsFile, shareImage, copyImageToClipboard } from "../services/imageService";
import "./Result.css";

export default function Result() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const imageUrl = state?.imageUrl;

  const handleDownload = () => {
    if (!imageUrl) return;

    try {
      // imageService 사용하여 다운로드
      const filename = `ai-drawing-${Date.now()}.png`;
      saveImageAsFile(imageUrl, filename);
      alert("💾 이미지가 저장되었습니다!");
    } catch (err) {
      console.error("다운로드 오류:", err);
      alert("이미지 저장 중 오류가 발생했습니다.");
    }
  };

  const handleShare = async () => {
    if (!imageUrl) return;

    try {
      // imageService 사용하여 공유
      const success = await shareImage(
        imageUrl,
        "AI 그림 공유",
        "제가 AI로 만든 그림이에요!"
      );

      if (!success) {
        // Web Share API 미지원 시 클립보드 복사
        const copied = await copyImageToClipboard(imageUrl);
        if (copied) {
          alert("📋 이미지가 클립보드에 복사되었습니다!");
        } else {
          alert("공유 기능을 사용할 수 없습니다.");
        }
      }
    } catch (err) {
      console.error("공유 오류:", err);
      alert("공유 중 오류가 발생했습니다.");
    }
  };

  return (
    <div className="page-container">
      {/* 상단 헤더 */}
      <header className="page-header">
        <button className="header-btn" onClick={() => navigate(-1)}>←</button>
        <h1 className="header-title">결과 보기</h1>
        <button className="header-btn" onClick={() => navigate("/home")}>🏠</button>
      </header>

      <div className="result-page">
        {imageUrl ? (
          <>
            {/* 생성된 이미지 */}
            <div className="result-image-container">
              <img src={imageUrl} alt="생성된 그림" className="result-image" />
            </div>

            {/* 액션 버튼들 */}
            <div className="result-actions">
              <button className="action-btn primary" onClick={handleDownload}>
                💾 저장하기
              </button>
              <button className="action-btn secondary" onClick={handleShare}>
                📤 공유하기
              </button>
            </div>

            {/* 다시 만들기 */}
            <button
              className="result-retry"
              onClick={() => navigate("/drawing/practice")}
            >
              🎨 다시 만들기
            </button>

            {/* 내 작품 보러가기 */}
            <button
              className="result-gallery"
              onClick={() => navigate("/my-works")}
            >
              🖼️ 내 작품 보러가기
            </button>
          </>
        ) : (
          <div className="result-empty">
            <p>생성된 이미지가 없습니다.</p>
            <button
              className="result-retry"
              onClick={() => navigate("/drawing/practice")}
            >
              🎨 그림 만들러 가기
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
