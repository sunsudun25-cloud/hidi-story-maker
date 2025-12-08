import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAllImages, deleteImage, type SavedImage } from "../services/dbService";

export default function MyWorksImages() {
  const [images, setImages] = useState<SavedImage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadImages();
  }, []);

  const loadImages = async () => {
    setIsLoading(true);
    try {
      const data = await getAllImages();
      setImages(data.reverse());
    } catch (error) {
      console.error("이미지 불러오기 오류:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("이 이미지를 삭제하시겠습니까?")) return;

    try {
      await deleteImage(id);
      setImages((prev) => prev.filter((img) => img.id !== id));
      alert("✅ 이미지가 삭제되었습니다.");
    } catch (error) {
      console.error("삭제 오류:", error);
      alert("삭제 중 오류가 발생했습니다.");
    }
  };

  if (isLoading) {
    return (
      <div className="screen">
        <div className="screen-body">
          <p className="text-center text-[18px] text-gray-600 mt-10">불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="screen">
      <div className="screen-body p-4">
        {/* 헤더 */}
        <div className="flex justify-between items-center mb-4">
          <button
            onClick={() => navigate("/my-works")}
            className="text-[24px] w-10 h-10 flex items-center justify-center"
          >
            ←
          </button>
          <h2 className="text-[22px] font-bold">🎨 내 이미지</h2>
          <div className="w-10"></div>
        </div>

        {/* 이미지 없음 */}
        {images.length === 0 ? (
          <div className="text-center mt-10">
            <p className="text-[20px] text-gray-600 mb-6">저장된 이미지가 없습니다.</p>
            <button
              className="px-6 py-3 bg-blue-500 text-white rounded-xl text-[18px] font-semibold"
              onClick={() => navigate("/image/practice")}
            >
              이미지 만들러 가기
            </button>
          </div>
        ) : (
          /* 이미지 갤러리 */
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {images.map((item) => (
              <div
                key={item.id}
                className="relative bg-white border-2 border-gray-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all cursor-pointer"
                onClick={() => navigate(`/my-works/images/${item.id}`)}
              >
                <div className="relative aspect-square bg-gray-100">
                  <img
                    src={item.image}
                    alt="저장된 이미지"
                    className="w-full h-full object-cover"
                  />

                  {/* 삭제 버튼 */}
                  <button
                    className="absolute top-2 right-2 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full shadow-lg flex items-center justify-center hover:bg-red-500 hover:text-white transition-all"
                    onClick={(e) => handleDelete(item.id!, e)}
                    title="삭제"
                  >
                    <span className="text-[16px]">🗑️</span>
                  </button>
                </div>

                {/* 간단한 정보 */}
                <div className="p-2">
                  <p className="text-[11px] text-gray-400 truncate">
                    {new Date(item.createdAt).toLocaleDateString("ko-KR")}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
