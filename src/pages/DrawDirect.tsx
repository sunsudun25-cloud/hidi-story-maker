import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import Header from "../components/Header";
import { generateImageViaFirebase } from "../services/firebaseFunctions";
import { friendlyErrorMessage } from "../utils/errorHandler";
import LoadingSpinner from "../components/LoadingSpinner";
import "./DrawDirect.css";

export default function DrawDirect() {
  const navigate = useNavigate();
  const [description, setDescription] = useState("");
  const [selectedStyle, setSelectedStyle] = useState<string>("기본");
  const [isListening, setIsListening] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

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

  const handleGenerate = async () => {
    console.log("🔵 [DrawDirect] handleGenerate 함수 호출됨!");
    
    if (!description.trim()) {
      console.warn("⚠️ [DrawDirect] 그림 설명이 비어있습니다");
      alert("그림 설명을 입력해주세요!");
      return;
    }

    console.log("🚀 [DrawDirect] 이미지 생성 시작:", { description, style: selectedStyle });

    setIsGenerating(true);

    try {
      const styleText = selectedStyle && selectedStyle !== "기본" ? ` (${selectedStyle} 스타일)` : "";
      const fullPrompt = `${description}${styleText}`;

      console.log("📡 [DrawDirect] generateImageViaFirebase 호출 중...", fullPrompt);

      // Firebase Functions를 통한 DALL·E 이미지 생성
      const imageBase64 = await generateImageViaFirebase(description, selectedStyle);

      console.log("✅ [DrawDirect] 이미지 생성 완료, Base64 길이:", imageBase64.length);

      // 결과 페이지로 이동
      navigate("/drawing/result", {
        state: {
          imageBase64,
          prompt: description,
          style: selectedStyle,
        },
      });
    } catch (err) {
      console.error("❌ [DrawDirect] 이미지 생성 실패:", err);
      alert(friendlyErrorMessage(err));
    } finally {
      console.log("🔵 [DrawDirect] setIsGenerating(false)");
      setIsGenerating(false);
    }
  };

  const handleUpload = () => {
    alert("사진 업로드 기능은 준비 중입니다.");
    // TODO: 파일 업로드 구현
  };

  return (
    <Layout>
      <div className="screen">
        <Header title="직접 입력" />
        
        <div className="screen-body draw-page-container">
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
            <select 
              style={{ 
                width: "100%", 
                padding: "12px", 
                fontSize: "16px",
                borderRadius: "var(--radius)",
                border: "2px solid var(--secondary)"
              }}
              value={selectedStyle}
              onChange={(e) => setSelectedStyle(e.target.value)}
            >
              <option value="기본">기본</option>
              <option value="수채화">수채화</option>
              <option value="동화풍">동화풍</option>
              <option value="파스텔톤">파스텔톤</option>
              <option value="애니메이션">애니메이션</option>
              <option value="연필스케치">연필스케치</option>
            </select>
          </div>
        </div>
      </details>

      {/* 로딩 상태 */}
      {isGenerating && (
        <LoadingSpinner text="AI가 멋진 그림을 그리고 있어요... 🎨" />
      )}

      {/* 최종 버튼 */}
      {!isGenerating && (
        <button 
          className="btn main-cta"
          onClick={handleGenerate}
        >
          🚀 그림 만들기
        </button>
      )}
        </div>
      </div>
    </Layout>
  );
}
