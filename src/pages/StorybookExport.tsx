import { useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import { exportEnhancedPDF } from "../services/pdfService";
import "./StorybookExport.css";

export default function StorybookExport() {
  const navigate = useNavigate();
  const { state } = useLocation();

  // State에서 동화책 데이터 받아오기
  const {
    title = "나의 동화책",
    pages = [],
    coverImageUrl = null,
  } = state || {};

  // PDF 설정 상태
  const [authorName, setAuthorName] = useState("익명");
  const [pdfLayout, setPdfLayout] = useState<"vertical" | "horizontal">("vertical");
  const [usePastelBackground, setUsePastelBackground] = useState(true);
  const [textImageLayout, setTextImageLayout] = useState<"image-right" | "image-top">("image-top");
  const [isExporting, setIsExporting] = useState(false);

  // 동화책 데이터가 없는 경우
  if (!state || pages.length === 0) {
    return (
      <div className="export-container">
        <div className="empty-state">
          <h2>⚠️ 동화책 데이터가 없습니다</h2>
          <p>먼저 동화책을 생성해주세요.</p>
          <button className="btn-primary" onClick={() => navigate("/storybook")}>
            동화책 만들러 가기
          </button>
        </div>
      </div>
    );
  }

  // 이미지가 있는 페이지만 필터링
  const pagesWithImages = pages.filter((page: any) => page.imageUrl);
  const totalPages = pages.length;
  const completedImages = pagesWithImages.length;

  // PDF 내보내기 핸들러
  const handleExportPDF = async () => {
    setIsExporting(true);

    try {
      await exportEnhancedPDF({
        pages: pages.map((page: any) => ({
          text: page.text,
          image: page.imageUrl || null,
        })),
        title: title,
        author: authorName,
        layout: pdfLayout,
        usePastelBackground: usePastelBackground,
        textImageLayout: textImageLayout,
        coverImage: coverImageUrl,
      });

      alert("✨ 동화책 PDF가 다운로드되었습니다!");
    } catch (error) {
      console.error("PDF 내보내기 오류:", error);
      alert("PDF 생성 중 오류가 발생했습니다. 다시 시도해주세요.");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="export-container">
      {/* 상단 헤더 */}
      <header className="export-header">
        <button className="header-btn" onClick={() => navigate(-1)}>
          ← 뒤로
        </button>
        <h1 className="header-title">📕 PDF 내보내기</h1>
        <button className="header-btn" onClick={() => navigate("/")}>
          🏠 홈
        </button>
      </header>

      {/* 동화책 정보 */}
      <div className="book-info">
        <h2 className="book-title">{title}</h2>
        {coverImageUrl && (
          <div className="cover-preview">
            <img src={coverImageUrl} alt="표지" />
          </div>
        )}
        <div className="book-stats">
          <span>📄 전체 페이지: {totalPages}개</span>
          <span>🎨 이미지: {completedImages}개</span>
        </div>
      </div>

      {/* PDF 설정 섹션 */}
      <div className="pdf-settings">
        <h3 className="section-title">⚙️ PDF 설정</h3>

        {/* 저자명 */}
        <div className="setting-item">
          <label className="setting-label">👤 저자명</label>
          <input
            type="text"
            className="setting-input"
            value={authorName}
            onChange={(e) => setAuthorName(e.target.value)}
            placeholder="저자 이름을 입력하세요"
          />
        </div>

        {/* 페이지 방향 */}
        <div className="setting-item">
          <label className="setting-label">📐 페이지 방향</label>
          <div className="radio-group">
            <label className="radio-item">
              <input
                type="radio"
                name="layout"
                value="vertical"
                checked={pdfLayout === "vertical"}
                onChange={(e) => setPdfLayout(e.target.value as "vertical")}
              />
              <span>세로 (Portrait)</span>
            </label>
            <label className="radio-item">
              <input
                type="radio"
                name="layout"
                value="horizontal"
                checked={pdfLayout === "horizontal"}
                onChange={(e) => setPdfLayout(e.target.value as "horizontal")}
              />
              <span>가로 (Landscape)</span>
            </label>
          </div>
        </div>

        {/* 이미지 레이아웃 */}
        <div className="setting-item">
          <label className="setting-label">🖼️ 이미지 레이아웃</label>
          <div className="radio-group">
            <label className="radio-item">
              <input
                type="radio"
                name="imageLayout"
                value="image-top"
                checked={textImageLayout === "image-top"}
                onChange={(e) => setTextImageLayout(e.target.value as "image-top")}
              />
              <span>이미지 상단 + 텍스트 하단</span>
            </label>
            <label className="radio-item">
              <input
                type="radio"
                name="imageLayout"
                value="image-right"
                checked={textImageLayout === "image-right"}
                onChange={(e) => setTextImageLayout(e.target.value as "image-right")}
              />
              <span>텍스트 좌측 + 이미지 우측</span>
            </label>
          </div>
        </div>

        {/* 파스텔 배경 */}
        <div className="setting-item">
          <label className="checkbox-item">
            <input
              type="checkbox"
              checked={usePastelBackground}
              onChange={(e) => setUsePastelBackground(e.target.checked)}
            />
            <span>🎨 파스텔 배경 사용</span>
          </label>
          <p className="setting-hint">
            은은한 핑크, 블루, 녹색, 크림, 보라색 배경이 페이지마다 적용됩니다.
          </p>
        </div>
      </div>

      {/* 미리보기 섹션 */}
      <div className="preview-section">
        <h3 className="section-title">👀 페이지 미리보기</h3>
        <div className="preview-grid">
          {pages.slice(0, 3).map((page: any, index: number) => (
            <div key={index} className="preview-card">
              {page.imageUrl ? (
                <img src={page.imageUrl} alt={`페이지 ${index + 1}`} />
              ) : (
                <div className="preview-placeholder">
                  <span>🖼️</span>
                  <p>이미지 없음</p>
                </div>
              )}
              <p className="preview-text">
                {page.text.slice(0, 30)}
                {page.text.length > 30 ? "..." : ""}
              </p>
            </div>
          ))}
        </div>
        {pages.length > 3 && (
          <p className="preview-more">외 {pages.length - 3}개 페이지...</p>
        )}
      </div>

      {/* 내보내기 버튼 */}
      <button
        className="export-btn"
        onClick={handleExportPDF}
        disabled={isExporting}
      >
        {isExporting ? "⏳ PDF 생성 중..." : "📕 동화책 PDF 완성하기"}
      </button>

      {/* 경고 메시지 */}
      {completedImages < totalPages && (
        <div className="warning-box">
          <p>
            ⚠️ 일부 페이지에 이미지가 없습니다. ({completedImages}/{totalPages})
          </p>
          <p>편집 페이지로 돌아가 이미지를 생성하시겠어요?</p>
          <button className="btn-secondary" onClick={() => navigate(-1)}>
            편집하러 가기
          </button>
        </div>
      )}
    </div>
  );
}
