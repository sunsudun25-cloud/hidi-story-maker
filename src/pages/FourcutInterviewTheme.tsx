import { useNavigate } from "react-router-dom";

export default function FourcutInterviewTheme() {
  const navigate = useNavigate();

  const themes = [
    {
      key: "home",
      icon: "🏠",
      title: "집으로 가는 사람들",
      desc: "고향, 가족을 만나러 가는 사람들의 이야기",
      examples: ["추석 귀성하는 사람", "부모님 뵈러 가는 사람", "고향 친구 만나러 가는 사람"],
      locations: ["고속도로 휴게소", "기차역", "버스 터미널"]
    },
    {
      key: "work",
      icon: "💼",
      title: "일하는 사람들",
      desc: "열심히 일하는 사람들의 일상 이야기",
      examples: ["편의점 아르바이트생", "시장 상인", "택배 기사", "청소부"],
      locations: ["편의점", "시장", "택배 차량", "거리"]
    },
    {
      key: "season",
      icon: "🌸",
      title: "계절의 이야기",
      desc: "계절을 느끼는 사람들의 이야기",
      examples: ["산책하는 노인", "꽃구경 나온 가족", "낙엽 쓰는 청소부", "눈사람 만드는 아이"],
      locations: ["봄꽃 공원", "여름 해변", "가을 산", "겨울 눈길"]
    },
    {
      key: "family",
      icon: "👨‍👩‍👧‍👦",
      title: "우리 가족 소개",
      desc: "소중한 우리 가족 이야기",
      examples: ["손주", "배우자", "자식", "형제자매"],
      locations: ["집 거실", "가족 식당", "공원 벤치", "할머니 댁"]
    },
    {
      key: "memory",
      icon: "🎭",
      title: "옛날 기억 인터뷰",
      desc: "옛 추억 속 사람들과의 만남",
      examples: ["옛날 친구", "첫사랑", "은사님", "젊은 시절의 나"],
      locations: ["옛날 골목", "고향 학교", "첫 직장", "추억의 장소"]
    }
  ];

  return (
    <div style={{
      minHeight: "100vh",
      padding: "20px",
      backgroundColor: "#F3F4F6"
    }}>
      <div style={{
        maxWidth: "800px",
        margin: "0 auto"
      }}>
        {/* 헤더 */}
        <div style={{
          textAlign: "center",
          marginBottom: "30px"
        }}>
          <h1 style={{
            fontSize: "28px",
            fontWeight: "700",
            color: "#1F2937",
            marginBottom: "10px"
          }}>
            🎤 4컷 인터뷰 작가
          </h1>
          <p style={{
            fontSize: "16px",
            color: "#6B7280",
            lineHeight: "1.6"
          }}>
            어떤 이야기를 만들까요?<br />
            테마를 선택하면 연습 예시를 보여드려요!
          </p>
        </div>

        {/* 테마 카드 리스트 */}
        <div style={{
          display: "flex",
          flexDirection: "column",
          gap: "15px",
          marginBottom: "20px"
        }}>
          {themes.map((theme) => (
            <button
              key={theme.key}
              onClick={() => {
                navigate("/write/fourcut-setup", {
                  state: { theme }
                });
              }}
              style={{
                backgroundColor: "white",
                border: "2px solid #E5E7EB",
                borderRadius: "16px",
                padding: "20px",
                textAlign: "left",
                cursor: "pointer",
                transition: "all 0.2s",
                boxShadow: "0 1px 3px rgba(0,0,0,0.1)"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "#9C27B0";
                e.currentTarget.style.boxShadow = "0 4px 12px rgba(156, 39, 176, 0.15)";
                e.currentTarget.style.transform = "translateY(-2px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "#E5E7EB";
                e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,0.1)";
                e.currentTarget.style.transform = "translateY(0)";
              }}
            >
              <div style={{
                display: "flex",
                alignItems: "flex-start",
                gap: "15px"
              }}>
                {/* 아이콘 */}
                <div style={{
                  fontSize: "40px",
                  flexShrink: 0
                }}>
                  {theme.icon}
                </div>

                {/* 내용 */}
                <div style={{ flex: 1 }}>
                  <h3 style={{
                    fontSize: "20px",
                    fontWeight: "700",
                    color: "#1F2937",
                    marginBottom: "8px"
                  }}>
                    {theme.title}
                  </h3>
                  <p style={{
                    fontSize: "14px",
                    color: "#6B7280",
                    marginBottom: "12px",
                    lineHeight: "1.5"
                  }}>
                    {theme.desc}
                  </p>

                  {/* 예시 태그 */}
                  <div style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: "6px"
                  }}>
                    {theme.examples.slice(0, 3).map((example, idx) => (
                      <span
                        key={idx}
                        style={{
                          fontSize: "12px",
                          padding: "4px 10px",
                          backgroundColor: "#F3E8FF",
                          color: "#7C3AED",
                          borderRadius: "12px",
                          fontWeight: "500"
                        }}
                      >
                        {example}
                      </span>
                    ))}
                  </div>
                </div>

                {/* 화살표 */}
                <div style={{
                  fontSize: "24px",
                  color: "#9CA3AF",
                  flexShrink: 0
                }}>
                  →
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* 이전 버튼 */}
        <button
          onClick={() => navigate("/writing/genre")}
          style={{
            width: "100%",
            padding: "16px",
            fontSize: "16px",
            fontWeight: "600",
            backgroundColor: "white",
            color: "#6B7280",
            border: "2px solid #E5E7EB",
            borderRadius: "12px",
            cursor: "pointer"
          }}
        >
          ← 장르 선택으로 돌아가기
        </button>
      </div>
    </div>
  );
}
