import { useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { generateNextPage, safeGeminiCall } from "../services/geminiService";
import { generateImageViaFirebase } from "../services/firebaseFunctions";
import { exportStorybookToPDF, exportEnhancedPDF } from "../services/pdfService";
import { saveStorybook } from "../services/dbService";
import { useStorybook } from "../context/StorybookContext";
import "./StorybookEditor.css";

/**
 * 🔥 StorybookEditor - 동화책 본문 편집 화면
 * 
 * 주요 기능:
 * - Manual/AISuggestion에서 생성된 초안 페이지 편집
 * - 페이지별 텍스트 수정
 * - 페이지별 이미지 생성 (Firebase Functions + DALL-E 3)
 * - AI 도움받기 (현재 페이지 내용 이어쓰기)
 * - 다음 페이지 자동 생성 (무한 페이지)
 * - PDF 생성 (간단 / 고급)
 * - 동화책 저장
 * 
 * ❌ 표지 이미지는 이 화면에서 표시하지 않음 (본문 편집 전용)
 */
export default function StorybookEditor() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as any | undefined;

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

  const [isGenerating, setIsGenerating] = useState(false);          // 페이지 자동 생성
  const [isGeneratingImage, setIsGeneratingImage] = useState(false); // 삽화 생성
  const [isAiHelping, setIsAiHelping] = useState(false);             // AI 도움받기
  const [showPdfModal, setShowPdfModal] = useState(false);
  const [showPageExtensionModal, setShowPageExtensionModal] = useState(false); // 페이지 확장 모달
  const [isAutoGeneratingImages, setIsAutoGeneratingImages] = useState(false); // 전체 이미지 자동 생성
  const [showCoverModal, setShowCoverModal] = useState(false);       // 표지 생성 모달
  const [isGeneratingCover, setIsGeneratingCover] = useState(false); // 표지 생성 중
  const [hasSuggestedCover, setHasSuggestedCover] = useState(false); // 표지 생성 제안 여부
  const [pdfOptions, setPdfOptions] = useState({
    author: "익명",
    layout: "vertical" as "vertical" | "horizontal",
    usePastelBackground: true,
    textImageLayout: "image-top" as "image-right" | "image-top",
  });

  // 👉 1. 초기 상태 세팅 (제목, 줄거리, 스타일, 페이지)
  useEffect(() => {
    if (state) {
      if (state.title) setTitle(state.title);
      if (state.prompt) setPrompt(state.prompt);
      if (state.style) setStyle(state.style);
      if (state.coverImageUrl) setCoverImageUrl(state.coverImageUrl);

      // Manual/AISuggestion 에서 넘어온 초안 페이지가 있다면 사용
      if (state.pages && Array.isArray(state.pages) && state.pages.length > 0) {
        if (storyPages.length === 0) {
          setStoryPages(
            state.pages.map((p: any) => ({
              text: p.text ?? "",
              imageUrl: p.imageUrl ?? undefined,
            }))
          );
        }
      }
    } else {
      // state 없이 들어온 경우 (예: 내 작품에서 편집)
      if (storyPages.length === 0) {
        // 방어적 기본값 – 완전 빈 페이지 1개
        setStoryPages([{ text: "", imageUrl: undefined }]);
      }
    }

    // 첫 페이지로 이동
    if (currentPage < 1) {
      setCurrentPage(1);
    }
  }, [state]);

  // 📖 10페이지 완성 시 표지 생성 제안
  useEffect(() => {
    if (storyPages.length === 10 && !hasSuggestedCover && !contextCoverImageUrl) {
      setShowCoverModal(true);
      setHasSuggestedCover(true);
    }
  }, [storyPages.length, hasSuggestedCover, contextCoverImageUrl]);

  // state도 없고 페이지도 없다면 에러 안내
  if (!state && storyPages.length === 0) {
    return (
      <div style={{ padding: 20 }}>
        ⚠ 동화책 정보가 없습니다.
        <br />
        홈에서 동화책을 다시 만들어 주세요.
        <button style={{ marginTop: 20 }} onClick={() => navigate("/storybook")}>
          동화책 만들기 화면으로
        </button>
      </div>
    );
  }

  const title = contextTitle || state?.title || "나의 동화책";
  const prompt = contextPrompt || state?.prompt || "";
  const style = contextStyle || state?.style || "동화 스타일";
  const coverImageUrl = contextCoverImageUrl || state?.coverImageUrl || "";

  // 📄 페이지 이동
  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > storyPages.length) return;
    setCurrentPage(newPage);
  };

  // ✏️ 텍스트 변경
  const handleTextChange = (index: number, newText: string) => {
    setTextForPage(index, newText);
  };

  // ➕ 다음 페이지 자동 생성 (무한 페이지)
  const handleAutoGenerate = async () => {
    setIsGenerating(true);
    try {
      const prevTexts = storyPages.map((p) => p.text);

      const nextPageText = await generateNextPage(
        prevTexts,
        prompt,
        style || "동화 스타일"
      );

      addNewPage(nextPageText);
      setCurrentPage(storyPages.length + 1);

      alert("✨ 새로운 페이지가 생성되었습니다!");
    } catch (err) {
      console.error("페이지 생성 오류:", err);
      alert("페이지 생성 중 오류가 발생했습니다. 다시 시도해주세요.");
    } finally {
      setIsGenerating(false);
    }
  };

  // 🆕 빈 페이지 추가 (직접 쓰기용)
  const handleAddBlankPage = () => {
    addNewPage("");
    setCurrentPage(storyPages.length + 1);
    alert("✨ 새로운 빈 페이지가 추가되었습니다!");
  };

  // 🆕 페이지 확장 모달 표시 (3페이지 이후)
  const handleShowExtensionModal = () => {
    setShowPageExtensionModal(true);
  };

  // 🆕 AI가 이어서 쓰기 선택
  const handleContinueWithAI = async () => {
    setShowPageExtensionModal(false);
    await handleAutoGenerate();
  };

  // 🆕 직접 쓰기 선택
  const handleWriteManually = () => {
    setShowPageExtensionModal(false);
    handleAddBlankPage();
  };

  // 🤖 현재 페이지에 대해 AI에게 도움받기
  const handleAiAssist = async () => {
    const pageIndex = currentPage - 1;
    const current = storyPages[pageIndex];

    if (!current || !current.text.trim()) {
      alert("먼저 이 페이지의 내용을 조금이라도 적어주세요!");
      return;
    }

    setIsAiHelping(true);
    try {
      const aiPrompt = `
당신은 어린이를 위한 동화책 작가입니다.
아래는 동화책의 제목과 전체 줄거리, 그리고 현재 페이지의 내용입니다.
현재 페이지의 내용을 자연스럽게 보완하거나, 다음 전개를 2~4문장 정도 이어서 제안해주세요.

제목: ${title}
전체 줄거리: ${prompt}

[현재 페이지 내용]
${current.text}

요청:
- 어린이가 이해하기 쉬운 문장
- 너무 길지 않게 2~4문장 정도
- 기존 내용과 자연스럽게 이어지게
`;

      const suggestion = await safeGeminiCall(aiPrompt);

      const newText = `${current.text.trim()}\n\n${suggestion.trim()}`;
      setTextForPage(pageIndex, newText);

      alert("🤖 AI가 내용을 이어줬어요! 필요 없는 부분은 자유롭게 지우셔도 됩니다.");
    } catch (err) {
      console.error("AI 도움 오류:", err);
      alert("AI가 도와주는 중에 오류가 발생했습니다. 다시 시도해주세요.");
    } finally {
      setIsAiHelping(false);
    }
  };

  // 🎨 현재 페이지 삽화 생성
  const handleGeneratePageImage = async () => {
    const pageIndex = currentPage - 1;
    const current = storyPages[pageIndex];

    if (!current || !current.text.trim()) {
      alert("먼저 페이지 내용을 입력해주세요!");
      return;
    }

    setIsGeneratingImage(true);
    try {
      const imgPrompt = `
동화책 장면에 어울리는 일러스트를 생성해주세요.
스타일: ${style || "동화 스타일"}
분위기: 따뜻하고 부드러운 느낌, 어린이가 좋아하는 그림체
장면 설명:
${current.text}

조건:
- 그림 안에 글자나 텍스트는 넣지 마세요.
- 표지 느낌이 아니라 본문 삽화 느낌으로 그려주세요.
`;

      const imageDataUrl = await generateImageViaFirebase(imgPrompt, style);

      setImageForPage(pageIndex, imageDataUrl);

      alert("🎨 페이지 이미지가 생성되었습니다!");
    } catch (err) {
      console.error("이미지 생성 오류:", err);
      alert("이미지 생성 중 오류가 발생했습니다. 다시 시도해주세요.");
    } finally {
      setIsGeneratingImage(false);
    }
  };

  // 🆕 모든 페이지 삽화 자동 생성
  const handleAutoGenerateAllImages = async () => {
    const emptyPages = storyPages.filter(p => !p.imageUrl && p.text.trim());
    
    if (emptyPages.length === 0) {
      alert("모든 페이지에 이미 이미지가 있거나, 내용이 비어있습니다!");
      return;
    }

    const confirmed = window.confirm(
      `${emptyPages.length}개 페이지의 삽화를 자동 생성하시겠습니까?\n\n` +
      `예상 소요 시간: 약 ${emptyPages.length * 30}초\n` +
      `(각 이미지당 약 30초 소요)`
    );

    if (!confirmed) return;

    setIsAutoGeneratingImages(true);
    
    try {
      let successCount = 0;
      
      for (let i = 0; i < storyPages.length; i++) {
        const page = storyPages[i];
        
        // 이미 이미지가 있거나 내용이 없으면 건너뛰기
        if (page.imageUrl || !page.text.trim()) {
          continue;
        }

        try {
          console.log(`🎨 페이지 ${i + 1} 이미지 생성 중...`);
          
          const imgPrompt = `
동화책 장면에 어울리는 일러스트를 생성해주세요.
스타일: ${style || "동화 스타일"}
분위기: 따뜻하고 부드러운 느낌, 어린이가 좋아하는 그림체
장면 설명:
${page.text}

조건:
- 그림 안에 글자나 텍스트는 넣지 마세요.
- 표지 느낌이 아니라 본문 삽화 느낌으로 그려주세요.
`;

          const imageDataUrl = await generateImageViaFirebase(imgPrompt, style);
          setImageForPage(i, imageDataUrl);
          successCount++;
          
          console.log(`✅ 페이지 ${i + 1} 이미지 생성 완료 (${successCount}/${emptyPages.length})`);
          
        } catch (err) {
          console.error(`❌ 페이지 ${i + 1} 이미지 생성 실패:`, err);
        }
      }

      alert(
        `🎨 삽화 자동 생성 완료!\n\n` +
        `성공: ${successCount}개\n` +
        `실패: ${emptyPages.length - successCount}개`
      );
      
    } catch (err) {
      console.error("전체 이미지 생성 오류:", err);
      alert("이미지 생성 중 오류가 발생했습니다. 다시 시도해주세요.");
    } finally {
      setIsAutoGeneratingImages(false);
    }
  };

  // 📖 표지 생성
  const handleGenerateCover = async () => {
    setIsGeneratingCover(true);
    try {
      const coverPrompt = `
동화책 표지 디자인을 생성해주세요.

제목: ${title}
줄거리: ${prompt}
스타일: ${style || "동화 스타일"}

조건:
- 표지는 책의 첫인상을 결정하는 중요한 요소입니다
- 제목과 줄거리의 핵심 내용을 담은 아름다운 일러스트
- 어린이가 보기에 매력적이고 따뜻한 느낌
- 그림 안에 텍스트나 글자는 넣지 마세요 (표지 디자인만)
`;

      const coverImage = await generateImageViaFirebase(coverPrompt, style);
      setCoverImageUrl(coverImage);
      
      alert("📖 표지가 생성되었습니다!\n\n만족스럽지 않다면 다시 생성할 수 있습니다.");
      setShowCoverModal(false);
      
    } catch (err) {
      console.error("표지 생성 오류:", err);
      alert("표지 생성 중 오류가 발생했습니다. 다시 시도해주세요.");
    } finally {
      setIsGeneratingCover(false);
    }
  };

  // 💾 저장 (1페이지 이상이면 저장 가능 - 중간 저장 지원)
  const handleSave = async () => {
    // 최소 1페이지 검증
    if (storyPages.length < 1) {
      alert('⚠️ 최소 1페이지 이상 작성해야 저장할 수 있습니다!');
      return;
    }

    // 10페이지 미만일 경우 안내 메시지
    if (storyPages.length < 10) {
      const confirmed = window.confirm(
        `📝 중간 저장하시겠습니까?\n\n` +
        `현재 페이지: ${storyPages.length}페이지\n` +
        `권장 페이지: 최소 10페이지\n\n` +
        `중간 저장 후 나중에 이어서 작성할 수 있습니다.`
      );
      if (!confirmed) return;
    }

    try {
      const storybookId = await saveStorybook({
        title,
        prompt,
        style,
        coverImageUrl,
        pages: storyPages,
        createdAt: new Date().toISOString(),
      });

      console.log("📘 저장된 동화책 ID:", storybookId);
      alert("✅ 동화책이 저장되었습니다!\n\n'내 작품'에서 확인하실 수 있어요.");
      navigate("/my-works");
    } catch (error) {
      console.error("동화책 저장 오류:", error);
      alert("저장 중 오류가 발생했습니다. 다시 시도해주세요.");
    }
  };

  // 📕 간단 PDF (최소 10페이지 검증)
  const handleSaveAsPDF = async () => {
    // 최소 10페이지 검증
    if (storyPages.length < 10) {
      alert(
        `⚠️ PDF는 최소 10페이지 이상이어야 생성할 수 있습니다!\n\n` +
        `현재 페이지: ${storyPages.length}페이지\n` +
        `필요한 페이지: ${10 - storyPages.length}페이지 더 추가하세요.`
      );
      return;
    }

    try {
      const date = new Date().toISOString().split("T")[0];
      const filename = `${title}_${date}.pdf`;

      await exportStorybookToPDF(
        storyPages.map((p) => ({
          text: p.text,
          image: p.imageUrl || null,
        })),
        filename
      );

      alert("📕 PDF가 다운로드되었습니다!");
    } catch (error) {
      console.error("PDF 생성 오류:", error);
      alert("PDF 생성 중 오류가 발생했습니다. 다시 시도해주세요.");
    }
  };

  // ✨ 고급 PDF (최소 10페이지 검증)
  const handleEnhancedPDF = async () => {
    // 최소 10페이지 검증
    if (storyPages.length < 10) {
      alert(
        `⚠️ PDF는 최소 10페이지 이상이어야 생성할 수 있습니다!\n\n` +
        `현재 페이지: ${storyPages.length}페이지\n` +
        `필요한 페이지: ${10 - storyPages.length}페이지 더 추가하세요.`
      );
      setShowPdfModal(false);
      return;
    }

    try {
      await exportEnhancedPDF({
        pages: storyPages.map((p) => ({
          text: p.text,
          image: p.imageUrl || null,
        })),
        title,
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

  const currentPageData = storyPages[currentPage - 1] || { text: "", imageUrl: undefined };

  return (
    <div className="editor-container">
      {/* 제목 */}
      <h2 className="book-title">{title}</h2>

      {/* ❌ 표지 이미지는 이 화면에서 보여주지 않습니다 (본문 편집 전용) */}

      {/* 페이지 내용 */}
      <div className="page-content">
        <div className="page-number">📄 {currentPage} 페이지 / {storyPages.length}</div>

        <textarea
          className="page-textarea"
          value={currentPageData.text}
          onChange={(e) => handleTextChange(currentPage - 1, e.target.value)}
        />

        {/* 🤖 AI 도움 버튼 */}
        <button
          className="ai-help-btn"
          onClick={handleAiAssist}
          disabled={isAiHelping}
        >
          {isAiHelping ? "🤖 생각 중..." : "🤖 이 페이지, AI에게 도움받기"}
        </button>

        {/* 페이지 이미지 */}
        {currentPageData.imageUrl ? (
          <div className="page-image-box">
            <img
              src={currentPageData.imageUrl}
              alt="동화 이미지"
              className="w-full rounded-lg mt-4 shadow page-image"
            />
            <button
              className="regenerate-image-btn"
              onClick={handleGeneratePageImage}
              disabled={isGeneratingImage}
            >
              {isGeneratingImage ? "⏳ 생성 중..." : "🔄 이미지 다시 만들기"}
            </button>
          </div>
        ) : (
          <button
            className="generate-image-btn"
            onClick={handleGeneratePageImage}
            disabled={isGeneratingImage}
          >
            {isGeneratingImage ? "⏳ 생성 중..." : "🎨 이 페이지 삽화 만들기"}
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

      {/* 🆕 3페이지 완성 후 안내 메시지 */}
      {storyPages.length === 3 && currentPage === 3 && (
        <div
          style={{
            padding: "20px",
            margin: "20px 0",
            backgroundColor: "#E3F2FD",
            border: "2px solid #2196F3",
            borderRadius: "12px",
            textAlign: "center",
          }}
        >
          <p style={{ fontSize: "18px", fontWeight: "bold", marginBottom: "15px", color: "#1976D2" }}>
            🎉 3페이지 초안이 완성되었습니다!
          </p>
          <p style={{ fontSize: "16px", color: "#333", lineHeight: "1.6" }}>
            동화책을 계속 작성하시겠어요?<br />
            아래 <strong>"➕ 페이지 추가하기"</strong> 버튼을 눌러<br />
            <strong>AI가 이어서 쓰기</strong> 또는 <strong>직접 쓰기</strong>를 선택하세요!
          </p>
        </div>
      )}

      {/* 🆕 페이지 확장 가이드 (10페이지 미만 시) */}
      {storyPages.length < 10 && (
        <div
          style={{
            padding: "15px",
            margin: "20px 0",
            backgroundColor: "#FFF3CD",
            border: "2px solid #FFC107",
            borderRadius: "8px",
            textAlign: "center",
          }}
        >
          <p style={{ fontSize: "16px", fontWeight: "bold", marginBottom: "10px" }}>
            ⚠️ PDF 생성은 최소 10페이지 이상 필요합니다!
          </p>
          <p style={{ fontSize: "14px", color: "#666" }}>
            현재: {storyPages.length}페이지 / 권장: 10페이지 이상
            <br />
            💾 중간 저장은 1페이지 이상이면 가능합니다!
          </p>
        </div>
      )}

      {/* 아래 액션 버튼들 */}
      <div className="bottom-actions">
        {/* 🆕 3페이지 이상일 때만 페이지 확장 모달 표시 */}
        {storyPages.length >= 3 ? (
          <button
            className="secondary-btn"
            onClick={handleShowExtensionModal}
            disabled={isGenerating}
            style={{ backgroundColor: "#4CAF50" }}
          >
            {isGenerating ? "⏳ 생성 중..." : "➕ 페이지 추가하기"}
          </button>
        ) : (
          <button
            className="secondary-btn"
            onClick={handleAutoGenerate}
            disabled={isGenerating}
          >
            {isGenerating ? "⏳ 생성 중..." : "➕ 다음 페이지 자동생성"}
          </button>
        )}

        {/* 🆕 전체 삽화 자동 생성 */}
        <button
          className="secondary-btn"
          onClick={handleAutoGenerateAllImages}
          disabled={isAutoGeneratingImages || isGeneratingImage}
          style={{ backgroundColor: "#FF9800" }}
        >
          {isAutoGeneratingImages ? "⏳ 생성 중..." : "🎨 모든 삽화 자동생성"}
        </button>

        <button
          className="pdf-btn"
          onClick={handleSaveAsPDF}
          disabled={storyPages.length < 10}
          style={{
            backgroundColor: storyPages.length < 10 ? "#ccc" : undefined,
            cursor: storyPages.length < 10 ? "not-allowed" : "pointer",
          }}
        >
          📕 빠른 PDF
        </button>

        <button
          className="pdf-btn"
          style={{
            backgroundColor: storyPages.length < 10 ? "#ccc" : "#8B5CF6",
            cursor: storyPages.length < 10 ? "not-allowed" : "pointer",
          }}
          onClick={() => setShowPdfModal(true)}
          disabled={storyPages.length < 10}
        >
          ✨ 고급 PDF
        </button>

        <button
          className="secondary-btn"
          onClick={() => setShowCoverModal(true)}
          disabled={isGeneratingCover}
          style={{ backgroundColor: "#FF6B6B", color: "white" }}
        >
          {isGeneratingCover ? "⏳ 생성 중..." : contextCoverImageUrl ? "📖 표지 재생성" : "📖 표지 만들기"}
        </button>

        <button
          className="primary-btn"
          onClick={handleSave}
          disabled={storyPages.length < 1}
          style={{
            backgroundColor: storyPages.length < 1 ? "#ccc" : undefined,
            cursor: storyPages.length < 1 ? "not-allowed" : "pointer",
          }}
        >
          💾 저장하기 {storyPages.length < 10 && `(${storyPages.length}/10)`}
        </button>
      </div>

      {/* PDF 설정 페이지로 이동 (선택 사항) */}
      <button
        className="export-page-btn"
        onClick={() =>
          navigate("/storybook-export", {
            state: {
              title,
              pages: storyPages,
              coverImageUrl,
            },
          })
        }
      >
        📘 PDF 만들기 설정 페이지로 이동
      </button>

      {/* 🆕 페이지 확장 모달 */}
      {showPageExtensionModal && (
        <div className="modal-overlay" onClick={() => setShowPageExtensionModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3 style={{ marginBottom: "20px", fontSize: "22px", fontWeight: "bold", textAlign: "center" }}>
              ➕ 페이지를 어떻게 추가하시겠어요?
            </h3>

            <p style={{ textAlign: "center", color: "#666", marginBottom: "30px" }}>
              현재 {storyPages.length}페이지
              {storyPages.length < 10 && ` / 최소 10페이지 필요 (${10 - storyPages.length}페이지 더 필요)`}
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
              {/* AI가 이어서 쓰기 */}
              <button
                onClick={handleContinueWithAI}
                disabled={isGenerating}
                style={{
                  padding: "20px",
                  backgroundColor: "#4CAF50",
                  color: "white",
                  border: "none",
                  borderRadius: "8px",
                  fontSize: "16px",
                  fontWeight: "bold",
                  cursor: isGenerating ? "not-allowed" : "pointer",
                  opacity: isGenerating ? 0.6 : 1,
                }}
              >
                🤖 AI가 이어서 쓰기
                <div style={{ fontSize: "14px", fontWeight: "normal", marginTop: "8px" }}>
                  AI가 자동으로 다음 페이지 내용을 생성합니다
                </div>
              </button>

              {/* 직접 쓰기 */}
              <button
                onClick={handleWriteManually}
                style={{
                  padding: "20px",
                  backgroundColor: "#2196F3",
                  color: "white",
                  border: "none",
                  borderRadius: "8px",
                  fontSize: "16px",
                  fontWeight: "bold",
                  cursor: "pointer",
                }}
              >
                ✍️ 내가 직접 쓰기
                <div style={{ fontSize: "14px", fontWeight: "normal", marginTop: "8px" }}>
                  빈 페이지를 추가하여 직접 내용을 입력합니다
                </div>
              </button>

              {/* 취소 */}
              <button
                onClick={() => setShowPageExtensionModal(false)}
                style={{
                  padding: "12px",
                  backgroundColor: "#ddd",
                  color: "#333",
                  border: "none",
                  borderRadius: "8px",
                  fontSize: "14px",
                  cursor: "pointer",
                }}
              >
                취소
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 📖 표지 생성 모달 */}
      {showCoverModal && (
        <div className="modal-overlay" onClick={() => setShowCoverModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3 style={{ marginBottom: "20px", fontSize: "22px", fontWeight: "bold", textAlign: "center" }}>
              🎉 10페이지 완성을 축하합니다!
            </h3>

            <p style={{ textAlign: "center", color: "#666", marginBottom: "30px", fontSize: "16px", lineHeight: "1.6" }}>
              동화책의 <strong>표지 이미지</strong>를 만들어볼까요?<br />
              AI가 제목과 줄거리를 바탕으로<br />
              아름다운 표지를 디자인해드립니다.
            </p>

            {contextCoverImageUrl && (
              <div style={{ textAlign: "center", marginBottom: "20px" }}>
                <img 
                  src={contextCoverImageUrl} 
                  alt="현재 표지" 
                  style={{ 
                    maxWidth: "200px", 
                    maxHeight: "200px", 
                    borderRadius: "12px",
                    border: "2px solid #ddd"
                  }} 
                />
                <p style={{ fontSize: "14px", color: "#666", marginTop: "10px" }}>
                  현재 표지
                </p>
              </div>
            )}

            <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
              {/* 표지 생성 */}
              <button
                onClick={handleGenerateCover}
                disabled={isGeneratingCover}
                style={{
                  padding: "20px",
                  backgroundColor: isGeneratingCover ? "#ccc" : "#FF6B6B",
                  color: "white",
                  border: "none",
                  borderRadius: "8px",
                  fontSize: "16px",
                  fontWeight: "bold",
                  cursor: isGeneratingCover ? "not-allowed" : "pointer",
                }}
              >
                {isGeneratingCover ? "⏳ 표지 생성 중..." : "📖 표지 만들기"}
                <div style={{ fontSize: "14px", fontWeight: "normal", marginTop: "8px" }}>
                  AI가 제목과 줄거리 기반으로 표지를 디자인합니다 (약 30초)
                </div>
              </button>

              {/* 나중에 만들기 */}
              <button
                onClick={() => setShowCoverModal(false)}
                style={{
                  padding: "12px",
                  backgroundColor: "#ddd",
                  color: "#333",
                  border: "none",
                  borderRadius: "8px",
                  fontSize: "14px",
                  cursor: "pointer",
                }}
              >
                나중에 만들기
              </button>
            </div>

            <p style={{ fontSize: "12px", color: "#999", marginTop: "15px", textAlign: "center" }}>
              💡 표지는 언제든지 저장 버튼 옆의 "📖 표지 만들기" 버튼으로 생성/재생성할 수 있습니다.
            </p>
          </div>
        </div>
      )}

      {/* PDF 설정 모달 */}
      {showPdfModal && (
        <div className="modal-overlay" onClick={() => setShowPdfModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3
              style={{
                marginBottom: "20px",
                fontSize: "20px",
                fontWeight: "bold",
              }}
            >
              ✨ 고급 PDF 설정
            </h3>

            <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
              {/* 저자명 */}
              <div>
                <label
                  style={{
                    display: "block",
                    marginBottom: "5px",
                    fontWeight: "500",
                  }}
                >
                  👤 저자명
                </label>
                <input
                  type="text"
                  value={pdfOptions.author}
                  onChange={(e) =>
                    setPdfOptions({ ...pdfOptions, author: e.target.value })
                  }
                  style={{
                    width: "100%",
                    padding: "8px",
                    border: "1px solid #ddd",
                    borderRadius: "4px",
                  }}
                />
              </div>

              {/* 페이지 방향 */}
              <div>
                <label
                  style={{
                    display: "block",
                    marginBottom: "5px",
                    fontWeight: "500",
                  }}
                >
                  📐 페이지 방향
                </label>
                <select
                  value={pdfOptions.layout}
                  onChange={(e) =>
                    setPdfOptions({
                      ...pdfOptions,
                      layout: e.target.value as "vertical" | "horizontal",
                    })
                  }
                  style={{
                    width: "100%",
                    padding: "8px",
                    border: "1px solid #ddd",
                    borderRadius: "4px",
                  }}
                >
                  <option value="vertical">세로 (Portrait)</option>
                  <option value="horizontal">가로 (Landscape)</option>
                </select>
              </div>

              {/* 이미지 레이아웃 */}
              <div>
                <label
                  style={{
                    display: "block",
                    marginBottom: "5px",
                    fontWeight: "500",
                  }}
                >
                  🖼️ 이미지 레이아웃
                </label>
                <select
                  value={pdfOptions.textImageLayout}
                  onChange={(e) =>
                    setPdfOptions({
                      ...pdfOptions,
                      textImageLayout: e.target.value as
                        | "image-right"
                        | "image-top",
                    })
                  }
                  style={{
                    width: "100%",
                    padding: "8px",
                    border: "1px solid #ddd",
                    borderRadius: "4px",
                  }}
                >
                  <option value="image-top">이미지 상단 + 텍스트 하단</option>
                  <option value="image-right">텍스트 좌측 + 이미지 우측</option>
                </select>
              </div>

              {/* 파스텔 배경 */}
              <div
                style={{ display: "flex", alignItems: "center", gap: "10px" }}
              >
                <input
                  type="checkbox"
                  checked={pdfOptions.usePastelBackground}
                  onChange={(e) =>
                    setPdfOptions({
                      ...pdfOptions,
                      usePastelBackground: e.target.checked,
                    })
                  }
                  id="pastel-bg"
                />
                <label htmlFor="pastel-bg" style={{ fontWeight: "500" }}>
                  🎨 파스텔 배경 사용
                </label>
              </div>
            </div>

            {/* 버튼 */}
            <div
              style={{
                display: "flex",
                gap: "10px",
                marginTop: "20px",
              }}
            >
              <button
                onClick={() => setShowPdfModal(false)}
                style={{
                  flex: 1,
                  padding: "10px",
                  backgroundColor: "#ddd",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
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
                  fontWeight: "bold",
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
