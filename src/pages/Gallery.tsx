import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAllImages, deleteImage } from "../services/dbService";

interface SavedImage {
  id?: number;
  image: string;
  prompt: string;
  style?: string;
  createdAt: string;
}

export default function Gallery() {
  const [images, setImages] = useState<SavedImage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadImages();
  }, []);

  const loadImages = async () => {
    try {
      const data = await getAllImages();
      setImages(data.reverse()); // 최신순 정렬
    } catch (error) {
      console.error("이미지 불러오기 오류:", error);
      alert("작품을 불러오는 중 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("이 작품을 삭제하시겠습니까?")) return;

    try {
      await deleteImage(id);
      alert("✅ 작품이 삭제되었습니다.");
      loadImages(); // 다시 로드
    } catch (error) {
      console.error("삭제 오류:", error);
      alert("삭제 중 오류가 발생했습니다.");
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 max-w-[600px] mx-auto">
        <h1 className="text-[24px] font-bold mb-4 text-center">📁 내 작품 보기</h1>
        <p className="text-[18px] text-center text-gray-600 mt-10">불러오는 중...</p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-[600px] mx-auto">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-4">
        <button
          className="text-[18px] text-gray-600"
          onClick={() => navigate(-1)}
        >
          ← 뒤로
        </button>
        <h1 className="text-[24px] font-bold">📁 내 작품 보기</h1>
        <button
          className="text-[18px] text-gray-600"
          onClick={() => navigate("/")}
        >
          🏠
        </button>
      </div>

      {/* 작품 개수 표시 */}
      <div className="bg-blue-50 p-3 rounded-xl mb-4 text-center">
        <p className="text-[18px] font-semibold text-blue-700">
          총 {images.length}개의 작품
        </p>
      </div>

      {/* 빈 상태 */}
      {images.length === 0 && (
        <div className="text-center mt-10">
          <p className="text-[20px] text-gray-600 mb-6">
            저장된 작품이 없습니다.
          </p>
          <button
            className="px-6 py-3 bg-emerald-500 text-white rounded-xl text-[18px] font-semibold"
            onClick={() => navigate("/image/practice")}
          >
            그림 만들러 가기
          </button>
        </div>
      )}

      {/* 이미지 그리드 */}
      <div className="grid grid-cols-1 gap-4 mt-4">
        {images.map((item) => (
          <div
            key={item.id}
            className="border rounded-xl p-4 bg-white shadow hover:shadow-lg transition"
          >
            <img
              src={item.image}
              alt="저장된 그림"
              className="w-full rounded-xl mb-3 cursor-pointer"
              onClick={() => {
                // 이미지 클릭 시 크게 보기 (새 탭)
                window.open(item.image, "_blank");
              }}
            />

            {/* 프롬프트 정보 */}
            <p className="text-[16px] text-gray-700 mb-2">
              <strong>생성 요청:</strong> {item.prompt}
            </p>

            {/* 스타일 정보 (있는 경우) */}
            {item.style && (
              <p className="text-[14px] text-gray-500 mb-2">
                <strong>스타일:</strong> {item.style}
              </p>
            )}

            {/* 생성 날짜 */}
            <p className="text-[14px] text-gray-400 mb-3">
              {new Date(item.createdAt).toLocaleString("ko-KR", {
                year: "numeric",
                month: "long",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>

            {/* 액션 버튼 */}
            <div className="flex gap-2">
              <button
                className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg text-[16px] font-semibold"
                onClick={() => {
                  // 다운로드
                  const link = document.createElement("a");
                  link.href = item.image;
                  link.download = `ai-image-${item.id || Date.now()}.png`;
                  link.click();
                }}
              >
                📥 다운로드
              </button>

              <button
                className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg text-[16px] font-semibold"
                onClick={() => item.id && handleDelete(item.id)}
              >
                🗑️ 삭제
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
