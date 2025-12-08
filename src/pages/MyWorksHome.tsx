import { useNavigate } from "react-router-dom";

export default function MyWorksHome() {
  const navigate = useNavigate();

  return (
    <div className="screen">
      <div className="screen-body p-6">
        <h1 className="text-center text-[26px] font-bold mb-8">📁 내 작품 관리</h1>

        <div className="grid grid-cols-1 gap-4 max-w-md mx-auto">
          {/* 이미지 */}
          <button
            className="flex items-center gap-4 p-6 bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-400 rounded-2xl text-left hover:shadow-lg transition-all"
            onClick={() => navigate("/my-works/images")}
          >
            <div className="text-[48px]">🎨</div>
            <div>
              <div className="text-[22px] font-bold text-blue-800">이미지 모아보기</div>
              <div className="text-[14px] text-blue-600">내가 만든 AI 이미지들</div>
            </div>
          </button>

          {/* 글쓰기 */}
          <button
            className="flex items-center gap-4 p-6 bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-400 rounded-2xl text-left hover:shadow-lg transition-all"
            onClick={() => navigate("/my-works/stories")}
          >
            <div className="text-[48px]">📝</div>
            <div>
              <div className="text-[22px] font-bold text-green-800">글 모아보기</div>
              <div className="text-[14px] text-green-600">내가 쓴 글들</div>
            </div>
          </button>

          {/* 동화책 */}
          <button
            className="flex items-center gap-4 p-6 bg-gradient-to-br from-purple-50 to-purple-100 border-2 border-purple-400 rounded-2xl text-left hover:shadow-lg transition-all"
            onClick={() => navigate("/my-works/storybooks")}
          >
            <div className="text-[48px]">📕</div>
            <div>
              <div className="text-[22px] font-bold text-purple-800">동화책 모아보기</div>
              <div className="text-[14px] text-purple-600">내가 만든 동화책들</div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
