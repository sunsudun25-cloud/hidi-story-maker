// src/pages/MyWorksHome.tsx
import { useNavigate } from "react-router-dom";

export default function MyWorksHome() {
  const navigate = useNavigate();

  console.log("🔥🔥🔥 MyWorksHome NEW VERSION LOADED 🔥🔥🔥");
  
  return (
    <div className="screen" style={{ backgroundColor: '#FFF9F0' }}>
      <div className="screen-body p-5">

        {/* 제목 */}
        <h1 className="text-2xl font-bold mb-6 text-center" style={{ color: '#333' }}>
          📂 내 작품 관리 (NEW)
        </h1>

        {/* 메뉴 3개 */}
        <div className="grid grid-cols-1 gap-4">

          {/* 🎨 이미지 */}
          <button
            onClick={() => navigate("/my-works/images")}
            className="flex items-center gap-4 p-5 bg-white border-2 border-gray-200 
            rounded-2xl shadow hover:shadow-md transition-all"
          >
            <span className="text-4xl">🎨</span>
            <div className="text-left">
              <p className="text-xl font-bold">이미지</p>
              <p className="text-gray-500 text-sm">AI로 만든 그림 보기</p>
            </div>
          </button>

          {/* 📝 글쓰기 */}
          <button
            onClick={() => navigate("/my-works/stories")}
            className="flex items-center gap-4 p-5 bg-white border-2 border-gray-200 
            rounded-2xl shadow hover:shadow-md transition-all"
          >
            <span className="text-4xl">📝</span>
            <div className="text-left">
              <p className="text-xl font-bold">글쓰기</p>
              <p className="text-gray-500 text-sm">작성한 글 보기</p>
            </div>
          </button>

          {/* 📕 동화책 */}
          <button
            onClick={() => navigate("/my-works/storybooks")}
            className="flex items-center gap-4 p-5 bg-white border-2 border-gray-200 
            rounded-2xl shadow hover:shadow-md transition-all"
          >
            <span className="text-4xl">📕</span>
            <div className="text-left">
              <p className="text-xl font-bold">동화책</p>
              <p className="text-gray-500 text-sm">만든 동화책 보기</p>
            </div>
          </button>

        </div>
      </div>
    </div>
  );
}
