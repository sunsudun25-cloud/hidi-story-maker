import { useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import { generateNextPage } from "../services/geminiService";
import { generateStoryImage } from "../services/imageService";
import { exportStorybookToPDF, exportEnhancedPDF } from "../services/pdfService";
import { saveStorybook } from "../services/dbService";
import "./StorybookEditor.css";

type PageData = {
  text: string;
  imageUrl?: string;
};

export default function StorybookEditor() {
  const navigate = useNavigate();
  const { state } = useLocation();

  const [pages, setPages] = useState<PageData[]>([
    { text: "달빛을 먹으면 힘이 나는 토끼는 오늘도 친구들을 만나기 위해 숲속을 달려갑니다.", imageUrl: undefined },
    { text: "숲속 깊은 곳에서 토끼는 이상한 빛을 발견하게 됩니다.", imageUrl: undefined },
    { text: "그 빛을 따라가자, 놀라운 모험이 시작되는데…", imageUrl: undefined }
  ]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [generatedImages, setGeneratedImages] = useState<(string | null)[]>([null, null, null]);
  const [showPdfModal, setShowPdfModal] = useState(false);
  const [pdfOptions, setPdfOptions] = useState({
    author: "익명",
    layout: "vertical" as "vertical" | "horizontal",
    usePastelBackground: true,
    textImageLayout: "image-top" as "image-right" | "image-top"
  });

  if (!state) {
    return (
      <div style={{ padding: 20 }}>
        ⚠ 동화책 정보가 없습니다.  
        <br />
        홈으로 돌아가 다시 시도해주세요.
        <button
          style={{ marginTop: 20 }}
          onClick={() => navigate("/storybook")}
        >
          홈으로
        </button>
      </div>
    );
  }

  const { title, prompt, style, coverImageUrl } = state;

  // 페이지 이동 핸들러
  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    // 페이지 이동 시 해당 페이지의 이미지를 generatedImage에 동기화
    setGeneratedImage(generatedImages[newPage - 1] || null);
  };

  // 텍스트 업데이트 핸들러
  const handleTextChange = (index: number, newText: string) => {
    const newPages = [...pages];
    newPages[index].text = newText;
    setPages(newPages);
  };

  // 페이지 자동생성 핸들러
  const handleAutoGenerate = async () => {
    setIsGenerating(true);

    try {
      // 현재까지의 모든 페이지 텍스트 수집
      const prevTexts = pages.map(p => p.text);
      
      // Gemini API로 다음 페이지 생성
      const nextPageText = await generateNextPage(prevTexts, style || "동화 스타일");
      
      // 새 페이지 추가
      setPages([...pages, { text: nextPageText }]);
      
      // generatedImages 배열에 null 추가
      setGeneratedImages(prev => [...prev, null]);
      
      // 새 페이지로 이동
      setCurrentPage(pages.length + 1);
      
      // 새 페이지는 이미지가 없으므로 generatedImage 초기화
      setGeneratedImage(null);
      
      alert("✨ 새로운 페이지가 생성되었습니다!");
    } catch (err) {
      console.error("페이지 생성 오류:", err);
      alert("페이지 생성 중 오류가 발생했습니다. 다시 시도해주세요.");
    } finally {
      setIsGenerating(false);
    }
  };

  // 페이지 이미지 생성 핸들러
  const handleGeneratePageImage = async () => {
    const currentPageData = pages[currentPage - 1];
    
    if (!currentPageData.text.trim()) {
      alert("먼저 페이지 내용을 입력해주세요!");
      return;
    }

    setIsGeneratingImage(true);

    try {
      // generateStoryImage로 이미지 생성
      const img = await generateStoryImage(currentPageData.text, {
        style: style || "동화 스타일",
        mood: "따뜻하고 부드러운"
      });

      // 생성된 이미지를 state에 저장
      setGeneratedImage(img);

      // 페이지 이미지 업데이트
      const newPages = [...pages];
      newPages[currentPage - 1].imageUrl = img;
      setPages(newPages);

      // generatedImages 배열 업데이트
      setGeneratedImages(prev => {
        const newImages = [...prev];
        newImages[currentPage - 1] = img;
        return newImages;
      });

      alert("🎨 페이지 이미지가 생성되었습니다!");
    } catch (err) {
      console.error("이미지 생성 오류:", err);
      alert("이미지 생성 중 오류가 발생했습니다. 다시 시도해주세요.");
    } finally {
      setIsGeneratingImage(false);
    }
  };

  // 저장 핸들러
  const handleSave = async () => {
    try {
      const storybookId = await saveStorybook({
        title,
        prompt,
        style,
        coverImageUrl,
        pages,
        createdAt: new Date().toISOString()
      });

      console.log("📘 저장된 동화책 ID:", storybookId);
      alert("✅ 동화책이 저장되었습니다!\n\n내 작품에서 확인하실 수 있습니다.");
      
      // 저장 후 MyWorks 페이지로 이동
      navigate("/my-works");
    } catch (error) {
      console.error("동화책 저장 오류:", error);
      alert("저장 중 오류가 발생했습니다. 다시 시도해주세요.");
    }
  };

  // PDF 저장 핸들러 (간단 버전)
  const handleSaveAsPDF = async () => {
    try {
      // 파일명 생성 (제목 + 날짜)
      const date = new Date().toISOString().split("T")[0];
      const filename = `${title}_${date}.pdf`;

      // PDF 생성 (간단 버전)
      await exportStorybookToPDF(
        pages.map((page) => ({
          text: page.text,
          image: page.imageUrl || null,
        })),
        filename
      );

      alert("📕 PDF가 다운로드되었습니다!");
    } catch (error) {
      console.error("PDF 생성 오류:", error);
      alert("PDF 생성 중 오류가 발생했습니다. 다시 시도해주세요.");
    }
  };

  // 고급 PDF 저장 핸들러
  const handleEnhancedPDF = async () => {
    try {
      await exportEnhancedPDF({
        pages: pages.map((page) => ({
          text: page.text,
          image: page.imageUrl || null,
        })),
        title: title || "나의 동화책",
        author: pdfOptions.author,
        layout: pdfOptions.layout,
        usePastelBackground: pdfOptions.usePastelBackground,
        textImageLayout: pdfOptions.textImageLayout,
        coverImage: coverImageUrl || null,
      });

      setShowPdfModal(false);
      alert("✨ 고급 PDF가 다운로드되었습니다!");
    } catch (error) {
      console.error("고급 PDF 생성 오류:", error);
      alert("PDF 생성 중 오류가 발생했습니다. 다시 시도해주세요.");
    }
  };

  return (
    <div className="editor-container">
      {/* 🔵 상단 헤더 */}
      <header className="editor-header">
        <button className="header-btn" onClick={() => navigate(-1)}>←</button>
        <h1 className="editor-title">동화책 편집</h1>
        <button className="header-btn" onClick={() => navigate("/")}>🏠</button>
      </header>

      {/* 제목 */}
      <h2 className="book-title">{title}</h2>

      {/* 표지 이미지 */}
      <div className="cover-box">
        <img src={coverImageUrl} alt="book cover" />
      </div>

      {/* 페이지 내용 */}
      <div className="page-content">
        <div className="page-number">📄 {currentPage} 페이지</div>

        <textarea
          className="page-textarea"
          value={pages[currentPage - 1]?.text || ""}
          onChange={(e) => handleTextChange(currentPage - 1, e.target.value)}
        ></textarea>

        {/* 페이지 이미지 */}
        {generatedImage ? (
          <div className="page-image-box">
            <img 
              src={generatedImage} 
              alt="동화 이미지" 
              className="w-full rounded-lg mt-4 shadow page-image"
            />
            <button
              className="regenerate-image-btn"
              onClick={handleGeneratePageImage}
              disabled={isGeneratingImage}
            >
              {isGeneratingImage ? "⏳ 생성 중..." : "🔄 이미지 재생성"}
            </button>
          </div>
        ) : (
          <button
            className="generate-image-btn"
            onClick={handleGeneratePageImage}
            disabled={isGeneratingImage}
          >
            {isGeneratingImage ? "⏳ 생성 중..." : "🎨 페이지 이미지 생성"}
          </button>
        )}
      </div>

      {/* 페이지 이동 버튼 */}
      <div className="page-controls">
        <button
          className="control-btn"
          disabled={currentPage === 1}
          onClick={() => handlePageChange(currentPage - 1)}
        >
          ← 이전
        </button>

        <button
          className="control-btn"
          disabled={currentPage === pages.length}
          onClick={() => handlePageChange(currentPage + 1)}
        >
          다음 →
        </button>
      </div>

      {/* 아래 버튼 */}
      <div className="bottom-actions">
        <button
          className="secondary-btn"
          onClick={handleAutoGenerate}
          disabled={isGenerating}
        >
          {isGenerating ? "⏳ 생성 중..." : "➕ 페이지 자동생성"}
        </button>

        <button
          className="pdf-btn"
          onClick={handleSaveAsPDF}
        >
          📕 빠른 PDF
        </button>

        <button
          className="pdf-btn"
          style={{ backgroundColor: "#8B5CF6" }}
          onClick={() => setShowPdfModal(true)}
        >
          ✨ 고급 PDF
        </button>

        <button
          className="primary-btn"
          onClick={handleSave}
        >
          💾 저장하기
        </button>
      </div>

      {/* PDF 내보내기 페이지 이동 버튼 */}
      <button
        className="export-page-btn"
        onClick={() => navigate("/storybook-export", {
          state: {
            title,
            pages,
            coverImageUrl
          }
        })}
      >
        📘 PDF 만들기 설정 페이지로 이동
      </button>

      {/* PDF 설정 모달 */}
      {showPdfModal && (
        <div className="modal-overlay" onClick={() => setShowPdfModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3 style={{ marginBottom: "20px", fontSize: "20px", fontWeight: "bold" }}>
              ✨ 고급 PDF 설정
            </h3>

            <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
              {/* 저자명 */}
              <div>
                <label style={{ display: "block", marginBottom: "5px", fontWeight: "500" }}>
                  👤 저자명
                </label>
                <input
                  type="text"
                  value={pdfOptions.author}
                  onChange={(e) => setPdfOptions({ ...pdfOptions, author: e.target.value })}
                  style={{
                    width: "100%",
                    padding: "8px",
                    border: "1px solid #ddd",
                    borderRadius: "4px"
                  }}
                />
              </div>

              {/* 페이지 방향 */}
              <div>
                <label style={{ display: "block", marginBottom: "5px", fontWeight: "500" }}>
                  📐 페이지 방향
                </label>
                <select
                  value={pdfOptions.layout}
                  onChange={(e) => setPdfOptions({ ...pdfOptions, layout: e.target.value as "vertical" | "horizontal" })}
                  style={{
                    width: "100%",
                    padding: "8px",
                    border: "1px solid #ddd",
                    borderRadius: "4px"
                  }}
                >
                  <option value="vertical">세로 (Portrait)</option>
                  <option value="horizontal">가로 (Landscape)</option>
                </select>
              </div>

              {/* 이미지 레이아웃 */}
              <div>
                <label style={{ display: "block", marginBottom: "5px", fontWeight: "500" }}>
                  🖼️ 이미지 레이아웃
                </label>
                <select
                  value={pdfOptions.textImageLayout}
                  onChange={(e) => setPdfOptions({ ...pdfOptions, textImageLayout: e.target.value as "image-right" | "image-top" })}
                  style={{
                    width: "100%",
                    padding: "8px",
                    border: "1px solid #ddd",
                    borderRadius: "4px"
                  }}
                >
                  <option value="image-top">이미지 상단 + 텍스트 하단</option>
                  <option value="image-right">텍스트 좌측 + 이미지 우측</option>
                </select>
              </div>

              {/* 파스텔 배경 */}
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <input
                  type="checkbox"
                  checked={pdfOptions.usePastelBackground}
                  onChange={(e) => setPdfOptions({ ...pdfOptions, usePastelBackground: e.target.checked })}
                  id="pastel-bg"
                />
                <label htmlFor="pastel-bg" style={{ fontWeight: "500" }}>
                  🎨 파스텔 배경 사용
                </label>
              </div>
            </div>

            {/* 버튼 */}
            <div style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
              <button
                onClick={() => setShowPdfModal(false)}
                style={{
                  flex: 1,
                  padding: "10px",
                  backgroundColor: "#ddd",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer"
                }}
              >
                취소
              </button>
              <button
                onClick={handleEnhancedPDF}
                style={{
                  flex: 1,
                  padding: "10px",
                  backgroundColor: "#8B5CF6",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                  fontWeight: "bold"
                }}
              >
                ✨ PDF 생성
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
