// src/pages/DrawingResult.tsx
import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { saveImageToDB } from "../services/dbService";

export default function DrawingResult() {
  const { state } = useLocation();
  const navigate = useNavigate();

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
    if (imageData && prompt) {
      console.log("💾 [DrawingResult] IndexedDB에 이미지 저장 시작...");
      
      saveImageToDB({
        image: imageData,
        prompt: prompt,
        style: style,
      })
        .then(() => {
          console.log("✅ [DrawingResult] IndexedDB 저장 완료");
        })
        .catch((err) => {
          console.error("❌ [DrawingResult] IndexedDB 저장 실패:", err);
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
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: "AI 생성 이미지",
          text: `${prompt} (${style} 스타일)`,
          url: window.location.href,
        });
        console.log("✅ [DrawingResult] 공유 완료");
      } catch (err) {
        console.error("❌ [DrawingResult] 공유 실패:", err);
      }
    } else {
      alert("이 브라우저는 공유 기능을 지원하지 않습니다.");
    }
  };

  return (
    <div className="p-5 pb-20">
      <h1 className="text-2xl font-bold mb-4">생성된 그림 🎨</h1>

      <div className="mb-4 p-3 bg-gray-100 rounded-lg">
        <p className="text-sm text-gray-600">설명: {prompt}</p>
        <p className="text-sm text-gray-600">스타일: {style}</p>
      </div>

      <img
        src={imageData}
        alt="AI 생성 이미지"
        className="w-full rounded-xl shadow-lg"
        onLoad={() => console.log("✅ [DrawingResult] 이미지 로드 완료")}
        onError={(e) => console.error("❌ [DrawingResult] 이미지 로드 실패:", e)}
      />

      <button
        className="w-full bg-emerald-500 text-white text-xl py-4 rounded-xl mt-6"
        onClick={handleDownload}
      >
        📥 이미지 다운로드
      </button>

      <button
        className="w-full bg-blue-500 text-white text-xl py-4 rounded-xl mt-4"
        onClick={handleShare}
      >
        📤 공유하기
      </button>

      <button
        className="w-full bg-purple-500 text-white text-xl py-4 rounded-xl mt-4"
        onClick={() => navigate("/my-works")}
      >
        📂 내 작품 보기
      </button>

      <button
        className="w-full bg-gray-300 text-black text-xl py-4 rounded-xl mt-4"
        onClick={() => navigate(-1)}
      >
        ← 다시 만들기
      </button>
    </div>
  );
}
