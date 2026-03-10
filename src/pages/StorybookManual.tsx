import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { safeGeminiCall } from "../services/geminiService";
import { useStorybook } from "../context/StorybookContext";
import LoadingSpinner from "../components/LoadingSpinner";
import StorybookLayout from "../components/storybook/StorybookLayout";
import { startListening, isSpeechRecognitionSupported } from "../services/speechRecognitionService";
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
  const [isListening, setIsListening] = useState(false);

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
어린이 동화책 줄거리 3가지를 추천해주세요.

각 줄거리는 제목과 내용을 포함하며:
- 제목: 간결하고 매력적인 동화 제목
- 내용: 2~3문장으로 줄거리 설명
- 어린이가 공감할 수 있는 주제
- 긍정적이고 희망적인 메시지

⚠️ 중요: 인사말이나 설명 없이 바로 줄거리만 출력하세요.

출력 형식:
1. [달빛을 먹는 토끼] 달빛을 먹으면 힘이 나는 토끼가 친구들과 모험하는 이야기. 어려움을 겪지만 함께 힘을 모아 극복합니다.
2. [마법의 씨앗] 숲 속 작은 마을에서 마법의 씨앗을 심은 아이의 이야기. 정성껏 가꾸자 아름다운 꽃이 피어납니다.
3. [별똥별 소녀] 하늘에서 떨어진 별똥별을 주운 소녀가 소원을 이루는 과정. 욕심 대신 남을 돕는 마음을 배웁니다.
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

  // 🎤 음성 입력 (줄거리)
  const handleVoiceInput = () => {
    if (!isSpeechRecognitionSupported()) {
      alert("이 브라우저는 음성 인식을 지원하지 않습니다.\n\nChrome, Edge, Safari 브라우저를 사용해주세요.");
      return;
    }

    setIsListening(true);

    const stopListening = startListening(
      (text) => {
        // 인식된 텍스트를 기존 줄거리에 추가
        setStoryPrompt(storyPrompt + (storyPrompt ? " " : "") + text);
      },
      (error) => {
        alert(error);
        setIsListening(false);
      }
    );

    // 컴포넌트가 언마운트될 때 음성 인식 중지
    return () => {
      stopListening();
      setIsListening(false);
    };
  };

  // 🎤 음성 입력 중지
  const handleStopVoice = () => {
    setIsListening(false);
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
    if (!storyPrompt.trim()) {
      alert("동화책 줄거리를 입력해주세요!");
      return;
    }

    setIsGenerating(true);
    try {
      // ------------------------------
      // 0) 제목이 없으면 AI로 자동 생성
      // ------------------------------
      let finalTitle = storyTitle.trim();
      
      if (!finalTitle) {
        console.log("📝 제목이 없어 AI로 자동 생성합니다...");
        const titlePrompt = `
다음 동화책 줄거리에 어울리는 제목 1개를 생성해주세요.
줄거리: ${storyPrompt}

요구사항:
- 제목만 출력 (설명 없이)
- 간결하고 매력적인 제목
- 5~10글자 내외
- 어린이가 이해하기 쉬운 제목

예시: 작은 별의 여행, 마법의 숲, 용감한 토끼
        `.trim();
        
        try {
          finalTitle = await safeGeminiCall(titlePrompt);
          finalTitle = finalTitle.trim().replace(/^["']|["']$/g, ''); // 따옴표 제거
          console.log("✅ 자동 생성된 제목:", finalTitle);
        } catch (err) {
          console.error("제목 생성 오류:", err);
          finalTitle = "나의 동화책"; // 실패 시 기본 제목
        }
      }

      console.log("📘 동화책 초안 생성:", { title: finalTitle, prompt: storyPrompt, style: selectedStyle });

      // ------------------------------
      // 1) Gemini AI로 1페이지만 생성
      // ------------------------------
      const generationPrompt = `
당신은 어린이를 위한 동화책 작가입니다.
사용자의 줄거리를 기반으로 동화책의 첫 페이지를 작성하세요.

제목: ${finalTitle}
줄거리: ${storyPrompt}

첫 페이지는 3~5문장으로 구성하세요.
이야기의 시작 부분으로 독자의 흥미를 끌어주세요.
따뜻하고 희망적인 도입부로 작성해주세요.
      `;

      const firstPageText = await safeGeminiCall(generationPrompt);

      // ------------------------------
      // 2) 1페이지만 배열에 담기
      // ------------------------------
      let pages: any[] = [];

      if (firstPageText && typeof firstPageText === "string" && firstPageText.trim().length > 10) {
        pages.push({ text: firstPageText.trim() });
      } else {
        // Fallback
        pages.push({ text: "AI가 내용을 생성하지 못했습니다. 다시 시도해주세요." });
      }

      console.log("✅ 생성된 첫 페이지:", pages[0].text.substring(0, 50) + "...");

      // ------------------------------
      // 3) Context에 저장 (자동 생성된 제목 사용)
      // ------------------------------
      storybookContext.resetStorybook();
      storybookContext.setTitle(finalTitle);
      storybookContext.setPrompt(storyPrompt);
      storybookContext.setStyle(selectedStyle || "동화 스타일");
      storybookContext.setStoryPages(pages);

      // ------------------------------
      // 4) Editor로 이동 (pages 전달, 자동 생성된 제목 사용)
      // ------------------------------
      navigate("/storybook-editor", {
        state: {
          title: finalTitle,
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
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
              <label className="manual-label">📖 줄거리</label>
              
              {/* 🎤 음성 입력 버튼 */}
              {isListening ? (
                <button
                  onClick={handleStopVoice}
                  style={{
                    padding: "8px 16px",
                    fontSize: "14px",
                    backgroundColor: "#F44336",
                    color: "white",
                    border: "none",
                    borderRadius: "8px",
                    cursor: "pointer",
                    fontWeight: "600",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px"
                  }}
                >
                  <span>⏹️</span>
                  <span>중지</span>
                </button>
              ) : (
                <button
                  onClick={handleVoiceInput}
                  style={{
                    padding: "8px 16px",
                    fontSize: "14px",
                    backgroundColor: "#E91E63",
                    color: "white",
                    border: "none",
                    borderRadius: "8px",
                    cursor: "pointer",
                    fontWeight: "600",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px"
                  }}
                >
                  <span>🎤</span>
                  <span>음성 입력</span>
                </button>
              )}
            </div>
            
            <textarea
              className="manual-plot-textarea"
              placeholder="동화책 줄거리를 입력하거나 음성 입력, AI 추천 버튼을 사용해보세요..."
              value={storyPrompt}
              onChange={(e) => setStoryPrompt(e.target.value)}
              rows={8}
            />
            
            {/* 듣고 있어요 표시 */}
            {isListening && (
              <div style={{
                marginTop: "10px",
                padding: "12px",
                backgroundColor: "#FFF3E0",
                border: "2px solid #FF9800",
                borderRadius: "8px",
                textAlign: "center",
                fontSize: "16px",
                fontWeight: "600",
                color: "#E65100"
              }}>
                <span style={{ fontSize: "20px", marginRight: "8px" }}>👂</span>
                듣고 있어요... 말씀해주세요!
              </div>
            )}
          </div>

          {/* AI 줄거리 추천 버튼 */}
          <button 
            className="ai-suggest-btn"
            onClick={handleAiSuggestion}
            disabled={isListening}
          >
            <span className="ai-suggest-icon">✨</span>
            <span className="ai-suggest-text">AI에게 줄거리 추천받기</span>
          </button>

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
