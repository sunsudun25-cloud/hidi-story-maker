import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { startListening, isSpeechRecognitionSupported } from "../services/speechRecognitionService";

export default function FourcutInterviewPractice() {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = location.state?.theme;
  const interviewScene = location.state?.interviewScene;

  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<string[]>(["", "", "", ""]);
  const [isListening, setIsListening] = useState(false);
  const [title, setTitle] = useState("");

  useEffect(() => {
    if (!theme || !interviewScene) {
      navigate("/write/fourcut-theme");
      return;
    }
  }, [theme, interviewScene]);

  // 테마별 질문 세트
  const getQuestions = (themeKey: string): string[] => {
    const questionSets: { [key: string]: string[] } = {
      home: [
        "안녕하세요! 지금 어디 가시는 길이세요?",
        "얼마나 오랜만에 가시는 건가요?",
        "어떤 기분이 드세요?",
        "마지막으로 한 말씀 해주세요!"
      ],
      work: [
        "안녕하세요! 지금 무슨 일을 하고 계세요?",
        "이 일을 하신 지 얼마나 되셨어요?",
        "일하면서 가장 보람찬 순간은 언제인가요?",
        "앞으로의 계획이나 바람이 있으시다면?"
      ],
      season: [
        "안녕하세요! 오늘 어디 나오셨어요?",
        "이 계절에 특별히 떠오르는 추억이 있으신가요?",
        "지금 이 순간 어떤 기분이 드세요?",
        "이 계절을 즐기는 당신만의 방법이 있나요?"
      ],
      family: [
        "오늘은 누구를 소개해주실 건가요?",
        "그분과 가장 좋은 추억은 무엇인가요?",
        "그분에게 해주고 싶은 말이 있다면?",
        "그분은 당신에게 어떤 의미인가요?"
      ],
      memory: [
        "오늘은 어떤 추억을 들려주실 건가요?",
        "그때는 어떤 모습이었나요?",
        "그 순간 어떤 기분이었어요?",
        "지금 그때를 돌아보니 어떤 생각이 드세요?"
      ]
    };

    return questionSets[themeKey] || questionSets.home;
  };

  const questions = theme ? getQuestions(theme.key) : [];

  // 음성 입력 핸들러
  const handleVoiceInput = () => {
    if (!isSpeechRecognitionSupported()) {
      alert("음성 인식을 지원하지 않는 브라우저입니다.\nChrome, Edge, Safari를 사용해주세요.");
      return;
    }

    setIsListening(true);
    startListening({
      onResult: (text) => {
        const newAnswers = [...answers];
        newAnswers[currentStep] = newAnswers[currentStep] + (newAnswers[currentStep] ? " " : "") + text;
        setAnswers(newAnswers);
      },
      onError: (error) => {
        console.error("음성 인식 오류:", error);
        alert(`음성 인식 오류: ${error}`);
        setIsListening(false);
      },
      onEnd: () => {
        setIsListening(false);
      }
    });
  };

  // 다음 단계
  const handleNext = () => {
    if (!answers[currentStep].trim()) {
      alert("답변을 입력해주세요!");
      return;
    }

    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    } else {
      // 완료 → 에디터로 이동
      handleComplete();
    }
  };

  // 이전 단계
  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  // 완료
  const handleComplete = () => {
    if (!title.trim()) {
      alert("제목을 입력해주세요!");
      return;
    }

    const story = `
1컷 (만남):
📺 인터뷰어: ${questions[0]}
👤 답변: ${answers[0]}

2컷 (이야기):
📺 인터뷰어: ${questions[1]}
👤 답변: ${answers[1]}

3컷 (감동):
📺 인터뷰어: ${questions[2]}
👤 답변: ${answers[2]}

4컷 (작별):
📺 인터뷰어: ${questions[3]}
👤 답변: ${answers[3]}
`.trim();

    navigate("/write/editor", {
      state: {
        genre: "fourcut",
        genreLabel: "🎤 4컷 인터뷰",
        genreGuide: "1컷(만남) → 2컷(이야기) → 3컷(감동) → 4컷(작별)",
        themeTitle: theme.title,
        themeKey: theme.key,
        title,
        initialContent: story,
        interviewScene
      }
    });
  };

  if (!theme || !interviewScene) return null;

  return (
    <div style={{
      minHeight: "100vh",
      padding: "20px",
      backgroundColor: "#F3F4F6"
    }}>
      <div style={{
        maxWidth: "800px",
        margin: "0 auto"
      }}>
        {/* 헤더 */}
        <div style={{
          textAlign: "center",
          marginBottom: "30px"
        }}>
          <div style={{
            fontSize: "48px",
            marginBottom: "10px"
          }}>
            {theme.icon}
          </div>
          <h1 style={{
            fontSize: "28px",
            fontWeight: "700",
            color: "#1F2937",
            marginBottom: "10px"
          }}>
            🎤 4컷 인터뷰 연습
          </h1>
          <p style={{
            fontSize: "16px",
            color: "#6B7280"
          }}>
            {theme.title}
          </p>
        </div>

        {/* 인터뷰 장면 이미지 */}
        <div style={{
          backgroundColor: "white",
          borderRadius: "12px",
          padding: "20px",
          marginBottom: "20px",
          boxShadow: "0 1px 3px rgba(0,0,0,0.1)"
        }}>
          <h3 style={{
            fontSize: "18px",
            fontWeight: "700",
            color: "#1F2937",
            marginBottom: "15px",
            textAlign: "center"
          }}>
            🎬 인터뷰 장면
          </h3>
          <img
            src={interviewScene.imageUrl}
            alt="인터뷰 장면"
            style={{
              width: "100%",
              borderRadius: "8px",
              marginBottom: "15px"
            }}
          />
          <div style={{
            fontSize: "14px",
            color: "#6B7280",
            textAlign: "center",
            lineHeight: "1.6"
          }}>
            📍 장소: {interviewScene.location}<br />
            🎤 인터뷰어: {interviewScene.interviewer === "male" ? "남자 아나운서" : "여자 아나운서"}<br />
            👤 답변자: {interviewScene.interviewee}
          </div>
        </div>

        {/* 제목 입력 (첫 단계에서만) */}
        {currentStep === 0 && (
          <div style={{
            backgroundColor: "white",
            borderRadius: "12px",
            padding: "20px",
            marginBottom: "20px",
            boxShadow: "0 1px 3px rgba(0,0,0,0.1)"
          }}>
            <h3 style={{
              fontSize: "18px",
              fontWeight: "700",
              color: "#1F2937",
              marginBottom: "15px"
            }}>
              📝 인터뷰 제목을 입력하세요
            </h3>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="예: 추석 귀성길의 만남"
              style={{
                width: "100%",
                padding: "12px",
                fontSize: "16px",
                border: "2px solid #E5E7EB",
                borderRadius: "8px",
                fontFamily: "'Noto Sans KR', sans-serif"
              }}
            />
          </div>
        )}

        {/* 진행 상황 */}
        <div style={{
          backgroundColor: "#EEF2FF",
          border: "2px solid #818CF8",
          borderRadius: "12px",
          padding: "16px",
          marginBottom: "20px"
        }}>
          <div style={{
            fontSize: "16px",
            fontWeight: "700",
            color: "#3730A3",
            marginBottom: "10px",
            textAlign: "center"
          }}>
            {currentStep + 1}컷 / 4컷
          </div>
          <div style={{
            display: "flex",
            gap: "8px",
            marginBottom: "10px"
          }}>
            {[0, 1, 2, 3].map((step) => (
              <div
                key={step}
                style={{
                  flex: 1,
                  height: "8px",
                  backgroundColor: step <= currentStep ? "#818CF8" : "#E5E7EB",
                  borderRadius: "4px",
                  transition: "all 0.3s"
                }}
              />
            ))}
          </div>
          <div style={{
            fontSize: "14px",
            color: "#4338CA",
            textAlign: "center"
          }}>
            {["만남", "이야기", "감동", "작별"][currentStep]}
          </div>
        </div>

        {/* 질문 및 답변 */}
        <div style={{
          backgroundColor: "white",
          borderRadius: "12px",
          padding: "24px",
          marginBottom: "20px",
          boxShadow: "0 1px 3px rgba(0,0,0,0.1)"
        }}>
          {/* 인터뷰어 질문 */}
          <div style={{
            backgroundColor: "#F3E8FF",
            borderRadius: "8px",
            padding: "16px",
            marginBottom: "20px"
          }}>
            <div style={{
              fontSize: "14px",
              fontWeight: "700",
              color: "#7C3AED",
              marginBottom: "8px"
            }}>
              📺 인터뷰어
            </div>
            <div style={{
              fontSize: "16px",
              color: "#1F2937",
              lineHeight: "1.6"
            }}>
              {questions[currentStep]}
            </div>
          </div>

          {/* 답변 입력 */}
          <div>
            <div style={{
              fontSize: "16px",
              fontWeight: "700",
              color: "#1F2937",
              marginBottom: "10px"
            }}>
              👤 당신의 답변
            </div>
            <textarea
              value={answers[currentStep]}
              onChange={(e) => {
                const newAnswers = [...answers];
                newAnswers[currentStep] = e.target.value;
                setAnswers(newAnswers);
              }}
              placeholder="여기에 답변을 입력하세요..."
              style={{
                width: "100%",
                minHeight: "120px",
                padding: "12px",
                fontSize: "15px",
                border: "2px solid #E5E7EB",
                borderRadius: "8px",
                fontFamily: "'Noto Sans KR', sans-serif",
                resize: "vertical"
              }}
            />

            {/* 음성 입력 버튼 */}
            <button
              onClick={handleVoiceInput}
              disabled={isListening}
              style={{
                width: "100%",
                marginTop: "10px",
                padding: "12px",
                fontSize: "15px",
                fontWeight: "600",
                backgroundColor: isListening ? "#D1D5DB" : "#10B981",
                color: "white",
                border: "none",
                borderRadius: "8px",
                cursor: isListening ? "not-allowed" : "pointer"
              }}
            >
              {isListening ? "👂 듣고 있어요..." : "🎤 음성으로 답변하기"}
            </button>
          </div>
        </div>

        {/* 버튼 */}
        <div style={{
          display: "flex",
          gap: "10px"
        }}>
          {currentStep > 0 && (
            <button
              onClick={handlePrevious}
              style={{
                flex: 1,
                padding: "16px",
                fontSize: "16px",
                fontWeight: "600",
                backgroundColor: "white",
                color: "#6B7280",
                border: "2px solid #E5E7EB",
                borderRadius: "12px",
                cursor: "pointer"
              }}
            >
              ← 이전
            </button>
          )}
          <button
            onClick={handleNext}
            disabled={!answers[currentStep].trim() || (currentStep === 0 && !title.trim())}
            style={{
              flex: 2,
              padding: "16px",
              fontSize: "18px",
              fontWeight: "700",
              backgroundColor: (!answers[currentStep].trim() || (currentStep === 0 && !title.trim()))
                ? "#D1D5DB"
                : "#9C27B0",
              color: "white",
              border: "none",
              borderRadius: "12px",
              cursor: (!answers[currentStep].trim() || (currentStep === 0 && !title.trim()))
                ? "not-allowed"
                : "pointer",
              boxShadow: "0 4px 12px rgba(156, 39, 176, 0.3)"
            }}
          >
            {currentStep < 3 ? "다음 →" : "✅ 완료"}
          </button>
        </div>

        {/* 안내 */}
        <div style={{
          marginTop: "20px",
          padding: "16px",
          backgroundColor: "#FEF3C7",
          border: "2px solid #F59E0B",
          borderRadius: "12px",
          fontSize: "14px",
          color: "#92400E",
          lineHeight: "1.6"
        }}>
          💡 <strong>꿀팁:</strong> 각 질문에 2-3문장으로 답변하세요!<br />
          음성 입력을 사용하면 더 편하게 작성할 수 있어요.
        </div>
      </div>
    </div>
  );
}
