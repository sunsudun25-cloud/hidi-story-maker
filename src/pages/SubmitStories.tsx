import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { getAllStories, type Story } from "../services/dbService";
import { getCurrentLearner, saveArtifact } from "../services/classroomService";

export default function SubmitStories() {
  const navigate = useNavigate();
  const [stories, setStories] = useState<Story[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadStories();
  }, []);

  const loadStories = async () => {
    setLoading(true);
    try {
      const data = await getAllStories();
      setStories(data.reverse()); // 최신순
    } catch (error) {
      console.error("글 로드 오류:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleSelect = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const selectAll = () => {
    if (selectedIds.size === stories.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(stories.map(story => story.id)));
    }
  };

  const handleSubmit = async () => {
    if (selectedIds.size === 0) {
      alert("제출할 글을 선택해주세요.");
      return;
    }

    const learner = getCurrentLearner();
    if (!learner) {
      alert("로그인이 필요합니다.");
      navigate("/onboarding");
      return;
    }

    const confirmed = confirm(
      `선택한 ${selectedIds.size}개의 글을 선생님께 제출하시겠습니까?\n\n제출 후에는 취소할 수 없습니다.`
    );

    if (!confirmed) return;

    setSubmitting(true);
    let successCount = 0;
    let failCount = 0;

    try {
      const selectedStories = stories.filter(story => selectedIds.has(story.id));

      for (const story of selectedStories) {
        try {
          await saveArtifact({
            learnerId: learner.learnerId,
            type: "story",
            title: story.title || `글 - ${new Date(story.createdAt).toLocaleDateString()}`,
            data: {
              title: story.title,
              content: story.content,
              genre: story.genre,
              description: story.description,
              createdAt: story.createdAt
            },
            files: story.image ? { image: story.image } : {}
          });
          successCount++;
        } catch (error: any) {
          console.error("글 제출 실패:", error);
          console.error("오류 상세:", error.message, error.stack);
          failCount++;
        }
      }

      if (successCount > 0) {
        alert(
          `✅ 제출 완료!\n\n성공: ${successCount}개\n실패: ${failCount}개\n\n선생님께서 갤러리에서 확인하실 수 있습니다.`
        );
        setSelectedIds(new Set());
      } else {
        alert("제출에 실패했습니다. 다시 시도해주세요.");
      }
    } catch (error: any) {
      console.error("제출 오류:", error);
      console.error("오류 상세:", error.message, error.response);
      alert(
        `제출 중 오류가 발생했습니다.\n\n` +
        `오류 메시지: ${error.message || "알 수 없는 오류"}\n\n` +
        `브라우저 콘솔(F12)에서 자세한 내용을 확인하세요.`
      );
    } finally {
      setSubmitting(false);
    }
  };

  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  };

  return (
    <div style={{ 
      minHeight: "100vh", 
      backgroundColor: "#FFF9F0", 
      padding: "20px",
      paddingBottom: "100px"
    }}>
      <div className="responsive-container">
        {/* 헤더 */}
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "20px"
        }}>
          <button
            onClick={() => navigate("/settings")}
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
          <h2 style={{ fontSize: "22px", fontWeight: "bold" }}>📝 글 제출하기</h2>
          <div style={{ width: "40px" }}></div>
        </div>

        {/* 선택 정보 및 전체 선택 */}
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "16px",
          padding: "12px 16px",
          background: "#ffffff",
          borderRadius: "12px",
          boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
        }}>
          <span style={{ fontSize: "15px", color: "#666" }}>
            선택: <strong style={{ color: "#667eea" }}>{selectedIds.size}</strong> / {stories.length}
          </span>
          <button
            onClick={selectAll}
            style={{
              padding: "8px 16px",
              background: selectedIds.size === stories.length ? "#667eea" : "#E5E7EB",
              color: selectedIds.size === stories.length ? "white" : "#666",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              fontSize: "14px",
              fontWeight: "600"
            }}
          >
            {selectedIds.size === stories.length ? "✓ 전체 선택됨" : "전체 선택"}
          </button>
        </div>

        {/* 로딩 */}
        {loading && (
          <p style={{ textAlign: "center", fontSize: "18px", color: "#666", marginTop: "40px" }}>
            불러오는 중...
          </p>
        )}

        {/* 작품 없음 */}
        {!loading && stories.length === 0 && (
          <div style={{ textAlign: "center", marginTop: "60px" }}>
            <p style={{ fontSize: "48px", marginBottom: "16px" }}>📝</p>
            <p style={{ fontSize: "18px", color: "#666", marginBottom: "20px" }}>
              저장된 글이 없습니다.
            </p>
            <button
              onClick={() => navigate("/write")}
              style={{
                padding: "12px 24px",
                background: "#667eea",
                color: "white",
                border: "none",
                borderRadius: "12px",
                cursor: "pointer",
                fontSize: "16px",
                fontWeight: "600"
              }}
            >
              글 쓰러 가기
            </button>
          </div>
        )}

        {/* 글 목록 */}
        {!loading && stories.length > 0 && (
          <div style={{
            display: "flex",
            flexDirection: "column",
            gap: "12px",
            marginBottom: "20px"
          }}>
            {stories.map((story) => {
              const isSelected = selectedIds.has(story.id);
              return (
                <div
                  key={story.id}
                  onClick={() => toggleSelect(story.id)}
                  style={{
                    position: "relative",
                    padding: "16px",
                    border: isSelected ? "3px solid #667eea" : "2px solid #E5E7EB",
                    borderRadius: "12px",
                    background: "white",
                    cursor: "pointer",
                    transition: "all 0.2s",
                    opacity: isSelected ? 0.9 : 1
                  }}
                >
                  {/* 체크박스 */}
                  <div style={{
                    position: "absolute",
                    top: "12px",
                    right: "12px",
                    width: "28px",
                    height: "28px",
                    background: isSelected ? "#667eea" : "white",
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "16px",
                    fontWeight: "bold",
                    color: isSelected ? "white" : "#667eea",
                    border: isSelected ? "none" : "2px solid #667eea"
                  }}>
                    {isSelected ? "✓" : ""}
                  </div>

                  {/* 내용 */}
                  <div style={{ paddingRight: "40px" }}>
                    <h3 style={{
                      fontSize: "17px",
                      fontWeight: "bold",
                      color: "#333",
                      marginBottom: "8px",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap"
                    }}>
                      {story.title || "제목 없음"}
                    </h3>
                    <p style={{
                      fontSize: "14px",
                      color: "#666",
                      lineHeight: "1.5",
                      marginBottom: "8px",
                      overflow: "hidden",
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical"
                    }}>
                      {truncateText(story.content, 100)}
                    </p>
                    <div style={{
                      display: "flex",
                      gap: "8px",
                      alignItems: "center"
                    }}>
                      {story.genre && (
                        <span style={{
                          padding: "4px 8px",
                          background: "#F3F4F6",
                          borderRadius: "6px",
                          fontSize: "12px",
                          color: "#667eea",
                          fontWeight: "600"
                        }}>
                          {story.genre}
                        </span>
                      )}
                      <span style={{ fontSize: "11px", color: "#9CA3AF" }}>
                        {new Date(story.createdAt).toLocaleDateString("ko-KR")}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 하단 제출 버튼 (고정) */}
      {!loading && stories.length > 0 && (
        <div style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          padding: "16px 20px",
          background: "white",
          boxShadow: "0 -4px 12px rgba(0,0,0,0.1)",
          zIndex: 100
        }}>
          <div className="responsive-container">
            <button
              onClick={handleSubmit}
              disabled={submitting || selectedIds.size === 0}
              style={{
                width: "100%",
                padding: "18px",
                background: selectedIds.size > 0 
                  ? "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                  : "#E5E7EB",
                color: selectedIds.size > 0 ? "white" : "#9CA3AF",
                border: "none",
                borderRadius: "12px",
                cursor: selectedIds.size > 0 && !submitting ? "pointer" : "not-allowed",
                fontSize: "18px",
                fontWeight: "bold",
                boxShadow: selectedIds.size > 0 ? "0 4px 12px rgba(102, 126, 234, 0.4)" : "none",
                opacity: submitting ? 0.7 : 1
              }}
            >
              {submitting 
                ? "제출 중..." 
                : selectedIds.size > 0 
                  ? `선택한 ${selectedIds.size}개 제출하기` 
                  : "글을 선택해주세요"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
