import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAllPostcards, deletePostcard, type Postcard } from "../services/dbService";

export default function MyWorksPostcards() {
  const [postcards, setPostcards] = useState<Postcard[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    try {
      const data = await getAllPostcards();
      setPostcards(data.reverse()); // 최신순 정렬
    } catch (error) {
      console.error("엽서 불러오기 오류:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string, e: React.MouseEvent) {
    e.stopPropagation();
    if (!confirm("이 엽서를 삭제하시겠습니까?")) return;

    try {
      await deletePostcard(id);
      setPostcards((prev) => prev.filter((item) => item.id !== id));
    } catch (error) {
      console.error("삭제 오류:", error);
      alert("삭제 중 오류가 발생했습니다.");
    }
  }

  return (
    <div style={{ padding: "20px", minHeight: "100vh", backgroundColor: "#FFF9F0" }}>
      <div className="responsive-container">
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
        <h2 style={{ fontSize: "22px", fontWeight: "bold" }}>📮 내 엽서</h2>
        <div style={{ width: "40px" }}></div>
      </div>

      {/* 로딩 중 */}
      {loading && (
        <p style={{ textAlign: "center", fontSize: "18px", color: "#666", marginTop: "40px" }}>
          불러오는 중...
        </p>
      )}

      {/* 저장된 엽서 없음 */}
      {!loading && postcards.length === 0 && (
        <div style={{ textAlign: "center", marginTop: "40px" }}>
          <p style={{ fontSize: "18px", color: "#666", marginBottom: "20px" }}>
            저장된 엽서가 없습니다.
          </p>
          <button
            style={{
              padding: "12px 24px",
              background: "#EC407A",
              color: "white",
              borderRadius: "12px",
              border: "none",
              fontSize: "16px",
              fontWeight: "600",
              cursor: "pointer"
            }}
            onClick={() => navigate("/goods")}
          >
            엽서 만들러 가기
          </button>
        </div>
      )}

      {/* 엽서 갤러리 */}
      {!loading && postcards.length > 0 && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, 1fr)",
            gap: "12px"
          }}
        >
          {postcards.map((item) => (
            <div
              key={item.id}
              onClick={() => navigate(`/my-works/postcards/${item.id}`)}
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
              {/* 엽서 미리보기 (3:2 비율) */}
              <div style={{ position: "relative", aspectRatio: "3/2", background: "#F3F4F6" }}>
                <img
                  src={item.imageUrl}
                  alt="엽서 이미지"
                  style={{
                    width: "100%",
                    height: "65%",
                    objectFit: "cover"
                  }}
                />
                <div style={{
                  width: "100%",
                  height: "35%",
                  background: "#ffffff",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  alignItems: "center",
                  padding: "4px",
                  fontSize: "10px",
                  textAlign: "center",
                  color: "#333"
                }}>
                  <p style={{ margin: 0, fontWeight: "600" }}>{item.line1}</p>
                  <p style={{ margin: 0, color: "#666" }}>{item.line2}</p>
                </div>

                {/* 삭제 버튼 */}
                <button
                  onClick={(e) => handleDelete(item.id!, e)}
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

              {/* 날짜 정보 */}
              <div style={{ padding: "8px" }}>
                <p style={{ fontSize: "11px", color: "#9CA3AF" }}>
                  {new Date(item.createdAt).toLocaleDateString("ko-KR")}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
      </div>
    </div>
  );
}
