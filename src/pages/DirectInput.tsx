import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { generateImage } from "../services/geminiService";
import LoadingSpinner from "../components/LoadingSpinner";
import { friendlyErrorMessage } from "../utils/errorHandler";
import "./DirectInput.css";

export default function DirectInput() {
  const navigate = useNavigate();

  const [description, setDescription] = useState("");
  const [selectedStyle, setSelectedStyle] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const styles = [
    { id: "watercolor", label: "수채화", desc: "부드럽고 번지는 느낌" },
    { id: "pastel", label: "파스텔톤", desc: "은은한 색감" },
    { id: "fairytale", label: "동화풍", desc: "아이 책 같은 느낌" },
    { id: "warm", label: "따뜻한 스타일", desc: "편안하고 포근" },
  ];

  // 그림 생성
  const handleGenerate = async () => {
    if (!description) {
      alert("그림 설명을 입력해주세요!");
      return;
    }

    console.log("🚀 이미지 생성:", { description, style: selectedStyle });

    setIsGenerating(true);
    try {
      // Gemini Service로 이미지 생성
      const imageUrl = await generateImage(description, selectedStyle ?? "기본 스타일");

      // 결과 페이지로 이동
      navigate("/result", { state: { imageUrl } });
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
        <h1 className="header-title">직접 입력</h1>
        <button className="header-btn" onClick={() => navigate("/home")}>🏠</button>
      </header>

      {isGenerating ? (
        <LoadingSpinner text="AI가 멋진 그림을 그리고 있어요... 🎨" />
      ) : (
      <div className="direct-page">
        <div className="section-title">원하는 그림을 자세히 설명해주세요 😊</div>

        <div className="example-box">
          <strong>예시</strong>
          <p>초록 들판에서 고양이가 나비를 잡으려고 뛰어오르는 장면</p>
        </div>

        <textarea
          className="input-area"
          placeholder="여기에 그림 설명을 입력해주세요…"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
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

        <button className="big-btn primary primary-btn" onClick={handleGenerate}>
          🚀 그림 만들기
        </button>
      </div>
      )}
    </div>
  );
}
