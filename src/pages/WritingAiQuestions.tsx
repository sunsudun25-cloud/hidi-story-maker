import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import CanvaHeader from "../components/CanvaHeader";
import LoadingSpinner from "../components/LoadingSpinner";
import { generateStoryPrompts } from "../services/geminiService";

interface Question {
  question: string;
  answer: string;
}

export default function WritingAiQuestions() {
  const location = useLocation();
  const navigate = useNavigate();
  const { genre, label } = location.state || {};

  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentAnswer, setCurrentAnswer] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!genre) {
      navigate("/writing/genre");
      return;
    }

    loadQuestions();
  }, [genre]);

  const loadQuestions = async () => {
    setLoading(true);
    try {
      const prompts = await generateStoryPrompts(genre);
      
      // Gemini API 응답을 질문 배열로 변환
      const questionList = prompts.split('\n')
        .filter(line => line.trim())
        .slice(0, 3) // 3개 질문만
        .map(q => ({
          question: q.replace(/^[-*]\s*/, '').replace(/^\d+\.\s*/, ''),
          answer: ''
        }));

      setQuestions(questionList);
    } catch (error) {
      console.error("질문 생성 실패:", error);
      // 기본 질문 제공
      setQuestions(getDefaultQuestions(genre));
    } finally {
      setLoading(false);
    }
  };

  const getDefaultQuestions = (genre: string): Question[] => {
    const defaults: Record<string, Question[]> = {
      diary: [
        { question: "오늘 어떤 일이 있었나요?", answer: "" },
        { question: "오늘 만난 사람 중 기억에 남는 사람이 있나요?", answer: "" },
        { question: "오늘의 기분을 한 단어로 표현한다면?", answer: "" }
      ],
      essay: [
        { question: "어떤 주제에 대해 쓰고 싶으신가요?", answer: "" },
        { question: "이 주제를 선택한 이유가 있나요?", answer: "" },
        { question: "독자에게 전하고 싶은 메시지는?", answer: "" }
      ],
      poem: [
        { question: "어떤 감정을 표현하고 싶으신가요?", answer: "" },
        { question: "특별히 떠오르는 이미지나 장면이 있나요?", answer: "" },
        { question: "이 시를 통해 전하고 싶은 것은?", answer: "" }
      ],
      novel: [
        { question: "이야기의 주인공은 누구인가요?", answer: "" },
        { question: "어떤 사건이 일어나나요?", answer: "" },
        { question: "이야기의 배경은 어디인가요?", answer: "" }
      ],
      letter: [
        { question: "누구에게 편지를 쓰시나요?", answer: "" },
        { question: "무엇을 전하고 싶으신가요?", answer: "" },
        { question: "가장 하고 싶은 말은?", answer: "" }
      ],
      travel: [
        { question: "어디를 여행했나요?", answer: "" },
        { question: "가장 인상 깊었던 순간은?", answer: "" },
        { question: "다시 가고 싶은 이유는?", answer: "" }
      ],
      memoir: [
        { question: "어떤 시기의 기억을 쓰고 싶으신가요?", answer: "" },
        { question: "그 시절 가장 기억에 남는 일은?", answer: "" },
        { question: "지금의 나에게 어떤 의미인가요?", answer: "" }
      ],
      autobio: [
        { question: "나의 인생에서 중요한 전환점은?", answer: "" },
        { question: "나를 만든 가장 중요한 경험은?", answer: "" },
        { question: "미래의 내가 이 글을 읽는다면?", answer: "" }
      ]
    };

    return defaults[genre] || defaults.diary;
  };

  const handleNext = () => {
    if (currentAnswer.trim()) {
      const updated = [...questions];
      updated[currentIndex].answer = currentAnswer;
      setQuestions(updated);
      setCurrentAnswer("");

      if (currentIndex < questions.length - 1) {
        setCurrentIndex(currentIndex + 1);
      } else {
        // 모든 질문 완료 → 에디터로 이동
        const initialText = questions
          .map((q, i) => `${q.question}\n${q.answer}`)
          .join("\n\n");
        
        navigate("/writing/editor", {
          state: { genre, label, initialText }
        });
      }
    }
  };

  const handleSkip = () => {
    // 질문 건너뛰기 → 바로 에디터
    navigate("/writing/editor", { state: { genre, label } });
  };

  if (!genre) {
    return null;
  }

  if (loading) {
    return (
      <div className="pb-24">
        <CanvaHeader title="AI 질문" color="var(--canva-yellow)" />
        <div className="flex flex-col items-center justify-center h-[60vh]">
          <LoadingSpinner />
          <p className="mt-4 text-gray-600">AI가 질문을 준비하고 있어요...</p>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentIndex];

  return (
    <div className="pb-24">
      <CanvaHeader title={`${label} 쓰기`} />

      <div className="p-5">
        {/* 진행 상황 */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-semibold text-emerald-600">
              질문 {currentIndex + 1} / {questions.length}
            </span>
            <button
              onClick={handleSkip}
              className="text-sm text-gray-500 hover:text-gray-700 underline"
            >
              건너뛰고 바로 쓰기
            </button>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-emerald-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
            />
          </div>
        </div>

        {/* AI 질문 */}
        <div className="bg-gradient-to-br from-emerald-50 to-blue-50 rounded-2xl p-6 mb-6 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="text-3xl">🤖</div>
            <div className="flex-1">
              <p className="text-sm text-gray-600 mb-2 font-semibold">AI가 물어봐요</p>
              <p className="text-xl font-bold text-gray-800 leading-relaxed">
                {currentQuestion?.question}
              </p>
            </div>
          </div>
        </div>

        {/* 답변 입력 */}
        <div className="mb-6">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            ✍️ 당신의 답변
          </label>
          <textarea
            value={currentAnswer}
            onChange={(e) => setCurrentAnswer(e.target.value)}
            placeholder="자유롭게 답변해주세요..."
            className="
              w-full h-[200px] p-4 text-lg
              border-2 rounded-xl border-gray-300
              focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent
              resize-none leading-relaxed
            "
            autoFocus
          />
          <p className="text-sm text-gray-500 mt-2">
            {currentAnswer.length} 글자
          </p>
        </div>

        {/* 버튼 */}
        <div className="space-y-3">
          <button
            onClick={handleNext}
            disabled={!currentAnswer.trim()}
            className="
              w-full py-4 text-xl font-bold rounded-xl
              bg-emerald-500 text-white shadow-lg 
              hover:bg-emerald-600
              active:scale-95
              disabled:bg-gray-300 disabled:cursor-not-allowed
              transition-all duration-200
            "
          >
            {currentIndex < questions.length - 1 ? "다음 질문" : "✅ 글쓰기 시작"}
          </button>

          {currentIndex > 0 && (
            <button
              onClick={() => {
                setCurrentAnswer(questions[currentIndex - 1].answer);
                setCurrentIndex(currentIndex - 1);
              }}
              className="
                w-full py-3 text-lg font-semibold
                bg-gray-100 text-gray-700 rounded-xl
                hover:bg-gray-200
                transition-colors duration-200
              "
            >
              ← 이전 질문
            </button>
          )}
        </div>

        {/* 도움말 */}
        <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-200">
          <p className="text-sm text-blue-800">
            💡 <strong>Tip:</strong> 짧게 답변해도 괜찮아요! AI가 이 답변을 바탕으로 글쓰기를 도와드립니다.
          </p>
        </div>
      </div>
    </div>
  );
}
