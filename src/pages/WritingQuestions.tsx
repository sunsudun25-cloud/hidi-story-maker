import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { safeGeminiCall } from "../services/geminiService";
import { startListening, isSpeechRecognitionSupported } from "../services/speechRecognitionService";

export default function WritingQuestions() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as {
    genre: string;
    genreLabel: string;
    genreGuide: string;
    novelSubGenre?: string;
  } | undefined;

  const genre = state?.genre || "poem";
  const genreLabel = state?.genreLabel || "";
  const genreGuide = state?.genreGuide || "";
  const novelSubGenre = state?.novelSubGenre || "";

  // 질문 답변 상태
  const [answers, setAnswers] = useState<{ [key: string]: string }>({});
  const [isGenerating, setIsGenerating] = useState(false);
  
  // 음성 입력 상태
  const [listeningQuestionId, setListeningQuestionId] = useState<string | null>(null);

  // 장르별 질문 정의
  const questions: { [key: string]: { id: string; question: string; placeholder: string }[] } = {
    poem: [
      {
        id: "emotion",
        question: "어떤 감정을 표현하고 싶으세요?",
        placeholder: "예: 그리움, 기쁨, 슬픔, 평화..."
      },
      {
        id: "subject",
        question: "무엇에 대해 쓰고 싶으세요?",
        placeholder: "예: 가족, 자연, 계절, 추억..."
      },
      {
        id: "keyword",
        question: "특별히 떠오르는 단어나 장면이 있나요?",
        placeholder: "예: 가을 단풍, 손주의 웃음소리..."
      },
      {
        id: "message",
        question: "마지막으로 꼭 전하고 싶은 한 마디가 있나요?",
        placeholder: "고마워요, 잊지 않을게요, 사랑합니다, 수고했어..."
      }
    ],
    novel: [
      {
        id: "protagonist",
        question: "주인공은 누구인가요?",
        placeholder: "예: 용감한 소년, 지혜로운 할아버지, 귀여운 토끼..."
      },
      {
        id: "setting",
        question: "이야기의 배경은 어디인가요?",
        placeholder: "예: 작은 마을, 신비로운 숲, 옛날 궁궐..."
      },
      {
        id: "conflict",
        question: "어떤 일이 일어나나요?",
        placeholder: "예: 마법의 보물 찾기, 친구와의 모험, 문제 해결..."
      },
      {
        id: "mood",
        question: "어떤 분위기의 이야기인가요?",
        placeholder: "예: 따뜻하고 감동적인, 신비롭고 재미있는, 교훈적인..."
      }
    ]
  };

  // 소설 하위 장르별 맞춤 질문
  const getNovelQuestions = (subGenre: string) => {
    const baseQuestions = questions.novel;
    
    // 장르별 맞춤 플레이스홀더
    const customPlaceholders: { [key: string]: any } = {
      fantasy: {
        protagonist: "예: 마법사 소년, 용을 키우는 소녀, 마법 검을 가진 기사...",
        setting: "예: 마법 학교, 드래곤의 왕국, 마법의 숲, 다른 차원의 세계...",
        conflict: "예: 어둠의 마법사를 물리치기, 마법의 보물 찾기, 저주 풀기...",
        mood: "예: 신비롭고 모험적인, 마법으로 가득한, 환상적이고 웅장한..."
      },
      romance: {
        protagonist: "예: 첫사랑을 만난 청년, 오랜 친구, 운명적으로 만난 두 사람...",
        setting: "예: 작은 카페, 시골 마을, 아름다운 해변, 학교...",
        conflict: "예: 오해로 인한 갈등, 재회, 멀리 떨어져 있기, 고백...",
        mood: "예: 따뜻하고 감동적인, 설레는, 애틋한, 행복한..."
      },
      mystery: {
        protagonist: "예: 명탐정, 호기심 많은 소년, 경찰관, 평범한 사람...",
        setting: "예: 오래된 저택, 작은 마을, 도시, 학교...",
        conflict: "예: 사라진 보물 찾기, 범인 찾기, 미스터리 풀기, 단서 조사...",
        mood: "예: 긴장감 넘치는, 미스터리한, 추리가 필요한, 흥미진진한..."
      },
      healing: {
        protagonist: "예: 지친 직장인, 시골에 온 도시 사람, 할머니, 고양이...",
        setting: "예: 평화로운 시골, 조용한 카페, 작은 정원, 바닷가 마을...",
        conflict: "예: 마음의 상처 치유하기, 일상 속 작은 기쁨 찾기, 새로운 시작...",
        mood: "예: 따뜻하고 평화로운, 위로가 되는, 잔잔한, 희망적인..."
      },
      historical: {
        protagonist: "예: 장군, 왕족, 평민 출신 영웅, 가문의 어른...",
        setting: "예: 조선시대, 고려 왕조, 전쟁터, 궁궐, 시대적 격변기...",
        conflict: "예: 나라를 지키기, 가문의 명예, 역사적 사건, 시대의 변화...",
        mood: "예: 장대하고 웅장한, 역사적인, 감동적인, 교훈적인..."
      },
      adventure: {
        protagonist: "예: 모험가, 탐험가, 보물 사냥꾼, 여행자...",
        setting: "예: 미지의 섬, 정글, 사막, 바다, 산맥...",
        conflict: "예: 보물 찾기, 위험한 여정, 미지의 땅 탐험, 구출 작전...",
        mood: "예: 흥미진진한, 모험적인, 긴장감 넘치는, 용감한..."
      }
    };

    if (subGenre && customPlaceholders[subGenre]) {
      return baseQuestions.map(q => ({
        ...q,
        placeholder: customPlaceholders[subGenre][q.id] || q.placeholder
      }));
    }
    
    return baseQuestions;
  };

  const currentQuestions = genre === "novel" && novelSubGenre 
    ? getNovelQuestions(novelSubGenre)
    : (questions[genre] || questions.poem);

  // 답변 입력 핸들러
  const handleAnswerChange = (id: string, value: string) => {
    setAnswers({
      ...answers,
      [id]: value
    });
  };

  // 🎤 음성 입력 핸들러
  const handleVoiceInput = (questionId: string) => {
    if (!isSpeechRecognitionSupported()) {
      alert("이 브라우저는 음성 인식을 지원하지 않습니다.\n\nChrome, Edge, Safari 브라우저를 사용해주세요.");
      return;
    }

    if (listeningQuestionId === questionId) {
      // 이미 해당 질문에서 듣는 중이면 중지
      setListeningQuestionId(null);
      return;
    }

    setListeningQuestionId(questionId);

    const stopListening = startListening({
      onResult: (text, isFinal) => {
        if (isFinal) {
          // ✅ 최종 결과만 텍스트에 추가
          setAnswers((prevAnswers) => {
            const currentAnswer = prevAnswers[questionId] || "";
            return {
              ...prevAnswers,
              [questionId]: currentAnswer + (currentAnswer ? " " : "") + text
            };
          });
        }
      },
      onError: (error) => {
        alert(error);
        setListeningQuestionId(null);
      },
      onEnd: () => {
        console.log("🎤 음성 인식 자동 종료");
        setListeningQuestionId(null);
      }
    });

    // 컴포넌트가 언마운트될 때 음성 인식 중지
    return () => {
      stopListening();
      setListeningQuestionId(null);
    };
  };

  // AI 초안 생성
  const handleGenerateDraft = async () => {
    // 모든 질문에 답변했는지 확인
    const allAnswered = currentQuestions.every((q) => answers[q.id]?.trim());
    if (!allAnswered) {
      alert("모든 질문에 답변해주세요!");
      return;
    }

    setIsGenerating(true);

    try {
      let prompt = "";
      let title = "";

      if (genre === "poem") {
        // 시 초안 생성
        prompt = `
다음 정보를 바탕으로 노인이 쓴 것 같은 따뜻하고 감성적인 시를 작성해주세요:

- 표현하고 싶은 감정: ${answers.emotion}
- 주제: ${answers.subject}
- 키워드/장면: ${answers.keyword}

시는 2-3연으로 구성하고, 각 연은 2-4줄로 작성해주세요.
쉽고 따뜻한 언어를 사용하고, 진솔한 감정이 느껴지도록 작성해주세요.

시만 출력하고 설명은 불필요합니다.
`;
        title = `${answers.subject}에 대한 시`;

      } else if (genre === "novel") {
        // 소설 초안 생성 - 장르별 완전히 다른 시작 방식
        const genrePrompts: { [key: string]: { instruction: string; style: string; opening: string } } = {
          fantasy: {
            instruction: "판타지 소설의 도입부를 작성해주세요.",
            style: "평범한 일상에 신비로운 사건이 나타나는 방식으로 시작합니다. 현실과 비현실이 만나는 첫 장면을 보여주세요.",
            opening: "그날, 평범하던 세상에 처음으로 이상한 일이 벌어졌다. / 아무도 듣지 못한 소리를 주인공만 들었다. / 오래된 물건을 만진 순간 모든 것이 달라졌다."
          },
          romance: {
            instruction: "로맨스 소설의 도입부를 작성해주세요.",
            style: "인물 사이의 감정이 흔들리기 시작하는 순간으로 시작합니다. 첫 만남, 재회, 시선, 말 한마디 같은 정서적 장면을 우선하세요.",
            opening: "그를 다시 만난 것은 [계절/날씨]의 [장소]에서였다. / 주인공은 그날 처음으로 낯선 사람의 눈빛이 오래 남는다는 것을 알았다. / 이름 하나가 불리는 순간, 오래된 감정이 조용히 깨어났다."
          },
          mystery: {
            instruction: "미스터리 소설의 도입부를 작성해주세요.",
            style: "독자가 바로 궁금해할 만한 이상한 단서나 사건으로 시작합니다. 설명되지 않는 장면, 수상한 물건, 낯선 흔적을 먼저 제시하세요.",
            opening: "그날 아침, [장소]에서 아무도 설명할 수 없는 일이 벌어졌다. / 편지는 이름도 없이 [장소]에 놓여 있었다. / 주인공은 분명히 아무도 없는 방에서 들려오는 발소리를 들었다."
          },
          healing: {
            instruction: "힐링 소설의 도입부를 작성해주세요.",
            style: "사건보다 분위기와 정서를 먼저 보여줍니다. 조용한 공간, 작은 행동, 따뜻한 감정으로 시작하세요.",
            opening: "[시간]의 [장소]는 늘 조용했고, 주인공은 그곳에서 마음을 쉬게 했다. / 햇살은 먼저 창가에 앉아 있었고, 주인공은 그 옆에 천천히 하루를 내려놓았다. / 그곳에 가면 이상하게도 마음이 조금 가벼워졌다."
          }
        };

        const genreData = novelSubGenre && genrePrompts[novelSubGenre] 
          ? genrePrompts[novelSubGenre]
          : {
              instruction: "짧은 소설의 도입부를 작성해주세요.",
              style: "자연스러운 이야기의 시작으로 장면을 열어주세요.",
              opening: ""
            };

        prompt = `
다음 정보를 바탕으로 ${genreData.instruction}

**주어진 정보:**
- 주인공: ${answers.protagonist}
- 배경: ${answers.setting}
- 사건: ${answers.conflict}
- 분위기: ${answers.mood}

**장르별 시작 방식:**
${genreData.style}

**시작 문장 참고 예시:**
${genreData.opening}

**작성 규칙:**
1. 도입부는 3-4개의 짧은 문단으로 작성
2. 첫 문장은 장르 특성에 맞게 독자의 관심을 끄는 방식으로 시작
3. "얘들아, 할머니가~" 같은 구연동화체 시작은 절대 사용하지 말 것
4. 등장인물과 배경을 자연스럽게 소개
5. 사건의 시작을 암시
6. 쉽고 읽기 편한 문체 사용

소설 내용만 출력하고, 제목이나 설명은 포함하지 마세요.
`;
        title = `${answers.protagonist}의 이야기`;
      }

      const draft = await safeGeminiCall(prompt);

      // WriteEditor로 이동하며 초안 전달
      navigate("/write/editor", {
        state: {
          genre: genre,
          genreLabel: genreLabel,
          genreGuide: genreGuide,
          novelSubGenre: novelSubGenre,
          title: title,
          initialContent: draft
        }
      });

    } catch (error) {
      console.error("AI 초안 생성 오류:", error);
      alert("초안 생성 중 오류가 발생했습니다. 다시 시도해주세요.");
    } finally {
      setIsGenerating(false);
    }
  };

  // 건너뛰기 (질문 없이 바로 작성)
  const handleSkip = () => {
    navigate("/write/editor", {
      state: {
        genre: genre,
        genreLabel: genreLabel,
        genreGuide: genreGuide,
        novelSubGenre: novelSubGenre
      }
    });
  };

  return (
    <>
      <style>{`
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
      `}</style>
      
      <main style={{
        padding: "20px",
        maxWidth: "800px",
        margin: "0 auto",
        minHeight: "100vh",
      }}>
      {/* 헤더 */}
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: "30px"
      }}>
        <button
          onClick={() => navigate(-1)}
          style={{
            padding: "12px 20px",
            fontSize: "18px",
            backgroundColor: "#ddd",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
          }}
        >
          ← 뒤로
        </button>
        <h1 style={{ fontSize: "28px", fontWeight: "bold", margin: 0 }}>
          {genreLabel}
        </h1>
        <button
          onClick={() => navigate("/home")}
          style={{
            padding: "12px 20px",
            fontSize: "18px",
            backgroundColor: "#ddd",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
          }}
        >
          🏠
        </button>
      </div>

      {/* 설명 */}
      <div style={{
        padding: "20px",
        backgroundColor: "#E3F2FD",
        border: "2px solid #2196F3",
        borderRadius: "12px",
        marginBottom: "30px",
        textAlign: "center",
      }}>
        <p style={{
          fontSize: "20px",
          color: "#1565C0",
          fontWeight: "600",
          marginBottom: "10px",
        }}>
          💡 AI가 초안을 만들어드려요
        </p>
        <p style={{
          fontSize: "16px",
          color: "#666",
          lineHeight: "1.6",
        }}>
          아래 질문에 답변하시면 AI가 {genreLabel}의 초안을 자동으로 만들어드립니다.<br />
          초안을 받은 후 자유롭게 수정하실 수 있어요!
        </p>
      </div>

      {/* 질문들 */}
      <div style={{ marginBottom: "30px" }}>
        {currentQuestions.map((q, index) => (
          <div
            key={q.id}
            style={{
              padding: "25px",
              backgroundColor: "white",
              borderRadius: "12px",
              boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
              marginBottom: "20px",
            }}
          >
            <div style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: "15px",
            }}>
              <label style={{
                fontSize: "20px",
                fontWeight: "600",
                color: "#333",
              }}>
                {index + 1}. {q.question}
              </label>
              <button
                onClick={() => handleVoiceInput(q.id)}
                disabled={isGenerating}
                style={{
                  padding: "10px 16px",
                  fontSize: "16px",
                  backgroundColor: listeningQuestionId === q.id ? "#E91E63" : "#E91E63",
                  color: "white",
                  border: listeningQuestionId === q.id ? "2px solid #C2185B" : "none",
                  borderRadius: "8px",
                  cursor: isGenerating ? "not-allowed" : "pointer",
                  fontWeight: "600",
                  boxShadow: listeningQuestionId === q.id ? "0 0 20px rgba(233, 30, 99, 0.5)" : "0 2px 4px rgba(0,0,0,0.1)",
                  animation: listeningQuestionId === q.id ? "pulse 1.5s ease-in-out infinite" : "none",
                  position: "relative",
                  whiteSpace: "nowrap",
                }}
              >
                {listeningQuestionId === q.id ? "⏹️ 중지" : "🎤 음성"}
                {listeningQuestionId === q.id && (
                  <span style={{
                    position: "absolute",
                    top: "-6px",
                    right: "-6px",
                    width: "12px",
                    height: "12px",
                    backgroundColor: "#4CAF50",
                    borderRadius: "50%",
                    animation: "blink 1s ease-in-out infinite"
                  }}></span>
                )}
              </button>
            </div>
            <textarea
              value={answers[q.id] || ""}
              onChange={(e) => handleAnswerChange(q.id, e.target.value)}
              placeholder={q.placeholder}
              style={{
                width: "100%",
                padding: "16px",
                fontSize: "18px",
                border: "2px solid #ddd",
                borderRadius: "8px",
                outline: "none",
                resize: "vertical",
                minHeight: "80px",
                lineHeight: "1.6",
                fontFamily: "inherit",
              }}
              onFocus={(e) => e.target.style.borderColor = "#2196F3"}
              onBlur={(e) => e.target.style.borderColor = "#ddd"}
            />
          </div>
        ))}
      </div>

      {/* 버튼 영역 */}
      <div style={{
        display: "flex",
        flexDirection: "column",
        gap: "15px",
      }}>
        <button
          onClick={handleGenerateDraft}
          disabled={isGenerating}
          style={{
            padding: "20px",
            fontSize: "22px",
            backgroundColor: isGenerating ? "#ccc" : "#4CAF50",
            color: "white",
            border: "none",
            borderRadius: "12px",
            cursor: isGenerating ? "not-allowed" : "pointer",
            fontWeight: "bold",
            boxShadow: isGenerating ? "none" : "0 4px 12px rgba(76, 175, 80, 0.3)",
          }}
        >
          {isGenerating ? "⏳ AI가 초안 만드는 중..." : "✨ AI 초안 만들기"}
        </button>

        <button
          onClick={handleSkip}
          disabled={isGenerating}
          style={{
            padding: "16px",
            fontSize: "18px",
            backgroundColor: "white",
            color: "#666",
            border: "2px solid #ddd",
            borderRadius: "12px",
            cursor: isGenerating ? "not-allowed" : "pointer",
            fontWeight: "600",
          }}
        >
          건너뛰고 직접 작성하기 →
        </button>
      </div>

      {/* 팁 */}
      <div style={{
        marginTop: "30px",
        padding: "15px 20px",
        backgroundColor: "#FFF3CD",
        border: "2px solid #FFC107",
        borderRadius: "8px",
        fontSize: "16px",
      }}>
        💡 <strong>도움말:</strong> 간단하게 답변하셔도 괜찮아요! AI가 자연스럽게 확장해드립니다.
      </div>
    </main>
    </>
  );
}
