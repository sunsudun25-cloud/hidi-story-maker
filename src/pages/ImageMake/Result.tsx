import { useLocation, useNavigate } from "react-router-dom";
import { downloadImage } from "../../services/imageService";
import { saveImageToDB } from "../../services/dbService";
import { useStorybook } from "../../context/StorybookContext";
import { useState } from "react";
import "./ImageMake.css";

export default function Result() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { storyPages, setImageForPage, addNewPage } = useStorybook();
  const [isSaving, setIsSaving] = useState(false);
  const [isSavingToDB, setIsSavingToDB] = useState(false);
  const [showPageSelector, setShowPageSelector] = useState(false);

  const { image, prompt, style } = state || {};

  // 이미지가 없는 경우
  if (!image) {
    return (
      <div className="image-make-container">
        <div className="empty-state">
          <h2>⚠️ 이미지가 없습니다</h2>
          <p>먼저 이미지를 생성해주세요.</p>
          <button className="btn-primary" onClick={() => navigate("/image/practice")}>
            그림 만들러 가기
          </button>
        </div>
      </div>
    );
  }

  // 저장하기 (다운로드)
  const handleSave = async () => {
    setIsSaving(true);
    try {
      await downloadImage(image, `ai-image-${Date.now()}.png`);
      alert("✅ 이미지가 저장되었습니다!");
    } catch (error) {
      console.error("저장 오류:", error);
      alert("저장 중 오류가 발생했습니다.");
    } finally {
      setIsSaving(false);
    }
  };

  // IndexedDB에 저장
  const handleSaveToDB = async () => {
    setIsSavingToDB(true);
    try {
      await saveImageToDB({
        image,
        prompt,
        style,
        createdAt: new Date().toISOString(),
      });
      alert("✅ 저장되었습니다!");
      navigate("/gallery"); // 저장 후 내 작품 보기로 이동
    } catch (error) {
      console.error("DB 저장 오류:", error);
      alert("저장 중 오류가 발생했습니다.");
    } finally {
      setIsSavingToDB(false);
    }
  };

  // 동화책에 이미지 추가
  const handleAddToStorybook = (pageIndex: number) => {
    setImageForPage(pageIndex, image);
    setShowPageSelector(false);
    alert(`✅ ${pageIndex + 1}페이지에 이미지가 추가되었습니다!`);
    navigate("/storybook-editor", {
      state: {
        title: "나의 동화책",
        prompt: "",
        style: "동화 스타일",
        coverImageUrl: ""
      }
    });
  };

  // 새 페이지로 추가
  const handleAddAsNewPage = () => {
    addNewPage(prompt || "새로운 페이지");
    setImageForPage(storyPages.length, image);
    setShowPageSelector(false);
    alert(`✅ 새 페이지(${storyPages.length + 1}페이지)에 추가되었습니다!`);
    navigate("/storybook-editor", {
      state: {
        title: "나의 동화책",
        prompt: "",
        style: "동화 스타일",
        coverImageUrl: ""
      }
    });
  };

  return (
    <div className="image-make-container">
      {/* 상단 헤더 */}
      <div className="image-make-header">
        <button className="back-btn" onClick={() => navigate(-1)}>
          ← 뒤로
        </button>
        <h1 className="image-make-title">🎉 그림 완성!</h1>
        <button className="home-btn" onClick={() => navigate("/")}>
          🏠
        </button>
      </div>

      <div className="image-make-content result-content">
        {/* 이미지 표시 */}
        <div className="result-image-container">
          <img
            src={image}
            alt="생성된 그림"
            className="result-image"
          />
        </div>

        {/* 프롬프트 정보 */}
        <p className="result-prompt">
          생성 요청: <strong>{prompt}</strong>
        </p>

        {/* 액션 버튼 */}
        <div className="result-actions">
          <button
            className="result-btn retry-btn"
            onClick={() => navigate(-1)}
          >
            🔄 다시 만들기
          </button>

          <button
            className="result-btn save-btn"
            onClick={handleSaveToDB}
            disabled={isSavingToDB}
          >
            {isSavingToDB ? "⏳ 저장 중..." : "💾 내 작품에 저장"}
          </button>

          <button
            className="result-btn download-btn"
            onClick={handleSave}
            disabled={isSaving}
          >
            {isSaving ? "⏳ 다운로드 중..." : "📥 다운로드"}
          </button>

          <button
            className="result-btn storybook-btn"
            onClick={() => setShowPageSelector(true)}
          >
            📕 동화책에 넣기
          </button>

          <button
            className="result-btn home-btn-large"
            onClick={() => navigate("/")}
          >
            🏠 홈으로 가기
          </button>
        </div>
      </div>

      {/* 페이지 선택 모달 */}
      {showPageSelector && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
          onClick={() => setShowPageSelector(false)}
        >
          <div
            style={{
              backgroundColor: "white",
              padding: "30px",
              borderRadius: "16px",
              maxWidth: "400px",
              width: "90%",
              maxHeight: "80vh",
              overflowY: "auto",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 style={{ fontSize: "22px", marginBottom: "20px", textAlign: "center" }}>
              어느 페이지에 넣을까요?
            </h2>

            {/* 기존 페이지 목록 */}
            <div style={{ marginBottom: "20px" }}>
              {storyPages.length > 0 ? (
                storyPages.map((page, index) => (
                  <button
                    key={index}
                    onClick={() => handleAddToStorybook(index)}
                    style={{
                      width: "100%",
                      padding: "15px",
                      marginBottom: "10px",
                      border: "2px solid #e0e0e0",
                      borderRadius: "12px",
                      backgroundColor: page.imageUrl ? "#f0f0f0" : "white",
                      cursor: "pointer",
                      textAlign: "left",
                      fontSize: "16px",
                    }}
                  >
                    <strong>{index + 1}페이지</strong>
                    {page.imageUrl && " 🖼️ (이미지 있음)"}
                    <br />
                    <span style={{ color: "#666", fontSize: "14px" }}>
                      {page.text ? page.text.substring(0, 30) + "..." : "(내용 없음)"}
                    </span>
                  </button>
                ))
              ) : (
                <p style={{ textAlign: "center", color: "#999" }}>
                  아직 페이지가 없습니다
                </p>
              )}
            </div>

            {/* 새 페이지로 추가 버튼 */}
            <button
              onClick={handleAddAsNewPage}
              style={{
                width: "100%",
                padding: "15px",
                backgroundColor: "#8B5CF6",
                color: "white",
                border: "none",
                borderRadius: "12px",
                fontSize: "18px",
                fontWeight: "bold",
                cursor: "pointer",
                marginBottom: "10px",
              }}
            >
              ➕ 새 페이지로 추가
            </button>

            {/* 취소 버튼 */}
            <button
              onClick={() => setShowPageSelector(false)}
              style={{
                width: "100%",
                padding: "15px",
                backgroundColor: "#e0e0e0",
                color: "#333",
                border: "none",
                borderRadius: "12px",
                fontSize: "16px",
                cursor: "pointer",
              }}
            >
              취소
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
