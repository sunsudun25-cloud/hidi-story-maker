import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { getAllStories, deleteStory, type Story } from "../services/dbService";
import QRCodeModal from "../components/QRCodeModal";
import GoodsSelectionModal from "../components/GoodsSelectionModal";

export default function MyWorksStoryDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [story, setStory] = useState<Story | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // ✅ QR 코드 모달 상태
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);
  
  // ✅ 굿즈 선택 모달 상태
  const [isGoodsModalOpen, setIsGoodsModalOpen] = useState(false);

  useEffect(() => {
    loadStory();
  }, [id]);

  const loadStory = async () => {
    setIsLoading(true);
    try {
      const list = await getAllStories();
      const found = list.find((s) => String(s.id) === id);
      setStory(found || null);
    } catch (error) {
      console.error("글 불러오기 오류:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = () => {
    if (!story) return;
    navigate("/write/editor", {
      state: {
        title: story.title,
        initialContent: story.content,
      },
    });
  };

  const handleDelete = async () => {
    if (!story || !confirm("이 글을 삭제하시겠습니까?")) return;

    try {
      await deleteStory(story.id!);
      alert("✅ 글이 삭제되었습니다.");
      navigate("/my-works/stories");
    } catch (error) {
      console.error("삭제 오류:", error);
      alert("삭제 중 오류가 발생했습니다.");
    }
  };

  // 선생님께 제출하기
  const handleSubmit = () => {
    if (!story) return;
    navigate("/submit/stories", {
      state: {
        id: story.id,
        title: story.title,
        content: story.content,
        imageUrl: story.images?.[0]?.url || ""
      }
    });
  };

  // 다운로드 (이미지들)
  const handleDownload = async () => {
    if (!story || !story.images || story.images.length === 0) {
      alert("다운로드할 이미지가 없습니다.");
      return;
    }

    try {
      const timestamp = Date.now();
      const baseFilename = story.title.replace(/[^a-zA-Z0-9가-힣]/g, '_');
      
      // 모든 이미지 다운로드
      for (let i = 0; i < story.images.length; i++) {
        const img = story.images[i];
        const response = await fetch(img.url);
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${baseFilename}-${i + 1}-${timestamp}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        
        // 브라우저가 여러 다운로드를 처리할 시간 제공
        if (i < story.images.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      }

      alert(`✅ 총 ${story.images.length}개 이미지가 다운로드되었습니다!`);
    } catch (error) {
      console.error("❌ 다운로드 오류:", error);
      alert("다운로드 중 오류가 발생했습니다.");
    }
  };

  // QR 코드용 URL 생성 (작품 내용을 Base64로 인코딩)
  const getShareUrl = () => {
    if (!story) return '';
    
    // 작품 데이터를 JSON으로 변환
    const shareData = {
      title: story.title,
      content: story.content,
      genre: story.genre,
      createdAt: story.createdAt,
    };
    
    // Base64 인코딩
    const encoded = btoa(encodeURIComponent(JSON.stringify(shareData)));
    
    // 공유 URL 생성
    const baseUrl = window.location.origin;
    return `${baseUrl}/shared/story?data=${encoded}`;
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

  if (!story) {
    return (
      <div style={{ minHeight: "100vh", backgroundColor: "#FFF9F0", padding: "20px" }}>
        <div className="responsive-container p-6">
          <p className="text-center text-[18px] text-gray-600">글을 찾을 수 없습니다.</p>
          <div className="text-center mt-4">
            <button
              onClick={() => navigate("/my-works/stories")}
              className="px-6 py-3 bg-green-500 text-white rounded-xl"
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
      <div className="responsive-container p-4">
        {/* 헤더 */}
        <div className="flex justify-between items-center mb-4">
          <button
            onClick={() => navigate("/my-works/stories")}
            className="text-[24px] w-10 h-10 flex items-center justify-center"
          >
            ←
          </button>
          <h2 className="text-[22px] font-bold">글 상세</h2>
          <div className="w-10"></div>
        </div>

        {/* 제목 */}
        <h3 className="text-[24px] font-bold text-gray-800 mb-4">{story.title}</h3>

        {/* 메타 정보 */}
        <div className="flex items-center gap-2 mb-6 text-[14px] text-gray-500">
          <span>{story.content.length}자</span>
          {story.images && story.images.length > 0 && (
            <>
              <span>·</span>
              <span>📸 {story.images.length}개</span>
            </>
          )}
          <span>·</span>
          <span>{new Date(story.createdAt).toLocaleDateString("ko-KR")}</span>
        </div>

        {/* 내용 */}
        <div className="bg-gray-50 rounded-2xl p-4 mb-6">
          <p className="text-[16px] text-gray-700 whitespace-pre-line leading-relaxed">
            {story.content}
          </p>
        </div>

        {/* 첨부 이미지들 */}
        {story.images && story.images.length > 0 && (
          <div className="mb-6">
            <h4 className="text-[18px] font-bold mb-3">📸 첨부 이미지</h4>
            <div className="grid grid-cols-2 gap-3">
              {story.images.map((img) => (
                <img
                  key={img.id}
                  src={img.url}
                  alt="첨부 이미지"
                  className="w-full rounded-xl border-2 border-gray-200 cursor-pointer"
                  onClick={() => window.open(img.url, "_blank")}
                />
              ))}
            </div>
          </div>
        )}

        {/* 액션 버튼들 - 통일된 큰 버튼 스타일 */}
        <div className="flex flex-col gap-3">
          {/* 1행: 선생님께 제출 + 다운로드 */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={handleSubmit}
              className="py-5 px-5 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl text-[17px] font-bold hover:from-purple-600 hover:to-pink-600 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              📤 선생님께 제출
            </button>
            <button
              onClick={handleDownload}
              className="py-5 px-5 bg-emerald-500 text-white rounded-xl text-[17px] font-bold hover:bg-emerald-600 transition-all duration-200 shadow-md hover:shadow-lg"
            >
              📥 다운로드
            </button>
          </div>

          {/* 2행: 공유 + QR코드 + 삭제 */}
          <div className="grid grid-cols-3 gap-3">
            <button
              onClick={() => setIsGoodsModalOpen(true)}
              className="py-4 px-4 bg-pink-500 text-white rounded-xl text-[16px] font-bold hover:bg-pink-600 transition-all duration-200 shadow-md hover:shadow-lg"
            >
              🎨 공유
            </button>
            <button
              onClick={() => setIsQRModalOpen(true)}
              className="py-4 px-4 bg-purple-500 text-white rounded-xl text-[16px] font-bold hover:bg-purple-600 transition-all duration-200 shadow-md hover:shadow-lg"
            >
              📱 QR코드
            </button>
            <button
              onClick={handleDelete}
              className="py-4 px-4 bg-rose-500 text-white rounded-xl text-[16px] font-bold hover:bg-rose-600 transition-all duration-200 shadow-md hover:shadow-lg"
            >
              🗑️ 삭제
            </button>
          </div>
        </div>

        {/* ✅ QR 코드 모달 */}
        {story && (
          <QRCodeModal
            isOpen={isQRModalOpen}
            onClose={() => setIsQRModalOpen(false)}
            imageUrl={getShareUrl()}
            title="글 QR 코드로 공유하기"
          />
        )}

        {/* ✅ 굿즈 선택 모달 */}
        {story && (
          <GoodsSelectionModal
            isOpen={isGoodsModalOpen}
            onClose={() => setIsGoodsModalOpen(false)}
            artwork={story}
            artworkType="writing"
          />
        )}
      </div>
    </div>
  );
}
