import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

interface LocationState {
  savedId: string;
  title: string;
  storyContent: string;
  imageUrl: string;
  theme: { key: string; icon: string; label: string; desc: string };
}

export default function FourcutStoryResult() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as LocationState;

  const [showQrModal, setShowQrModal] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState("");

  useEffect(() => {
    if (!state || !state.savedId) {
      navigate("/write/fourcut-theme");
      return;
    }

    // 자동 저장 확인 메시지
    console.log("✅ 4컷 스토리 저장 완료:", state.savedId);
  }, []);

  // 다운로드 (폰에 저장)
  const handleDownload = async () => {
    try {
      // 이미지를 Blob으로 변환
      const response = await fetch(state.imageUrl);
      const blob = await response.blob();
      
      // 파일명 생성
      const filename = `4cut-story-${state.title.replace(/[^a-zA-Z0-9가-힣]/g, '_')}-${Date.now()}.png`;
      
      // 다운로드
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      // 모바일 안내
      if (/iPhone|iPad|iPod|Android/i.test(navigator.userAgent)) {
        alert(`📱 이미지 저장 방법:\n\n✅ iOS: 사진 앱 → 다운로드 폴더\n✅ Android: 갤러리 → Downloads 폴더\n\n"${filename}" 파일을 확인하세요!`);
      } else {
        alert(`✅ 이미지가 다운로드되었습니다!\n파일명: ${filename}`);
      }
    } catch (error) {
      console.error("❌ 다운로드 오류:", error);
      alert("다운로드 중 오류가 발생했습니다.");
    }
  };

  // 공유하기
  const handleShare = async () => {
    setIsSharing(true);
    try {
      if (navigator.share) {
        const response = await fetch(state.imageUrl);
        const blob = await response.blob();
        const file = new File([blob], `${state.title}.png`, { type: "image/png" });
        
        await navigator.share({
          title: state.title,
          text: state.storyContent.substring(0, 100) + "...",
          files: [file]
        });
      } else {
        // Web Share API 미지원 시 클립보드 복사
        await navigator.clipboard.writeText(
          `${state.title}\n\n${state.storyContent}\n\n이미지: ${state.imageUrl}`
        );
        alert("📋 클립보드에 복사되었습니다!");
      }
    } catch (error) {
      console.error("공유 오류:", error);
      alert("공유 기능을 사용할 수 없습니다.");
    } finally {
      setIsSharing(false);
    }
  };

  // QR 코드 생성
  const handleQrCode = () => {
    const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(state.imageUrl)}`;
    setQrCodeUrl(qrApiUrl);
    setShowQrModal(true);
  };

  // 선생님께 제출하기
  const handleSubmit = () => {
    navigate("/submit/stories", {
      state: {
        id: state.savedId,
        title: state.title,
        content: state.storyContent,
        imageUrl: state.imageUrl
      }
    });
  };

  if (!state) return null;

  return (
    <div style={{ 
      minHeight: "100vh", 
      padding: "20px", 
      backgroundColor: "#F3F4F6",
      paddingBottom: "100px"
    }}>
      <div style={{ maxWidth: "800px", margin: "0 auto" }}>
        {/* 헤더 */}
        <div style={{ textAlign: "center", marginBottom: "30px" }}>
          <div style={{ fontSize: "64px", marginBottom: "10px" }}>{state.theme.icon}</div>
          <h1 style={{
            fontSize: "32px",
            fontWeight: "700",
            color: "#1F2937",
            marginBottom: "10px"
          }}>
            🎉 4컷 스토리 완성!
          </h1>
          <p style={{ 
            fontSize: "20px", 
            fontWeight: "600", 
            color: "#6B7280",
            marginBottom: "20px"
          }}>
            {state.title}
          </p>
          <div style={{
            display: "inline-block",
            backgroundColor: "#DCFCE7",
            border: "2px solid #22C55E",
            borderRadius: "8px",
            padding: "12px 20px",
            fontSize: "14px",
            fontWeight: "600",
            color: "#166534"
          }}>
            ✅ 내 작품에 자동 저장 완료
          </div>
        </div>

        {/* 이미지 미리보기 */}
        <div style={{
          backgroundColor: "white",
          borderRadius: "16px",
          padding: "24px",
          marginBottom: "30px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
          textAlign: "center"
        }}>
          <h3 style={{
            fontSize: "18px",
            fontWeight: "700",
            color: "#1F2937",
            marginBottom: "20px"
          }}>
            📸 인터뷰 장면
          </h3>
          <img 
            src={state.imageUrl} 
            alt={state.title}
            style={{
              width: "100%",
              maxWidth: "500px",
              borderRadius: "12px",
              boxShadow: "0 4px 12px rgba(0,0,0,0.15)"
            }}
          />
        </div>

        {/* 버튼 그룹 */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "12px",
          marginBottom: "20px"
        }}>
          {/* 다운로드 */}
          <button
            onClick={handleDownload}
            style={{
              padding: "18px",
              fontSize: "16px",
              fontWeight: "700",
              backgroundColor: "#10B981",
              color: "white",
              border: "none",
              borderRadius: "12px",
              cursor: "pointer",
              boxShadow: "0 4px 12px rgba(16, 185, 129, 0.3)",
              transition: "transform 0.2s"
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = "scale(1.02)"}
            onMouseLeave={(e) => e.currentTarget.style.transform = "scale(1)"}
          >
            📥 다운로드
          </button>

          {/* 공유하기 */}
          <button
            onClick={handleShare}
            disabled={isSharing}
            style={{
              padding: "18px",
              fontSize: "16px",
              fontWeight: "700",
              backgroundColor: isSharing ? "#D1D5DB" : "#3B82F6",
              color: "white",
              border: "none",
              borderRadius: "12px",
              cursor: isSharing ? "not-allowed" : "pointer",
              boxShadow: "0 4px 12px rgba(59, 130, 246, 0.3)",
              transition: "transform 0.2s"
            }}
            onMouseEnter={(e) => !isSharing && (e.currentTarget.style.transform = "scale(1.02)")}
            onMouseLeave={(e) => e.currentTarget.style.transform = "scale(1)"}
          >
            {isSharing ? "공유 중..." : "🔗 공유하기"}
          </button>

          {/* QR 코드 */}
          <button
            onClick={handleQrCode}
            style={{
              padding: "18px",
              fontSize: "16px",
              fontWeight: "700",
              backgroundColor: "#8B5CF6",
              color: "white",
              border: "none",
              borderRadius: "12px",
              cursor: "pointer",
              boxShadow: "0 4px 12px rgba(139, 92, 246, 0.3)",
              transition: "transform 0.2s"
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = "scale(1.02)"}
            onMouseLeave={(e) => e.currentTarget.style.transform = "scale(1)"}
          >
            📱 QR 코드
          </button>

          {/* 내작품 보기 */}
          <button
            onClick={() => navigate("/my-works/stories")}
            style={{
              padding: "18px",
              fontSize: "16px",
              fontWeight: "700",
              backgroundColor: "#F59E0B",
              color: "white",
              border: "none",
              borderRadius: "12px",
              cursor: "pointer",
              boxShadow: "0 4px 12px rgba(245, 158, 11, 0.3)",
              transition: "transform 0.2s"
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = "scale(1.02)"}
            onMouseLeave={(e) => e.currentTarget.style.transform = "scale(1)"}
          >
            📂 내작품 보기
          </button>
        </div>

        {/* 선생님께 제출하기 (큰 버튼) */}
        <button
          onClick={handleSubmit}
          style={{
            width: "100%",
            padding: "20px",
            fontSize: "18px",
            fontWeight: "700",
            backgroundColor: "#DC2626",
            color: "white",
            border: "none",
            borderRadius: "12px",
            cursor: "pointer",
            boxShadow: "0 4px 12px rgba(220, 38, 38, 0.3)",
            marginBottom: "20px",
            transition: "transform 0.2s"
          }}
          onMouseEnter={(e) => e.currentTarget.style.transform = "scale(1.02)"}
          onMouseLeave={(e) => e.currentTarget.style.transform = "scale(1)"}
        >
          📤 선생님께 제출하기
        </button>

        {/* 다시 만들기 */}
        <button
          onClick={() => navigate("/write/fourcut-theme")}
          style={{
            width: "100%",
            padding: "16px",
            fontSize: "16px",
            fontWeight: "600",
            backgroundColor: "white",
            color: "#6B7280",
            border: "2px solid #E5E7EB",
            borderRadius: "12px",
            cursor: "pointer",
            transition: "transform 0.2s"
          }}
          onMouseEnter={(e) => e.currentTarget.style.transform = "scale(1.02)"}
          onMouseLeave={(e) => e.currentTarget.style.transform = "scale(1)"}
        >
          🔄 다시 만들기
        </button>

        {/* QR 코드 모달 */}
        {showQrModal && (
          <div 
            onClick={() => setShowQrModal(false)}
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: "rgba(0,0,0,0.7)",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              zIndex: 1000
            }}
          >
            <div 
              onClick={(e) => e.stopPropagation()}
              style={{
                backgroundColor: "white",
                borderRadius: "16px",
                padding: "30px",
                textAlign: "center",
                maxWidth: "400px"
              }}
            >
              <h3 style={{
                fontSize: "20px",
                fontWeight: "700",
                color: "#1F2937",
                marginBottom: "20px"
              }}>
                📱 QR 코드로 공유하기
              </h3>
              <img 
                src={qrCodeUrl} 
                alt="QR Code"
                style={{
                  width: "300px",
                  height: "300px",
                  marginBottom: "20px"
                }}
              />
              <p style={{
                fontSize: "14px",
                color: "#6B7280",
                marginBottom: "20px",
                lineHeight: "1.6"
              }}>
                휴대폰으로 QR 코드를 스캔하면<br />
                이미지를 바로 확인할 수 있어요!
              </p>
              <button
                onClick={() => setShowQrModal(false)}
                style={{
                  padding: "12px 24px",
                  fontSize: "16px",
                  fontWeight: "600",
                  backgroundColor: "#6B7280",
                  color: "white",
                  border: "none",
                  borderRadius: "8px",
                  cursor: "pointer"
                }}
              >
                닫기
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
