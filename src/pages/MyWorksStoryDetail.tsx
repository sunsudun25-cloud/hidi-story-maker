import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { getAllStories, deleteStory, type Story } from "../services/dbService";

export default function MyWorksStoryDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [story, setStory] = useState<Story | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadStory();
  }, [id]);

  const loadStory = async () => {
    setIsLoading(true);
    try {
      const list = await getAllStories();
      const found = list.find((s) => String(s.id) === id);
      setStory(found || null);
    } catch (error) {
      console.error("글 불러오기 오류:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = () => {
    if (!story) return;
    navigate("/write/editor", {
      state: {
        title: story.title,
        initialContent: story.content,
      },
    });
  };

  const handleDelete = async () => {
    if (!story || !confirm("이 글을 삭제하시겠습니까?")) return;

    try {
      await deleteStory(story.id!);
      alert("✅ 글이 삭제되었습니다.");
      navigate("/my-works/stories");
    } catch (error) {
      console.error("삭제 오류:", error);
      alert("삭제 중 오류가 발생했습니다.");
    }
  };

  if (isLoading) {
    return (
      <div style={{ minHeight: "100vh", backgroundColor: "#FFF9F0", padding: "20px" }}>
        <div className="max-w-mobile md:max-w-desktop mx-auto">
          <p className="text-center text-[18px] text-gray-600 mt-10">불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (!story) {
    return (
      <div style={{ minHeight: "100vh", backgroundColor: "#FFF9F0", padding: "20px" }}>
        <div className="max-w-mobile md:max-w-desktop mx-auto p-6">
          <p className="text-center text-[18px] text-gray-600">글을 찾을 수 없습니다.</p>
          <div className="text-center mt-4">
            <button
              onClick={() => navigate("/my-works/stories")}
              className="px-6 py-3 bg-green-500 text-white rounded-xl"
            >
              목록으로 돌아가기
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#FFF9F0", padding: "20px" }}>
      <div className="max-w-mobile md:max-w-desktop mx-auto p-4">
        {/* 헤더 */}
        <div className="flex justify-between items-center mb-4">
          <button
            onClick={() => navigate("/my-works/stories")}
            className="text-[24px] w-10 h-10 flex items-center justify-center"
          >
            ←
          </button>
          <h2 className="text-[22px] font-bold">글 상세</h2>
          <div className="w-10"></div>
        </div>

        {/* 제목 */}
        <h3 className="text-[24px] font-bold text-gray-800 mb-4">{story.title}</h3>

        {/* 메타 정보 */}
        <div className="flex items-center gap-2 mb-6 text-[14px] text-gray-500">
          <span>{story.content.length}자</span>
          {story.images && story.images.length > 0 && (
            <>
              <span>·</span>
              <span>📸 {story.images.length}개</span>
            </>
          )}
          <span>·</span>
          <span>{new Date(story.createdAt).toLocaleDateString("ko-KR")}</span>
        </div>

        {/* 내용 */}
        <div className="bg-gray-50 rounded-2xl p-4 mb-6">
          <p className="text-[16px] text-gray-700 whitespace-pre-line leading-relaxed">
            {story.content}
          </p>
        </div>

        {/* 첨부 이미지들 */}
        {story.images && story.images.length > 0 && (
          <div className="mb-6">
            <h4 className="text-[18px] font-bold mb-3">📸 첨부 이미지</h4>
            <div className="grid grid-cols-2 gap-3">
              {story.images.map((img) => (
                <img
                  key={img.id}
                  src={img.url}
                  alt="첨부 이미지"
                  className="w-full rounded-xl border-2 border-gray-200 cursor-pointer"
                  onClick={() => window.open(img.url, "_blank")}
                />
              ))}
            </div>
          </div>
        )}

        {/* 액션 버튼들 */}
        <div className="flex flex-col gap-3">
          {/* 수정하기 */}
          <button
            onClick={handleEdit}
            className="p-4 bg-blue-500 text-white rounded-xl text-[16px] font-semibold hover:bg-blue-600 transition"
          >
            ✏️ 수정하기
          </button>

          {/* 삭제 */}
          <button
            onClick={handleDelete}
            className="p-4 bg-red-500 text-white rounded-xl text-[16px] font-semibold hover:bg-red-600 transition"
          >
            🗑️ 삭제하기
          </button>
        </div>
      </div>
    </div>
  );
}
