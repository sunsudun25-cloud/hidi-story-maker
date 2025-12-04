import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function DrawDirect() {
  const navigate = useNavigate();
  const [description, setDescription] = useState("");
  const [selectedStyle, setSelectedStyle] = useState("");

  const styles = [
    { id: "watercolor", label: "수채화", emoji: "🎨" },
    { id: "pastel", label: "파스텔톤", emoji: "🌸" },
    { id: "fairytale", label: "동화 스타일", emoji: "📚" },
    { id: "warm", label: "밝고 따뜻한", emoji: "☀️" }
  ];

  const handleGenerate = () => {
    if (!description.trim()) {
      alert("그림 설명을 입력해주세요!");
      return;
    }
    alert(`생성할 그림:\n"${description}"\n스타일: ${selectedStyle || "기본"}`);
  };

  return (
    <main>
      <h1 className="page-title">그림 만들기</h1>
      <p className="page-subtitle">원하는 그림을 직접 설명해주세요</p>

      <div className="card">
        <h3 style={{ fontSize: "20px", marginBottom: "12px", fontWeight: "600" }}>
          그림 설명하기
        </h3>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="예: 귀여운 고양이가 꽃밭에서 노는 모습"
          rows={5}
          style={{
            resize: "vertical",
            minHeight: "120px"
          }}
        />
      </div>

      <div className="card">
        <h3 style={{ fontSize: "20px", marginBottom: "12px", fontWeight: "600" }}>
          스타일 선택
        </h3>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
          {styles.map((style) => (
            <span
              key={style.id}
              className={`chip ${selectedStyle === style.id ? "active" : ""}`}
              onClick={() => setSelectedStyle(style.id)}
            >
              {style.emoji} {style.label}
            </span>
          ))}
        </div>
      </div>

      <div className="tip-box">
        💡 <strong>도움말:</strong> 구체적으로 설명할수록 원하는 그림을 얻을 수 있어요. 
        예: "무엇이", "어디서", "어떤 느낌으로" 설명해보세요!
      </div>

      <button className="btn" onClick={handleGenerate}>
        🎨 그림 생성하기
      </button>

      <button
        className="btn-secondary"
        onClick={() => navigate("/drawing/start")}
        style={{ marginTop: "12px" }}
      >
        ← 이전으로
      </button>
    </main>
  );
}
