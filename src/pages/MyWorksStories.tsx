import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAllStories, deleteStory, type Story } from "../services/dbService";

export default function MyWorksStories() {
  const [stories, setStories] = useState<Story[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadStories();
  }, []);

  const loadStories = async () => {
    setIsLoading(true);
    try {
      const data = await getAllStories();
      setStories(data.reverse());
    } catch (error) {
      console.error("글 불러오기 오류:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("이 글을 삭제하시겠습니까?")) return;

    try {
      await deleteStory(id);
      setStories((prev) => prev.filter((s) => s.id !== id));
      alert("✅ 글이 삭제되었습니다.");
    } catch (error) {
      console.error("삭제 오류:", error);
      alert("삭제 중 오류가 발생했습니다.");
    }
  };

  if (isLoading) {
    return (
      <div className="screen">
        <div className="screen-body">
          <p className="text-center text-[18px] text-gray-600 mt-10">불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="screen">
      <div className="screen-body p-4">
        {/* 헤더 */}
        <div className="flex justify-between items-center mb-4">
          <button
            onClick={() => navigate("/my-works")}
            className="text-[24px] w-10 h-10 flex items-center justify-center"
          >
            ←
          </button>
          <h2 className="text-[22px] font-bold">📝 내 글</h2>
          <div className="w-10"></div>
        </div>

        {/* 글 없음 */}
        {stories.length === 0 ? (
          <div className="text-center mt-10">
            <p className="text-[20px] text-gray-600 mb-6">저장된 글이 없습니다.</p>
            <button
              className="px-6 py-3 bg-green-500 text-white rounded-xl text-[18px] font-semibold"
              onClick={() => navigate("/write")}
            >
              글쓰기 시작하기
            </button>
          </div>
        ) : (
          /* 글 목록 */
          <div className="grid grid-cols-1 gap-4">
            {stories.map((story) => (
              <div
                key={story.id}
                className="relative bg-white border-2 border-gray-200 rounded-2xl shadow-sm hover:shadow-lg transition-all cursor-pointer overflow-hidden"
                onClick={() => navigate(`/my-works/stories/${story.id}`)}
              >
                <div className="p-4">
                  {/* 제목 */}
                  <h3 className="text-[18px] font-bold text-gray-800 mb-2">
                    {story.title}
                  </h3>

                  {/* 내용 미리보기 */}
                  <p
                    className="text-[14px] text-gray-600 leading-relaxed"
                    style={{
                      display: '-webkit-box',
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                    }}
                  >
                    {story.content}
                  </p>

                  {/* 메타 정보 */}
                  <div className="flex items-center gap-2 mt-3 text-[12px] text-gray-500">
                    <span>{story.content.length}자</span>
                    {story.images && story.images.length > 0 && (
                      <>
                        <span>·</span>
                        <span>📸 {story.images.length}개</span>
                      </>
                    )}
                  </div>
                </div>

                {/* 삭제 버튼 */}
                <button
                  className="absolute top-2 right-2 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full shadow-lg flex items-center justify-center hover:bg-red-500 hover:text-white transition-all"
                  onClick={(e) => handleDelete(story.id!, e)}
                  title="삭제"
                >
                  <span className="text-[16px]">🗑️</span>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
