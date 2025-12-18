import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { generateImageViaCloudflare } from "../services/cloudflareImageApi";
import { friendlyErrorMessage } from "../utils/errorHandler";
import { startListening, isSpeechRecognitionSupported } from "../services/speechRecognitionService";
import { uploadImage } from "../services/imageUploadService";
import { analyzeHandwriting } from "../services/visionService";
import LoadingSpinner from "../components/LoadingSpinner";
import "./DrawDirect.css";

export default function DrawDirect() {
  const navigate = useNavigate();
  const [description, setDescription] = useState("");
  const [selectedStyle, setSelectedStyle] = useState<string>("기본");
  const [isListening, setIsListening] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleVoiceInput = () => {
    if (!isSpeechRecognitionSupported()) {
      alert("이 브라우저는 음성 인식을 지원하지 않습니다.\n\nChrome, Edge, Safari 브라우저를 사용해주세요.");
      return;
    }

    setIsListening(true);

    const stopListening = startListening(
      (text) => {
        // 인식된 텍스트를 기존 내용에 추가
        setDescription((prev) =>
          prev.trim().length > 0 ? `${prev} ${text}` : text
        );
        setIsListening(false);
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

    console.log("🚀 [DrawDirect] 이미지 생성 시작:", { 
      description, 
      style: selectedStyle,
      hasUploadedImage: !!uploadedImage 
    });

    setIsGenerating(true);

    try {
      // 업로드된 이미지가 있을 경우 프롬프트에 추가 정보 포함
      let finalPrompt = description;
      if (uploadedImage) {
        finalPrompt = `${description} (참고: 업로드된 이미지의 스타일과 구도를 참고하여 새로운 그림을 그려주세요)`;
        console.log("📸 [DrawDirect] 업로드된 이미지 포함 모드");
      }

      const styleText = selectedStyle && selectedStyle !== "기본" ? ` (${selectedStyle} 스타일)` : "";
      const fullPrompt = `${finalPrompt}${styleText}`;

      console.log("📡 [DrawDirect] generateImageViaCloudflare 호출 중...", fullPrompt);

      // Cloudflare Functions를 통한 DALL·E 이미지 생성
      const imageBase64 = await generateImageViaCloudflare(finalPrompt, selectedStyle);

      console.log("✅ [DrawDirect] 이미지 생성 완료, Base64 길이:", imageBase64.length);

      // 결과 페이지로 이동
      navigate("/drawing/result", {
        state: {
          imageBase64,
          prompt: description,
          style: selectedStyle,
          sourceImage: uploadedImage, // 참고한 원본 이미지도 함께 전달
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

  const handleUpload = async () => {
    setIsUploading(true);
    try {
      // 이미지 파일 선택 및 업로드
      const result = await uploadImage(true); // true = 자동 압축

      console.log("✅ [DrawDirect] 이미지 업로드 완료:", {
        fileName: result.fileName,
        fileSize: result.fileSize,
        width: result.width,
        height: result.height,
      });

      // 업로드된 이미지 저장
      setUploadedImage(result.base64);

      // 자동으로 설명 추가 (선택)
      if (!description.trim()) {
        setDescription("업로드된 사진을 참고하여 그림을 그려주세요");
      }

      alert(`✅ 이미지가 업로드되었습니다!\n\n파일명: ${result.fileName}\n크기: ${result.width}x${result.height}px\n\n이제 설명을 입력하고 '그림 만들기'를 눌러주세요.`);
    } catch (error) {
      console.error("❌ [DrawDirect] 이미지 업로드 실패:", error);
      alert(friendlyErrorMessage(error));
    } finally {
      setIsUploading(false);
    }
  };

  const handleHandwritingUpload = async () => {
    setIsUploading(true);
    setIsAnalyzing(true);
    try {
      // 이미지 파일 선택 및 업로드
      const result = await uploadImage(true);

      console.log("✅ [DrawDirect] 손글씨 이미지 업로드 완료");

      // 업로드된 이미지 저장
      setUploadedImage(result.base64);

      // Vision API로 손글씨 분석
      console.log("🔍 [DrawDirect] 손글씨 분석 시작...");
      const extractedText = await analyzeHandwriting(result.base64);

      console.log("✅ [DrawDirect] 손글씨 분석 완료:", extractedText);

      // 인식된 텍스트를 설명란에 입력
      if (extractedText && extractedText !== "텍스트를 찾을 수 없습니다") {
        setDescription(extractedText);
        alert(`✅ 손글씨를 성공적으로 읽었습니다!\n\n인식된 내용:\n"${extractedText}"\n\n필요하면 내용을 수정한 후 '그림 만들기'를 눌러주세요.`);
      } else {
        alert("❌ 손글씨를 인식할 수 없습니다.\n\n다음을 확인해주세요:\n1. 글씨가 명확하게 보이는지\n2. 사진이 흐릿하지 않은지\n3. 조명이 충분한지");
        setUploadedImage(null);
      }
    } catch (error) {
      console.error("❌ [DrawDirect] 손글씨 분석 실패:", error);
      alert("❌ 손글씨 분석 중 오류가 발생했습니다.\n\n" + friendlyErrorMessage(error));
      setUploadedImage(null);
    } finally {
      setIsUploading(false);
      setIsAnalyzing(false);
    }
  };

  const handleRemoveImage = () => {
    if (confirm("업로드한 이미지를 삭제하시겠습니까?")) {
      setUploadedImage(null);
    }
  };

  return (
    
      <div className="screen">
        
        <div className="screen-body draw-page-container">
        {/* 설명 안내 */}
        <p className="guide-text">
        원하는 그림을 자세히 설명해주세요 😊
        <br />
        예) 파란 하늘 아래 초록 들판에서 고양이가 나비와 놀고 있는 모습
      </p>

      {/* 업로드된 이미지 미리보기 */}
      {uploadedImage && (
        <div style={{
          marginBottom: "20px",
          padding: "15px",
          backgroundColor: "#f0f0f0",
          borderRadius: "12px",
          border: "2px solid var(--secondary)"
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
            <span style={{ fontSize: "16px", fontWeight: "bold" }}>📷 업로드된 이미지</span>
            <button
              onClick={handleRemoveImage}
              style={{
                padding: "6px 12px",
                fontSize: "14px",
                backgroundColor: "#ff6b6b",
                color: "white",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer"
              }}
            >
              🗑️ 삭제
            </button>
          </div>
          <img
            src={uploadedImage}
            alt="업로드된 이미지"
            style={{
              width: "100%",
              maxWidth: "300px",
              height: "auto",
              borderRadius: "8px",
              display: "block",
              margin: "0 auto"
            }}
          />
          <p style={{ fontSize: "14px", color: "#666", marginTop: "10px", textAlign: "center" }}>
            💡 이 이미지를 참고하여 새로운 그림을 만들어드립니다.
          </p>
        </div>
      )}

      {/* 입력 박스 */}
      <textarea
        className="input-box"
        placeholder="여기에 그리고 싶은 그림을 설명해주세요…"
        rows={4}
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />

      {/* 기능 버튼들 */}
      <div className="button-group">
        <button 
          className="btn-tertiary"
          onClick={handleUpload}
          disabled={isUploading || isAnalyzing}
        >
          {isUploading && !isAnalyzing ? "📤 업로드 중..." : "📤 사진 또는 그림 업로드"}
        </button>
        <button 
          className="btn-tertiary"
          onClick={handleHandwritingUpload}
          disabled={isUploading || isAnalyzing}
          style={{ backgroundColor: "#9c27b0", borderColor: "#9c27b0" }}
        >
          {isAnalyzing ? "🔍 손글씨 읽는 중..." : "✍️ 손글씨 사진 업로드"}
        </button>
        <button 
          className={"btn-tertiary" + (isListening ? " voice-button--active" : "")}
          onClick={handleVoiceInput}
          disabled={isListening}
        >
          {isListening ? "🎤 듣는 중..." : "🎤 말로 입력"}
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
          className="btn-primary"
          style={{ marginTop: "20px" }}
          onClick={handleGenerate}
        >
          🚀 그림 만들기
        </button>
      )}
        </div>
      </div>
    
  );
}
