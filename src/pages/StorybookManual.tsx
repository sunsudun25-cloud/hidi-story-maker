import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { safeGeminiCall } from "../services/geminiService";
import { useStorybook } from "../context/StorybookContext";
import LoadingSpinner from "../components/LoadingSpinner";
import StorybookLayout from "../components/storybook/StorybookLayout";
import "./Storybook/Storybook.css";
import "./StorybookManual.css";

export default function StorybookManual() {
  const navigate = useNavigate();
  const location = useLocation();
  const storybookContext = useStorybook();

  // AI 추천 페이지에서 전달받은 데이터
  const receivedTitle = location.state?.title || "";
  const receivedPrompt = location.state?.prompt || "";

  const [storyTitle, setStoryTitle] = useState(receivedTitle);
  const [storyPrompt, setStoryPrompt] = useState(receivedPrompt);
  const [selectedStyle, setSelectedStyle] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showAiModal, setShowAiModal] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);
  const [isLoadingAI, setIsLoadingAI] = useState(false);

  // 전달받은 데이터가 있으면 설정
  useEffect(() => {
    if (receivedTitle) setStoryTitle(receivedTitle);
    if (receivedPrompt) setStoryPrompt(receivedPrompt);
  }, [receivedTitle, receivedPrompt]);

  // AI 줄거리 추천 받기
  const handleAiSuggestion = async () => {
    setShowAiModal(true);
    setIsLoadingAI(true);
    try {
      const prompt = `
당신은 어린이 동화책 작가입니다.
흥미롭고 교육적이며 따뜻한 동화책 줄거리를 3가지 추천해주세요.

각 줄거리는:
- 2~3문장으로 간결하게 작성
- 어린이가 공감할 수 있는 주제
- 긍정적이고 희망적인 메시지 포함

⚠️ 중요: 제목 없이 줄거리 내용만 작성해주세요.

출력 형식 예시:
1. 달빛을 먹으면 힘이 나는 토끼가 친구들과 모험하는 이야기. 어려움을 겪지만 함께 힘을 모아 극복합니다.
2. 숲 속 작은 마을에서 마법의 씨앗을 심은 아이의 이야기. 정성껏 가꾸자 아름다운 꽃이 피어납니다.
3. 하늘에서 떨어진 별똥별을 주운 소녀가 소원을 이루는 과정. 욕심 대신 남을 돕는 마음을 배웁니다.
      `.trim();

      const response = await safeGeminiCall(prompt);
      
      // 응답 파싱
      const suggestions = response
        .split(/\d+\.\s*/)
        .filter((s: string) => s.trim().length > 10)
        .slice(0, 3);

      setAiSuggestions(suggestions.length > 0 ? suggestions : ["AI가 줄거리를 생성하지 못했습니다."]);
    } catch (err) {
      console.error("AI 줄거리 추천 오류:", err);
      alert("AI 줄거리 추천 중 오류가 발생했습니다.");
      setShowAiModal(false);
    } finally {
      setIsLoadingAI(false);
    }
  };

  // 줄거리 선택
  const handleSelectSuggestion = (suggestion: string) => {
    setStoryPrompt(suggestion);
    setShowAiModal(false);
  };

  const styles = [
    { id: "fairytale", label: "동화 스타일", desc: "아이 책 느낌" },
    { id: "watercolor", label: "수채화", desc: "부드럽고 번지는 느낌" },
    { id: "pastel", label: "파스텔톤", desc: "은은하고 차분한 색감" },
    { id: "warm", label: "따뜻한 느낌", desc: "햇살 같은 분위기" },
  ];

  /** 
   * 🔥 핵심 변경 포인트:
   * - 표지 생성 ❌ 제거
   * - 본문 3페이지 초안 생성 ✅ 추가
   * - Editor로 pages 배열 전달 ✅
   */
  const handleCreateStorybook = async () => {
    if (!storyTitle.trim()) {
      alert("동화책 제목을 입력해주세요!");
      return;
    }
    if (!storyPrompt.trim()) {
      alert("동화책 줄거리를 입력해주세요!");
      return;
    }

    console.log("📘 동화책 초안 생성:", { title: storyTitle, prompt: storyPrompt, style: selectedStyle });

    setIsGenerating(true);
    try {
      // ------------------------------
      // 1) Gemini AI로 3페이지 초안 생성
      // ------------------------------
      const generationPrompt = `
당신은 어린이를 위한 동화책 작가입니다.
사용자의 줄거리를 기반으로 초안 3페이지를 작성하세요.

제목: ${storyTitle}
줄거리: ${storyPrompt}

각 페이지는 3~5문장으로 구성하세요.
따뜻하고 희망적인 이야기로 작성해주세요.

출력 형식:
[page1]
내용...

[page2]
내용...

[page3]
내용...
      `;

      const raw = await safeGeminiCall(generationPrompt);

      // ------------------------------
      // 2) 페이지 분리 및 파싱 (null 체크 추가)
      // ------------------------------
      let pages: any[] = [];

      if (raw && typeof raw === "string") {
        const blocks = raw.split(/\[page\d+\]/);
        
        blocks.forEach(block => {
          const text = block.trim();
          if (text && text.length > 10) {
            pages.push({ text });
          }
        });
      }

      // 최소 1페이지는 보장 (fallback)
      if (pages.length === 0) {
        pages.push({ text: "AI가 내용을 생성하지 못했습니다. 다시 시도해주세요." });
      }

      console.log("✅ 생성된 페이지:", pages.length);

      // ------------------------------
      // 3) Context에 저장
      // ------------------------------
      storybookContext.resetStorybook();
      storybookContext.setTitle(storyTitle);
      storybookContext.setPrompt(storyPrompt);
      storybookContext.setStyle(selectedStyle || "동화 스타일");
      storybookContext.setStoryPages(pages);

      // ------------------------------
      // 4) Editor로 이동 (pages 전달)
      // ------------------------------
      navigate("/storybook-editor", {
        state: {
          title: storyTitle,
          prompt: storyPrompt,
          style: selectedStyle || "동화 스타일",
          pages,
        },
      });

    } catch (err) {
      console.error("초안 생성 오류:", err);
      alert("동화책 초안 생성 중 오류가 발생했습니다. 다시 시도해주세요.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <StorybookLayout title="📚 동화책 만들기">
      {isGenerating ? (
        <LoadingSpinner text="AI가 동화책 초안을 만드는 중이에요... 📚✨" />
      ) : (
        <div className="storybook-manual-page">
          {/* 제목 입력 (크게) */}
          <div className="manual-section">
            <label className="manual-label">📘 동화책 제목</label>
            <input
              className="manual-title-input"
              placeholder="예: 달빛을 먹는 토끼"
              value={storyTitle}
              onChange={(e) => setStoryTitle(e.target.value)}
            />
          </div>

          {/* 줄거리 입력 영역 */}
          <div className="manual-section">
            <label className="manual-label">📖 줄거리</label>
            <textarea
              className="manual-plot-textarea"
              placeholder="동화책 줄거리를 입력하거나 아래 버튼으로 AI 추천을 받아보세요..."
              value={storyPrompt}
              onChange={(e) => setStoryPrompt(e.target.value)}
              rows={8}
            />
          </div>

          {/* 줄거리 입력 방법 선택 버튼 */}
          <div className="manual-input-methods">
            <button 
              className="method-btn direct"
              onClick={() => {
                // 텍스트 에리어에 포커스
                const textarea = document.querySelector('.manual-plot-textarea') as HTMLTextAreaElement;
                textarea?.focus();
              }}
            >
              <span className="method-icon">📝</span>
              <span className="method-text">줄거리 직접 입력하기</span>
            </button>
            
            <button 
              className="method-btn ai"
              onClick={handleAiSuggestion}
            >
              <span className="method-icon">✨</span>
              <span className="method-text">AI에게 줄거리 추천받기</span>
            </button>
          </div>

          {/* 스타일 선택 */}
          <div className="manual-section">
            <label className="manual-label">🎨 그림 스타일 (선택사항)</label>
            <div className="style-grid">
              {styles.map((s) => (
                <button
                  key={s.id}
                  className={`style-card ${selectedStyle === s.id ? "selected" : ""}`}
                  onClick={() => setSelectedStyle(s.id)}
                >
                  {s.label}
                  <br />
                  <span>{s.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* 동화책 만들기 버튼 */}
          <button 
            className="manual-create-btn" 
            onClick={handleCreateStorybook}
            disabled={!storyTitle.trim() || !storyPrompt.trim()}
          >
            🚀 동화책 만들기 시작
          </button>
        </div>
      )}

      {/* AI 추천 모달 */}
      {showAiModal && (
        <div className="ai-modal-overlay" onClick={() => setShowAiModal(false)}>
          <div className="ai-modal" onClick={(e) => e.stopPropagation()}>
            <div className="ai-modal-header">
              <h3>✨ AI 줄거리 추천</h3>
              <button className="ai-modal-close" onClick={() => setShowAiModal(false)}>✕</button>
            </div>
            
            {isLoadingAI ? (
              <div className="ai-modal-loading">
                <div className="spinner"></div>
                <p>AI가 줄거리를 생각하고 있어요...</p>
              </div>
            ) : (
              <div className="ai-modal-content">
                <p className="ai-modal-desc">3개의 줄거리 중 마음에 드는 것을 선택하면 자동으로 입력됩니다</p>
                {aiSuggestions.map((suggestion, idx) => (
                  <button
                    key={idx}
                    className="ai-suggestion-card"
                    onClick={() => handleSelectSuggestion(suggestion)}
                  >
                    <span className="suggestion-number">{idx + 1}</span>
                    <span className="suggestion-text">{suggestion}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </StorybookLayout>
  );
}
