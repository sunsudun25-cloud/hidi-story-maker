import { useLocation, useNavigate } from "react-router-dom";
import { useStory } from "../context/StoryContext";

export default function WritingDetail() {
  const location = useLocation();
  const navigate = useNavigate();
  const { stories, deleteStory } = useStory();

  const storyId = location.state?.id;
  const story = stories.find((s) => s.id === storyId);

  if (!story) {
    return (
      <div className="pb-24">
        <div className="p-5">
          <div className="bg-red-50 border border-red-300 rounded-xl p-6 text-center">
            <p className="text-xl text-red-600 font-semibold mb-4">
              글을 찾을 수 없습니다.
            </p>
            <button
              onClick={() => navigate("/gallery")}
              className="bg-emerald-500 text-white px-6 py-3 rounded-xl text-lg font-bold hover:bg-emerald-600 transition-colors"
            >
              갤러리로 돌아가기
            </button>
          </div>
        </div>
      </div>
    );
  }

  const handleDelete = () => {
    if (confirm("정말 삭제하시겠습니까?")) {
      deleteStory(story.id);
      alert("✅ 삭제되었습니다.");
      navigate("/gallery");
    }
  };

  const handleEdit = () => {
    navigate("/writing/editor", {
      state: {
        genre: "custom", // 기존 글은 장르 정보가 없을 수 있음
        label: story.title,
        content: story.content,
        id: story.id,
      },
    });
  };

  return (
    <div className="pb-28" style={{ minHeight: "100vh", backgroundColor: "#FFF9F0" }}>
      <div className="max-w-4xl mx-auto p-5">
        {/* 제목 */}
        <h2 className="text-3xl font-bold mb-3">
          📖 {story.title}
        </h2>

        {/* 작성일 */}
        <p className="text-gray-500 mb-6 text-sm">
          작성일: {new Date(story.createdAt).toLocaleDateString('ko-KR')}
        </p>

        {/* 이미지 (있는 경우) */}
        {story.image && (
          <div className="flex justify-center mb-6">
            <img
              src={story.image}
              alt={story.title}
              className="rounded-2xl shadow-lg cursor-pointer"
              style={{ maxWidth: "380px", width: "100%", height: "auto" }}
              onClick={() => window.open(story.image, "_blank")}
            />
          </div>
        )}

        {/* 본문 */}
        <div className="p-5 border-2 rounded-xl bg-white leading-relaxed text-lg whitespace-pre-line min-h-[300px]">
          {story.content || story.description}
        </div>

        {/* 버튼 그룹 */}
        <div style={{ marginTop: "24px" }}>
          {/* 수정하기, 삭제하기 (2열) */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <button
              onClick={handleEdit}
              style={{
                backgroundColor: "#2563eb",
                color: "white",
                fontWeight: "600",
                padding: "12px 16px",
                borderRadius: "8px",
                border: "none",
                cursor: "pointer",
                boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                fontSize: "16px"
              }}
            >
              ✏️ 수정하기
            </button>

            <button
              onClick={handleDelete}
              style={{
                backgroundColor: "#dc2626",
                color: "white",
                fontWeight: "600",
                padding: "12px 16px",
                borderRadius: "8px",
                border: "none",
                cursor: "pointer",
                boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                fontSize: "16px"
              }}
            >
              🗑️ 삭제하기
            </button>
          </div>

          {/* 목록으로 돌아가기 */}
          <button
            onClick={() => navigate("/gallery")}
            style={{
              width: "100%",
              backgroundColor: "#9ca3af",
              color: "white",
              fontWeight: "600",
              padding: "12px 16px",
              borderRadius: "8px",
              border: "none",
              cursor: "pointer",
              boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
              marginTop: "12px",
              fontSize: "16px"
            }}
          >
            ← 목록으로 돌아가기
          </button>
        </div>
      </div>
    </div>
  );
}
