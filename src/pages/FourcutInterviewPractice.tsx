import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { startListening, isSpeechRecognitionSupported } from "../services/speechRecognitionService";
import { safeGeminiCall } from "../services/geminiService";

export default function FourcutInterviewPractice() {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = location.state?.theme;
  const interviewScene = location.state?.interviewScene;

  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<string[]>(["", "", "", ""]);
  const [isListening, setIsListening] = useState(false);
  const [title, setTitle] = useState("");
  
  // AI 조언 관련 상태
  const [showCompletion, setShowCompletion] = useState(false);
  const [showAdvice, setShowAdvice] = useState(false);
  const [aiAdvice, setAiAdvice] = useState("");
  const [isGeneratingAdvice, setIsGeneratingAdvice] = useState(false);
  const [suggestedCut, setSuggestedCut] = useState<number | null>(null);
  const [isRevising, setIsRevising] = useState(false);
  const [revisingCut, setRevisingCut] = useState<number | null>(null);

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

    // 보완 모드일 경우 revisingCut 사용, 아니면 currentStep 사용
    const targetStep = isRevising && revisingCut !== null ? revisingCut : currentStep;

    // ✅ 모바일 키보드 제거 (textarea 포커스 해제)
    const activeElement = document.activeElement as HTMLElement;
    if (activeElement && activeElement.blur) {
      activeElement.blur();
    }

    setIsListening(true);
    
    let finalTexts: string[] = [];  // 최종 결과들만 저장
    
    startListening({
      onResult: (text, isFinal) => {
        const newAnswers = [...answers];
        
        if (isFinal) {
          // ✅ 최종 결과: 배열에 추가
          console.log("📝 최종 텍스트 추가:", text);
          finalTexts.push(text);
          
          // 기존 텍스트 + 모든 최종 결과 합치기
          const baseText = newAnswers[targetStep] || "";
          const allFinalText = finalTexts.join(" ");
          newAnswers[targetStep] = baseText + (baseText ? " " : "") + allFinalText;
        } else {
          // ✅ 중간 결과: 실시간 표시 (덮어쓰기)
          console.log("⏳ 중간 텍스트 표시:", text);
          const baseText = newAnswers[targetStep] || "";
          const allFinalText = finalTexts.join(" ");
          newAnswers[targetStep] = baseText + (baseText && allFinalText ? " " : "") + allFinalText + (allFinalText ? " " : "") + text;
        }
        
        setAnswers(newAnswers);
      },
      onError: (error) => {
        console.error("음성 인식 오류:", error);
        alert(`음성 인식 오류: ${error}`);
        setIsListening(false);
      },
      onEnd: () => {
        console.log("🎤 음성 인식 종료");
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
      // 4컷 완료 → 완료 화면 표시
      setShowCompletion(true);
    }
  };

  // 이전 단계
  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  // AI 조언 생성
  const handleGetAdvice = async () => {
    setIsGeneratingAdvice(true);
    try {
      const prompt = `
당신은 따뜻하고 친절한 글쓰기 선생님입니다.
노인 학습자가 작성한 4컷 인터뷰를 보고, 
짧고 따뜻한 조언 1개만 해주세요.

인터뷰 내용:

1컷 (만남):
질문: ${questions[0]}
답변: ${answers[0]}

2컷 (이야기):
질문: ${questions[1]}
답변: ${answers[1]}

3컷 (감동):
질문: ${questions[2]}
답변: ${answers[2]}

4컷 (작별):
질문: ${questions[3]}
답변: ${answers[3]}

---

**조언 규칙:**
1. 평가하지 말고, 제안만 하세요
2. 구체적으로 어느 컷을 어떻게 보완할지 알려주세요 (예: "3컷에서...")
3. 한 문장으로 간결하게 (최대 2줄)
4. 따뜻하고 긍정적인 톤으로
5. "~하면 좋을 것 같아요", "~해보면 어떨까요?" 같은 부드러운 표현 사용

**나쁜 예:**
- "3컷이 부족합니다."
- "감정 표현이 약해요."
- "더 잘 써야 합니다."

**좋은 예:**
- "3컷에서 할머니의 표정이나 목소리 톤을 조금 더 추가하면 더욱 생동감 있을 것 같아요!"
- "2컷에서 구체적인 상황(예: 어떤 선물을 들고 있었는지)을 추가하면 더 좋을 것 같아요!"
- "4컷에서 작별 인사를 나누며 느낀 감정을 한 문장 더하면 따뜻한 마무리가 될 거예요!"

---

조언 (한 문장):
`;

      const advice = await safeGeminiCall(prompt);
      setAiAdvice(advice.trim());
      
      // 조언에서 컷 번호 추출 (1컷, 2컷, 3컷, 4컷)
      const match = advice.match(/([1-4])컷/);
      if (match) {
        setSuggestedCut(parseInt(match[1]) - 1); // 0-indexed
      }
      
      setShowAdvice(true);
    } catch (error) {
      console.error("AI 조언 생성 오류:", error);
      alert("조언 생성 중 오류가 발생했습니다.");
    } finally {
      setIsGeneratingAdvice(false);
    }
  };

  // 컷 다시 쓰기
  const handleReviseAnswer = (cutIndex: number) => {
    setRevisingCut(cutIndex);
    setIsRevising(true);
    setShowAdvice(false);
    setShowCompletion(false);
    setCurrentStep(cutIndex);
  };

  // 보완 완료
  const handleRevisionComplete = () => {
    setIsRevising(false);
    setRevisingCut(null);
    handleDirectComplete();
  };

  // 바로 완료
  const handleDirectComplete = () => {
    if (!title.trim()) {
      alert("제목을 입력해주세요!");
      return;
    }

    // 4컷 이미지 생성 페이지로 이동
    navigate("/write/fourcut-images", {
      state: {
        theme,
        interviewScene,
        title,
        questions,
        answers
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
            
            {/* ✅ 음성 인식 중일 때 큰 피드백 표시 */}
            {isListening && (
              <div style={{
                backgroundColor: "#10B981",
                borderRadius: "12px",
                padding: "24px",
                marginBottom: "16px",
                textAlign: "center",
                animation: "pulse 2s infinite"
              }}>
                <div style={{
                  fontSize: "48px",
                  marginBottom: "12px"
                }}>
                  🎤
                </div>
                <div style={{
                  fontSize: "20px",
                  fontWeight: "700",
                  color: "white",
                  marginBottom: "8px"
                }}>
                  듣고 있어요...
                </div>
                <div style={{
                  fontSize: "14px",
                  color: "rgba(255,255,255,0.9)"
                }}>
                  말씀하시면 자동으로 입력됩니다
                </div>
              </div>
            )}
            
            <textarea
              value={answers[currentStep]}
              onChange={(e) => {
                const newAnswers = [...answers];
                newAnswers[currentStep] = e.target.value;
                setAnswers(newAnswers);
              }}
              placeholder="여기에 답변을 입력하세요..."
              disabled={isListening}
              style={{
                width: "100%",
                minHeight: "120px",
                padding: "12px",
                fontSize: "15px",
                border: isListening ? "2px solid #10B981" : "2px solid #E5E7EB",
                borderRadius: "8px",
                fontFamily: "'Noto Sans KR', sans-serif",
                resize: "vertical",
                backgroundColor: isListening ? "#F0FDF4" : "white",
                opacity: isListening ? 0.7 : 1
              }}
            />

            {/* 음성 입력 버튼 */}
            <button
              onClick={handleVoiceInput}
              disabled={isListening}
              style={{
                width: "100%",
                marginTop: "10px",
                padding: "14px",
                fontSize: "16px",
                fontWeight: "700",
                backgroundColor: isListening ? "#D1D5DB" : "#10B981",
                color: "white",
                border: "none",
                borderRadius: "8px",
                cursor: isListening ? "not-allowed" : "pointer",
                boxShadow: isListening ? "none" : "0 4px 12px rgba(16, 185, 129, 0.3)"
              }}
            >
              {isListening ? "⏸️ 음성 인식 중..." : "🎤 음성으로 답변하기"}
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
        {!showCompletion && !showAdvice && !isRevising && (
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
        )}

        {/* 4컷 완료 화면 */}
        {showCompletion && !showAdvice && (
          <div style={{
            backgroundColor: "white",
            borderRadius: "12px",
            padding: "30px",
            marginTop: "20px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.1)"
          }}>
            <div style={{
              textAlign: "center",
              marginBottom: "30px"
            }}>
              <div style={{ fontSize: "64px", marginBottom: "10px" }}>🎉</div>
              <h2 style={{
                fontSize: "24px",
                fontWeight: "700",
                color: "#1F2937",
                marginBottom: "10px"
              }}>
                4컷 인터뷰 완성!
              </h2>
              <p style={{
                fontSize: "16px",
                color: "#6B7280"
              }}>
                AI 조언을 받고 한 문장을 더 다듬어볼까요?
              </p>
            </div>

            <div style={{
              display: "flex",
              flexDirection: "column",
              gap: "12px"
            }}>
              <button
                onClick={handleGetAdvice}
                disabled={isGeneratingAdvice}
                style={{
                  width: "100%",
                  padding: "18px",
                  fontSize: "18px",
                  fontWeight: "700",
                  backgroundColor: isGeneratingAdvice ? "#D1D5DB" : "#7C3AED",
                  color: "white",
                  border: "none",
                  borderRadius: "12px",
                  cursor: isGeneratingAdvice ? "not-allowed" : "pointer",
                  boxShadow: "0 4px 12px rgba(124, 58, 237, 0.3)"
                }}
              >
                {isGeneratingAdvice ? "💭 AI가 생각 중..." : "✨ AI 조언 받기"}
              </button>

              <button
                onClick={handleDirectComplete}
                style={{
                  width: "100%",
                  padding: "18px",
                  fontSize: "18px",
                  fontWeight: "700",
                  backgroundColor: "white",
                  color: "#6B7280",
                  border: "2px solid #E5E7EB",
                  borderRadius: "12px",
                  cursor: "pointer"
                }}
              >
                바로 완료하기 →
              </button>
            </div>
          </div>
        )}

        {/* AI 조언 화면 */}
        {showAdvice && (
          <div style={{
            backgroundColor: "white",
            borderRadius: "12px",
            padding: "30px",
            marginTop: "20px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.1)"
          }}>
            <div style={{
              textAlign: "center",
              marginBottom: "30px"
            }}>
              <div style={{ fontSize: "64px", marginBottom: "10px" }}>💡</div>
              <h2 style={{
                fontSize: "24px",
                fontWeight: "700",
                color: "#1F2937",
                marginBottom: "10px"
              }}>
                AI 선생님의 따뜻한 조언
              </h2>
            </div>

            <div style={{
              backgroundColor: "#F3E8FF",
              borderRadius: "12px",
              padding: "20px",
              marginBottom: "30px"
            }}>
              <div style={{
                fontSize: "16px",
                color: "#1F2937",
                lineHeight: "1.8"
              }}>
                {aiAdvice}
              </div>
            </div>

            {/* 컷 선택 버튼 */}
            <div style={{
              marginBottom: "20px"
            }}>
              <h3 style={{
                fontSize: "16px",
                fontWeight: "700",
                color: "#1F2937",
                marginBottom: "15px",
                textAlign: "center"
              }}>
                어느 컷을 다시 쓸까요?
              </h3>
              <div style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "10px"
              }}>
                {["1컷 (만남)", "2컷 (이야기)", "3컷 (감동)", "4컷 (작별)"].map((label, index) => (
                  <button
                    key={index}
                    onClick={() => handleReviseAnswer(index)}
                    style={{
                      padding: "14px",
                      fontSize: "15px",
                      fontWeight: "600",
                      backgroundColor: suggestedCut === index ? "#7C3AED" : "white",
                      color: suggestedCut === index ? "white" : "#374151",
                      border: suggestedCut === index ? "none" : "2px solid #E5E7EB",
                      borderRadius: "8px",
                      cursor: "pointer",
                      transition: "all 0.2s"
                    }}
                  >
                    {suggestedCut === index && "⭐ "}
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleDirectComplete}
              style={{
                width: "100%",
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
              조언 건너뛰고 바로 완료하기 →
            </button>
          </div>
        )}

        {/* 보완 화면 */}
        {isRevising && revisingCut !== null && (
          <div style={{
            backgroundColor: "white",
            borderRadius: "12px",
            padding: "30px",
            marginTop: "20px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.1)"
          }}>
            <div style={{
              textAlign: "center",
              marginBottom: "30px"
            }}>
              <div style={{ fontSize: "64px", marginBottom: "10px" }}>✍️</div>
              <h2 style={{
                fontSize: "24px",
                fontWeight: "700",
                color: "#1F2937",
                marginBottom: "10px"
              }}>
                {revisingCut + 1}컷 다시 쓰기
              </h2>
            </div>

            {/* AI 조언 다시 보기 */}
            <div style={{
              backgroundColor: "#FEF3C7",
              border: "2px solid #F59E0B",
              borderRadius: "12px",
              padding: "16px",
              marginBottom: "20px",
              fontSize: "14px",
              color: "#92400E",
              lineHeight: "1.6"
            }}>
              💡 <strong>AI 조언:</strong><br />
              {aiAdvice}
            </div>

            {/* 원래 질문과 답변 */}
            <div style={{
              backgroundColor: "#F9FAFB",
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
                fontSize: "15px",
                color: "#1F2937",
                marginBottom: "15px",
                lineHeight: "1.6"
              }}>
                {questions[revisingCut]}
              </div>
              <div style={{
                fontSize: "14px",
                fontWeight: "700",
                color: "#374151",
                marginBottom: "8px"
              }}>
                👤 이전 답변
              </div>
              <div style={{
                fontSize: "14px",
                color: "#6B7280",
                lineHeight: "1.6"
              }}>
                {answers[revisingCut]}
              </div>
            </div>

            {/* 새로운 답변 입력 */}
            <div>
              <div style={{
                fontSize: "16px",
                fontWeight: "700",
                color: "#1F2937",
                marginBottom: "10px"
              }}>
                ✨ 보완한 답변
              </div>
              
              {/* ✅ 음성 인식 중일 때 큰 피드백 표시 */}
              {isListening && (
                <div style={{
                  backgroundColor: "#10B981",
                  borderRadius: "12px",
                  padding: "24px",
                  marginBottom: "16px",
                  textAlign: "center",
                  animation: "pulse 2s infinite"
                }}>
                  <div style={{
                    fontSize: "48px",
                    marginBottom: "12px"
                  }}>
                    🎤
                  </div>
                  <div style={{
                    fontSize: "20px",
                    fontWeight: "700",
                    color: "white",
                    marginBottom: "8px"
                  }}>
                    듣고 있어요...
                  </div>
                  <div style={{
                    fontSize: "14px",
                    color: "rgba(255,255,255,0.9)"
                  }}>
                    말씀하시면 자동으로 입력됩니다
                  </div>
                </div>
              )}
              
              <textarea
                value={answers[revisingCut]}
                onChange={(e) => {
                  const newAnswers = [...answers];
                  newAnswers[revisingCut] = e.target.value;
                  setAnswers(newAnswers);
                }}
                placeholder="조언을 참고해서 답변을 다시 써보세요..."
                disabled={isListening}
                style={{
                  width: "100%",
                  minHeight: "140px",
                  padding: "12px",
                  fontSize: "15px",
                  border: isListening ? "2px solid #10B981" : "2px solid #7C3AED",
                  borderRadius: "8px",
                  fontFamily: "'Noto Sans KR', sans-serif",
                  resize: "vertical",
                  backgroundColor: isListening ? "#F0FDF4" : "white",
                  opacity: isListening ? 0.7 : 1
                }}
              />

              {/* 음성 입력 버튼 */}
              <button
                onClick={handleVoiceInput}
                disabled={isListening}
                style={{
                  width: "100%",
                  marginTop: "10px",
                  padding: "14px",
                  fontSize: "16px",
                  fontWeight: "700",
                  backgroundColor: isListening ? "#D1D5DB" : "#10B981",
                  color: "white",
                  border: "none",
                  borderRadius: "8px",
                  cursor: isListening ? "not-allowed" : "pointer",
                  boxShadow: isListening ? "none" : "0 4px 12px rgba(16, 185, 129, 0.3)"
                }}
              >
                {isListening ? "⏸️ 음성 인식 중..." : "🎤 음성으로 답변하기"}
              </button>
            </div>

            {/* 완료 버튼 */}
            <button
              onClick={handleRevisionComplete}
              disabled={!answers[revisingCut]?.trim()}
              style={{
                width: "100%",
                marginTop: "20px",
                padding: "18px",
                fontSize: "18px",
                fontWeight: "700",
                backgroundColor: !answers[revisingCut]?.trim() ? "#D1D5DB" : "#9C27B0",
                color: "white",
                border: "none",
                borderRadius: "12px",
                cursor: !answers[revisingCut]?.trim() ? "not-allowed" : "pointer",
                boxShadow: "0 4px 12px rgba(156, 39, 176, 0.3)"
              }}
            >
              ✅ 보완 완료하고 저장하기
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
