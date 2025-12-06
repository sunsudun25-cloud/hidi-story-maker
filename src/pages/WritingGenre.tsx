import Header from "../components/Header";
import { useNavigate } from "react-router-dom";

export default function WritingGenre() {
  const navigate = useNavigate();

  const genres = [
    { key: "diary", label: "일기" },
    { key: "essay", label: "에세이" },
    { key: "poem", label: "시" },
    { key: "novel", label: "소설" },
    { key: "letter", label: "편지" },
    { key: "travel", label: "여행기" },
    { key: "memoir", label: "회고록" },
    { key: "autobio", label: "자서전" },
  ];

  return (
    <div className="pb-24">
      <Header title="글쓰기" />

      <div className="p-5">
        <h2 className="text-2xl font-bold mb-4">글쓰기 장르 선택</h2>

        <p className="text-gray-700 mb-6 leading-relaxed text-lg">
          어떤 종류의 글을 작성할지 선택하세요.
        </p>

        <div className="grid grid-cols-2 gap-4">
          {genres.map((g) => (
            <button
              key={g.key}
              onClick={() =>
                navigate("/writing/questions", { state: { genre: g.key, label: g.label } })
              }
              className="
                bg-white border-2 border-gray-300 rounded-xl
                py-6 text-xl font-bold shadow-sm
                hover:border-emerald-500 hover:bg-emerald-50
                transition-all duration-200
                active:scale-95
              "
            >
              {g.label}
            </button>
          ))}
        </div>

        {/* 건너뛰기 버튼 */}
        <div className="mt-6">
          <button
            onClick={() => navigate("/writing/editor", { state: { genre: "diary", label: "자유 글쓰기" } })}
            className="
              w-full py-3 text-lg font-semibold
              bg-gray-100 text-gray-700 rounded-xl
              hover:bg-gray-200
              transition-colors duration-200
            "
          >
            질문 없이 바로 쓰기 →
          </button>
        </div>
      </div>
    </div>
  );
}
