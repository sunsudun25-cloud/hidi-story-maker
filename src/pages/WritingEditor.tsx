import { useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import Header from "../components/Header";
import { useStory } from "../context/StoryContext";
import { safeGeminiCall } from "../services/geminiService";

export default function WritingEditor() {
  const location = useLocation();
  const navigate = useNavigate();
  const { addStory, updateStory } = useStory();

  const { genre, label, content, id } = location.state || {};

  // 수정 모드인 경우 기존 content 로드
  const [text, setText] = useState(content || "");
  const [loading, setLoading] = useState(false);
  
  const isEditMode = !!id; // id가 있으면 수정 모드

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

  // AI 이어쓰기
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

    if (isEditMode) {
      // 수정 모드
      updateStory(id, {
        title: label,
        content: text,
        description: `${label} 장르`,
      });
      alert("✅ 수정되었습니다!");
    } else {
      // 새 글 작성 모드
      addStory({
        title: label,
        content: text,
        description: `${label} 장르`,
      });
      alert("✅ 저장되었습니다!");
    }

    navigate("/gallery");
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

        {/* 버튼 영역 */}
        <div className="mt-5 space-y-3">
          <button
            onClick={handleAiContinue}
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
            {loading ? "🤖 AI가 작성 중..." : "🤖 AI 이어쓰기"}
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
            onClick={() => navigate("/writing/help", { state: { genre, label } })}
            className="
              w-full py-3 text-lg font-semibold
              bg-gray-100 text-gray-700 rounded-xl
              hover:bg-gray-200
              transition-colors duration-200
            "
          >
            ← 도움말 다시 보기
          </button>
        </div>
      </div>
    </div>
  );
}
