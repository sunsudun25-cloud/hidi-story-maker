import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { generateImageViaCloudflare } from "../services/cloudflareImageApi";  // ⭐ Firebase Functions 프록시 사용
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

  const handleGenerate = async () => {
    console.log("🔵 [DirectInput] handleGenerate 함수 호출됨!");
    
    if (!description.trim()) {
      console.warn("⚠️ [DirectInput] 그림 설명이 비어있습니다");
      alert("그림 설명을 입력해주세요!");
      return;
    }

    console.log("🚀 [DirectInput] 이미지 생성 시작:", { description, style: selectedStyle });

    setIsGenerating(true);

    try {
      // ✅ 스타일 기본값 (UX 혼란 방지: 사용자 선택 그대로 유지)
      const safeStyle = selectedStyle || '기본';
      
      console.log("📡 [DirectInput] generateImageViaCloudflare 호출 중...", { 
        originalStyle: selectedStyle,
        safeStyle: safeStyle,
        description: description.slice(0, 100) + '...'
      });

      // ⭐ Cloudflare Functions를 통한 안전한 이미지 생성
      const imageBase64 = await generateImageViaCloudflare(description, safeStyle, {
        model: 'dall-e-3',
        size: '1024x1024',
        quality: 'standard'
      });

      console.log("✅ [DirectInput] 이미지 생성 완료, Base64 길이:", imageBase64.length);

      // 결과 페이지로 이동
      navigate("/drawing/result", {
        state: {
          imageBase64,
          prompt: description,
          style: safeStyle, // ✅ 실제 적용된 스타일 전달
        },
      });
    } catch (err) {
      console.error("❌ [DirectInput] 이미지 생성 실패:", err);
      alert(friendlyErrorMessage(err));
    } finally {
      console.log("🔵 [DirectInput] setIsGenerating(false)");
      setIsGenerating(false);
    }
  };

  return (
    <>
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
    </>
  );
}
