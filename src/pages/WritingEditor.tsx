import { useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import Header from "../components/Header";
import { useStory } from "../context/StoryContext";
import { safeGeminiCall, generateContinuationSamples } from "../services/geminiService";

export default function WritingEditor() {
  const location = useLocation();
  const navigate = useNavigate();
  const { addStory, updateStory } = useStory();

  const { genre, label, content, id, initialText } = location.state || {};

  // 수정 모드인 경우 기존 content 로드, AI 질문에서 온 경우 initialText 사용
  const [text, setText] = useState(content || initialText || "");
  const [loading, setLoading] = useState(false);
  const [continuationSamples, setContinuationSamples] = useState<string[]>([]);
  const [showSamples, setShowSamples] = useState(false);
  
  const isEditMode = !!id; // id가 있으면 수정 모드

  // initialText가 있으면 자동으로 설정
  useEffect(() => {
    if (initialText && !content) {
      setText(initialText);
    }
  }, [initialText, content]);

  if (!genre) {
    return (
      <div className="pb-24">
        <Header title="글쓰기" />
        <div className="p-5">
          <div className="bg-red-50 border border-red-300 rounded-xl p-6 text-center">
            <p className="text-xl text-red-600 font-semibold mb-4">
              잘못된 접근입니다.
            </p>
            <button
              onClick={() => navigate("/writing/genre")}
              className="bg-emerald-500 text-white px-6 py-3 rounded-xl text-lg font-bold hover:bg-emerald-600 transition-colors"
            >
              장르 선택으로 돌아가기
            </button>
          </div>
        </div>
      </div>
    );
  }

  // AI 이어쓰기 샘플 생성
  const handleGenerateSamples = async () => {
    if (!text.trim()) {
      alert("먼저 글을 작성해주세요.");
      return;
    }

    setLoading(true);
    setShowSamples(false);

    try {
      const samples = await generateContinuationSamples(text);
      setContinuationSamples(samples);
      setShowSamples(true);
    } catch (error) {
      console.error("이어쓰기 샘플 생성 오류:", error);
      alert("이어쓰기 샘플 생성 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  // 샘플 선택
  const handleSelectSample = (sample: string) => {
    setText((prev) => prev + "\n\n" + sample);
    setShowSamples(false);
    setContinuationSamples([]);
  };

  // AI 이어쓰기 (기존 버전 - 바로 추가)
  const handleAiContinue = async () => {
    if (!text.trim()) {
      alert("먼저 글을 작성해주세요.");
      return;
    }

    setLoading(true);

    const prompt = `
당신은 글쓰기 도우미입니다.
아래 사용자의 글을 자연스럽게 이어서 2~3문장 정도 작성해 주세요.

사용자 글:
${text}
`;

    const aiResult = await safeGeminiCall(prompt);

    if (aiResult) {
      setText((prev) => prev + "\n\n" + aiResult);
    }

    setLoading(false);
  };

  // 저장하기
  const handleSave = async () => {
    if (!text.trim()) {
      alert("내용을 입력해주세요.");
      return;
    }

    try {
      if (isEditMode) {
        try {
          // IndexedDB 저장 시도
          await updateStory(id, label, text);
          alert("✅ 수정되었습니다!");
        } catch (err) {
          console.warn("⚠ IndexedDB 수정 실패 → localStorage fallback 적용", err);

          // localStorage에 백업 저장 (안전 처리)
          try {
            const backup = { id, label, text, updatedAt: Date.now() };
            localStorage.setItem(`story-backup-${id}`, JSON.stringify(backup));
          } catch (e) {
            console.warn("⚠️ localStorage 접근 불가 (무시)", e);
          }
          
          alert("✅ 수정되었습니다! (임시 저장)");
        }
      } else {
        try {
          // 새 글 저장
          await addStory(label, text);
          alert("✅ 저장되었습니다!");
        } catch (err) {
          console.warn("⚠ IndexedDB 저장 실패 → localStorage fallback 적용", err);

          // localStorage 임시 저장 (안전 처리)
          try {
            const tempId = `story-temp-${Date.now()}`;
            const backup = { id: tempId, label, text, createdAt: Date.now() };
            localStorage.setItem(tempId, JSON.stringify(backup));
          } catch (e) {
            console.warn("⚠️ localStorage 접근 불가 (무시)", e);
          }

          alert("✅ 저장되었습니다! (임시 저장)");
        }
      }

      navigate("/gallery");
    } catch (err) {
      console.error("저장 오류:", err);

      alert(
        "⚠ 저장 기능에 문제가 발생했습니다.\n작성한 글은 자동으로 보관 처리되었습니다."
      );

      // 글 유실 방지 (안전 처리)
      try {
        const fallbackId = `story-fallback-${Date.now()}`;
        localStorage.setItem(
          fallbackId,
          JSON.stringify({ label, text, createdAt: Date.now() })
        );
      } catch (e) {
        console.warn("⚠️ localStorage 접근 불가 (무시)", e);
      }
    }
  };

  return (
    <div className="pb-28">
      <Header title={isEditMode ? `${label} 수정` : `${label} 쓰기`} />

      {/* 메인 영역 */}
      <div className="p-5">
        {/* 글자 수 카운터 */}
        <div className="flex justify-between items-center mb-3">
          <p className="text-lg text-gray-600 font-semibold">
            {isEditMode ? "📝 수정 중..." : "✍️ 작성 중..."}
          </p>
          <p className="text-sm text-gray-500">
            {text.length} 글자
          </p>
        </div>

        {/* 텍스트 입력 영역 */}
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="여기에 글을 작성하세요..."
          className="
            w-full h-[350px] p-4 text-lg
            border-2 rounded-xl border-gray-300
            focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent
            resize-none leading-relaxed
          "
        />

        {/* 이어쓰기 샘플 표시 */}
        {showSamples && continuationSamples.length > 0 && (
          <div className="mt-4 p-4 bg-purple-50 rounded-xl border-2 border-purple-200">
            <h3 className="text-lg font-bold text-purple-800 mb-3">
              🤖 AI 이어쓰기 샘플 (선택하세요)
            </h3>
            <div className="space-y-2">
              {continuationSamples.map((sample, index) => (
                <button
                  key={index}
                  onClick={() => handleSelectSample(sample)}
                  className="
                    w-full p-3 text-left text-gray-700
                    bg-white rounded-lg border border-purple-200
                    hover:bg-purple-100 hover:border-purple-400
                    transition-all duration-200
                  "
                >
                  <span className="font-semibold text-purple-600">옵션 {index + 1}:</span> {sample}
                </button>
              ))}
            </div>
            <button
              onClick={() => {
                setShowSamples(false);
                setContinuationSamples([]);
              }}
              className="mt-3 w-full py-2 text-sm text-gray-600 hover:text-gray-800"
            >
              ✕ 샘플 닫기
            </button>
          </div>
        )}

        {/* 버튼 영역 */}
        <div className="mt-5 space-y-3">
          <button
            onClick={handleGenerateSamples}
            disabled={loading || !text.trim()}
            className="
              w-full py-4 text-xl font-bold rounded-xl
              bg-purple-500 text-white shadow-lg 
              hover:bg-purple-600
              active:scale-95
              disabled:bg-gray-300 disabled:cursor-not-allowed
              transition-all duration-200
            "
          >
            {loading ? "🤖 AI가 샘플 생성 중..." : "🤖 이어쓰기 샘플 보기"}
          </button>

          <button
            onClick={handleAiContinue}
            disabled={loading || !text.trim()}
            className="
              w-full py-3 text-lg font-semibold rounded-xl
              bg-purple-400 text-white shadow-md
              hover:bg-purple-500
              active:scale-95
              disabled:bg-gray-300 disabled:cursor-not-allowed
              transition-all duration-200
            "
          >
            {loading ? "🤖 AI가 작성 중..." : "⚡ 빠른 이어쓰기"}
          </button>

          <button
            onClick={handleSave}
            disabled={!text.trim()}
            className="
              w-full py-4 text-xl font-bold rounded-xl
              bg-emerald-500 text-white shadow-lg 
              hover:bg-emerald-600
              active:scale-95
              disabled:bg-gray-300 disabled:cursor-not-allowed
              transition-all duration-200
            "
          >
            {isEditMode ? "✅ 수정 완료" : "💾 저장하기"}
          </button>

          <button
            onClick={() => navigate("/writing/genre")}
            className="
              w-full py-3 text-lg font-semibold
              bg-gray-100 text-gray-700 rounded-xl
              hover:bg-gray-200
              transition-colors duration-200
            "
          >
            ← 장르 선택으로 돌아가기
          </button>
        </div>
      </div>
    </div>
  );
}
