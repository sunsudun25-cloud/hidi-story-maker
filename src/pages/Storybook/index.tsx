import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { generateImage, safeGeminiCall } from "../../services/geminiService";
import { useStorybook } from "../../context/StorybookContext";
import LoadingSpinner from "../../components/LoadingSpinner";
import { friendlyErrorMessage } from "../../utils/errorHandler";
import "./Storybook.css";

export default function Storybook() {
  const navigate = useNavigate();
  const storybookContext = useStorybook();

  const [storyTitle, setStoryTitle] = useState("");
  const [storyPrompt, setStoryPrompt] = useState("");
  const [selectedStyle, setSelectedStyle] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isGeneratingPlot, setIsGeneratingPlot] = useState(false);
  const [promptMode, setPromptMode] = useState<"ai" | "manual" | null>(null); // AI 추천 or 직접 입력

  const styles = [
    { id: "fairytale", label: "동화 스타일", desc: "아이 책 느낌" },
    { id: "watercolor", label: "수채화", desc: "부드럽고 번지는 느낌" },
    { id: "pastel", label: "파스텔톤", desc: "은은하고 차분한 색감" },
    { id: "warm", label: "따뜻한 느낌", desc: "햇살 같은 분위기" },
  ];

  // AI 줄거리 생성
  const handleGeneratePlot = async () => {
    if (!storyTitle.trim()) {
      alert("먼저 동화책 제목을 입력해주세요!");
      return;
    }

    setIsGeneratingPlot(true);
    try {
      const prompt = `
당신은 어린이 동화책 작가입니다.
다음 제목으로 동화책 줄거리를 3-5문장으로 간단히 작성해주세요.

제목: ${storyTitle}

조건:
- 따뜻하고 희망적인 이야기
- 명확한 주인공과 모험 요소
- 어린이가 이해하기 쉬운 내용
- 교훈이나 메시지 포함
- 3-5문장으로 간결하게
`;

      const generatedPlot = await safeGeminiCall(prompt);
      
      if (generatedPlot) {
        setStoryPrompt(generatedPlot);
        alert("✨ AI가 줄거리를 생성했습니다!\n마음에 들지 않으면 수정하거나 다시 생성해주세요.");
      } else {
        alert("줄거리 생성에 실패했습니다. 다시 시도해주세요.");
      }
    } catch (err) {
      console.error("줄거리 생성 오류:", err);
      alert("줄거리 생성 중 오류가 발생했습니다.");
    } finally {
      setIsGeneratingPlot(false);
    }
  };

  const handleCreateStorybook = async () => {
    if (!storyTitle) {
      alert("동화책 제목을 입력해주세요!");
      return;
    }
    if (!storyPrompt) {
      alert("동화책 줄거리를 입력해주세요!");
      return;
    }

    console.log("📘 동화책 생성:", { title: storyTitle, prompt: storyPrompt, style: selectedStyle });

    setIsGenerating(true);
    try {
      // Gemini Service로 표지 이미지 생성
      const coverImageUrl = await generateImage(storyPrompt, selectedStyle ?? "동화 스타일");

      // Context에 저장
      storybookContext.setTitle(storyTitle);
      storybookContext.setPrompt(storyPrompt);
      storybookContext.setStyle(selectedStyle || "동화 스타일");
      storybookContext.setCoverImageUrl(coverImageUrl);
      storybookContext.resetStorybook(); // 페이지 초기화

      // 다음 단계(편집기 페이지)로 이동
      navigate("/storybook-editor", {
        state: {
          title: storyTitle,
          prompt: storyPrompt,
          style: selectedStyle,
          coverImageUrl,
        },
      });
    } catch (err) {
      alert(friendlyErrorMessage(err));
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="page-container">
      {/* 상단 헤더 */}
      <header className="page-header">
        <button className="header-btn" onClick={() => navigate(-1)}>←</button>
        <h1 className="header-title">동화책 만들기</h1>
        <button className="header-btn" onClick={() => navigate("/home")}>🏠</button>
      </header>

      {isGenerating ? (
        <LoadingSpinner text="동화책 표지를 그리고 있어요... 📚✨" />
      ) : (
      <div className="storybook-page">
        {/* 제목 입력 */}
        <div className="section-title">📘 동화책 제목</div>
        <input
          className="input-field"
          placeholder="예: '달빛을 먹는 토끼'"
          value={storyTitle}
          onChange={(e) => setStoryTitle(e.target.value)}
        />

        {/* 줄거리 입력 방식 선택 */}
        <div className="section-title">📖 줄거리 입력 방식</div>
        
        {!promptMode ? (
          <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
            <button
              onClick={() => setPromptMode("ai")}
              style={{
                flex: 1,
                padding: "20px",
                backgroundColor: "#10B981",
                color: "white",
                border: "none",
                borderRadius: "12px",
                fontSize: "16px",
                fontWeight: "bold",
                cursor: "pointer",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "8px"
              }}
            >
              <span style={{ fontSize: "32px" }}>🤖</span>
              <span>AI에게 추천받기</span>
              <span style={{ fontSize: "12px", opacity: 0.9 }}>제목 기반으로 AI가 생성</span>
            </button>
            
            <button
              onClick={() => setPromptMode("manual")}
              style={{
                flex: 1,
                padding: "20px",
                backgroundColor: "#6366F1",
                color: "white",
                border: "none",
                borderRadius: "12px",
                fontSize: "16px",
                fontWeight: "bold",
                cursor: "pointer",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "8px"
              }}
            >
              <span style={{ fontSize: "32px" }}>✍️</span>
              <span>직접 쓰기</span>
              <span style={{ fontSize: "12px", opacity: 0.9 }}>내가 원하는 내용 입력</span>
            </button>
          </div>
        ) : null}

        {/* AI 추천 모드 */}
        {promptMode === "ai" && (
          <>
            <div className="example-box" style={{ backgroundColor: "#D1FAE5", borderColor: "#10B981" }}>
              <strong>🤖 AI 줄거리 생성</strong>
              <p>제목을 입력하고 버튼을 누르면 AI가 자동으로 줄거리를 만들어줍니다.</p>
            </div>

            <button
              onClick={handleGeneratePlot}
              disabled={isGeneratingPlot || !storyTitle.trim()}
              style={{
                width: "100%",
                padding: "15px",
                marginBottom: "15px",
                backgroundColor: isGeneratingPlot ? "#9CA3AF" : "#10B981",
                color: "white",
                border: "none",
                borderRadius: "8px",
                fontSize: "16px",
                fontWeight: "bold",
                cursor: isGeneratingPlot || !storyTitle.trim() ? "not-allowed" : "pointer"
              }}
            >
              {isGeneratingPlot ? "⏳ AI가 줄거리 생성 중..." : "✨ AI 줄거리 생성하기"}
            </button>

            <textarea
              className="input-area"
              placeholder="AI가 생성한 줄거리가 여기에 나타납니다. 수정도 가능합니다!"
              value={storyPrompt}
              onChange={(e) => setStoryPrompt(e.target.value)}
            />

            <button
              onClick={() => {
                setPromptMode(null);
                setStoryPrompt("");
              }}
              style={{
                width: "100%",
                padding: "10px",
                marginTop: "10px",
                backgroundColor: "#EF4444",
                color: "white",
                border: "none",
                borderRadius: "8px",
                fontSize: "14px",
                cursor: "pointer"
              }}
            >
              🔄 입력 방식 변경
            </button>
          </>
        )}

        {/* 직접 입력 모드 */}
        {promptMode === "manual" && (
          <>
            <div className="example-box">
              <strong>✍️ 직접 입력 예시</strong>
              <p>달빛을 먹으면 힘이 나는 토끼가 친구들과 모험하는 이야기</p>
            </div>

            <textarea
              className="input-area"
              placeholder="동화책 줄거리를 간단히 입력해주세요…"
              value={storyPrompt}
              onChange={(e) => setStoryPrompt(e.target.value)}
            />

            <button
              onClick={() => {
                setPromptMode(null);
                setStoryPrompt("");
              }}
              style={{
                width: "100%",
                padding: "10px",
                marginTop: "10px",
                backgroundColor: "#EF4444",
                color: "white",
                border: "none",
                borderRadius: "8px",
                fontSize: "14px",
                cursor: "pointer"
              }}
            >
              🔄 입력 방식 변경
            </button>
          </>
        )}

        {/* 스타일 선택 */}
        <div className="section-title">그림 스타일 선택 (선택)</div>

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

        {/* 동화책 생성 버튼 */}
        <button className="big-btn primary primary-btn" onClick={handleCreateStorybook}>
          🚀 동화책 만들기 시작
        </button>
      </div>
      )}
    </div>
  );
}
