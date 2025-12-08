import Header from "../components/Header";
import { useNavigate } from "react-router-dom";

export default function WritingGenre() {
  const navigate = useNavigate();

  const genres = [
    { 
      key: "diary", 
      label: "📝 일기", 
      desc: "오늘 있었던 일을 기록해요",
      guide: "시간-장소-사건 순으로 써보세요"
    },
    { 
      key: "letter", 
      label: "💌 편지", 
      desc: "가족이나 친구에게 마음을 전해요",
      guide: "안부 인사 → 하고 싶은 말 → 마무리 인사"
    },
    { 
      key: "essay", 
      label: "📖 수필", 
      desc: "일상의 생각과 감정을 표현해요",
      guide: "경험한 일 → 느낀 점 → 배운 점"
    },
    { 
      key: "poem", 
      label: "🎭 시", 
      desc: "감성적으로 마음을 표현해요",
      guide: "느낌과 감정을 자유롭게 표현하세요"
    },
    { 
      key: "autobio", 
      label: "📚 자서전", 
      desc: "내 인생 이야기를 기록해요",
      guide: "어린 시절 → 청년기 → 현재 순으로"
    },
    { 
      key: "memoir", 
      label: "💭 회고록", 
      desc: "특별했던 순간을 되돌아봐요",
      guide: "기억나는 장면 → 당시 감정 → 현재 생각"
    },
  ];

  return (
    <div className="pb-24">
      <Header title="글쓰기" />

      <div className="p-5">
        <h2 className="text-2xl font-bold mb-4">글쓰기 장르 선택</h2>

        <p className="text-gray-700 mb-6 leading-relaxed text-lg">
          어떤 종류의 글을 작성할지 선택하세요.
        </p>

        <div className="grid grid-cols-1 gap-4">
          {genres.map((g) => (
            <button
              key={g.key}
              onClick={() =>
                navigate("/write/editor", { 
                  state: { 
                    genre: g.key, 
                    genreLabel: g.label,
                    genreGuide: g.guide 
                  } 
                })
              }
              className="
                bg-white border-2 border-gray-300 rounded-xl
                p-6 text-left shadow-sm
                hover:border-emerald-500 hover:bg-emerald-50
                transition-all duration-200
                active:scale-95
              "
            >
              <div className="text-2xl font-bold mb-2">{g.label}</div>
              <div className="text-gray-600 text-lg mb-2">{g.desc}</div>
              <div className="text-emerald-600 text-base">💡 {g.guide}</div>
            </button>
          ))}
        </div>

        {/* 뒤로가기 버튼 */}
        <div className="mt-6">
          <button
            onClick={() => navigate("/write")}
            className="
              w-full py-4 text-xl font-semibold
              bg-gray-100 text-gray-700 rounded-xl
              hover:bg-gray-200
              transition-colors duration-200
            "
          >
            ← 이전으로
          </button>
        </div>
      </div>
    </div>
  );
}
