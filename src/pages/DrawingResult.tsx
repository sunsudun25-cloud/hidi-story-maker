// src/pages/Result.tsx
import { useLocation, useNavigate } from "react-router-dom";

export default function Result() {
  const { state } = useLocation();
  const navigate = useNavigate();

  if (!state?.imageUrl) {
    return (
      <div className="p-10 text-center">
        <p className="text-xl">표시할 이미지가 없습니다.</p>
        <button
          onClick={() => navigate("/home")}
          className="mt-5 bg-emerald-500 text-white px-6 py-3 rounded-xl"
        >
          홈으로 돌아가기
        </button>
      </div>
    );
  }

  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = state.imageUrl;
    link.download = "generated-image.png";
    link.click();
  };

  return (
    <div className="p-5 pb-20">
      <h1 className="text-2xl font-bold mb-4">생성된 그림</h1>

      <img
        src={state.imageUrl}
        alt="AI 생성 이미지"
        className="w-full rounded-xl shadow-lg"
      />

      <button
        className="w-full bg-emerald-500 text-white text-xl py-4 rounded-xl mt-6"
        onClick={handleDownload}
      >
        📥 이미지 다운로드
      </button>

      <button
        className="w-full bg-gray-300 text-black text-xl py-4 rounded-xl mt-4"
        onClick={() => navigate(-1)}
      >
        ← 다시 만들기
      </button>
    </div>
  );
}
