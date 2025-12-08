import { useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { generateNextPage, safeGeminiCall } from "../services/geminiService";
import { generateImageViaFirebase } from "../services/firebaseFunctions";
import { saveStorybook } from "../services/dbService";
import { useStorybook } from "../context/StorybookContext";
import StorybookLayout from "../components/storybook/StorybookLayout";

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
  } = useStorybook();

  const [isGenerating, setIsGenerating] = useState(false);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [isAiHelping, setIsAiHelping] = useState(false);

  useEffect(() => {
    if (state) {
      if (state.title) setTitle(state.title);
      if (state.prompt) setPrompt(state.prompt);
      if (state.style) setStyle(state.style);

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
      if (storyPages.length === 0) {
        setStoryPages([{ text: "", imageUrl: undefined }]);
      }
    }

    if (currentPage < 1) {
      setCurrentPage(1);
    }
  }, [state]);

  if (!state && storyPages.length === 0) {
    return (
      <StorybookLayout title="📚 동화책 편집">
        <div style={{ padding: 20 }}>
          ⚠ 동화책 정보가 없습니다.
          <br />
          홈에서 동화책을 다시 만들어 주세요.
          <button style={{ marginTop: 20 }} onClick={() => navigate("/storybook")}>
            동화책 만들기 화면으로
          </button>
        </div>
      </StorybookLayout>
    );
  }

  const title = contextTitle || state?.title || "나의 동화책";
  const prompt = contextPrompt || state?.prompt || "";
  const style = contextStyle || state?.style || "동화 스타일";

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > storyPages.length) return;
    setCurrentPage(newPage);
  };

  const handleTextChange = (index: number, newText: string) => {
    setTextForPage(index, newText);
  };

  const handleAutoGenerate = async () => {
    setIsGenerating(true);
    try {
      const prevTexts = storyPages.map((p) => p.text);
      const nextPageText = await generateNextPage(prevTexts, prompt, style);
      addNewPage(nextPageText);
      setCurrentPage(storyPages.length + 1);
      alert("✨ 새 페이지가 생성되었습니다!");
    } catch (err) {
      console.error("페이지 생성 오류:", err);
      alert("페이지 생성 중 오류가 발생했습니다.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAiAssist = async () => {
    const pageIndex = currentPage - 1;
    const current = storyPages[pageIndex];

    if (!current || !current.text.trim()) {
      alert("먼저 이 페이지의 내용을 입력해주세요!");
      return;
    }

    setIsAiHelping(true);
    try {
      const aiPrompt = `
당신은 어린이를 위한 동화책 작가입니다.
아래 내용을 자연스럽게 이어서 2~4문장 제안해주세요.

제목: ${title}
줄거리: ${prompt}

[현재 페이지]
${current.text}
`;

      const suggestion = await safeGeminiCall(aiPrompt);
      const newText = `${current.text.trim()}\n\n${suggestion.trim()}`;
      setTextForPage(pageIndex, newText);
      alert("🤖 AI가 내용을 이어줬어요!");
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
        coverImageUrl: "",
        pages: storyPages,
        createdAt: new Date().toISOString(),
      });

      alert("✅ 저장되었습니다!");
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
          {title}
        </h2>

        {/* 페이지 번호 */}
        <div style={{ textAlign: "center", fontSize: 14, color: "#666" }}>
          📄 {currentPage} / {storyPages.length} 페이지
        </div>

        {/* 텍스트 편집 */}
        <textarea
          value={currentPageData.text}
          onChange={(e) => handleTextChange(currentPage - 1, e.target.value)}
          placeholder="여기에 동화 내용을 입력하세요..."
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

        {/* AI 도움 버튼 */}
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
          {isAiHelping ? "⏳ 생성 중..." : "🤖 AI에게 도움받기"}
        </button>

        {/* 이미지 */}
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

        {/* 페이지 이동 */}
        <div style={{ display: "flex", gap: 10 }}>
          <button
            onClick={() => handlePageChange(currentPage - 1)}
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
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === storyPages.length}
            style={{
              flex: 1,
              padding: 12,
              background: currentPage === storyPages.length ? "#D1D5DB" : "#6B7280",
              color: "white",
              border: "none",
              borderRadius: 8,
              fontSize: 16,
              fontWeight: 600,
              cursor: currentPage === storyPages.length ? "not-allowed" : "pointer",
            }}
          >
            다음 →
          </button>
        </div>

        {/* 페이지 추가 */}
        <button
          onClick={handleAutoGenerate}
          disabled={isGenerating}
          style={{
            padding: 15,
            background: isGenerating ? "#D1D5DB" : "#3B82F6",
            color: "white",
            border: "none",
            borderRadius: 8,
            fontSize: 16,
            fontWeight: 600,
            cursor: isGenerating ? "not-allowed" : "pointer",
          }}
        >
          {isGenerating ? "⏳ 생성 중..." : "➕ 다음 페이지 자동 생성"}
        </button>

        {/* 저장 */}
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

        {/* PDF 설정 페이지로 이동 */}
        <button
          onClick={() =>
            navigate("/storybook-export", {
              state: { title, pages: storyPages, coverImageUrl: "" },
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
    </StorybookLayout>
  );
}
