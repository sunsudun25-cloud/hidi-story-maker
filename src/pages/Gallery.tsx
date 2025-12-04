import { useNavigate } from "react-router-dom";
import { useStory } from "../context/StoryContext";
import Header from "../components/Header";
import { useState } from "react";

export default function Gallery() {
  const { stories } = useStory();
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
    <div className="pb-28">
      <Header title="내 작품 보기" />

      {/* 작품 없는 경우 */}
      {stories.length === 0 ? (
        <div className="px-5 py-10 text-center">
          <p className="text-xl text-gray-500 mb-6">
            아직 저장된 작품이 없습니다.
          </p>
          <button
            onClick={() => navigate("/writing/genre")}
            className="bg-emerald-500 text-white px-6 py-3 rounded-xl text-lg font-bold hover:bg-emerald-600 transition-colors"
          >
            ✍️ 글쓰기 시작하기
          </button>
        </div>
      ) : (
        <>
          {/* 정렬 옵션 */}
          <div className="px-5 py-3 flex justify-between items-center">
            <span className="text-lg font-semibold">
              📚 총 {stories.length}개 작품
            </span>
            <select
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value)}
              className="p-2 border-2 border-gray-300 rounded-xl text-lg focus:border-emerald-500 focus:outline-none"
            >
              <option value="new">최신 순</option>
              <option value="old">오래된 순</option>
            </select>
          </div>

          {/* 카드형 갤러리 */}
          <div className="px-5 grid grid-cols-1 gap-5">
            {sortedStories.map((story) => (
              <div
                key={story.id}
                onClick={() =>
                  navigate("/writing/detail", { state: { id: story.id } })
                }
                className="bg-white rounded-2xl shadow-md p-5 active:scale-[0.98] transition-transform cursor-pointer hover:shadow-lg"
              >
                {/* 제목 */}
                <h2 className="text-2xl font-bold mb-2">
                  📖 {story.title}
                </h2>

                {/* 날짜 */}
                <p className="text-gray-500 text-sm mb-3">
                  {new Date(story.createdAt).toLocaleDateString('ko-KR', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>

                {/* 내용 미리보기 */}
                <p className="text-gray-700 text-lg line-clamp-3 leading-relaxed">
                  {story.content || story.description}
                </p>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
