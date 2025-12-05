import { useNavigate } from "react-router-dom";

export default function WriteStart() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#FAF7EF] px-6 py-8">

      {/* 헤더 */}
      <div className="flex items-center justify-between bg-[#CFE1FF] py-3 px-4 rounded-xl mb-6 shadow-sm">
        <button
          onClick={() => navigate(-1)}
          className="w-10 h-10 flex items-center justify-center rounded-full bg-white shadow hover:bg-gray-50 transition-colors"
        >
          ←
        </button>

        <h1 className="text-xl font-bold">글쓰기</h1>

        <button
          onClick={() => navigate("/")}
          className="w-10 h-10 flex items-center justify-center rounded-full bg-white shadow hover:bg-gray-50 transition-colors"
        >
          🏠
        </button>
      </div>

      {/* 상단 안내 */}
      <div className="text-center mt-4 mb-8">
        <div className="text-3xl mb-2">✨</div>
        <p className="text-lg font-semibold">글을 어떻게 시작할까요?</p>
        <p className="text-gray-500 text-sm mt-1">
          직접 입력하거나 손글씨 사진으로도 시작할 수 있어요
        </p>
      </div>

      {/* 카드 버튼 영역 */}
      <div className="space-y-5">

        {/* 사진 업로드 */}
        <button
          onClick={() => navigate("/write/photo")}
          className="w-full bg-[#FFF3C4] py-5 rounded-2xl shadow-md text-lg font-semibold 
                     flex items-center justify-center gap-2 active:scale-[0.98] 
                     hover:shadow-lg transition-all duration-200"
        >
          📷 <span>사진으로 올릴래요</span>
        </button>

        {/* 직접 입력 */}
        <button
          onClick={() => navigate("/write/direct")}
          className="w-full bg-[#D9ECFF] py-5 rounded-2xl shadow-md text-lg font-semibold 
                     flex items-center justify-center gap-2 active:scale-[0.98]
                     hover:shadow-lg transition-all duration-200"
        >
          ✍️ <span>직접 입력할래요</span>
        </button>
      </div>

    </div>
  );
}
