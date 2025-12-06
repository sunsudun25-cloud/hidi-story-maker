import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { saveImageAsFile, shareImage, copyImageToClipboard } from "../services/imageService";
import { saveImageToDB } from "../services/dbService";
import "./Result.css";

export default function Result() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const imageUrl = state?.imageUrl;
  const prompt = state?.prompt || "AI 생성 이미지";
  const style = state?.style || "기본";

  // 이미지가 생성되면 자동으로 DB에 저장 (한 번만 실행)
  useEffect(() => {
    if (imageUrl) {
      console.log("💾 [Result] IndexedDB에 이미지 저장 시작...");
      
      saveImageToDB({
        image: imageUrl,
        prompt: prompt,
        style: style,
        createdAt: new Date().toISOString()
      }).then(() => {
        console.log("✅ [Result] 이미지가 내 작품에 저장되었습니다.");
      }).catch((err) => {
        console.error("❌ [Result] 이미지 저장 오류:", err);
      });
    }
  }, []); // 빈 의존성 배열로 한 번만 실행

  const handleDownload = async () => {
    if (!imageUrl) return;

    try {
      // imageService 사용하여 다운로드
      const filename = `ai-drawing-${Date.now()}.png`;
      await saveImageAsFile(imageUrl, filename);
      
      // 모바일 사용자를 위한 안내 메시지
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
      const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);
      
      if (isMobile) {
        if (isIOS) {
          alert(
            "💾 이미지가 새 탭에서 열렸습니다!\n\n" +
            "📱 iPhone/iPad 저장 방법:\n" +
            "1. 이미지를 길게 누르기\n" +
            "2. '사진에 추가' 선택\n" +
            "3. 사진 앱에서 확인하세요!\n\n" +
            "💡 Tip: '내 작품 보기'에도 자동 저장되었습니다!"
          );
        } else {
          alert(
            "💾 이미지 다운로드가 시작되었습니다!\n\n" +
            "📱 Android 저장 위치:\n" +
            "• 내 파일 → Download 폴더\n" +
            "• 갤러리 앱에서도 확인 가능\n\n" +
            "💡 Tip: '내 작품 보기'에도 자동 저장되었습니다!"
          );
        }
      } else {
        alert("💾 이미지가 저장되었습니다!\n\n💡 Tip: '내 작품 보기'에서도 확인할 수 있습니다!");
      }
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
          // HTTP URL인 경우
          if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
            alert("📋 이미지 링크가 클립보드에 복사되었습니다!\n\n링크를 공유하거나 브라우저에 붙여넣어 다운로드하세요.");
          } else {
            alert("📋 이미지가 클립보드에 복사되었습니다!");
          }
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
              className="big-btn secondary result-retry"
              onClick={() => navigate("/drawing/practice")}
            >
              🎨 다시 만들기
            </button>

            {/* 내 작품 보러가기 */}
            <button
              className="big-btn secondary result-gallery"
              onClick={() => navigate("/my-works")}
            >
              🖼️ 내 작품 보러가기
            </button>

            {/* 홈으로 돌아가기 */}
            <button
              className="big-btn primary result-home"
              onClick={() => navigate("/home")}
            >
              🏠 홈으로 돌아가기
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
