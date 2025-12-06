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
          어떻게 글을 쓸까요?
        </h2>

        <p className="text-gray-600 mb-8 text-[17px] leading-relaxed">
          AI가 도와주는 연습하기, 또는<br />자유롭게 직접 쓰기를 선택하세요
        </p>

        {/* 연습하기 */}
        <button
          className="w-full py-6 bg-[#FFF2C6] rounded-2xl shadow-md text-lg font-bold 
                     flex items-center justify-center gap-3
                     hover:bg-[#FFE8A6] transition-all mb-4"
          onClick={() => navigate("/writing/help")}
        >
          📝 연습하기
          <span className="text-sm font-normal text-gray-600">AI 주제 추천</span>
        </button>

        {/* 직접 쓰기 */}
        <button
          className="w-full py-6 bg-[#C6ECFF] rounded-2xl shadow-md text-lg font-bold 
                     flex items-center justify-center gap-3
                     hover:bg-[#A9E3FF] transition-all"
          onClick={() => navigate("/writing/genre")}
        >
          ✍️ 직접 쓰기
          <span className="text-sm font-normal text-gray-600">장르 선택</span>
        </button>
      </div>
    </div>
  );
}
