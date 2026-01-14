import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";

interface SharedStoryData {
  title: string;
  content: string;
  genre?: string;
  createdAt?: string;
}

export default function SharedStory() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [storyData, setStoryData] = useState<SharedStoryData | null>(null);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    try {
      const encoded = searchParams.get("data");
      if (!encoded) {
        setError("공유 데이터가 없습니다.");
        return;
      }

      // Base64 디코딩
      const decoded = JSON.parse(decodeURIComponent(atob(encoded)));
      setStoryData(decoded);
    } catch (err) {
      console.error("공유 데이터 파싱 오류:", err);
      setError("잘못된 공유 링크입니다.");
    }
  }, [searchParams]);

  if (error) {
    return (
      <div style={{ minHeight: "100vh", backgroundColor: "#FFF9F0", padding: "20px" }}>
        <div className="responsive-container p-6">
          <p className="text-center text-[18px] text-red-600 mb-4">{error}</p>
          <div className="text-center">
            <button
              onClick={() => navigate("/")}
              className="px-6 py-3 bg-green-500 text-white rounded-xl hover:bg-green-600"
            >
              홈으로 돌아가기
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!storyData) {
    return (
      <div style={{ minHeight: "100vh", backgroundColor: "#FFF9F0", padding: "20px" }}>
        <div className="responsive-container">
          <p className="text-center text-[18px] text-gray-600 mt-10">불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#FFF9F0", padding: "20px" }}>
      <div className="responsive-container p-6">
        {/* 헤더 */}
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => navigate("/")}
            className="text-[18px] text-gray-600 hover:text-gray-800"
          >
            ← 홈으로
          </button>
          <h1 className="text-[24px] font-bold text-gray-800">공유된 작품</h1>
        </div>

        {/* 작품 내용 */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          {/* 제목 */}
          <h2 className="text-[28px] font-bold text-gray-800 mb-4 border-b-2 border-green-500 pb-3">
            {storyData.title}
          </h2>

          {/* 메타 정보 */}
          <div className="flex gap-4 text-[14px] text-gray-500 mb-6">
            {storyData.genre && (
              <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full">
                {storyData.genre}
              </span>
            )}
            {storyData.createdAt && (
              <span>
                작성일: {new Date(storyData.createdAt).toLocaleDateString("ko-KR")}
              </span>
            )}
          </div>

          {/* 본문 */}
          <div className="prose max-w-none">
            <p className="text-[18px] leading-relaxed text-gray-700 whitespace-pre-wrap">
              {storyData.content}
            </p>
          </div>
        </div>

        {/* 안내 메시지 */}
        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-lg">
          <p className="text-[14px] text-blue-700">
            💡 이 작품은 QR 코드를 통해 공유되었습니다. 
            직접 글쓰기를 시작하려면 홈 화면에서 "글쓰기"를 선택해주세요!
          </p>
        </div>

        {/* 하단 버튼 */}
        <div className="flex gap-4 mt-6">
          <button
            onClick={() => navigate("/")}
            className="flex-1 px-6 py-3 bg-green-500 text-white text-[18px] font-bold rounded-xl hover:bg-green-600 transition"
          >
            나도 글쓰기 시작하기
          </button>
        </div>
      </div>
    </div>
  );
}
