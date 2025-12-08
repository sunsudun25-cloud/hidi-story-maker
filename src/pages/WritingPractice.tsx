import { useNavigate } from "react-router-dom";
import { useState } from "react";
import CanvaHeader from "../components/CanvaHeader";

export default function WritingPractice() {
  const navigate = useNavigate();
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);

  // 연습용 주제 예시
  const practiceTopics = [
    { id: "memory", title: "어린 시절 추억", desc: "가장 기억에 남는 순간을 떠올려보세요" },
    { id: "family", title: "가족 이야기", desc: "소중한 가족과의 시간을 기록해보세요" },
    { id: "nature", title: "자연 풍경", desc: "아름다운 자연을 글로 표현해보세요" },
    { id: "food", title: "음식 이야기", desc: "기억에 남는 음식에 대해 써보세요" },
    { id: "travel", title: "여행 경험", desc: "다녀온 여행지의 추억을 나눠보세요" },
  ];

  const handleStart = () => {
    if (!selectedTopic) {
      alert("주제를 선택해주세요.");
      return;
    }

    const topic = practiceTopics.find(t => t.id === selectedTopic);
    
    navigate("/writing/editor", {
      state: {
        genre: "practice",
        label: topic?.title || "연습하기",
        content: ""
      }
    });
  };

  return (
    <div className="pb-24">
      <CanvaHeader title="연습하기" color="var(--canva-yellow)" />

      <div className="p-5">
        <h2 className="text-2xl font-bold mb-3">주제를 선택하세요</h2>
        
        <p className="text-gray-700 mb-6 leading-relaxed">
          아래 주제 중 하나를 선택하면<br />
          AI가 글쓰기를 도와드려요 ✨
        </p>

        {/* 주제 선택 */}
        <div className="space-y-3 mb-8">
          {practiceTopics.map((topic) => (
            <button
              key={topic.id}
              onClick={() => setSelectedTopic(topic.id)}
              className={`w-full text-left p-5 rounded-xl border-2 transition-all ${
                selectedTopic === topic.id
                  ? "border-emerald-500 bg-emerald-50"
                  : "border-gray-200 bg-white hover:border-emerald-300"
              }`}
            >
              <div className="font-bold text-lg mb-1">{topic.title}</div>
              <div className="text-gray-600 text-sm">{topic.desc}</div>
            </button>
          ))}
        </div>

        {/* 시작하기 버튼 */}
        <button
          onClick={handleStart}
          disabled={!selectedTopic}
          className={`w-full py-4 rounded-xl text-lg font-bold transition-all ${
            selectedTopic
              ? "bg-emerald-500 text-white hover:bg-emerald-600"
              : "bg-gray-200 text-gray-400 cursor-not-allowed"
          }`}
        >
          {selectedTopic ? "✍️ 글쓰기 시작하기" : "주제를 먼저 선택하세요"}
        </button>

        {/* 안내 메시지 */}
        <div className="mt-6 p-4 bg-blue-50 rounded-xl">
          <p className="text-sm text-blue-700 leading-relaxed">
            💡 <strong>팁:</strong> 글을 쓰다가 막히면 "AI 이어쓰기" 버튼을 눌러보세요!
          </p>
        </div>
      </div>
    </div>
  );
}
