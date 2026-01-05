import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { saveImageAsFile, shareImage, copyImageToClipboard } from "../services/imageService";
import { saveImage } from "../services/dbService";
import QRCodeModal from "../components/QRCodeModal";

export default function Result() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const imageUrl = state?.imageUrl;
  const prompt = state?.prompt || "AI 생성 이미지";
  const style = state?.style || "기본";
  const hasSaved = useRef(false); // 저장 플래그
  
  // ✅ QR 코드 모달 상태
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);

  // 이미지가 생성되면 자동으로 DB에 저장 (한 번만 실행)
  useEffect(() => {
    // 이미 저장했으면 스킵
    if (hasSaved.current) {
      console.log("⏭️ [Result] 이미 저장됨, 스킵");
      return;
    }

    if (imageUrl) {
      console.log("💾 [Result] IndexedDB에 이미지 저장 시작...");
      hasSaved.current = true; // 저장 플래그 설정
      
      saveImage({
        image: imageUrl,
        prompt: prompt,
        style: style
      }).then(() => {
        console.log("✅ [Result] 이미지가 내 작품에 저장되었습니다.");
      }).catch((err) => {
        console.error("❌ [Result] 이미지 저장 오류:", err);
        hasSaved.current = false; // 실패 시 플래그 해제
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
    if (!imageUrl) {
      alert("공유할 이미지가 없습니다.");
      return;
    }

    try {
      console.log("🔗 공유 시작:", imageUrl.substring(0, 100) + "...");
      
      // imageService 사용하여 공유
      const success = await shareImage(
        imageUrl,
        "AI 그림 공유",
        "제가 AI로 만든 그림이에요!"
      );

      if (!success) {
        console.log("⚠️ Web Share API 사용 불가, 클립보드 복사로 대체");
        
        // Web Share API 미지원 시 클립보드 복사
        const copied = await copyImageToClipboard(imageUrl);
        if (copied) {
          // HTTP URL인 경우
          if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
            alert("📋 이미지 링크가 클립보드에 복사되었습니다!\n\n💡 메신저나 SNS에 붙여넣기(Ctrl+V)하여 공유하세요.");
          } else {
            alert("📋 이미지가 클립보드에 복사되었습니다!\n\n💡 메신저나 SNS에 붙여넣기(Ctrl+V)하여 공유하세요.");
          }
        } else {
          alert("⚠️ 공유 기능을 사용할 수 없습니다.\n\n직접 이미지를 다운로드한 후 공유해주세요.");
        }
      } else {
        console.log("✅ 공유 성공!");
      }
    } catch (err) {
      console.error("❌ 공유 오류:", err);
      alert("공유 중 오류가 발생했습니다.\n\n이미지를 다운로드한 후 직접 공유해주세요.");
    }
  };

  return (
    <div className="min-h-screen bg-[#FFF9F0] p-5 pb-20">
      <div className="max-w-4xl mx-auto">
        {imageUrl ? (
          <>
            {/* 제목 */}
            <h1 className="text-2xl font-bold mb-4">생성된 그림 🎨</h1>

            {/* 생성된 이미지 */}
            <div className="flex justify-center mb-6">
              <img
                src={imageUrl}
                alt="생성된 그림"
                className="rounded-xl shadow-lg cursor-pointer"
                style={{ maxWidth: "380px", width: "100%", height: "auto" }}
                onClick={() => window.open(imageUrl, "_blank")}
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
                onClick={() => navigate("/drawing/practice")}
                className="py-4 px-5 bg-gray-400 text-white rounded-xl text-[17px] font-bold hover:bg-gray-500 transition-all duration-200 shadow-md hover:shadow-lg"
              >
                ← 다시 만들기
              </button>
            </div>

            {/* ✅ QR 코드 모달 */}
            <QRCodeModal
              isOpen={isQRModalOpen}
              onClose={() => setIsQRModalOpen(false)}
              imageUrl={imageUrl}
              title="QR 코드로 공유하기"
            />
          </>
        ) : (
          <div className="p-10 text-center">
            <p className="text-xl mb-5">생성된 이미지가 없습니다.</p>
            <button
              onClick={() => navigate("/drawing/practice")}
              className="bg-purple-600 text-white px-6 py-3 rounded-xl text-lg font-bold hover:bg-purple-700 transition-colors"
            >
              🎨 그림 만들러 가기
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
