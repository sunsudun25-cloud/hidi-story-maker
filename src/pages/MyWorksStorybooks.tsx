import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAllStorybooks, deleteStorybook, type Storybook } from "../services/dbService";

export default function MyWorksStorybooks() {
  const [books, setBooks] = useState<Storybook[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    try {
      const data = await getAllStorybooks();
      setBooks(data.reverse()); // 최신순 정렬
    } catch (error) {
      console.error("동화책 불러오기 오류:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: number, e: React.MouseEvent) {
    e.stopPropagation();
    if (!confirm("이 동화책을 삭제하시겠습니까?")) return;

    try {
      await deleteStorybook(id);
      setBooks((prev) => prev.filter((b) => b.id !== id));
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
        <h2 style={{ fontSize: "22px", fontWeight: "bold" }}>📕 내 동화책</h2>
        <div style={{ width: "40px" }}></div>
      </div>

      {/* 로딩 중 */}
      {loading && (
        <p style={{ textAlign: "center", fontSize: "18px", color: "#666", marginTop: "40px" }}>
          불러오는 중...
        </p>
      )}

      {/* 저장된 동화책 없음 */}
      {!loading && books.length === 0 && (
        <div style={{ textAlign: "center", marginTop: "40px" }}>
          <p style={{ fontSize: "18px", color: "#666", marginBottom: "20px" }}>
            저장된 동화책이 없습니다.
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
            onClick={() => navigate("/storybook")}
          >
            동화책 만들러 가기
          </button>
        </div>
      )}

      {/* 동화책 갤러리 */}
      {!loading && books.length > 0 && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, 1fr)",
            gap: "12px"
          }}
        >
          {books.map((book) => (
            <div
              key={book.id}
              onClick={() => navigate(`/my-works/storybooks/${book.id}`)}
              style={{
                border: "2px solid #E5E7EB",
                borderRadius: "12px",
                overflow: "hidden",
                cursor: "pointer",
                position: "relative",
                background: "white",
                transition: "transform 0.2s, box-shadow 0.2s"
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
              {/* 표지 이미지 */}
              <div
                style={{
                  position: "relative",
                  aspectRatio: "3/4",
                  background: "linear-gradient(135deg, #A78BFA 0%, #C084FC 100%)"
                }}
              >
                {book.coverImageUrl ? (
                  <img
                    src={book.coverImageUrl}
                    alt={book.title}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover"
                    }}
                  />
                ) : (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      height: "100%"
                    }}
                  >
                    <span style={{ fontSize: "48px" }}>📕</span>
                  </div>
                )}

                {/* 삭제 버튼 */}
                <button
                  onClick={(e) => handleDelete(book.id!, e)}
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

              {/* 정보 */}
              <div style={{ padding: "12px" }}>
                <h3
                  style={{
                    fontSize: "16px",
                    fontWeight: "bold",
                    marginBottom: "4px",
                    color: "#1F2937",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap"
                  }}
                >
                  {book.title || "제목 없음"}
                </h3>
                <p style={{ fontSize: "12px", color: "#9CA3AF" }}>
                  {book.pages.length}페이지
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
