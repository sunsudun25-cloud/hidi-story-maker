import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { generateImage } from "../../services/geminiService";
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

  const styles = [
    { id: "fairytale", label: "동화 스타일", desc: "아이 책 느낌" },
    { id: "watercolor", label: "수채화", desc: "부드럽고 번지는 느낌" },
    { id: "pastel", label: "파스텔톤", desc: "은은하고 차분한 색감" },
    { id: "warm", label: "따뜻한 느낌", desc: "햇살 같은 분위기" },
  ];

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

        {/* 줄거리 입력 */}
        <div className="section-title">줄거리를 간단히 설명해주세요</div>
        <div className="example-box">
          <strong>예시</strong>
          <p>달빛을 먹으면 힘이 나는 토끼가 친구들과 모험하는 이야기</p>
        </div>

        <textarea
          className="input-area"
          placeholder="동화책 줄거리를 간단히 입력해주세요…"
          value={storyPrompt}
          onChange={(e) => setStoryPrompt(e.target.value)}
        />

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
