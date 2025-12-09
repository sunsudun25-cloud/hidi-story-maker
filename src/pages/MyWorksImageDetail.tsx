import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { getAllImages, deleteImage, type SavedImage } from "../services/dbService";

export default function MyWorksImageDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [item, setItem] = useState<SavedImage | null>(null);
  const [isLoading, setIsLoading] = useState(true);

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
    if (!item) return;
    if (navigator.share) {
      try {
        await navigator.share({
          title: "AI 이미지",
          url: item.image,
        });
      } catch (error) {
        console.error("공유 오류:", error);
      }
    } else {
      alert("이 브라우저는 공유 기능을 지원하지 않습니다.");
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
        <div style={{ maxWidth: "720px", margin: "0 auto" }}>
          <p className="text-center text-[18px] text-gray-600 mt-10">불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (!item) {
    return (
      <div style={{ minHeight: "100vh", backgroundColor: "#FFF9F0", padding: "20px" }}>
        <div style={{ maxWidth: "720px", margin: "0 auto", padding: "24px" }}>
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
      <div style={{ maxWidth: "720px", margin: "0 auto" }}>
        {/* 헤더 */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
          <button
            onClick={() => navigate("/my-works/images")}
            style={{
              fontSize: "24px",
              width: "40px",
              height: "40px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "white",
              border: "1px solid #E5E7EB",
              borderRadius: "8px",
              cursor: "pointer"
            }}
          >
            ←
          </button>
          <h2 style={{ fontSize: "22px", fontWeight: "bold" }}>이미지 상세</h2>
          <div style={{ width: "40px" }}></div>
        </div>

        {/* 이미지 */}
        <img
          src={item.image}
          alt="AI 이미지"
          className="w-full rounded-2xl shadow-lg mb-6"
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

        {/* 액션 버튼들 */}
        <div className="flex flex-col gap-3">
          {/* 다운로드 */}
          <button
            onClick={handleDownload}
            className="p-4 bg-blue-500 text-white rounded-xl text-[16px] font-semibold hover:bg-blue-600 transition"
          >
            📥 다운로드
          </button>

          {/* 공유하기 */}
          <button
            onClick={handleShare}
            className="p-4 bg-green-500 text-white rounded-xl text-[16px] font-semibold hover:bg-green-600 transition"
          >
            🔗 공유하기
          </button>

          {/* 삭제 */}
          <button
            onClick={handleDelete}
            className="p-4 bg-red-500 text-white rounded-xl text-[16px] font-semibold hover:bg-red-600 transition"
          >
            🗑️ 삭제하기
          </button>
        </div>
      </div>
    </div>
  );
}
