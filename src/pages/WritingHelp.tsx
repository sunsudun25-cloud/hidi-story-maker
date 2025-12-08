import { useLocation, useNavigate } from "react-router-dom";
import CommonHeader from "../components/CommonHeader";

export default function WritingHelp() {
  const location = useLocation();
  const navigate = useNavigate();

  const { genre, label } = location.state || {};

  if (!genre) {
    return (
      <div className="pb-24">
        <CommonHeader title="글쓰기 안내" color="#FFF2A8" />
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

  // 장르별 AI 도움말
  const helpText: Record<string, string[]> = {
    diary: [
      "오늘 있었던 일을 떠올려보세요.",
      "감정·날씨·만난 사람을 함께 적으면 좋아요.",
      "짧아도 괜찮아요. 하루를 편하게 기록하세요."
    ],
    essay: [
      "어떤 주제에 대해 생각을 적어보세요.",
      "경험에서 느낀 점을 중심으로 작성하면 좋아요.",
      "예시는 굳이 없어도 됩니다. 자연스럽게 써보세요."
    ],
    poem: [
      "떠오르는 이미지나 감정을 한 문장으로 표현해보세요.",
      "짧은 문장으로 감정을 담아도 충분합니다.",
      "비유나 반복을 활용하면 운율이 생겨요."
    ],
    fairytale: [
      "주인공을 한 문장으로 소개해보세요.",
      "어떤 사건이 일어날지 떠올려보세요.",
      "장면을 묘사하면 더 생생한 동화가 만들어져요."
    ],
    letter: [
      "누구에게 편지를 쓰는지 떠올려보세요.",
      "감사·격려·사과 등 마음을 표현해보세요.",
      "마지막에 한마디 덧붙이면 따뜻해집니다."
    ],
    travel: [
      "기억에 남는 장소를 떠올려보세요.",
      "그 순간의 분위기·소리·냄새까지 적으면 좋아요.",
      "하이라이트 장면을 중심으로 적어보세요."
    ],
    memoir: [
      "인상 깊었던 경험 하나를 선택하세요.",
      "그때의 감정과 배운 점을 적어보세요.",
      "나만의 삶의 기록을 차분히 정리해봅니다."
    ],
    autobio: [
      "나의 성장 과정 중 기억에 남는 순간을 떠올려보세요.",
      "가족·학교·직장 등 인물 중심으로 써보세요.",
      "시간 순서대로 쓰면 자연스러운 흐름이 만들어집니다."
    ]
  };

  const tips = helpText[genre] || [];

  return (
    <div className="pb-24">
      <CommonHeader title="글쓰기 안내" color="#FFF2A8" />

      <div className="p-5">
        {/* 장르 제목 */}
        <h2 className="text-3xl font-bold mb-4">📝 {label} 쓰기</h2>

        {/* 안내 박스 */}
        <div className="bg-yellow-50 border-2 border-yellow-300 rounded-xl p-5 mb-6">
          <h3 className="text-xl font-semibold mb-3 text-yellow-800">
            💡 이렇게 시작해보세요
          </h3>

          <ul className="space-y-3 text-lg text-gray-700">
            {tips.map((t, idx) => (
              <li key={idx} className="flex items-start">
                <span className="text-yellow-600 mr-2">•</span>
                <span className="leading-relaxed">{t}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* 다음 단계 버튼 */}
        <button
          onClick={() => navigate("/writing/editor", { state: { genre, label } })}
          className="
            w-full py-4 text-xl font-bold
            bg-emerald-500 text-white rounded-xl shadow-lg
            hover:bg-emerald-600
            active:scale-95
            transition-all duration-200
          "
        >
          ✍️ 글쓰기 시작하기
        </button>

        {/* 뒤로가기 버튼 */}
        <button
          onClick={() => navigate("/writing/genre")}
          className="
            w-full py-3 text-lg font-semibold mt-3
            bg-gray-100 text-gray-700 rounded-xl
            hover:bg-gray-200
            transition-colors duration-200
          "
        >
          ← 장르 다시 선택하기
        </button>
      </div>
    </div>
  );
}
