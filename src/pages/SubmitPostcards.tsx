import { useNavigate } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import { getAllPostcards, type Postcard } from "../services/dbService";
import { getCurrentLearner, saveArtifact } from "../services/classroomService";
import html2canvas from "html2canvas";

export default function SubmitPostcards() {
  const navigate = useNavigate();
  const [postcards, setPostcards] = useState<Postcard[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const fontStyles = {
    nanum: { fontFamily: "'Nanum Gothic', 'Malgun Gothic', '맑은 고딕', sans-serif" },
    cute: { fontFamily: "'Nanum Pen Script', 'Nanum Pen', cursive" },
    jua: { fontFamily: "'Jua', 'Nanum Barun Gothic', sans-serif" }
  };

  useEffect(() => {
    loadPostcards();
  }, []);

  const loadPostcards = async () => {
    setLoading(true);
    try {
      const data = await getAllPostcards();
      setPostcards(data.reverse());
    } catch (error) {
      console.error("엽서 로드 오류:", error);
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
    if (selectedIds.size === postcards.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(postcards.map(card => card.id!)));
    }
  };

  const handleSubmit = async () => {
    if (selectedIds.size === 0) {
      alert("제출할 엽서를 선택해주세요.");
      return;
    }

    const learner = getCurrentLearner();
    if (!learner) {
      alert("로그인이 필요합니다.");
      navigate("/onboarding");
      return;
    }

    const confirmed = confirm(
      `선택한 ${selectedIds.size}개의 엽서를 선생님께 제출하시겠습니까?\n\n제출 후에는 취소할 수 없습니다.`
    );

    if (!confirmed) return;

    setSubmitting(true);
    let successCount = 0;
    let failCount = 0;

    try {
      const selectedCards = postcards.filter(card => selectedIds.has(card.id!));

      for (const card of selectedCards) {
        try {
          // 엽서를 이미지로 변환하여 제출
          await saveArtifact({
            learnerId: learner.learnerId,
            type: "image",
            title: `엽서 - ${card.line1}`,
            data: {
              line1: card.line1,
              line2: card.line2,
              font: card.font,
              originalImageUrl: card.imageUrl,
              createdAt: card.createdAt
            },
            files: {
              postcard: card.imageUrl
            }
          });
          successCount++;
        } catch (error: any) {
          console.error("엽서 제출 실패:", error);
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
          <h2 style={{ fontSize: "22px", fontWeight: "bold" }}>📮 엽서 제출하기</h2>
          <div style={{ width: "40px" }}></div>
        </div>

        {/* 선택 정보 */}
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
            선택: <strong style={{ color: "#667eea" }}>{selectedIds.size}</strong> / {postcards.length}
          </span>
          <button
            onClick={selectAll}
            style={{
              padding: "8px 16px",
              background: selectedIds.size === postcards.length ? "#667eea" : "#E5E7EB",
              color: selectedIds.size === postcards.length ? "white" : "#666",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              fontSize: "14px",
              fontWeight: "600"
            }}
          >
            {selectedIds.size === postcards.length ? "✓ 전체 선택됨" : "전체 선택"}
          </button>
        </div>

        {/* 로딩 */}
        {loading && (
          <p style={{ textAlign: "center", fontSize: "18px", color: "#666", marginTop: "40px" }}>
            불러오는 중...
          </p>
        )}

        {/* 작품 없음 */}
        {!loading && postcards.length === 0 && (
          <div style={{ textAlign: "center", marginTop: "60px" }}>
            <p style={{ fontSize: "48px", marginBottom: "16px" }}>📮</p>
            <p style={{ fontSize: "18px", color: "#666", marginBottom: "20px" }}>
              저장된 엽서가 없습니다.
            </p>
            <button
              onClick={() => navigate("/goods")}
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
              엽서 만들러 가기
            </button>
          </div>
        )}

        {/* 엽서 그리드 */}
        {!loading && postcards.length > 0 && (
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, 1fr)",
            gap: "12px",
            marginBottom: "20px"
          }}>
            {postcards.map((card) => {
              const isSelected = selectedIds.has(card.id!);
              return (
                <div
                  key={card.id}
                  onClick={() => toggleSelect(card.id!)}
                  style={{
                    position: "relative",
                    border: isSelected ? "3px solid #667eea" : "2px solid #E5E7EB",
                    borderRadius: "12px",
                    overflow: "hidden",
                    cursor: "pointer",
                    background: "white",
                    transition: "all 0.2s",
                    transform: isSelected ? "scale(0.98)" : "scale(1)"
                  }}
                >
                  {/* 엽서 미리보기 */}
                  <div style={{ position: "relative", aspectRatio: "3/2" }}>
                    <img
                      src={card.imageUrl}
                      alt="엽서"
                      style={{
                        width: "100%",
                        height: "65%",
                        objectFit: "cover",
                        opacity: isSelected ? 0.7 : 1
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
                      fontSize: "9px",
                      textAlign: "center"
                    }}>
                      <p style={{ margin: 0, fontWeight: "600", color: "#333" }}>{card.line1}</p>
                      <p style={{ margin: 0, color: "#666" }}>{card.line2}</p>
                    </div>

                    {/* 체크박스 */}
                    <div style={{
                      position: "absolute",
                      top: "8px",
                      right: "8px",
                      width: "32px",
                      height: "32px",
                      background: isSelected ? "#667eea" : "rgba(255,255,255,0.9)",
                      borderRadius: "50%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "18px",
                      fontWeight: "bold",
                      color: isSelected ? "white" : "#667eea",
                      border: isSelected ? "none" : "2px solid #667eea",
                      boxShadow: "0 2px 4px rgba(0,0,0,0.2)"
                    }}>
                      {isSelected ? "✓" : ""}
                    </div>
                  </div>

                  {/* 날짜 */}
                  <div style={{ padding: "8px" }}>
                    <p style={{ fontSize: "11px", color: "#9CA3AF", margin: 0 }}>
                      {new Date(card.createdAt).toLocaleDateString("ko-KR")}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 하단 제출 버튼 */}
      {!loading && postcards.length > 0 && (
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
                  : "엽서를 선택해주세요"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
