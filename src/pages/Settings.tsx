import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { getCurrentLearner, clearCurrentLearner } from "../services/classroomService";
import { getAllImages, getAllStories, getAllStorybooks, getAllPostcards } from "../services/dbService";

export default function Settings() {
  const navigate = useNavigate();
  const [learner, setLearner] = useState<any>(null);
  const [counts, setCounts] = useState({
    images: 0,
    stories: 0,
    storybooks: 0,
    postcards: 0
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    // 학생 정보 로드
    const currentLearner = getCurrentLearner();
    setLearner(currentLearner);

    // 작품 개수 카운트
    try {
      const [images, stories, storybooks, postcards] = await Promise.all([
        getAllImages(),
        getAllStories(),
        getAllStorybooks(),
        getAllPostcards()
      ]);

      setCounts({
        images: images.length,
        stories: stories.length,
        storybooks: storybooks.length,
        postcards: postcards.length
      });
    } catch (error) {
      console.error("작품 개수 로드 오류:", error);
    }
  };

  const handleLogout = () => {
    if (confirm("로그아웃 하시겠습니까?")) {
      clearCurrentLearner();
      alert("✅ 로그아웃 되었습니다.");
      navigate("/");
    }
  };

  const handleSubmitAll = () => {
    const total = counts.images + counts.stories + counts.storybooks + counts.postcards;
    
    if (total === 0) {
      alert("제출할 작품이 없습니다.");
      return;
    }

    const confirmed = confirm(
      `모든 작품을 선생님께 제출하시겠습니까?\n\n` +
      `📝 글: ${counts.stories}개\n` +
      `🎨 그림: ${counts.images}개\n` +
      `📕 동화책: ${counts.storybooks}개\n` +
      `📮 엽서: ${counts.postcards}개\n\n` +
      `총 ${total}개의 작품`
    );

    if (confirmed) {
      // 모든 작품 제출 (추후 구현)
      alert("⚠️ 일괄 제출 기능은 개발 중입니다.\n각 작품 유형별로 제출해주세요.");
    }
  };

  return (
    <div style={{ 
      minHeight: "100vh", 
      backgroundColor: "#FFF9F0", 
      padding: "20px",
      paddingBottom: "80px"
    }}>
      <div className="responsive-container" style={{ maxWidth: "600px", margin: "0 auto" }}>
        {/* 헤더 */}
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "24px"
        }}>
          <button
            onClick={() => navigate("/home")}
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
          <h2 style={{ fontSize: "24px", fontWeight: "bold", color: "#333" }}>
            ⚙️ 설정
          </h2>
          <div style={{ width: "40px" }}></div>
        </div>

        {/* 내 정보 섹션 */}
        <div style={{
          background: "#ffffff",
          borderRadius: "16px",
          padding: "24px",
          marginBottom: "20px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
        }}>
          <h3 style={{
            fontSize: "18px",
            fontWeight: "bold",
            color: "#333",
            marginBottom: "16px",
            display: "flex",
            alignItems: "center",
            gap: "8px"
          }}>
            👤 내 정보
          </h3>
          
          {learner ? (
            <div style={{
              display: "flex",
              flexDirection: "column",
              gap: "12px"
            }}>
              <div style={{
                display: "flex",
                justifyContent: "space-between",
                padding: "12px",
                background: "#F9FAFB",
                borderRadius: "8px"
              }}>
                <span style={{ color: "#666", fontSize: "15px" }}>이름</span>
                <span style={{ fontWeight: "600", color: "#333", fontSize: "15px" }}>
                  {learner.learnerName}
                </span>
              </div>
              <div style={{
                display: "flex",
                justifyContent: "space-between",
                padding: "12px",
                background: "#F9FAFB",
                borderRadius: "8px"
              }}>
                <span style={{ color: "#666", fontSize: "15px" }}>수업 코드</span>
                <span style={{ fontWeight: "600", color: "#667eea", fontSize: "15px" }}>
                  {learner.classCode}
                </span>
              </div>
              <div style={{
                display: "flex",
                justifyContent: "space-between",
                padding: "12px",
                background: "#F9FAFB",
                borderRadius: "8px"
              }}>
                <span style={{ color: "#666", fontSize: "15px" }}>학생 번호</span>
                <span style={{ fontWeight: "600", color: "#333", fontSize: "15px" }}>
                  {learner.learnerId.split('-')[1]}
                </span>
              </div>
            </div>
          ) : (
            <div style={{
              padding: "20px",
              textAlign: "center",
              color: "#666",
              fontSize: "15px"
            }}>
              <p style={{ marginBottom: "12px" }}>로그인이 필요합니다.</p>
              <button
                onClick={() => navigate("/onboarding")}
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
                로그인하기
              </button>
            </div>
          )}
        </div>

        {/* 선생님께 제출 섹션 */}
        {learner && (
          <div style={{
            background: "#ffffff",
            borderRadius: "16px",
            padding: "24px",
            marginBottom: "20px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
          }}>
            <h3 style={{
              fontSize: "18px",
              fontWeight: "bold",
              color: "#333",
              marginBottom: "16px",
              display: "flex",
              alignItems: "center",
              gap: "8px"
            }}>
              📤 선생님께 제출
            </h3>

            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {/* 글 제출 */}
              <button
                onClick={() => navigate("/settings/submit/stories")}
                style={{
                  width: "100%",
                  padding: "16px 20px",
                  background: counts.stories > 0 
                    ? "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                    : "#E5E7EB",
                  color: counts.stories > 0 ? "#ffffff" : "#9CA3AF",
                  border: "none",
                  borderRadius: "12px",
                  cursor: counts.stories > 0 ? "pointer" : "not-allowed",
                  fontSize: "16px",
                  fontWeight: "600",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  transition: "all 0.2s",
                  textAlign: "left"
                }}
                disabled={counts.stories === 0}
              >
                <span>📝 글 제출하기</span>
                <span style={{
                  background: "rgba(255,255,255,0.2)",
                  padding: "4px 12px",
                  borderRadius: "20px",
                  fontSize: "14px"
                }}>
                  {counts.stories}개
                </span>
              </button>

              {/* 그림 제출 */}
              <button
                onClick={() => navigate("/settings/submit/images")}
                style={{
                  width: "100%",
                  padding: "16px 20px",
                  background: counts.images > 0 
                    ? "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)"
                    : "#E5E7EB",
                  color: counts.images > 0 ? "#ffffff" : "#9CA3AF",
                  border: "none",
                  borderRadius: "12px",
                  cursor: counts.images > 0 ? "pointer" : "not-allowed",
                  fontSize: "16px",
                  fontWeight: "600",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  transition: "all 0.2s",
                  textAlign: "left"
                }}
                disabled={counts.images === 0}
              >
                <span>🎨 그림 제출하기</span>
                <span style={{
                  background: "rgba(255,255,255,0.2)",
                  padding: "4px 12px",
                  borderRadius: "20px",
                  fontSize: "14px"
                }}>
                  {counts.images}개
                </span>
              </button>

              {/* 동화책 제출 */}
              <button
                onClick={() => navigate("/settings/submit/storybooks")}
                style={{
                  width: "100%",
                  padding: "16px 20px",
                  background: counts.storybooks > 0 
                    ? "linear-gradient(135deg, #48c6ef 0%, #6f86d6 100%)"
                    : "#E5E7EB",
                  color: counts.storybooks > 0 ? "#ffffff" : "#9CA3AF",
                  border: "none",
                  borderRadius: "12px",
                  cursor: counts.storybooks > 0 ? "pointer" : "not-allowed",
                  fontSize: "16px",
                  fontWeight: "600",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  transition: "all 0.2s",
                  textAlign: "left"
                }}
                disabled={counts.storybooks === 0}
              >
                <span>📕 동화책 제출하기</span>
                <span style={{
                  background: "rgba(255,255,255,0.2)",
                  padding: "4px 12px",
                  borderRadius: "20px",
                  fontSize: "14px"
                }}>
                  {counts.storybooks}개
                </span>
              </button>

              {/* 엽서 제출 */}
              <button
                onClick={() => navigate("/settings/submit/postcards")}
                style={{
                  width: "100%",
                  padding: "16px 20px",
                  background: counts.postcards > 0 
                    ? "linear-gradient(135deg, #fa709a 0%, #fee140 100%)"
                    : "#E5E7EB",
                  color: counts.postcards > 0 ? "#ffffff" : "#9CA3AF",
                  border: "none",
                  borderRadius: "12px",
                  cursor: counts.postcards > 0 ? "pointer" : "not-allowed",
                  fontSize: "16px",
                  fontWeight: "600",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  transition: "all 0.2s",
                  textAlign: "left"
                }}
                disabled={counts.postcards === 0}
              >
                <span>📮 엽서 제출하기</span>
                <span style={{
                  background: "rgba(255,255,255,0.2)",
                  padding: "4px 12px",
                  borderRadius: "20px",
                  fontSize: "14px"
                }}>
                  {counts.postcards}개
                </span>
              </button>
            </div>

            {/* 한 번에 모두 제출 */}
            <button
              onClick={handleSubmitAll}
              style={{
                width: "100%",
                padding: "18px 20px",
                marginTop: "16px",
                background: "linear-gradient(135deg, #11998e 0%, #38ef7d 100%)",
                color: "#ffffff",
                border: "none",
                borderRadius: "12px",
                cursor: "pointer",
                fontSize: "17px",
                fontWeight: "bold",
                boxShadow: "0 4px 12px rgba(0,0,0,0.15)"
              }}
            >
              ⬇️ 한 번에 모두 제출하기
            </button>
          </div>
        )}

        {/* 로그아웃 버튼 */}
        {learner && (
          <button
            onClick={handleLogout}
            style={{
              width: "100%",
              padding: "16px 20px",
              background: "#EF4444",
              color: "#ffffff",
              border: "none",
              borderRadius: "12px",
              cursor: "pointer",
              fontSize: "16px",
              fontWeight: "600",
              boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
            }}
          >
            🔓 로그아웃
          </button>
        )}
      </div>
    </div>
  );
}
