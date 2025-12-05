import { useNavigate } from "react-router-dom";
import Header from "../components/Header";

export default function WriteStart() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#FFF9E9] pb-24">
      <Header title="글쓰기" />

      {/* 상단 텍스트 */}
      <div className="w-full text-center mt-10 px-6">
        <h2 className="text-xl font-bold text-gray-800 leading-relaxed">
          글을 어떻게<br/>시작할까요?
        </h2>

        <p className="text-gray-600 text-sm mt-3 leading-relaxed">
          직접 입력하거나, 손글씨 사진을<br/>
          업로드할 수 있어요
        </p>
      </div>

      {/* 버튼 영역 */}
      <div className="px-6 mt-8 space-y-4 flex flex-col items-center">
        {/* 버튼 1 */}
        <button
          onClick={() => navigate("/write/upload")}
          className="w-full max-w-md py-4 bg-[#FFF2B8] rounded-2xl shadow 
                     flex items-center justify-center gap-3 text-lg font-bold
                     hover:shadow-lg transition-shadow"
        >
          📷 사진으로 올릴래요
        </button>

        {/* 버튼 2 */}
        <button
          onClick={() => navigate("/write/direct")}
          className="w-full max-w-md py-4 bg-[#CFEAFF] rounded-2xl shadow
                     flex items-center justify-center gap-3 text-lg font-bold
                     hover:shadow-lg transition-shadow"
        >
          ✍️ 직접 입력할래요
        </button>

        {/* 구분선 + 아이콘 */}
        <div className="flex items-center justify-center w-full max-w-md my-2">
          <div className="flex-1 border-b border-gray-300"></div>
          <span className="mx-3 text-xl">✨</span>
          <div className="flex-1 border-b border-gray-300"></div>
        </div>

        {/* 버튼 3 */}
        <button
          onClick={() => navigate("/write/voice")}
          className="w-full max-w-md py-4 bg-[#CFFFE2] rounded-2xl shadow
                     flex items-center justify-center gap-3 text-lg font-bold
                     hover:shadow-lg transition-shadow"
        >
          🎤 말로 입력할래요
        </button>
      </div>
    </div>
  );
}
