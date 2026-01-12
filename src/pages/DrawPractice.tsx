import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { generateImageViaCloudflare } from "../services/cloudflareImageApi";
import LoadingSpinner from "../components/LoadingSpinner";
import { friendlyErrorMessage } from "../utils/errorHandler";
import { startListening, isSpeechRecognitionSupported } from "../services/speechRecognitionService";
import "./DrawPractice.css";

type ExamplePrompt = {
  label: string;
  text: string;
};

type StyleOption = {
  id: string;
  label: string;
  description: string;
};

const EXAMPLES: ExamplePrompt[] = [
  {
    label: "귀여운 고양이",
    text: "햇살이 들어오는 창가에 앉아 있는 귀여운 고양이",
  },
  {
    label: "아름다운 꽃밭",
    text: "다양한 색깔의 꽃들이 가득 피어 있는 봄날의 꽃밭",
  },
  {
    label: "맛있는 케이크",
    text: "생크림과 과일이 올라간 맛있어 보이는 생일 케이크",
  },
  {
    label: "작은 집",
    text: "숲속에 조용히 자리 잡은 아담한 오두막 집",
  },
];

const STYLES: StyleOption[] = [
  {
    id: "watercolor",
    label: "수채화",
    description: "부드럽고 번지는 느낌",
  },
  {
    id: "pastel",
    label: "파스텔톤",
    description: "은은하고 차분한 색감",
  },
  {
    id: "fairytale",
    label: "동화 스타일",
    description: "아이 책 느낌",
  },
  {
    id: "bright",
    label: "밝고 따뜻한 느낌",
    description: "햇살 가득 분위기",
  },
];

export default function DrawPractice() {
  const navigate = useNavigate();
  const [description, setDescription] = useState("");
  const [selectedStyle, setSelectedStyle] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  // 예시 버튼 클릭 → 텍스트 자동 완성
  const handleExampleClick = (example: ExamplePrompt) => {
    setDescription((prev) =>
      prev.trim().length > 0 ? `${prev}\n${example.text}` : example.text
    );
  };

  // 스타일 선택
  const handleStyleClick = (styleId: string) => {
    setSelectedStyle(styleId === selectedStyle ? null : styleId);
  };

  // 음성 입력 (Web Speech API)
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

  // 그림 생성
  const handleGenerate = async () => {
    if (!description.trim()) {
      alert("그림 설명을 입력해주세요!");
      return;
    }

    setIsGenerating(true);
    try {
      console.log("🎨 [DrawPractice] DALL-E 3 모델로 이미지 생성 시작");
      console.log("📝 [DrawPractice] 프롬프트:", description);
      console.log("🎭 [DrawPractice] 스타일:", selectedStyle ?? "기본");
      
      // ✅ DALL-E 3 모델 사용 (강화된 스타일 프롬프트 적용)
      const imageUrl = await generateImageViaCloudflare(description, selectedStyle ?? "기본", {
        model: "dall-e-3"
      });

      console.log("✅ [DrawPractice] 이미지 생성 완료");

      // 결과 페이지로 이동 (prompt와 style 정보도 함께 전달)
      navigate("/result", { 
        state: { 
          imageUrl,
          prompt: description,
          style: selectedStyle ?? "기본",
          model: "dall-e-3"
        } 
      });
    } catch (error) {
      console.error("❌ [DrawPractice] 이미지 생성 실패:", error);
      
      // 사용자 친화적 에러 메시지
      const errorMessage = error instanceof Error 
        ? error.message 
        : "알 수 없는 오류가 발생했습니다.";
      
      alert(
        `🚨 이미지 생성에 실패했습니다\n\n` +
        `오류: ${errorMessage}\n\n` +
        `다시 시도해주세요. 문제가 계속되면:\n` +
        `1. 페이지를 새로고침하세요 (Ctrl+Shift+R)\n` +
        `2. 시크릿 모드로 접속해보세요\n` +
        `3. 관리자에게 문의하세요`
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const handleHelp = () => {
    alert(
      "설명 잘 쓰는 방법 예시\n\n" +
        "1) 무엇을: 예) 귀여운 고양이\n" +
        "2) 어디에서: 예) 햇살이 들어오는 창가에서\n" +
        "3) 어떤 느낌으로: 예) 따뜻하고 포근한 분위기\n\n" +
        "이 세 가지를 넣어서 천천히 써 보시면 좋아요."
    );
  };

  return (
    
      <div className="screen">
        
        <div className="screen-body draw-page-container">
        {isGenerating ? (
        <LoadingSpinner text="AI가 그림을 그리고 있어요... 잠시만 기다려주세요 🎨" />
      ) : (
      <div className="practice-page">
        {/* 빠른 예시 */}
        <section className="practice-box">
          <div className="practice-subtitle">
            💡 빠른 예시를 선택하고 설명글을 이어보세요
          </div>
          <div className="example-chips">
            {EXAMPLES.map((ex) => (
              <button
                key={ex.label}
                type="button"
                className="example-chip"
                onClick={() => handleExampleClick(ex)}
              >
                {ex.label}
              </button>
            ))}
          </div>
        </section>

        {/* 텍스트 입력 */}
        <section className="practice-section">
          <div className="practice-label">원하는 그림을 설명해보세요</div>
          <textarea
            className="practice-textarea"
            placeholder="여기에 그리고 싶은 그림을 설명해 주세요..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          <div className="tip-box">
            💡 팁: 무엇을 + 어디서 + 어떤 색깔과 분위기로 그릴지 자세히 써주세요.
            <br />
            🎨 스타일을 선택하면 일러스트 느낌으로 그려집니다!
          </div>
        </section>

        {/* 음성 입력 버튼 */}
        <button
          type="button"
          className={"btn-voice" + (isListening ? " voice-button--active" : "")}
          onClick={handleVoiceInput}
        >
          {isListening ? "🎤 듣는 중... 한 번 더 누르면 종료" : "🎤 말로 설명하기"}
        </button>

        {/* 스타일 선택 */}
        <section className="practice-section">
          <div className="practice-label">그림 스타일을 골라보세요 (선택)</div>
          <div className="style-grid">
            {STYLES.map((style) => (
              <button
                key={style.id}
                type="button"
                className={
                  "style-card" + (selectedStyle === style.id ? " selected" : "")
                }
                onClick={() => handleStyleClick(style.id)}
              >
                {style.label}
                <br />
                <span>{style.description}</span>
              </button>
            ))}
          </div>
        </section>

        {/* 액션 버튼 */}
        <div className="practice-actions">
          <button 
            type="button" 
            className="btn-primary main-action" 
            onClick={handleGenerate}
          >
            🎨 그림 만들기
          </button>
          <button 
            type="button" 
            className="btn-secondary sub-action" 
            onClick={handleHelp}
          >
            💡 도움말
          </button>
        </div>
      </div>
      )}
        </div>
      </div>
    
  );
}
