import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

interface Artifact {
  artifactId: string;
  type: "story" | "image" | "storybook";
  title: string;
  createdAt: string;
  thumbnail?: string;
  learnerName?: string;
}

export default function Gallery() {
  const { classCode } = useParams();
  const navigate = useNavigate();
  const [artifacts, setArtifacts] = useState<Artifact[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "image" | "story" | "storybook">("all");
  const [error, setError] = useState("");

  useEffect(() => {
    if (classCode) {
      loadArtifacts();
    }
  }, [classCode]);

  const loadArtifacts = async () => {
    if (!classCode) return;

    setLoading(true);
    setError("");

    try {
      // Firebase Functions에서 수업별 작품 목록 가져오기
      const response = await fetch(
        `https://asia-northeast1-story-make-fbbd7.cloudfunctions.net/artifactListByClass?classCode=${encodeURIComponent(classCode)}`
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "작품을 불러올 수 없습니다.");
      }

      setArtifacts(data.artifacts || []);
    } catch (err: any) {
      console.error("작품 목록 로드 오류:", err);
      setError(err.message || "작품을 불러오는 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const filteredArtifacts = filter === "all" 
    ? artifacts 
    : artifacts.filter(item => item.type === filter);

  const getTypeIcon = (type: string) => {
    switch(type) {
      case "image": return "🎨";
      case "story": return "📝";
      case "storybook": return "📕";
      default: return "📄";
    }
  };

  const getTypeLabel = (type: string) => {
    switch(type) {
      case "image": return "이미지";
      case "story": return "글쓰기";
      case "storybook": return "동화책";
      default: return "작품";
    }
  };

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#FFF9F0", padding: "20px" }}>
      <div className="responsive-container" style={{ maxWidth: "800px", margin: "0 auto" }}>
        {/* 헤더 */}
        <div style={{
          textAlign: "center",
          marginBottom: "32px"
        }}>
          <h1 style={{
            fontSize: "28px",
            fontWeight: "bold",
            color: "#333",
            marginBottom: "8px"
          }}>
            🎨 수업 작품 갤러리
          </h1>
          <p style={{
            fontSize: "16px",
            color: "#666"
          }}>
            수업 코드: <strong>{classCode}</strong>
          </p>
        </div>

        {/* 필터 버튼 */}
        <div style={{
          display: "flex",
          gap: "8px",
          marginBottom: "24px",
          overflowX: "auto",
          padding: "4px"
        }}>
          {[
            { value: "all", label: "전체" },
            { value: "image", label: "🎨 이미지" },
            { value: "story", label: "📝 글쓰기" },
            { value: "storybook", label: "📕 동화책" }
          ].map((option) => (
            <button
              key={option.value}
              onClick={() => setFilter(option.value as any)}
              style={{
                padding: "10px 20px",
                fontSize: "15px",
                fontWeight: "600",
                background: filter === option.value 
                  ? "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                  : "#ffffff",
                color: filter === option.value ? "#ffffff" : "#333",
                border: filter === option.value ? "none" : "2px solid #E5E7EB",
                borderRadius: "12px",
                cursor: "pointer",
                whiteSpace: "nowrap",
                transition: "all 0.2s",
                boxShadow: filter === option.value 
                  ? "0 4px 12px rgba(102, 126, 234, 0.3)"
                  : "none"
              }}
            >
              {option.label}
            </button>
          ))}
        </div>

        {/* 로딩 중 */}
        {loading && (
          <div style={{
            textAlign: "center",
            padding: "60px 20px",
            color: "#666",
            fontSize: "18px"
          }}>
            <div style={{
              display: "inline-block",
              width: "40px",
              height: "40px",
              border: "4px solid #f3f3f3",
              borderTop: "4px solid #667eea",
              borderRadius: "50%",
              animation: "spin 1s linear infinite",
              marginBottom: "16px"
            }}></div>
            <p>작품을 불러오는 중...</p>
          </div>
        )}

        {/* 오류 메시지 */}
        {!loading && error && (
          <div style={{
            textAlign: "center",
            padding: "40px 20px",
            background: "#FEE",
            borderRadius: "12px",
            color: "#C00",
            fontSize: "16px"
          }}>
            <p style={{ marginBottom: "16px" }}>{error}</p>
            <button
              onClick={loadArtifacts}
              style={{
                padding: "10px 20px",
                background: "#667eea",
                color: "white",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
                fontSize: "14px",
                fontWeight: "600"
              }}
            >
              다시 시도
            </button>
          </div>
        )}

        {/* 작품 없음 */}
        {!loading && !error && filteredArtifacts.length === 0 && (
          <div style={{
            textAlign: "center",
            padding: "60px 20px",
            color: "#666",
            fontSize: "18px"
          }}>
            <p style={{ fontSize: "48px", marginBottom: "16px" }}>📭</p>
            <p>
              {filter === "all" 
                ? "아직 제출된 작품이 없습니다."
                : `${getTypeLabel(filter)} 작품이 없습니다.`}
            </p>
          </div>
        )}

        {/* 작품 카드 그리드 */}
        {!loading && !error && filteredArtifacts.length > 0 && (
          <>
            {/* 작품 개수 표시 */}
            <div style={{
              marginBottom: "16px",
              fontSize: "14px",
              color: "#666",
              textAlign: "right"
            }}>
              총 <strong style={{ color: "#667eea" }}>{filteredArtifacts.length}</strong>개의 작품
            </div>

            {/* 작품 그리드 */}
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
              gap: "16px"
            }}>
              {filteredArtifacts.map((item) => (
                <div
                  key={item.artifactId}
                  style={{
                    background: "#ffffff",
                    border: "2px solid #E5E7EB",
                    borderRadius: "16px",
                    overflow: "hidden",
                    cursor: "pointer",
                    transition: "all 0.3s"
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-4px)";
                    e.currentTarget.style.boxShadow = "0 8px 16px rgba(0,0,0,0.1)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                >
                  {/* 썸네일 또는 타입 아이콘 */}
                  <div style={{
                    width: "100%",
                    aspectRatio: "1/1",
                    background: item.thumbnail 
                      ? `url(${item.thumbnail})` 
                      : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "64px"
                  }}>
                    {!item.thumbnail && getTypeIcon(item.type)}
                  </div>

                  {/* 작품 정보 */}
                  <div style={{ padding: "12px" }}>
                    <div style={{
                      fontSize: "12px",
                      color: "#667eea",
                      fontWeight: "600",
                      marginBottom: "4px"
                    }}>
                      {getTypeIcon(item.type)} {getTypeLabel(item.type)}
                    </div>
                    <h3 style={{
                      fontSize: "16px",
                      fontWeight: "bold",
                      color: "#333",
                      marginBottom: "8px",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap"
                    }}>
                      {item.title}
                    </h3>
                    {item.learnerName && (
                      <p style={{
                        fontSize: "13px",
                        color: "#666",
                        marginBottom: "4px"
                      }}>
                        👤 {item.learnerName}
                      </p>
                    )}
                    <p style={{
                      fontSize: "11px",
                      color: "#9CA3AF"
                    }}>
                      {new Date(item.createdAt).toLocaleDateString("ko-KR")}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* 하단 공유 안내 */}
        {!loading && !error && filteredArtifacts.length > 0 && (
          <div style={{
            marginTop: "40px",
            padding: "20px",
            background: "#F0F4FF",
            borderRadius: "12px",
            textAlign: "center",
            fontSize: "14px",
            color: "#666"
          }}>
            <p style={{ margin: "0 0 8px 0", fontWeight: "600", color: "#667eea" }}>
              📱 이 갤러리 공유하기
            </p>
            <p style={{ margin: "0 0 12px 0" }}>
              현재 URL을 복사하여 학부모님이나 다른 분들과 공유하세요!
            </p>
            <button
              onClick={() => {
                navigator.clipboard.writeText(window.location.href);
                alert("✅ URL이 클립보드에 복사되었습니다!");
              }}
              style={{
                padding: "10px 20px",
                background: "#667eea",
                color: "white",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
                fontSize: "14px",
                fontWeight: "600"
              }}
            >
              📋 URL 복사하기
            </button>
          </div>
        )}
      </div>

      {/* CSS 애니메이션 */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
