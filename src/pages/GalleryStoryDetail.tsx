import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

interface StoryDetail {
  artifactId: string;
  type: "story";
  title: string;
  content: string;
  genre?: string;
  createdAt: string;
  learnerName?: string;
  makerId?: string;
  classCode: string;
}

export default function GalleryStoryDetail() {
  const { classCode, artifactId } = useParams();
  const navigate = useNavigate();
  const [story, setStory] = useState<StoryDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (classCode && artifactId) {
      loadStoryDetail();
    }
  }, [classCode, artifactId]);

  const loadStoryDetail = async () => {
    if (!classCode || !artifactId) return;

    setLoading(true);
    setError("");

    try {
      // Firebase Functions에서 작품 상세 정보 가져오기
      const response = await fetch(
        `https://asia-northeast1-story-make-fbbd7.cloudfunctions.net/artifactGet?artifactId=${encodeURIComponent(artifactId)}`
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "작품을 불러올 수 없습니다.");
      }

      console.log("📖 글 상세 정보:", data.artifact);
      setStory(data.artifact);
    } catch (err: any) {
      console.error("작품 상세 로드 오류:", err);
      setError(err.message || "작품을 불러오는 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopyText = () => {
    if (!story) return;
    
    const textToCopy = `${story.title}\n작성자: ${story.learnerName || "익명"}\n\n${story.content}`;
    navigator.clipboard.writeText(textToCopy);
    alert("✅ 글이 클립보드에 복사되었습니다!");
  };

  const handlePrint = () => {
    window.print();
  };

  const getGenreLabel = (genre?: string) => {
    switch(genre) {
      case "diary": return "일기";
      case "letter": return "편지";
      case "essay": return "수필";
      case "poem": return "시";
      case "novel": return "소설";
      case "autobiography": return "자서전";
      case "fourcut": return "4컷 인터뷰";
      case "drama": return "드라마 대본";
      default: return "글쓰기";
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", backgroundColor: "#FFF9F0", padding: "20px" }}>
        <div className="responsive-container" style={{ maxWidth: "800px", margin: "0 auto" }}>
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
        </div>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  if (error || !story) {
    return (
      <div style={{ minHeight: "100vh", backgroundColor: "#FFF9F0", padding: "20px" }}>
        <div className="responsive-container" style={{ maxWidth: "800px", margin: "0 auto" }}>
          <div style={{
            textAlign: "center",
            padding: "40px 20px",
            background: "#FEE",
            borderRadius: "12px",
            color: "#C00",
            fontSize: "16px"
          }}>
            <p style={{ marginBottom: "16px" }}>{error || "작품을 찾을 수 없습니다."}</p>
            <button
              onClick={() => navigate(`/gallery/${classCode}`)}
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
              갤러리로 돌아가기
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#FFF9F0", padding: "20px" }}>
      <div className="responsive-container" style={{ maxWidth: "800px", margin: "0 auto" }}>
        {/* 헤더 - 인쇄 시 숨김 */}
        <div className="no-print" style={{ marginBottom: "24px" }}>
          <button
            onClick={() => navigate(`/gallery/${classCode}`)}
            style={{
              padding: "10px 20px",
              fontSize: "15px",
              background: "#ffffff",
              color: "#333",
              border: "2px solid #E5E7EB",
              borderRadius: "12px",
              cursor: "pointer",
              fontWeight: "600",
              display: "flex",
              alignItems: "center",
              gap: "8px"
            }}
          >
            ← 갤러리로 돌아가기
          </button>
        </div>

        {/* 작품 카드 */}
        <div style={{
          background: "#ffffff",
          border: "2px solid #E5E7EB",
          borderRadius: "16px",
          padding: "32px",
          marginBottom: "24px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.08)"
        }}>
          {/* 메타 정보 */}
          <div style={{ marginBottom: "24px" }}>
            <div style={{
              fontSize: "14px",
              color: "#667eea",
              fontWeight: "600",
              marginBottom: "8px"
            }}>
              📝 {getGenreLabel(story.genre)}
            </div>
            <h1 style={{
              fontSize: "28px",
              fontWeight: "bold",
              color: "#333",
              marginBottom: "16px",
              lineHeight: "1.4"
            }}>
              {story.title}
            </h1>
            <div style={{
              display: "flex",
              gap: "16px",
              fontSize: "14px",
              color: "#666",
              borderTop: "1px solid #E5E7EB",
              paddingTop: "16px"
            }}>
              {story.learnerName && (
                <div>
                  <span style={{ fontWeight: "600" }}>👤 작성자:</span> {story.learnerName}
                </div>
              )}
              <div>
                <span style={{ fontWeight: "600" }}>📅 작성일:</span>{" "}
                {new Date(story.createdAt).toLocaleDateString("ko-KR")}
              </div>
            </div>
          </div>

          {/* 본문 */}
          <div style={{
            fontSize: "16px",
            lineHeight: "1.8",
            color: "#333",
            whiteSpace: "pre-wrap",
            wordBreak: "break-word",
            borderTop: "2px solid #E5E7EB",
            paddingTop: "24px"
          }}>
            {story.content}
          </div>
        </div>

        {/* 액션 버튼 - 인쇄 시 숨김 */}
        <div className="no-print" style={{
          display: "flex",
          gap: "12px",
          justifyContent: "center"
        }}>
          <button
            onClick={handleCopyText}
            style={{
              padding: "12px 24px",
              fontSize: "15px",
              fontWeight: "600",
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              color: "#ffffff",
              border: "none",
              borderRadius: "12px",
              cursor: "pointer",
              boxShadow: "0 4px 12px rgba(102, 126, 234, 0.3)"
            }}
          >
            📋 텍스트 복사
          </button>
          <button
            onClick={handlePrint}
            style={{
              padding: "12px 24px",
              fontSize: "15px",
              fontWeight: "600",
              background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
              color: "#ffffff",
              border: "none",
              borderRadius: "12px",
              cursor: "pointer",
              boxShadow: "0 4px 12px rgba(16, 185, 129, 0.3)"
            }}
          >
            🖨️ 인쇄하기
          </button>
        </div>

        {/* 하단 정보 */}
        <div style={{
          marginTop: "40px",
          padding: "20px",
          background: "#F0F4FF",
          borderRadius: "12px",
          textAlign: "center",
          fontSize: "14px",
          color: "#666"
        }}>
          <p style={{ margin: "0", fontWeight: "600", color: "#667eea" }}>
            🎨 스토리메이커
          </p>
          <p style={{ margin: "8px 0 0 0" }}>
            학급 코드: <strong>{classCode}</strong>
          </p>
        </div>
      </div>

      {/* 인쇄 스타일 */}
      <style>{`
        @media print {
          .no-print {
            display: none !important;
          }
          body {
            background: white;
          }
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
