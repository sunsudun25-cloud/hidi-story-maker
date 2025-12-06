import { useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { generateNextPage } from "../services/geminiService";
import { generateImageViaFirebase } from "../services/firebaseFunctions";
import { exportStorybookToPDF, exportEnhancedPDF } from "../services/pdfService";
import { saveStorybook } from "../services/dbService";
import { useStorybook } from "../context/StorybookContext";
import "./StorybookEditor.css";

type PageData = {
  text: string;
  imageUrl?: string;
};

export default function StorybookEditor() {
  const navigate = useNavigate();
  const { state } = useLocation();
  
  // Context에서 가져오기
  const {
    storyPages,
    setStoryPages,
    currentPage,
    setCurrentPage,
    setImageForPage,
    setTextForPage,
    addNewPage,
    title: contextTitle,
    setTitle,
    prompt: contextPrompt,
    setPrompt,
    style: contextStyle,
    setStyle,
    coverImageUrl: contextCoverImageUrl,
    setCoverImageUrl,
  } = useStorybook();
  const [isGenerating, setIsGenerating] = useState(false);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [showPdfModal, setShowPdfModal] = useState(false);
  const [pdfOptions, setPdfOptions] = useState({
    author: "익명",
    layout: "vertical" as "vertical" | "horizontal",
    usePastelBackground: true,
    textImageLayout: "image-top" as "image-right" | "image-top"
  });

  // Context 초기화 (state가 있는 경우)
  useEffect(() => {
    if (state) {
      setTitle(state.title || '나의 동화책');
      setPrompt(state.prompt || '');
      setStyle(state.style || '동화 스타일');
      
      // 표지 이미지 확인 로직
      const coverUrl = state.coverImageUrl || '';
      if (coverUrl && !state.coverConfirmed) {
        const ok = confirm("이 이미지를 동화책 표지로 사용할까요?");
        
        if (!ok) {
          // 표지 다시 생성 페이지로 보내기
          navigate("/storybook", { state: { regenerateCover: true } });
          return;
        }

        // 표지 확정
        setCoverImageUrl(coverUrl);
        state.coverConfirmed = true;
      } else {
        setCoverImageUrl(coverUrl);
      }
      
      // 빈 페이지 1개로 초기화 (AI가 내용을 채울 예정)
      if (storyPages.length === 0) {
        setStoryPages([
          { text: "", imageUrl: undefined }
        ]);
      }
    }
  }, [state, navigate, setCoverImageUrl, setPrompt, setStoryPages, setStyle, setTitle, storyPages.length]);

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
  };

  // 텍스트 업데이트 핸들러 (Context 사용)
  const handleTextChange = (index: number, newText: string) => {
    setTextForPage(index, newText);
  };

  // 현재 페이지 AI 내용 생성 핸들러 (새로 추가!)
  const handleGenerateCurrentPageText = async () => {
    setIsGenerating(true);

    try {
      // 현재 페이지 이전의 페이지들 (최근 2개)
      const prevPages = storyPages.slice(0, currentPage - 1);
      const prevTexts = prevPages.slice(-2).map(p => p.text).filter(t => t.trim());
      
      // Gemini API로 현재 페이지 내용 생성
      const pageText = await generateNextPage(
        prevTexts.length > 0 ? prevTexts : [""], // 첫 페이지면 빈 배열
        style || "동화 스타일",
        prompt || contextPrompt  // 주제 전달로 일관성 유지
      );
      
      // 현재 페이지 텍스트 업데이트
      setTextForPage(currentPage - 1, pageText);

      alert("✨ AI가 페이지 내용을 생성했습니다!\n마음에 들지 않으면 수정하거나 다시 생성해주세요.");
    } catch (err) {
      console.error("페이지 생성 오류:", err);
      
      // 오류 시 fallback 제공
      setTextForPage(currentPage - 1, "AI가 내용을 생성하지 못했습니다. 직접 작성해주세요.");
      alert("⚠️ AI 생성에 실패했습니다. 직접 작성해주세요.");
    } finally {
      setIsGenerating(false);
    }
  };

  // 새 페이지 추가 핸들러 (기존 기능 유지)
  const handleAddNewPage = async () => {
    setIsGenerating(true);

    try {
      // 최근 2페이지만 참조 (컨텍스트 최적화)
      const prevTexts = storyPages.slice(-2).map(p => p.text).filter(t => t.trim());
      
      // Gemini API로 다음 페이지 생성 (주제 전달)
      const nextPageText = await generateNextPage(
        prevTexts, 
        style || "동화 스타일",
        prompt || contextPrompt  // 주제 전달로 일관성 유지
      );
      
      // 새 페이지 추가 (Context 사용)
      addNewPage(nextPageText);

      alert("✨ 새로운 페이지가 생성되었습니다!");
    } catch (err) {
      console.error("페이지 생성 오류:", err);
      
      // 오류 시 fallback 제공
      addNewPage("다음 모험이 곧 시작될 것 같아요…");
      alert("⚠️ AI 생성에 실패했지만 기본 텍스트를 추가했습니다. 직접 수정해주세요.");
    } finally {
      setIsGenerating(false);
    }
  };

  // 페이지 이미지 생성 핸들러
  const handleGeneratePageImage = async () => {
    const currentPageData = storyPages[currentPage - 1];
    
    if (!currentPageData.text.trim()) {
      alert("먼저 페이지 내용을 입력해주세요!");
      return;
    }

    setIsGeneratingImage(true);

    try {
      // 🔥 프롬프트 구성
      const prompt = `
동화책 장면에 어울리는 일러스트를 생성해주세요.
스타일: ${style || "동화 스타일"}
분위기: 따뜻하고 부드러운
장면 설명:
${currentPageData.text}
`;

      // 🔥 Firebase Functions를 사용해 이미지 생성
      const img = await generateImageViaFirebase(prompt);

      // 페이지 이미지 저장
      setImageForPage(currentPage - 1, img);

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
      // Context 상태 저장
      const storybookId = await saveStorybook({
        title: contextTitle || title,
        prompt: contextPrompt || prompt,
        style: contextStyle || style,
        coverImageUrl: contextCoverImageUrl || coverImageUrl,
        pages: storyPages,
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
        storyPages.map((page) => ({
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
        pages: storyPages.map((page) => ({
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
        <button className="header-btn" onClick={() => navigate("/home")}>🏠</button>
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

        {/* AI 내용 생성 버튼 (페이지가 비어있거나 적을 때만 표시) */}
        {(!storyPages[currentPage - 1]?.text || storyPages[currentPage - 1]?.text.trim().length < 10) && (
          <button
            className="generate-text-btn"
            onClick={handleGenerateCurrentPageText}
            disabled={isGenerating}
            style={{
              width: "100%",
              padding: "12px",
              marginBottom: "10px",
              backgroundColor: "#10B981",
              color: "white",
              border: "none",
              borderRadius: "8px",
              fontSize: "16px",
              fontWeight: "bold",
              cursor: isGenerating ? "not-allowed" : "pointer",
              opacity: isGenerating ? 0.6 : 1
            }}
          >
            {isGenerating ? "⏳ AI가 내용 생성 중..." : "✨ AI에게 페이지 내용 추천받기"}
          </button>
        )}

        <textarea
          className="page-textarea"
          value={storyPages[currentPage - 1]?.text || ""}
          onChange={(e) => handleTextChange(currentPage - 1, e.target.value)}
          placeholder="여기에 페이지 내용을 입력하거나, 위의 'AI에게 페이지 내용 추천받기' 버튼을 눌러주세요."
        ></textarea>

        {/* 페이지 이미지 */}
        {storyPages[currentPage - 1]?.imageUrl ? (
          <div className="page-image-box">
            <img 
              src={storyPages[currentPage - 1].imageUrl} 
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
          disabled={currentPage === storyPages.length}
          onClick={() => handlePageChange(currentPage + 1)}
        >
          다음 →
        </button>
      </div>

      {/* 아래 버튼 */}
      <div className="bottom-actions">
        <button
          className="secondary-btn"
          onClick={handleAddNewPage}
          disabled={isGenerating}
        >
          {isGenerating ? "⏳ 생성 중..." : "➕ 새 페이지 추가"}
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
            pages: storyPages,
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
