import { useNavigate } from "react-router-dom";

export default function NovelGenreSelect() {
  const navigate = useNavigate();

  const novelGenres = [
    {
      key: "fantasy",
      label: "🧙‍♂️ 판타지",
      desc: "마법과 모험이 가득한 환상의 세계",
      emoji: "✨",
      examples: "마법사, 용, 마법의 검, 다른 세계..."
    },
    {
      key: "romance",
      label: "💕 로맨스",
      desc: "따뜻한 사랑 이야기",
      emoji: "💝",
      examples: "첫사랑, 재회, 운명적인 만남..."
    },
    {
      key: "mystery",
      label: "🔍 추리",
      desc: "수수께끼를 풀어가는 이야기",
      emoji: "🕵️",
      examples: "사건, 단서, 범인 찾기, 미스터리..."
    },
    {
      key: "healing",
      label: "🌿 힐링",
      desc: "마음을 위로하는 따뜻한 이야기",
      emoji: "☕",
      examples: "일상, 평화, 치유, 성장..."
    },
    {
      key: "historical",
      label: "🏛️ 대하소설",
      desc: "역사적 배경의 장대한 이야기",
      emoji: "📜",
      examples: "역사, 가문, 시대적 배경, 대를 잇는 이야기..."
    },
    {
      key: "adventure",
      label: "🗺️ 모험",
      desc: "흥미진진한 여행과 탐험",
      emoji: "⛵",
      examples: "탐험, 보물찾기, 여행, 새로운 세계..."
    }
  ];

  const handleGenreSelect = (genreKey: string, genreLabel: string) => {
    navigate("/writing/genre/questions", {
      state: {
        genre: "novel",
        genreLabel: genreLabel,
        genreGuide: "등장인물 → 배경 → 사건 → 결말 순으로",
        novelSubGenre: genreKey
      }
    });
  };

  return (
    <main style={{
      padding: "20px",
      maxWidth: "1000px",
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
          📚 장르 선택
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
          ✍️ 어떤 소설을 쓰고 싶으세요?
        </p>
        <p style={{
          fontSize: "16px",
          color: "#666",
          lineHeight: "1.6",
        }}>
          장르를 선택하시면 AI가 맞춤형 질문을 드려요!
        </p>
      </div>

      {/* 장르 그리드 */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
        gap: "20px",
        marginBottom: "30px",
      }}>
        {novelGenres.map((genre) => (
          <button
            key={genre.key}
            onClick={() => handleGenreSelect(genre.key, genre.label)}
            style={{
              padding: "30px 25px",
              backgroundColor: "white",
              border: "3px solid #E0E0E0",
              borderRadius: "16px",
              cursor: "pointer",
              textAlign: "left",
              boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
              transition: "all 0.3s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-5px)";
              e.currentTarget.style.borderColor = "#2196F3";
              e.currentTarget.style.boxShadow = "0 8px 20px rgba(33, 150, 243, 0.2)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.borderColor = "#E0E0E0";
              e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.1)";
            }}
          >
            {/* 아이콘 */}
            <div style={{
              fontSize: "48px",
              marginBottom: "15px",
            }}>
              {genre.emoji}
            </div>

            {/* 제목 */}
            <div style={{
              fontSize: "22px",
              fontWeight: "bold",
              color: "#333",
              marginBottom: "10px",
            }}>
              {genre.label}
            </div>

            {/* 설명 */}
            <div style={{
              fontSize: "16px",
              color: "#666",
              marginBottom: "15px",
              lineHeight: "1.5",
            }}>
              {genre.desc}
            </div>

            {/* 예시 */}
            <div style={{
              fontSize: "14px",
              color: "#999",
              fontStyle: "italic",
              borderTop: "1px solid #F0F0F0",
              paddingTop: "12px",
            }}>
              💡 {genre.examples}
            </div>
          </button>
        ))}
      </div>

      {/* 도움말 */}
      <div style={{
        padding: "20px",
        backgroundColor: "#FFF9C4",
        border: "2px solid #FBC02D",
        borderRadius: "12px",
        fontSize: "16px",
        color: "#F57F17",
        textAlign: "center",
      }}>
        💡 <strong>Tip:</strong> 장르는 이야기의 분위기를 정하는 거예요. 나중에 자유롭게 수정할 수 있으니 편하게 선택하세요!
      </div>
    </main>
  );
}
