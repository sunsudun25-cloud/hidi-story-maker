import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { saveImageAsFile, shareImage, copyImageToClipboard } from "../services/imageService";
import { saveImage } from "../services/dbService";
import QRCodeModal from "../components/QRCodeModal";

export default function FourcutInterviewResult() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const imageUrl = state?.imageUrl;
  const theme = state?.theme;
  const interviewScene = state?.interviewScene;
  const hasSaved = useRef(false); // 저장 플래그
  
  // QR 코드 모달 상태
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);

  // 이미지가 생성되면 자동으로 DB에 저장 (한 번만 실행)
  useEffect(() => {
    if (hasSaved.current) {
      console.log("⏭️ [FourcutResult] 이미 저장됨, 스킵");
      return;
    }

    if (imageUrl) {
      console.log("💾 [FourcutResult] IndexedDB에 이미지 저장 시작...");
      hasSaved.current = true;
      
      // HTTP URL인 경우 Data URL로 변환
      const convertAndSave = async () => {
        let imageToSave = imageUrl;
        
        if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
          try {
            console.log("🔄 [FourcutResult] HTTP URL을 Data URL로 변환 중...");
            const response = await fetch(imageUrl);
            const blob = await response.blob();
            imageToSave = await new Promise<string>((resolve, reject) => {
              const reader = new FileReader();
              reader.onloadend = () => resolve(reader.result as string);
              reader.onerror = reject;
              reader.readAsDataURL(blob);
            });
            console.log("✅ [FourcutResult] Data URL 변환 완료");
          } catch (error) {
            console.warn("⚠️ [FourcutResult] Data URL 변환 실패, 원본 URL 사용:", error);
          }
        }
        
        return saveImage({
          image: imageToSave,
          prompt: `${theme?.title || '인터뷰'} - ${interviewScene?.location || ''}`,
          style: "인터뷰 장면"
        });
      };
      
      convertAndSave()
        .then(() => {
          console.log("✅ [FourcutResult] 인터뷰 이미지가 내 작품에 저장되었습니다.");
        })
        .catch((err) => {
          console.error("❌ [FourcutResult] 이미지 저장 오류:", err);
          hasSaved.current = false;
        });
    }
  }, []);

  const handleDownload = async () => {
    if (!imageUrl) return;

    try {
      const filename = `interview-${Date.now()}.png`;
      await saveImageAsFile(imageUrl, filename);
      
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
        alert("✅ 이미지가 다운로드되었습니다!");
      }
    } catch (err: any) {
      console.error("다운로드 오류:", err);
      alert("이미지 다운로드 중 오류가 발생했습니다. 이미지를 길게 눌러 저장해주세요.");
    }
  };

  const handleShare = async () => {
    if (!imageUrl) return;

    try {
      await shareImage(imageUrl, `${theme?.title || '인터뷰'} 장면`);
    } catch (err: any) {
      console.error("공유 오류:", err);
      alert("공유 중 오류가 발생했습니다. 다시 시도해주세요.");
    }
  };

  const handleCopy = async () => {
    if (!imageUrl) return;

    try {
      await copyImageToClipboard(imageUrl);
      alert("✅ 이미지가 클립보드에 복사되었습니다!");
    } catch (err: any) {
      console.error("복사 오류:", err);
      alert("이미지 복사 중 오류가 발생했습니다.");
    }
  };

  const handleMyWorks = () => {
    navigate("/myworks");
  };

  const handleRemake = () => {
    navigate("/write/fourcut-interview", {
      state: { theme }
    });
  };

  const handleNext = () => {
    navigate("/write/fourcut-practice", {
      state: {
        theme,
        interviewScene
      }
    });
  };

  if (!imageUrl) {
    return (
      <div style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#F3F4F6"
      }}>
        <div style={{ textAlign: "center" }}>
          <p style={{ fontSize: "18px", color: "#6B7280" }}>이미지를 불러올 수 없습니다.</p>
          <button
            onClick={() => navigate("/write/fourcut-theme")}
            style={{
              marginTop: "20px",
              padding: "12px 24px",
              backgroundColor: "#9C27B0",
              color: "white",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer"
            }}
          >
            처음부터 다시 만들기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: "100vh",
      padding: "20px",
      backgroundColor: "#F3F4F6"
    }}>
      <div style={{
        maxWidth: "800px",
        margin: "0 auto"
      }}>
        {/* 헤더 */}
        <div style={{
          textAlign: "center",
          marginBottom: "30px"
        }}>
          <h1 style={{
            fontSize: "28px",
            fontWeight: "700",
            color: "#1F2937",
            marginBottom: "10px"
          }}>
            ✨ 인터뷰 장면 완성!
          </h1>
          <p style={{
            fontSize: "16px",
            color: "#6B7280"
          }}>
            이미지가 자동으로 내 작품에 저장되었습니다
          </p>
        </div>

        {/* 이미지 */}
        <div style={{
          backgroundColor: "white",
          borderRadius: "16px",
          padding: "20px",
          marginBottom: "20px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.1)"
        }}>
          <img
            src={imageUrl}
            alt="인터뷰 장면"
            style={{
              width: "100%",
              height: "auto",
              borderRadius: "12px"
            }}
          />
        </div>

        {/* 액션 버튼 */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(2, 1fr)",
          gap: "12px",
          marginBottom: "20px"
        }}>
          <button
            onClick={handleDownload}
            style={{
              padding: "16px",
              fontSize: "16px",
              fontWeight: "600",
              backgroundColor: "#10B981",
              color: "white",
              border: "none",
              borderRadius: "12px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px"
            }}
          >
            📥 다운로드
          </button>

          <button
            onClick={handleShare}
            style={{
              padding: "16px",
              fontSize: "16px",
              fontWeight: "600",
              backgroundColor: "#3B82F6",
              color: "white",
              border: "none",
              borderRadius: "12px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px"
            }}
          >
            📤 공유하기
          </button>

          <button
            onClick={() => setIsQRModalOpen(true)}
            style={{
              padding: "16px",
              fontSize: "16px",
              fontWeight: "600",
              backgroundColor: "#8B5CF6",
              color: "white",
              border: "none",
              borderRadius: "12px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px"
            }}
          >
            📱 QR 코드
          </button>

          <button
            onClick={handleMyWorks}
            style={{
              padding: "16px",
              fontSize: "16px",
              fontWeight: "600",
              backgroundColor: "#F59E0B",
              color: "white",
              border: "none",
              borderRadius: "12px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px"
            }}
          >
            🎨 내 작품 보기
          </button>
        </div>

        {/* 다시 만들기 / 다음 단계 */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(2, 1fr)",
          gap: "12px"
        }}>
          <button
            onClick={handleRemake}
            style={{
              padding: "16px",
              fontSize: "16px",
              fontWeight: "600",
              backgroundColor: "#6B7280",
              color: "white",
              border: "none",
              borderRadius: "12px",
              cursor: "pointer"
            }}
          >
            🔄 다시 만들기
          </button>

          <button
            onClick={handleNext}
            style={{
              padding: "16px",
              fontSize: "18px",
              fontWeight: "700",
              backgroundColor: "#9C27B0",
              color: "white",
              border: "none",
              borderRadius: "12px",
              cursor: "pointer",
              boxShadow: "0 4px 12px rgba(156, 39, 176, 0.3)"
            }}
          >
            ✅ 다음 단계로
          </button>
        </div>
      </div>

      {/* QR 코드 모달 */}
      {isQRModalOpen && (
        <QRCodeModal
          imageUrl={imageUrl}
          onClose={() => setIsQRModalOpen(false)}
        />
      )}
    </div>
  );
}
