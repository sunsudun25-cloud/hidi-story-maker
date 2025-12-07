import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { generateImageViaFirebase } from "../services/firebaseFunctions";
import { useStorybook } from "../context/StorybookContext";
import LoadingSpinner from "../components/LoadingSpinner";
import { friendlyErrorMessage } from "../utils/errorHandler";
import "./Storybook/Storybook.css";

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

  // 전달받은 데이터가 있으면 설정
  useEffect(() => {
    if (receivedTitle) setStoryTitle(receivedTitle);
    if (receivedPrompt) setStoryPrompt(receivedPrompt);
  }, [receivedTitle, receivedPrompt]);

  const styles = [
    { id: "fairytale", label: "동화 스타일", desc: "아이 책 느낌" },
    { id: "watercolor", label: "수채화", desc: "부드럽고 번지는 느낌" },
    { id: "pastel", label: "파스텔톤", desc: "은은하고 차분한 색감" },
    { id: "warm", label: "따뜻한 느낌", desc: "햇살 같은 분위기" },
  ];

  const handleCreateStorybook = async () => {
    if (!storyTitle.trim()) {
      alert("동화책 제목을 입력해주세요!");
      return;
    }
    if (!storyPrompt.trim()) {
      alert("동화책 줄거리를 입력해주세요!");
      return;
    }

    console.log("📘 동화책 생성:", { title: storyTitle, prompt: storyPrompt, style: selectedStyle });

    setIsGenerating(true);
    try {
      // Firebase Functions를 통해 DALL-E 3로 표지 이미지 생성
      const coverPrompt = `
동화책 표지 일러스트를 생성해주세요.
제목: ${storyTitle}
내용: ${storyPrompt}
스타일: ${selectedStyle ?? "동화 스타일"}
따뜻하고 친근한 분위기로 어린이가 좋아할 만한 그림을 그려주세요.
`;
      const coverImageUrl = await generateImageViaFirebase(coverPrompt);

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
      console.error("표지 생성 오류:", err);
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
          {/* AI 추천에서 왔을 경우 안내 */}
          {receivedPrompt && (
            <div style={{
              backgroundColor: "#D1FAE5",
              border: "2px solid #10B981",
              borderRadius: "12px",
              padding: "15px",
              marginBottom: "20px"
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
                <span style={{ fontSize: "24px" }}>✨</span>
                <strong style={{ color: "#065F46" }}>AI가 추천한 줄거리가 입력되었습니다!</strong>
              </div>
              <p style={{ fontSize: "14px", color: "#047857", margin: 0 }}>
                마음에 들지 않으면 수정하거나 새로 작성하셔도 좋습니다.
              </p>
            </div>
          )}

          {/* 제목 입력 */}
          <div className="section-title">📘 동화책 제목</div>
          <input
            className="input-field"
            placeholder="예: '달빛을 먹는 토끼'"
            value={storyTitle}
            onChange={(e) => setStoryTitle(e.target.value)}
          />

          {/* 줄거리 입력 */}
          <div className="section-title">📖 줄거리를 간단히 설명해주세요</div>
          <div className="example-box">
            <strong>예시</strong>
            <p>달빛을 먹으면 힘이 나는 토끼가 친구들과 모험하는 이야기</p>
          </div>

          <textarea
            className="input-area"
            placeholder="동화책 줄거리를 간단히 입력해주세요…"
            value={storyPrompt}
            onChange={(e) => setStoryPrompt(e.target.value)}
            rows={6}
          />

          {/* 스타일 선택 */}
          <div className="section-title">🎨 그림 스타일 선택 (선택사항)</div>

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
          <button 
            className="big-btn primary primary-btn" 
            onClick={handleCreateStorybook}
            disabled={!storyTitle.trim() || !storyPrompt.trim()}
            style={{
              opacity: (!storyTitle.trim() || !storyPrompt.trim()) ? 0.5 : 1,
              cursor: (!storyTitle.trim() || !storyPrompt.trim()) ? "not-allowed" : "pointer"
            }}
          >
            🚀 동화책 만들기 시작
          </button>
        </div>
      )}
    </div>
  );
}
