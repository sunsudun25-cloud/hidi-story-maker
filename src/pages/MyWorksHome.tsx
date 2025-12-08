import { useNavigate } from "react-router-dom";

export default function MyWorksHome() {
  const navigate = useNavigate();

  return (
    <div className="screen">
      <div className="screen-body p-6">
        {/* 상단 헤더 */}
        <div className="flex items-center gap-4 mb-6">
          <button
            className="text-[24px] font-bold text-gray-700 hover:text-gray-900"
            onClick={() => navigate("/")}
          >
            ← 돌아가기
          </button>
        </div>

        <h1 className="text-center text-[26px] font-bold mb-8">📁 내 작품 관리</h1>

        <div className="grid grid-cols-1 gap-6 max-w-md mx-auto">
          {/* 이미지 */}
          <button
            className="flex items-center gap-4 p-6 bg-gradient-to-br from-pink-50 to-pink-100 border-2 border-pink-400 rounded-2xl text-left hover:shadow-lg hover:scale-[1.02] transition-all"
            onClick={() => navigate("/my-works/images")}
          >
            <div className="text-[48px]">🎨</div>
            <div>
              <div className="text-[22px] font-bold text-pink-800">이미지 모아보기</div>
              <div className="text-[14px] text-pink-600">내가 만든 AI 이미지들</div>
            </div>
          </button>

          {/* 글쓰기 */}
          <button
            className="flex items-center gap-4 p-6 bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-400 rounded-2xl text-left hover:shadow-lg hover:scale-[1.02] transition-all"
            onClick={() => navigate("/my-works/stories")}
          >
            <div className="text-[48px]">📝</div>
            <div>
              <div className="text-[22px] font-bold text-blue-800">글 모아보기</div>
              <div className="text-[14px] text-blue-600">내가 쓴 글들</div>
            </div>
          </button>

          {/* 동화책 */}
          <button
            className="flex items-center gap-4 p-6 bg-gradient-to-br from-red-50 to-red-100 border-2 border-red-400 rounded-2xl text-left hover:shadow-lg hover:scale-[1.02] transition-all"
            onClick={() => navigate("/my-works/storybooks")}
          >
            <div className="text-[48px]">📕</div>
            <div>
              <div className="text-[22px] font-bold text-red-800">동화책 모아보기</div>
              <div className="text-[14px] text-red-600">내가 만든 동화책들</div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
