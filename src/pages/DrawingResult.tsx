// src/pages/DrawingResult.tsx
import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { saveImage } from "../services/dbService";
import QRCodeModal from "../components/QRCodeModal";

export default function DrawingResult() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const hasSaved = useRef(false); // 저장 플래그
  
  // ✅ QR 코드 모달 상태
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);

  // 이미지 URL 또는 Base64 확인
  const imageData = state?.imageBase64 || state?.imageUrl;
  const prompt = state?.prompt || "AI 생성 이미지";
  const style = state?.style || "기본";

  console.log("🔵 [DrawingResult] 페이지 로드:", { 
    hasImageBase64: !!state?.imageBase64, 
    hasImageUrl: !!state?.imageUrl,
    imageDataLength: imageData?.length,
    prompt,
    style 
  });

  // IndexedDB에 이미지 자동 저장 (한 번만 실행)
  useEffect(() => {
    // 이미 저장했으면 스킵
    if (hasSaved.current) {
      console.log("⏭️ [DrawingResult] 이미 저장됨, 스킵");
      return;
    }

    if (imageData && prompt) {
      console.log("💾 [DrawingResult] IndexedDB에 이미지 저장 시작...");
      hasSaved.current = true; // 저장 플래그 설정
      
      saveImage({
        image: imageData,
        prompt: prompt,
        style: style,
      })
        .then(() => {
          console.log("✅ [DrawingResult] IndexedDB 저장 완료");
        })
        .catch((err) => {
          console.error("❌ [DrawingResult] IndexedDB 저장 실패:", err);
          hasSaved.current = false; // 실패 시 플래그 해제
        });
    }
  }, []); // 빈 의존성 배열로 한 번만 실행

  if (!imageData) {
    console.warn("⚠️ [DrawingResult] 이미지 데이터가 없습니다");
    return (
      <div className="p-10 text-center">
        <p className="text-xl">표시할 이미지가 없습니다.</p>
        <button
          onClick={() => navigate("/home")}
          className="mt-5 bg-emerald-500 text-white px-6 py-3 rounded-xl"
        >
          홈으로 돌아가기
        </button>
      </div>
    );
  }

  const handleDownload = () => {
    console.log("📥 [DrawingResult] 다운로드 시작");
    const link = document.createElement("a");
    link.href = imageData;
    link.download = `ai-image-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    console.log("✅ [DrawingResult] 다운로드 완료");
  };

  const handleShare = async () => {
    console.log("📤 [DrawingResult] 공유 시작");
    
    if (!imageData) {
      alert("공유할 이미지가 없습니다.");
      return;
    }

    try {
      // imageService 사용하여 공유
      const { shareImage, copyImageToClipboard } = await import("../services/imageService");
      
      const success = await shareImage(
        imageData,
        "AI 생성 이미지",
        `${prompt} (${style} 스타일)`
      );

      if (!success) {
        console.log("⚠️ Web Share API 사용 불가, 클립보드 복사로 대체");
        
        // Web Share API 미지원 시 클립보드 복사
        const copied = await copyImageToClipboard(imageData);
        if (copied) {
          if (imageData.startsWith('http://') || imageData.startsWith('https://')) {
            alert("📋 이미지 링크가 클립보드에 복사되었습니다!\n\n💡 메신저나 SNS에 붙여넣기(Ctrl+V)하여 공유하세요.");
          } else {
            alert("📋 이미지가 클립보드에 복사되었습니다!\n\n💡 메신저나 SNS에 붙여넣기(Ctrl+V)하여 공유하세요.");
          }
        } else {
          alert("⚠️ 공유 기능을 사용할 수 없습니다.\n\n직접 이미지를 다운로드한 후 공유해주세요.");
        }
      } else {
        console.log("✅ [DrawingResult] 공유 완료");
      }
    } catch (err) {
      console.error("❌ [DrawingResult] 공유 실패:", err);
      alert("공유 중 오류가 발생했습니다.\n\n이미지를 다운로드한 후 직접 공유해주세요.");
    }
  };

  return (
    <div className="min-h-screen bg-[#FFF9F0] p-5 pb-20">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">생성된 그림 🎨</h1>

        <div className="mb-4 p-3 bg-gray-100 rounded-lg">
          <p className="text-sm text-gray-600">설명: {prompt}</p>
          <p className="text-sm text-gray-600">스타일: {style}</p>
        </div>

      <div className="flex justify-center mb-6">
        <img
          src={imageData}
          alt="AI 생성 이미지"
          className="rounded-xl shadow-lg cursor-pointer"
          style={{ maxWidth: "380px", width: "100%", height: "auto" }}
          onClick={() => window.open(imageData, "_blank")}
          onLoad={() => console.log("✅ [DrawingResult] 이미지 로드 완료")}
          onError={(e) => console.error("❌ [DrawingResult] 이미지 로드 실패:", e)}
        />
      </div>

      {/* 액션 버튼들 - 2번째 이미지 스타일 */}
      <div className="flex flex-col gap-3 mt-6">
        {/* 1행: 다운로드 + 공유하기 */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={handleDownload}
            className="py-4 px-5 bg-emerald-500 text-white rounded-xl text-[17px] font-bold hover:bg-emerald-600 transition-all duration-200 shadow-md hover:shadow-lg"
          >
            📥 다운로드
          </button>
          <button
            onClick={handleShare}
            className="py-4 px-5 bg-blue-500 text-white rounded-xl text-[17px] font-bold hover:bg-blue-600 transition-all duration-200 shadow-md hover:shadow-lg"
          >
            📤 공유하기
          </button>
        </div>

        {/* 2행: QR 코드 + 내 작품 보기 */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => setIsQRModalOpen(true)}
            className="py-4 px-5 bg-orange-500 text-white rounded-xl text-[17px] font-bold hover:bg-orange-600 transition-all duration-200 shadow-md hover:shadow-lg"
          >
            📱 QR 코드
          </button>
          <button
            onClick={() => navigate("/my-works")}
            className="py-4 px-5 bg-purple-600 text-white rounded-xl text-[17px] font-bold hover:bg-purple-700 transition-all duration-200 shadow-md hover:shadow-lg"
          >
            👀 내 작품 보기
          </button>
        </div>

        {/* 3행: 다시 만들기 */}
        <button
          onClick={() => navigate(-1)}
          className="py-4 px-5 bg-gray-400 text-white rounded-xl text-[17px] font-bold hover:bg-gray-500 transition-all duration-200 shadow-md hover:shadow-lg"
        >
          ← 다시 만들기
        </button>
      </div>

      {/* ✅ QR 코드 모달 */}
      <QRCodeModal
        isOpen={isQRModalOpen}
        onClose={() => setIsQRModalOpen(false)}
        imageUrl={imageData}
        title="QR 코드로 공유하기"
      />
      </div>
    </div>
  );
}
