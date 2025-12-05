import { useNavigate } from "react-router-dom";
import Header from "../components/Header";

export default function WriteStart() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#FFF9E9] pb-24">
      {/* 상단 헤더 */}
      <Header title="글쓰기" />

      {/* 상단 아이콘 + 제목 */}
      <div className="w-full text-center mt-8 px-6">
        <div className="text-5xl mb-4">✨</div>
        <h1 className="text-2xl font-bold text-gray-800 mb-3">
          글을 어떻게 시작할까요?
        </h1>
        <p className="text-gray-600 text-lg leading-relaxed">
          직접 입력하거나 손글씨 사진으로도 시작할 수 있어요
        </p>
      </div>

      {/* 버튼 영역 */}
      <div className="mt-10 flex flex-col items-center px-6 space-y-5">
        <button
          className="w-full max-w-md py-5 bg-[#FFF2C6] rounded-2xl shadow-md text-xl font-bold 
                     flex items-center justify-center gap-3
                     hover:shadow-lg hover:bg-[#FFE99E] 
                     active:scale-[0.98] transition-all duration-200"
          onClick={() => navigate("/write/upload")}
        >
          📷 <span>사진으로 올릴래요</span>
        </button>

        <button
          className="w-full max-w-md py-5 bg-[#C6ECFF] rounded-2xl shadow-md text-xl font-bold 
                     flex items-center justify-center gap-3
                     hover:shadow-lg hover:bg-[#A1DEFF]
                     active:scale-[0.98] transition-all duration-200"
          onClick={() => navigate("/write/direct")}
        >
          ✍️ <span>직접 입력할래요</span>
        </button>
      </div>
    </div>
  );
}
