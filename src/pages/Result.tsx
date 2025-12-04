import { useLocation, useNavigate } from "react-router-dom";
import "./Result.css";

export default function Result() {
  const navigate = useNavigate();
  const location = useLocation();
  const { imageUrl } = location.state || {};

  const handleDownload = () => {
    if (!imageUrl) return;

    // 이미지 다운로드
    const link = document.createElement("a");
    link.href = imageUrl;
    link.download = `ai-drawing-${Date.now()}.png`;
    link.click();
  };

  const handleShare = async () => {
    if (!imageUrl) return;

    // Web Share API 사용
    if (navigator.share) {
      try {
        await navigator.share({
          title: "AI 그림 공유",
          text: "제가 AI로 만든 그림이에요!",
          url: imageUrl,
        });
      } catch (err) {
        console.error("공유 실패:", err);
      }
    } else {
      // Fallback: 클립보드 복사
      navigator.clipboard.writeText(imageUrl);
      alert("이미지 URL이 클립보드에 복사되었습니다!");
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
