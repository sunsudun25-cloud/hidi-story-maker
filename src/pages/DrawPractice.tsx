import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { generateImage } from "../services/geminiService";
import LoadingSpinner from "../components/LoadingSpinner";
import { friendlyErrorMessage } from "../utils/errorHandler";
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
    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("이 브라우저에서는 음성 인식이 지원되지 않습니다.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "ko-KR";
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onerror = () => {
      setIsListening(false);
      alert("음성 인식 중 오류가 발생했어요. 다시 시도해 주세요.");
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.onresult = (event: any) => {
      const result = event.results[0][0].transcript as string;
      setDescription((prev) =>
        prev.trim().length > 0 ? `${prev} ${result}` : result
      );
    };

    recognition.start();
  };

  // 그림 생성
  const handleGenerate = async () => {
    if (!description.trim()) {
      alert("그림 설명을 입력해주세요!");
      return;
    }

    setIsGenerating(true);
    try {
      // Gemini Service로 이미지 생성
      const imageUrl = await generateImage(description, selectedStyle ?? "기본 스타일");

      // 결과 페이지로 이동 (prompt와 style 정보도 함께 전달)
      navigate("/result", { 
        state: { 
          imageUrl,
          prompt: description,
          style: selectedStyle ?? "기본"
        } 
      });
    } catch (error) {
      alert(friendlyErrorMessage(error));
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
    <div className="page-container">
      {/* 상단 헤더 */}
      <header className="page-header">
        <button className="header-btn" onClick={() => navigate(-1)}>←</button>
        <h1 className="header-title">연습하기</h1>
        <button className="header-btn" onClick={() => navigate("/home")}>🏠</button>
      </header>

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
          </div>
        </section>

        {/* 스타일 선택 */}
        <div className="section-title">그림 스타일을 골라보세요 (선택)</div>
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

        {/* 음성 입력 */}
        <section className="practice-section">
          <button
            type="button"
            className={
              "voice-button" + (isListening ? " voice-button--active" : "")
            }
            onClick={handleVoiceInput}
          >
            {isListening ? "🎤 듣는 중... 한 번 더 누르면 종료" : "🎤 말로 설명하기"}
          </button>
        </section>

        {/* 액션 버튼 */}
        <div className="practice-actions">
          <button type="button" className="big-btn primary main-action" onClick={handleGenerate}>
            🎨 그림 만들기
          </button>
          <button type="button" className="big-btn secondary sub-action" onClick={handleHelp}>
            💡 도움말
          </button>
        </div>
      </div>
      )}
    </div>
  );
}
