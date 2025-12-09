import { useNavigate } from "react-router-dom";
import "./WritingGenre.css";

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
      key: "novel", 
      label: "📚 소설", 
      desc: "상상력으로 이야기를 만들어요",
      guide: "등장인물 → 배경 → 사건 → 결말 순으로"
    },
    { 
      key: "autobio", 
      label: "📜 자서전", 
      desc: "내 인생 이야기를 기록해요",
      guide: "어린 시절 → 청년기 → 현재 순으로"
    },
  ];

  return (
    <div className="screen" style={{ paddingTop: "10px" }}>
      <div className="genre-container">
        <h2 className="screen-title">글쓰기 장르 선택</h2>
        <p className="screen-subtitle">
          어떤 종류의 글을 작성할지 선택하세요.
        </p>

        <div className="genre-list">
          {genres.map((g) => (
            <button
              key={g.key}
              className="genre-card"
              onClick={() => {
                // 시와 소설은 질문 페이지로, 나머지는 바로 편집기로
                if (g.key === "poem" || g.key === "novel") {
                  navigate("/writing/genre/questions", { 
                    state: { 
                      genre: g.key, 
                      genreLabel: g.label,
                      genreGuide: g.guide 
                    } 
                  });
                } else {
                  navigate("/write/editor", { 
                    state: { 
                      genre: g.key, 
                      genreLabel: g.label,
                      genreGuide: g.guide 
                    } 
                  });
                }
              }}
            >
              <div className="genre-label">{g.label}</div>
              <div className="genre-desc">{g.desc}</div>
              <div className="genre-guide">💡 {g.guide}</div>
            </button>
          ))}
        </div>

        <button onClick={() => navigate("/write")} className="btn-secondary btn-large">
          ← 이전으로
        </button>
      </div>
    </div>
  );
}
