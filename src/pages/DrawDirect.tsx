import React, { useState } from "react";
import "./DrawDirect.css";

export default function DrawDirect() {
  const [description, setDescription] = useState("");
  const [isListening, setIsListening] = useState(false);

  const handleVoiceInput = () => {
    setIsListening(!isListening);
    alert(isListening ? "음성 입력 중지" : "음성 입력 시작");
    // TODO: Web Speech API 구현
  };

  const handleHelp = () => {
    alert("💡 그림 설명 도움말:\n\n" +
      "1. 무엇이: 그리고 싶은 대상 (예: 고양이, 나비)\n" +
      "2. 어디서: 배경이나 장소 (예: 꽃밭, 하늘)\n" +
      "3. 어떤 느낌: 분위기나 스타일 (예: 따뜻한, 밝은)\n\n" +
      "예시: 파란 하늘 아래 초록 들판에서 고양이가 나비와 놀고 있는 모습");
  };

  const handleClear = () => {
    if (confirm("입력한 내용을 모두 지우시겠습니까?")) {
      setDescription("");
    }
  };

  const handleGenerate = () => {
    if (!description.trim()) {
      alert("그림 설명을 입력해주세요!");
      return;
    }
    alert(`그림 생성 시작!\n설명: "${description}"`);
    // TODO: AI 이미지 생성 API 호출
  };

  const handleUpload = () => {
    alert("사진 업로드 기능은 준비 중입니다.");
    // TODO: 파일 업로드 구현
  };

  return (
    <main>
      {/* 설명 안내 */}
      <p className="guide-text">
        원하는 그림을 자세히 설명해주세요 😊
        <br />
        예) 파란 하늘 아래 초록 들판에서 고양이가 나비와 놀고 있는 모습
      </p>

      {/* 입력 박스 */}
      <textarea
        className="input-box"
        placeholder="여기에 그리고 싶은 그림을 설명해주세요…"
        rows={4}
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />

      {/* 업로드 버튼 */}
      <button 
        className="btn-secondary" 
        style={{ marginTop: "16px" }}
        onClick={handleUpload}
      >
        📤 사진 또는 그림 업로드
      </button>

      {/* 기능 버튼들 */}
      <div className="button-group">
        <button 
          className="btn-secondary"
          onClick={handleVoiceInput}
        >
          🎤 말로 입력
        </button>
        <button 
          className="btn-secondary"
          onClick={handleHelp}
        >
          💡 도움말
        </button>
        <button 
          className="btn-secondary"
          onClick={handleClear}
        >
          🗑️ 지우기
        </button>
      </div>

      {/* 고급 옵션 */}
      <details className="advanced">
        <summary>🧩 고급 옵션 (선택 사항)</summary>
        <div className="advanced-box">
          <p>세부 스타일, 화풍, 해상도를 선택할 수 있어요.</p>
          <div style={{ marginTop: "12px" }}>
            <label style={{ display: "block", marginBottom: "8px", fontSize: "16px" }}>
              화풍:
            </label>
            <select style={{ 
              width: "100%", 
              padding: "12px", 
              fontSize: "16px",
              borderRadius: "var(--radius)",
              border: "2px solid var(--secondary)"
            }}>
              <option>기본</option>
              <option>수채화</option>
              <option>유화</option>
              <option>애니메이션</option>
              <option>사실적</option>
            </select>
          </div>
        </div>
      </details>

      {/* 최종 버튼 */}
      <button 
        className="btn main-cta"
        onClick={handleGenerate}
      >
        🚀 그림 만들기
      </button>
    </main>
  );
}
