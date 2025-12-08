import { useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { safeGeminiCall } from "../services/geminiService";
import { generateImageViaFirebase } from "../services/firebaseFunctions";
import { saveStorybook } from "../services/dbService";
import { useStorybook } from "../context/StorybookContext";
import StorybookLayout from "../components/storybook/StorybookLayout";

export default function StorybookEditorModify() {
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
    coverImageUrl,
    setCoverImageUrl,
  } = useStorybook();

  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [isAiHelping, setIsAiHelping] = useState(false);
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [isGeneratingCover, setIsGeneratingCover] = useState(false);

  // 수정 모드: 기존 작품 데이터 로드
  useEffect(() => {
    if (state && state.pages && state.pages.length > 0) {
      setTitle(state.title || "");
      setPrompt(state.prompt || "");
      setStyle(state.style || "동화 스타일");
      setCoverImageUrl(state.coverImageUrl || "");
      
      setStoryPages(
        state.pages.map((p: any) => ({
          text: p.text ?? "",
          imageUrl: p.imageUrl ?? undefined,
        }))
      );

      if (currentPage < 1) {
        setCurrentPage(1);
      }
    } else {
      // 데이터 없으면 작품 관리로 리다이렉트
      alert("⚠ 수정할 작품 정보가 없습니다.");
      navigate("/my-works");
    }
  }, [state]);

  if (!state || !state.pages || state.pages.length === 0) {
    return (
      <StorybookLayout title="📚 동화책 편집">
        <div style={{ padding: 20 }}>
          ⚠ 수정할 작품 정보가 없습니다.
          <br />
          <button style={{ marginTop: 20 }} onClick={() => navigate("/my-works")}>
            내 작품 관리로 이동
          </button>
        </div>
      </StorybookLayout>
    );
  }

  const title = contextTitle || state?.title || "나의 동화책";
  const prompt = contextPrompt || state?.prompt || "";
  const style = contextStyle || state?.style || "동화 스타일";

  const handlePageChange = (direction: 'prev' | 'next') => {
    if (direction === 'prev') {
      if (currentPage > 1) {
        setCurrentPage(currentPage - 1);
      }
    } else {
      // 다음 페이지로 이동
      if (currentPage < storyPages.length) {
        // 기존 페이지가 있으면 이동
        setCurrentPage(currentPage + 1);
      } else {
        // 10페이지 도달 시 완성 확인 모달
        if (storyPages.length === 10) {
          setShowCompletionModal(true);
          return;
        }
        
        // 마지막 페이지면 새 빈 페이지 추가
        addNewPage("");
        setCurrentPage(storyPages.length + 1);
      }
    }
  };

  // 계속 쓰기 선택
  const handleContinueWriting = () => {
    setShowCompletionModal(false);
    addNewPage("");
    setCurrentPage(storyPages.length + 1);
  };

  // 완성 모드로 이동
  const handleCompleteStorybook = () => {
    setShowCompletionModal(false);
    navigate("/storybook-export", {
      state: { title, pages: storyPages, coverImageUrl },
    });
  };

  const handleTextChange = (index: number, newText: string) => {
    setTextForPage(index, newText);
  };

  const handleAiAssist = async () => {
    const pageIndex = currentPage - 1;
    const current = storyPages[pageIndex];

    setIsAiHelping(true);
    try {
      let aiPrompt = "";

      // 현재 페이지가 비어있는 경우 → 이전 페이지들을 참고해서 이어쓰기
      if (!current || !current.text.trim()) {
        // 이전 페이지들의 내용 수집
        const previousPages = storyPages
          .slice(0, pageIndex)
          .filter(p => p.text && p.text.trim())
          .map((p, idx) => `[${idx + 1}페이지]\n${p.text}`)
          .join("\n\n");

        if (!previousPages) {
          alert("이전 페이지에 내용이 없습니다. 먼저 1페이지를 작성해주세요!");
          setIsAiHelping(false);
          return;
        }

        aiPrompt = `
당신은 어린이를 위한 동화책 작가입니다.
아래 이전 페이지들의 내용을 자연스럽게 이어서 새로운 페이지를 작성해주세요.

제목: ${title}
줄거리: ${prompt}

${previousPages}

위 내용을 이어서 3~5문장으로 다음 페이지를 작성해주세요.
`;

        const newPageText = await safeGeminiCall(aiPrompt);
        setTextForPage(pageIndex, newPageText.trim());
        alert("✨ AI가 이어서 새 페이지를 작성했어요!");
      } else {
        // 현재 페이지에 내용이 있는 경우 → 현재 페이지 내용을 확장
        aiPrompt = `
당신은 어린이를 위한 동화책 작가입니다.
아래 내용을 자연스럽게 이어서 2~4문장 추가해주세요.

제목: ${title}
줄거리: ${prompt}

[현재 페이지]
${current.text}
`;

        const suggestion = await safeGeminiCall(aiPrompt);
        const newText = `${current.text.trim()}\n\n${suggestion.trim()}`;
        setTextForPage(pageIndex, newText);
        alert("✨ AI가 내용을 추가했어요!");
      }
    } catch (err) {
      console.error("AI 도움 오류:", err);
      alert("AI 도움 중 오류가 발생했습니다.");
    } finally {
      setIsAiHelping(false);
    }
  };

  const handleGeneratePageImage = async () => {
    const pageIndex = currentPage - 1;
    const current = storyPages[pageIndex];

    if (!current || !current.text.trim()) {
      alert("먼저 내용을 입력해주세요!");
      return;
    }

    setIsGeneratingImage(true);
    try {
      const imgPrompt = `
동화책 본문 삽화 생성
스타일: ${style}
내용: ${current.text}
(그림 안에 텍스트 넣지 말기)
`;

      const imageDataUrl = await generateImageViaFirebase(imgPrompt, style);
      setImageForPage(pageIndex, imageDataUrl);
      alert("🎨 이미지가 생성되었습니다!");
    } catch (err) {
      console.error("이미지 생성 오류:", err);
      alert("이미지 생성 중 오류가 발생했습니다.");
    } finally {
      setIsGeneratingImage(false);
    }
  };

  const handleGenerateCover = async () => {
    if (!title || !prompt) {
      alert("제목과 줄거리가 필요합니다!");
      return;
    }

    setIsGeneratingCover(true);
    try {
      const coverPrompt = `
동화책 표지 이미지 생성
제목: ${title}
줄거리: ${prompt}
스타일: ${style}

표지 디자인 요구사항:
- 동화책 표지로 적합한 구도
- 제목과 주요 캐릭터가 돋보이도록
- 어린이에게 친근한 느낌
- 그림 안에 텍스트 넣지 말기 (텍스트는 나중에 추가)
`;

      const coverImageDataUrl = await generateImageViaFirebase(coverPrompt, style);
      setCoverImageUrl(coverImageDataUrl);
      alert("📕 표지가 생성되었습니다!");
    } catch (err) {
      console.error("표지 생성 오류:", err);
      alert("표지 생성 중 오류가 발생했습니다.");
    } finally {
      setIsGeneratingCover(false);
    }
  };

  const handleSave = async () => {
    if (storyPages.length < 1) {
      alert("최소 1페이지 이상 작성해야 저장할 수 있습니다!");
      return;
    }

    try {
      await saveStorybook({
        title,
        prompt,
        style,
        coverImageUrl: coverImageUrl || "",
        pages: storyPages,
        createdAt: new Date().toISOString(),
      });

      alert("✅ 수정 내용이 저장되었습니다!");
      navigate("/my-works");
    } catch (err) {
      console.error("저장 오류:", err);
      alert("저장 중 오류가 발생했습니다.");
    }
  };

  const currentPageData = storyPages[currentPage - 1] || { text: "", imageUrl: undefined };

  return (
    <StorybookLayout title="📚 동화책 편집">
      <div style={{ display: "flex", flexDirection: "column", gap: 15 }}>
        {/* 제목 */}
        <h2 style={{ fontSize: 20, fontWeight: 700, textAlign: "center", margin: 0 }}>
          {title || "제목 없음"}
        </h2>

        {/* 표지 섹션 */}
        <div style={{ 
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", 
          borderRadius: 12, 
          padding: 20,
          color: "white"
        }}>
          <h3 style={{ fontSize: 18, fontWeight: 700, margin: "0 0 10px 0" }}>📕 동화책 표지</h3>
          {coverImageUrl ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <img
                src={coverImageUrl}
                alt="표지"
                style={{ width: "100%", borderRadius: 8, border: "3px solid white" }}
              />
              <button
                onClick={handleGenerateCover}
                disabled={isGeneratingCover}
                style={{
                  padding: 12,
                  background: "rgba(255, 255, 255, 0.2)",
                  color: "white",
                  border: "2px solid white",
                  borderRadius: 8,
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: isGeneratingCover ? "not-allowed" : "pointer",
                }}
              >
                {isGeneratingCover ? "⏳ 생성 중..." : "🔄 표지 다시 만들기"}
              </button>
            </div>
          ) : (
            <div>
              <p style={{ fontSize: 14, margin: "0 0 10px 0", opacity: 0.9 }}>
                동화책의 첫인상을 결정하는 표지를 만들어보세요!
              </p>
              <button
                onClick={handleGenerateCover}
                disabled={isGeneratingCover}
                style={{
                  width: "100%",
                  padding: 15,
                  background: "white",
                  color: "#667eea",
                  border: "none",
                  borderRadius: 8,
                  fontSize: 16,
                  fontWeight: 700,
                  cursor: isGeneratingCover ? "not-allowed" : "pointer",
                  opacity: isGeneratingCover ? 0.7 : 1,
                }}
              >
                {isGeneratingCover ? "⏳ 생성 중..." : "✨ 표지 만들기"}
              </button>
            </div>
          )}
        </div>

        {/* 보조작가 모드 안내 */}
        <div style={{ 
          background: "#F0F9FF", 
          border: "2px solid #3B82F6", 
          borderRadius: 12, 
          padding: 15
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
            <span style={{ fontSize: 24 }}>🤖</span>
            <strong style={{ fontSize: 16, color: "#1E40AF" }}>AI 보조작가 모드</strong>
          </div>
          <p style={{ fontSize: 14, color: "#1E40AF", margin: 0, lineHeight: 1.5 }}>
            빈 페이지에서 <strong>"✨ AI가 이어서 쓰기"</strong>를 누르면 AI가 이전 페이지를 기억하고 자동으로 이어서 작성해줍니다.
          </p>
        </div>

        {/* 페이지 번호 */}
        <div style={{ textAlign: "center", fontSize: 14, color: "#666" }}>
          📄 {currentPage} / {storyPages.length} 페이지
        </div>

        {/* 텍스트 편집 */}
        <textarea
          value={currentPageData.text}
          onChange={(e) => handleTextChange(currentPage - 1, e.target.value)}
          placeholder="여기에 동화 내용을 입력하거나 AI가 이어쓰기를 선택하세요..."
          style={{
            width: "100%",
            minHeight: 150,
            padding: 15,
            fontSize: 16,
            border: "2px solid #E5E7EB",
            borderRadius: 12,
            resize: "vertical",
          }}
        />

        {/* 1. 페이지 이동 (최상단) */}
        <div style={{ display: "flex", gap: 10 }}>
          <button
            onClick={() => handlePageChange('prev')}
            disabled={currentPage === 1}
            style={{
              flex: 1,
              padding: 12,
              background: currentPage === 1 ? "#D1D5DB" : "#6B7280",
              color: "white",
              border: "none",
              borderRadius: 8,
              fontSize: 16,
              fontWeight: 600,
              cursor: currentPage === 1 ? "not-allowed" : "pointer",
            }}
          >
            ← 이전
          </button>
          <button
            onClick={() => handlePageChange('next')}
            style={{
              flex: 1,
              padding: 12,
              background: "#6B7280",
              color: "white",
              border: "none",
              borderRadius: 8,
              fontSize: 16,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            다음 →
          </button>
        </div>

        {/* 2. AI 이어쓰기 */}
        <button
          onClick={handleAiAssist}
          disabled={isAiHelping}
          style={{
            padding: 12,
            background: isAiHelping ? "#D1D5DB" : "#10B981",
            color: "white",
            border: "none",
            borderRadius: 8,
            fontSize: 16,
            fontWeight: 600,
            cursor: isAiHelping ? "not-allowed" : "pointer",
          }}
        >
          {isAiHelping ? "⏳ AI가 쓰는 중..." : "✨ AI가 이어서 쓰기"}
        </button>

        {/* 3. 삽화 만들기 */}
        {currentPageData.imageUrl ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <img
              src={currentPageData.imageUrl}
              alt="삽화"
              style={{ width: "100%", borderRadius: 12, border: "2px solid #E5E7EB" }}
            />
            <button
              onClick={handleGeneratePageImage}
              disabled={isGeneratingImage}
              style={{
                padding: 10,
                background: "#F59E0B",
                color: "white",
                border: "none",
                borderRadius: 8,
                fontSize: 14,
                fontWeight: 600,
                cursor: isGeneratingImage ? "not-allowed" : "pointer",
              }}
            >
              {isGeneratingImage ? "⏳ 생성 중..." : "🔄 이미지 다시 만들기"}
            </button>
          </div>
        ) : (
          <button
            onClick={handleGeneratePageImage}
            disabled={isGeneratingImage}
            style={{
              padding: 15,
              background: isGeneratingImage ? "#D1D5DB" : "#8B5CF6",
              color: "white",
              border: "none",
              borderRadius: 8,
              fontSize: 16,
              fontWeight: 600,
              cursor: isGeneratingImage ? "not-allowed" : "pointer",
            }}
          >
            {isGeneratingImage ? "⏳ 생성 중..." : "🎨 삽화 만들기"}
          </button>
        )}

        {/* 4. 저장하기 */}
        <button
          onClick={handleSave}
          style={{
            padding: 15,
            background: "#EF4444",
            color: "white",
            border: "none",
            borderRadius: 8,
            fontSize: 16,
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          💾 저장하기 ({storyPages.length}페이지)
        </button>

        {/* 5. PDF 설정 페이지로 이동 (최하단) */}
        <button
          onClick={() =>
            navigate("/storybook-export", {
              state: { title, pages: storyPages, coverImageUrl },
            })
          }
          style={{
            padding: 12,
            background: "#F3F4F6",
            color: "#374151",
            border: "2px solid #E5E7EB",
            borderRadius: 8,
            fontSize: 14,
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          📘 PDF 설정 페이지로 이동
        </button>
      </div>

      {/* 10페이지 완성 확인 모달 */}
      {showCompletionModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0, 0, 0, 0.6)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            padding: 20,
          }}
          onClick={() => setShowCompletionModal(false)}
        >
          <div
            style={{
              background: "#fff",
              borderRadius: 16,
              maxWidth: 400,
              width: "100%",
              padding: 30,
              boxShadow: "0 10px 40px rgba(0, 0, 0, 0.2)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* 아이콘 */}
            <div style={{ textAlign: "center", fontSize: 64, marginBottom: 20 }}>
              🎉
            </div>

            {/* 제목 */}
            <h3 style={{ fontSize: 22, fontWeight: 700, textAlign: "center", margin: "0 0 15px 0", color: "#2c3e50" }}>
              10페이지를 작성하셨습니다!
            </h3>

            {/* 설명 */}
            <p style={{ fontSize: 16, textAlign: "center", color: "#7f8c8d", margin: "0 0 25px 0", lineHeight: 1.6 }}>
              동화책을 완성하시겠어요?<br />
              아니면 계속 작성하시겠어요?
            </p>

            {/* 버튼 */}
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <button
                onClick={handleCompleteStorybook}
                style={{
                  padding: 16,
                  background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  color: "white",
                  border: "none",
                  borderRadius: 12,
                  fontSize: 18,
                  fontWeight: 700,
                  cursor: "pointer",
                  boxShadow: "0 4px 12px rgba(102, 126, 234, 0.4)",
                }}
              >
                ✅ 완성하기 (PDF로 내보내기)
              </button>

              <button
                onClick={handleContinueWriting}
                style={{
                  padding: 16,
                  background: "#fff",
                  color: "#667eea",
                  border: "2px solid #667eea",
                  borderRadius: 12,
                  fontSize: 18,
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                ✏️ 계속 쓰기 (11페이지로)
              </button>
            </div>
          </div>
        </div>
      )}
    </StorybookLayout>
  );
}
