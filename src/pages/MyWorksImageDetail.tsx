import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { getAllImages, deleteImage, type SavedImage } from "../services/dbService";
import QRCodeModal from "../components/QRCodeModal";
import GoodsSelectionModal from "../components/GoodsSelectionModal";

export default function MyWorksImageDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [item, setItem] = useState<SavedImage | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // ✅ QR 코드 모달 상태
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);
  
  // ✅ 굿즈 선택 모달 상태
  const [isGoodsModalOpen, setIsGoodsModalOpen] = useState(false);

  useEffect(() => {
    loadImage();
  }, [id]);

  const loadImage = async () => {
    setIsLoading(true);
    try {
      const list = await getAllImages();
      const found = list.find((i) => String(i.id) === id);
      setItem(found || null);
    } catch (error) {
      console.error("이미지 불러오기 오류:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = () => {
    if (!item) return;
    const link = document.createElement("a");
    link.href = item.image;
    link.download = `ai-image-${item.id || Date.now()}.png`;
    link.click();
  };

  const handleShare = async () => {
    if (!item || !item.image) {
      alert("공유할 이미지가 없습니다.");
      return;
    }

    try {
      // imageService 사용하여 공유
      const { shareImage, copyImageToClipboard } = await import("../services/imageService");
      
      const success = await shareImage(
        item.image,
        "AI 이미지",
        item.prompt || "AI로 생성한 이미지입니다"
      );

      if (!success) {
        console.log("⚠️ Web Share API 사용 불가, 클립보드 복사로 대체");
        
        // Web Share API 미지원 시 클립보드 복사
        const copied = await copyImageToClipboard(item.image);
        if (copied) {
          if (item.image.startsWith('http://') || item.image.startsWith('https://')) {
            alert("📋 이미지 링크가 클립보드에 복사되었습니다!\n\n💡 메신저나 SNS에 붙여넣기(Ctrl+V)하여 공유하세요.");
          } else {
            alert("📋 이미지가 클립보드에 복사되었습니다!\n\n💡 메신저나 SNS에 붙여넣기(Ctrl+V)하여 공유하세요.");
          }
        } else {
          alert("⚠️ 공유 기능을 사용할 수 없습니다.\n\n직접 이미지를 다운로드한 후 공유해주세요.");
        }
      }
    } catch (error) {
      console.error("공유 오류:", error);
      alert("공유 중 오류가 발생했습니다.\n\n이미지를 다운로드한 후 직접 공유해주세요.");
    }
  };

  const handleDelete = async () => {
    if (!item || !confirm("이 이미지를 삭제하시겠습니까?")) return;

    try {
      await deleteImage(item.id!);
      alert("✅ 이미지가 삭제되었습니다.");
      navigate("/my-works/images");
    } catch (error) {
      console.error("삭제 오류:", error);
      alert("삭제 중 오류가 발생했습니다.");
    }
  };

  if (isLoading) {
    return (
      <div style={{ minHeight: "100vh", backgroundColor: "#FFF9F0", padding: "20px" }}>
        <div className="responsive-container">
          <p className="text-center text-[18px] text-gray-600 mt-10">불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (!item) {
    return (
      <div style={{ minHeight: "100vh", backgroundColor: "#FFF9F0", padding: "20px" }}>
        <div className="responsive-container p-6">
          <p className="text-center text-[18px] text-gray-600">이미지를 찾을 수 없습니다.</p>
          <div className="text-center mt-4">
            <button
              onClick={() => navigate("/my-works/images")}
              className="px-6 py-3 bg-blue-500 text-white rounded-xl"
            >
              목록으로 돌아가기
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#FFF9F0", padding: "20px" }}>
      <div className="responsive-container">
        {/* 헤더 */}
        <div className="flex justify-between items-center mb-5">
          <button
            onClick={() => navigate("/my-works/images")}
            className="text-[24px] w-10 h-10 flex items-center justify-center bg-white border border-gray-300 rounded-lg cursor-pointer"
          >
            ←
          </button>
          <h2 className="text-[22px] font-bold">이미지 상세</h2>
          <div className="w-10"></div>
        </div>

        {/* 이미지 */}
        <img
          src={item.image}
          alt="AI 이미지"
          className="w-full rounded-2xl shadow-lg mb-6 cursor-pointer"
          style={{ maxWidth: "380px", margin: "0 auto", display: "block" }}
          onClick={() => window.open(item.image, "_blank")}
        />

        {/* 프롬프트 */}
        {item.prompt && (
          <div className="bg-gray-50 rounded-xl p-4 mb-6">
            <p className="text-[14px] text-gray-700">{item.prompt}</p>
          </div>
        )}

        {/* 생성일 */}
        <div className="text-center text-[13px] text-gray-500 mb-6">
          {new Date(item.createdAt).toLocaleString("ko-KR")}
        </div>

        {/* 액션 버튼들 - 개선된 스타일 */}
        <div className="flex flex-col gap-3">
          {/* 무엇을 만들까요? 버튼 - 가장 상단에 강조 */}
          <button
            onClick={() => setIsGoodsModalOpen(true)}
            className="py-5 px-5 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-xl text-[18px] font-bold hover:from-pink-600 hover:to-purple-600 transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            🎨 무엇을 만들까요?
          </button>

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

          {/* 2행: QR 코드 + 삭제하기 */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setIsQRModalOpen(true)}
              className="py-4 px-5 bg-orange-500 text-white rounded-xl text-[17px] font-bold hover:bg-orange-600 transition-all duration-200 shadow-md hover:shadow-lg"
            >
              📱 QR 코드
            </button>
            <button
              onClick={handleDelete}
              className="py-4 px-5 bg-rose-500 text-white rounded-xl text-[17px] font-bold hover:bg-rose-600 transition-all duration-200 shadow-md hover:shadow-lg"
            >
              🗑️ 삭제하기
            </button>
          </div>
        </div>

        {/* ✅ QR 코드 모달 */}
        {item && (
          <QRCodeModal
            isOpen={isQRModalOpen}
            onClose={() => setIsQRModalOpen(false)}
            imageUrl={item.image}
            title="QR 코드로 공유하기"
          />
        )}

        {/* ✅ 굿즈 선택 모달 */}
        {item && (
          <GoodsSelectionModal
            isOpen={isGoodsModalOpen}
            onClose={() => setIsGoodsModalOpen(false)}
            artwork={item}
            artworkType="image"
          />
        )}
      </div>
    </div>
  );
}
