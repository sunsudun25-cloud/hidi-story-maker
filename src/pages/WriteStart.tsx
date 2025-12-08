import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import { getHeaderColor } from "../styles/colors";

export default function WriteStart() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#FFF9E9] flex flex-col items-center">
      
      <Header title="글쓰기" color={getHeaderColor("글쓰기")} />

      <div className="w-full max-w-[480px] mt-8 px-6 text-center">

        <div className="text-4xl mb-4">✨</div>

        <h2 className="text-xl font-bold text-gray-800 mb-2">
          어떻게 글을 쓸까요?
        </h2>

        <p className="text-gray-600 mb-8 text-[17px] leading-relaxed">
          시니어를 위한 세 가지 글쓰기 방법
        </p>

        {/* 사진으로 올리기 */}
        <button
          className="w-full py-6 bg-[#E3F2FF] rounded-2xl shadow-md text-lg font-bold 
                     flex flex-col items-center justify-center
                     hover:bg-[#C6E5FF] transition-all mb-4"
          onClick={() => navigate("/writing/photo")}
        >
          <div className="text-4xl mb-2">📷</div>
          <div>사진으로 올리기</div>
          <span className="text-sm font-normal text-gray-600 mt-1">
            사진을 보고 AI가 글감 제안
          </span>
        </button>

        {/* 직접 입력하기 */}
        <button
          className="w-full py-6 bg-[#FFF2C6] rounded-2xl shadow-md text-lg font-bold 
                     flex flex-col items-center justify-center
                     hover:bg-[#FFE8A6] transition-all mb-4"
          onClick={() => navigate("/writing/genre")}
        >
          <div className="text-4xl mb-2">✍️</div>
          <div>직접 입력하기</div>
          <span className="text-sm font-normal text-gray-600 mt-1">
            장르 선택 후 AI 질문에 답하기
          </span>
        </button>

        {/* 말로 입력하기 */}
        <button
          className="w-full py-6 bg-[#F0E6FF] rounded-2xl shadow-md text-lg font-bold 
                     flex flex-col items-center justify-center
                     hover:bg-[#E0D4FF] transition-all mb-4"
          onClick={() => navigate("/writing/voice")}
        >
          <div className="text-4xl mb-2">🎤</div>
          <div>말로 입력하기</div>
          <span className="text-sm font-normal text-gray-600 mt-1">
            음성을 글로 자동 변환
          </span>
        </button>

        {/* 도움말 */}
        <div className="mt-6 p-4 bg-white rounded-xl border border-gray-200">
          <p className="text-sm text-gray-700 text-center">
            💡 <strong>처음이신가요?</strong> '직접 입력하기'를 추천합니다!
          </p>
        </div>
      </div>
    </div>
  );
}
