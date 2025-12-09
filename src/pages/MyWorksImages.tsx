import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAllImages, deleteImage, type SavedImage } from "../services/dbService";

export default function MyWorksImages() {
  const [images, setImages] = useState<SavedImage[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    try {
      const data = await getAllImages();
      setImages(data.reverse()); // 최신순 정렬
    } catch (error) {
      console.error("이미지 불러오기 오류:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: number, e: React.MouseEvent) {
    e.stopPropagation();
    if (!confirm("이 이미지를 삭제하시겠습니까?")) return;

    try {
      await deleteImage(id);
      setImages((prev) => prev.filter((img) => img.id !== id));
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
        <h2 style={{ fontSize: "22px", fontWeight: "bold" }}>🎨 내 이미지</h2>
        <div style={{ width: "40px" }}></div>
      </div>

      {/* 로딩 중 */}
      {loading && (
        <p style={{ textAlign: "center", fontSize: "18px", color: "#666", marginTop: "40px" }}>
          불러오는 중...
        </p>
      )}

      {/* 저장된 이미지 없음 */}
      {!loading && images.length === 0 && (
        <div style={{ textAlign: "center", marginTop: "40px" }}>
          <p style={{ fontSize: "18px", color: "#666", marginBottom: "20px" }}>
            저장된 이미지가 없습니다.
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
            onClick={() => navigate("/drawing/start")}
          >
            이미지 만들러 가기
          </button>
        </div>
      )}

      {/* 이미지 갤러리 */}
      {!loading && images.length > 0 && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, 1fr)",
            gap: "12px"
          }}
        >
          {images.map((item) => (
            <div
              key={item.id}
              onClick={() => navigate(`/my-works/images/${item.id}`)}
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
              {/* 이미지 */}
              <div style={{ position: "relative", aspectRatio: "1/1", background: "#F3F4F6" }}>
                <img
                  src={item.image}
                  alt="저장된 이미지"
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover"
                  }}
                />

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
