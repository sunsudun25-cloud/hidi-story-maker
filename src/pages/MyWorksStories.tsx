import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAllStories, deleteStory, type Story } from "../services/dbService";

export default function MyWorksStories() {
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    try {
      const data = await getAllStories();
      setStories(data.reverse()); // 최신순 정렬
    } catch (error) {
      console.error("글 불러오기 오류:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: number, e: React.MouseEvent) {
    e.stopPropagation();
    if (!confirm("이 글을 삭제하시겠습니까?")) return;

    try {
      await deleteStory(id);
      setStories((prev) => prev.filter((s) => s.id !== id));
    } catch (error) {
      console.error("삭제 오류:", error);
      alert("삭제 중 오류가 발생했습니다.");
    }
  }

  return (
    <div style={{ padding: "20px", minHeight: "100vh", backgroundColor: "#FFF9F0" }}>
      {/* 헤더 */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <button
          onClick={() => navigate("/my-works")}
          style={{
            fontSize: "24px",
            width: "40px",
            height: "40px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "white",
            border: "1px solid #E5E7EB",
            borderRadius: "8px",
            cursor: "pointer"
          }}
        >
          ←
        </button>
        <h2 style={{ fontSize: "22px", fontWeight: "bold" }}>📝 내 글</h2>
        <div style={{ width: "40px" }}></div>
      </div>

      {/* 로딩 중 */}
      {loading && (
        <p style={{ textAlign: "center", fontSize: "18px", color: "#666", marginTop: "40px" }}>
          불러오는 중...
        </p>
      )}

      {/* 저장된 글 없음 */}
      {!loading && stories.length === 0 && (
        <div style={{ textAlign: "center", marginTop: "40px" }}>
          <p style={{ fontSize: "18px", color: "#666", marginBottom: "20px" }}>
            저장된 글이 없습니다.
          </p>
          <button
            style={{
              padding: "12px 24px",
              background: "#4AA8FF",
              color: "white",
              borderRadius: "12px",
              border: "none",
              fontSize: "16px",
              fontWeight: "600",
              cursor: "pointer"
            }}
            onClick={() => navigate("/write")}
          >
            글쓰기 시작하기
          </button>
        </div>
      )}

      {/* 글 목록 */}
      {!loading && stories.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {stories.map((story) => (
            <div
              key={story.id}
              onClick={() => navigate(`/my-works/stories/${story.id}`)}
              style={{
                position: "relative",
                background: "white",
                border: "2px solid #E5E7EB",
                borderRadius: "12px",
                padding: "16px",
                cursor: "pointer",
                transition: "all 0.2s"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.1)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              {/* 제목 */}
              <h3 style={{ fontSize: "18px", fontWeight: "bold", marginBottom: "8px", color: "#1F2937" }}>
                {story.title}
              </h3>

              {/* 내용 미리보기 */}
              <p
                style={{
                  fontSize: "14px",
                  color: "#6B7280",
                  lineHeight: "1.5",
                  overflow: "hidden",
                  display: "-webkit-box",
                  WebkitLineClamp: 3,
                  WebkitBoxOrient: "vertical"
                }}
              >
                {story.content}
              </p>

              {/* 메타 정보 */}
              <div style={{ marginTop: "12px", fontSize: "12px", color: "#9CA3AF" }}>
                <span>{story.content.length}자</span>
                {story.images && story.images.length > 0 && (
                  <>
                    <span style={{ margin: "0 4px" }}>·</span>
                    <span>📸 {story.images.length}개</span>
                  </>
                )}
              </div>

              {/* 삭제 버튼 */}
              <button
                onClick={(e) => handleDelete(story.id!, e)}
                style={{
                  position: "absolute",
                  top: "8px",
                  right: "8px",
                  width: "32px",
                  height: "32px",
                  background: "rgba(255,255,255,0.9)",
                  backdropFilter: "blur(4px)",
                  borderRadius: "50%",
                  border: "1px solid #E5E7EB",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "16px",
                  transition: "all 0.2s"
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "#EF4444";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "rgba(255,255,255,0.9)";
                }}
                title="삭제"
              >
                🗑️
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
