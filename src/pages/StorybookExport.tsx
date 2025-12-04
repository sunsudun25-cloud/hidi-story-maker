import { useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import { exportEnhancedPDF } from "../services/pdfService";
import { generateStoryImage } from "../services/imageService";
import "./StorybookExport.css";

export default function StorybookExport() {
  const navigate = useNavigate();
  const { state } = useLocation();

  // State에서 동화책 데이터 받아오기
  const {
    title: initialTitle = "나의 동화책",
    pages = [],
    coverImageUrl: initialCover = null,
  } = state || {};

  // PDF 설정 상태
  const [title, setTitle] = useState(initialTitle);
  const [author, setAuthor] = useState("익명");
  const [coverImage, setCoverImage] = useState(initialCover);
  const [layout, setLayout] = useState("vertical");
  const [usePastelBackground, setUsePastelBackground] = useState(true);
  const [textImageLayout, setTextImageLayout] = useState("image-top");
  const [isGeneratingCover, setIsGeneratingCover] = useState(false);
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

  // 표지 이미지 자동 생성
  const generateCover = async () => {
    if (pages.length === 0 || !pages[0].text) {
      alert("페이지 내용이 없습니다!");
      return;
    }

    setIsGeneratingCover(true);

    try {
      // 첫 번째 페이지 텍스트로 표지 생성
      const img = await generateStoryImage(pages[0].text, {
        style: "동화 스타일",
        mood: "따뜻하고 부드러운"
      });
      setCoverImage(img);
      alert("🎨 표지 이미지가 생성되었습니다!");
    } catch (error) {
      console.error("표지 생성 오류:", error);
      alert("표지 이미지 생성 중 오류가 발생했습니다. 다시 시도해주세요.");
    } finally {
      setIsGeneratingCover(false);
    }
  };

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
        author: author,
        layout: layout as "vertical" | "horizontal",
        usePastelBackground: usePastelBackground,
        textImageLayout: textImageLayout as "image-right" | "image-top",
        coverImage: coverImage,
      });

      alert("✨ 동화책 PDF가 다운로드되었습니다!");
    } catch (error) {
      console.error("PDF 내보내기 오류:", error);
      alert("PDF 생성 중 오류가 발생했습니다. 다시 시도해주세요.");
    } finally {
      setIsExporting(false);
    }
  };

  // 이미지 완성도 계산
  const pagesWithImages = pages.filter((page: any) => page.imageUrl);
  const totalPages = pages.length;
  const completedImages = pagesWithImages.length;

  return (
    <div className="export-container">
      {/* 상단 헤더 */}
      <header className="export-header">
        <button className="header-btn" onClick={() => navigate(-1)}>
          ← 뒤로
        </button>
        <h1 className="header-title">📕 PDF 만들기</h1>
        <button className="header-btn" onClick={() => navigate("/")}>
          🏠
        </button>
      </header>

      <div className="export-content">
        {/* 책 정보 섹션 */}
        <div className="section-card">
          <h2 className="section-title">📚 책 정보</h2>

          {/* 제목 */}
          <div className="input-group">
            <label className="input-label">책 제목</label>
            <input
              className="input-field"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="동화책 제목을 입력하세요"
            />
          </div>

          {/* 저자명 */}
          <div className="input-group">
            <label className="input-label">저자명</label>
            <input
              className="input-field"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              placeholder="저자 이름을 입력하세요"
            />
          </div>
        </div>

        {/* 표지 이미지 섹션 */}
        <div className="section-card">
          <h2 className="section-title">🎨 표지 이미지</h2>

          {coverImage && (
            <div className="cover-preview">
              <img src={coverImage} alt="표지" />
            </div>
          )}

          <button
            onClick={generateCover}
            className="btn-purple"
            disabled={isGeneratingCover}
          >
            {isGeneratingCover ? "⏳ 표지 생성 중..." : "🎨 표지 자동 생성"}
          </button>
        </div>

        {/* PDF 설정 섹션 */}
        <div className="section-card">
          <h2 className="section-title">⚙️ PDF 설정</h2>

          {/* PDF 방향 */}
          <div className="input-group">
            <label className="input-label">📐 PDF 방향</label>
            <select
              className="select-field"
              value={layout}
              onChange={(e) => setLayout(e.target.value)}
            >
              <option value="vertical">세로 (Portrait)</option>
              <option value="horizontal">가로 (Landscape)</option>
            </select>
          </div>

          {/* 페이지 배치 방식 */}
          <div className="input-group">
            <label className="input-label">🖼️ 페이지 배치 방식</label>
            <select
              className="select-field"
              value={textImageLayout}
              onChange={(e) => setTextImageLayout(e.target.value)}
            >
              <option value="image-top">이미지 위 + 텍스트 아래</option>
              <option value="image-right">텍스트 왼쪽 + 이미지 오른쪽</option>
            </select>
          </div>

          {/* 배경 스타일 */}
          <div className="input-group">
            <label className="input-label">🎨 배경 스타일</label>
            <select
              className="select-field"
              value={String(usePastelBackground)}
              onChange={(e) => setUsePastelBackground(e.target.value === "true")}
            >
              <option value="true">파스텔톤 배경</option>
              <option value="false">기본 흰색</option>
            </select>
          </div>
        </div>

        {/* 페이지 통계 */}
        <div className="stats-card">
          <div className="stat-item">
            <span className="stat-icon">📄</span>
            <div>
              <div className="stat-label">전체 페이지</div>
              <div className="stat-value">{totalPages}개</div>
            </div>
          </div>
          <div className="stat-item">
            <span className="stat-icon">🎨</span>
            <div>
              <div className="stat-label">이미지</div>
              <div className="stat-value">{completedImages}/{totalPages}</div>
            </div>
          </div>
        </div>

        {/* 경고 메시지 */}
        {completedImages < totalPages && (
          <div className="warning-box">
            <p className="warning-text">
              ⚠️ 일부 페이지에 이미지가 없습니다. ({completedImages}/{totalPages})
            </p>
            <button className="btn-warning" onClick={() => navigate(-1)}>
              편집하러 가기
            </button>
          </div>
        )}

        {/* PDF 생성 버튼 */}
        <button
          onClick={handleExportPDF}
          className="btn-export"
          disabled={isExporting}
        >
          {isExporting ? "⏳ PDF 생성 중..." : "📕 동화책 PDF 만들기"}
        </button>
      </div>
    </div>
  );
}
