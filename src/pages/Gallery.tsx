import { useNavigate } from "react-router-dom";
import { useStory } from "../context/StoryContext";
import CanvaHeader from "../components/CanvaHeader";
import StoryCard from "../components/StoryCard";
import { useState } from "react";

export default function Gallery() {
  const { stories, deleteStory } = useStory();
  const navigate = useNavigate();

  const [sortOption, setSortOption] = useState("new");

  // 날짜 기준 정렬
  const sortedStories = [...stories].sort((a, b) => {
    if (sortOption === "new") {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
    return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
  });

  return (
    <div className="min-h-screen bg-[#FFF9E9] pb-28">
      <CanvaHeader title="내 작품 보기" color="var(--canva-pink)" />

      {/* 작품 없는 경우 */}
      {stories.length === 0 ? (
        <div className="px-5 py-10 text-center">
          <p className="text-2xl text-gray-600 mb-6">
            📭 아직 저장된 작품이 없어요
          </p>
          <button
            onClick={() => navigate("/writing/genre")}
            className="bg-emerald-500 text-white px-6 py-3 rounded-xl text-lg font-bold hover:bg-emerald-600 transition-colors shadow-lg active:scale-95"
          >
            ✍️ 글쓰기 시작하기
          </button>
        </div>
      ) : (
        <>
          {/* 정렬 옵션 */}
          <div className="px-5 py-4 flex justify-between items-center">
            <span className="text-xl font-bold text-gray-800">
              📚 총 {stories.length}개 작품
            </span>
            <select
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value)}
              className="p-2 border-2 border-gray-300 rounded-xl text-base font-semibold bg-white focus:border-emerald-500 focus:outline-none shadow-sm"
            >
              <option value="new">최신 순</option>
              <option value="old">오래된 순</option>
            </select>
          </div>

          {/* 반응형 그리드: 모바일 2열, 태블릿 3열, 데스크톱 4열 */}
          <div className="px-5 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {sortedStories.map((story) => (
              <StoryCard key={story.id} story={story} onDelete={deleteStory} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
