import { useNavigate } from "react-router-dom";
import Header from "../components/Header";

export default function WriteStart() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#FFF9E9] flex flex-col items-center">
      
      <Header title="글쓰기" />

      <div className="w-full max-w-[480px] mt-8 px-6 text-center">

        <div className="text-4xl mb-4">✨</div>

        <h2 className="text-xl font-bold text-gray-800 mb-2">
          글을 어떻게 시작할까요?
        </h2>

        <p className="text-gray-600 mb-6 text-[17px] leading-relaxed">
          직접 입력하거나, 손글씨 사진을<br />업로드할 수 있어요
        </p>

        {/* 사진 업로드 */}
        <button
          className="w-full py-5 bg-[#FFF2C6] rounded-2xl shadow-md text-lg font-bold 
                     flex items-center justify-center gap-3
                     hover:bg-[#FFE8A6] transition-all mb-4"
          onClick={() => navigate("/write/upload")}
        >
          📷 사진으로 올릴래요
        </button>

        {/* 직접 입력 */}
        <button
          className="w-full py-5 bg-[#C6ECFF] rounded-2xl shadow-md text-lg font-bold 
                     flex items-center justify-center gap-3
                     hover:bg-[#A9E3FF] transition-all mb-6"
          onClick={() => navigate("/writing/genre")}
        >
          ✍️ 직접 입력할래요
        </button>

        {/* 음성 입력 */}
        <div className="border-t w-full my-4 opacity-40" />

        <div className="text-xl mb-3">✨</div>

        <button
          className="w-full py-5 bg-[#C8F7E4] rounded-2xl shadow-md text-lg font-bold 
                     flex items-center justify-center gap-3
                     hover:bg-[#B3F0D9] transition-all"
        >
          🎤 말로 입력할래요
        </button>
      </div>
    </div>
  );
}
