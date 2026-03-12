import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { safeGeminiCall } from "../services/geminiService";

export default function FourcutInterviewPractice() {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = location.state?.theme;

  const [exampleSynopsis, setExampleSynopsis] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!theme) {
      navigate("/write/fourcut-theme");
      return;
    }
    generateExampleSynopsis();
  }, [theme]);

  const generateExampleSynopsis = async () => {
    if (!theme) return;

    setIsLoading(true);
    try {
      const prompt = `
당신은 4컷 인터뷰 작가입니다.
다음 테마로 4컷 인터뷰 예시를 작성해주세요.

테마: ${theme.title}
설명: ${theme.desc}
인터뷰 대상 예시: ${theme.examples[0]}
장소 예시: ${theme.locations[0]}

---

**4컷 구성 규칙:**
- 각 컷은 2-3줄의 짧은 문장으로 구성
- 1컷: 만남 (인터뷰 대상과 첫 만남)
- 2컷: 이야기 (대상의 이야기나 상황)
- 3컷: 감동 (깊은 이야기나 감정)
- 4컷: 작별 (따뜻한 마무리)

---

**출력 형식 (정확히 이 형식으로):**

제목: (제목)

1컷 (만남):
(2-3줄 내용)

2컷 (이야기):
(2-3줄 내용)

3컷 (감동):
(2-3줄 내용)

4컷 (작별):
(2-3줄 내용)

---

노인 학습자가 쉽게 이해하고 따라 쓸 수 있도록 간단하고 따뜻한 예시를 작성해주세요.
`;

      const response = await safeGeminiCall(prompt);
      setExampleSynopsis(response);
    } catch (error) {
      console.error("예시 생성 오류:", error);
      setExampleSynopsis(getDefaultExample(theme.key));
    } finally {
      setIsLoading(false);
    }
  };

  const getDefaultExample = (themeKey: string): string => {
    const examples: { [key: string]: string } = {
      home: `제목: 추석 귀성길의 만남

1컷 (만남):
고속도로 휴게소 벤치에 앉아 계신 분을 봤습니다.
"안녕하세요, 어디 가시는 길이세요?" 물었습니다.

2컷 (이야기):
"고향에 가는 길이에요. 부모님이 기다리고 계세요."
손에는 선물 봉투가 가득 들려있었습니다.

3컷 (감동):
"올해는 코로나 때문에 3년 만에 가는 거예요."
목소리에 설렘과 그리움이 묻어났습니다.

4컷 (작별):
"부모님 건강하시길 바랄게요!" 인사를 나눴습니다.
그분은 환하게 웃으며 차로 돌아갔습니다.`,

      work: `제목: 늦은 밤 편의점에서

1컷 (만남):
편의점에 들어가니 젊은 직원이 있었습니다.
"늦은 시간까지 일하시네요?" 물었습니다.

2컷 (이야기):
"네, 대학 등록금 벌려고 야간 알바 해요."
피곤해 보이지만 밝게 웃었습니다.

3컷 (감동):
"힘들지 않으세요?" 걱정스럽게 물었습니다.
"괜찮아요, 꿈이 있으니까요!" 힘차게 대답했습니다.

4컷 (작별):
작은 간식을 선물로 드렸습니다.
"고맙습니다! 조심히 가세요!" 환하게 웃었습니다.`,

      season: `제목: 봄날 공원의 할머니

1컷 (만남):
공원 벤치에서 꽃을 보고 계신 할머니를 만났습니다.
"벚꽃이 참 예쁘죠?" 말을 걸었습니다.

2컷 (이야기):
"네, 매년 이맘때면 여기 와요. 남편과 추억이 있거든요."
할머니 눈가에 그리움이 어렸습니다.

3컷 (감동):
"남편 분이 꽃을 좋아하셨나 봐요."
"네, 매년 여기서 함께 꽃구경 했었지요." 미소 지으셨습니다.

4컷 (작별):
"올해도 예쁜 꽃 보셨으니 기뻐하실 거예요."
할머니는 고개를 끄덕이며 꽃을 바라보셨습니다.`,

      family: `제목: 우리 손주 이야기

1컷 (만남):
오늘은 우리 손주를 소개하려고 합니다.
이름은 민준이, 올해 7살입니다.

2컷 (이야기):
주말마다 우리 집에 놀러 옵니다.
할아버지 손을 잡고 공원 산책을 좋아해요.

3컷 (감동):
"할아버지, 나 커서도 할아버지랑 같이 살래요!"
그 말에 가슴이 뭉클했습니다.

4컷 (작별):
민준이는 나의 큰 기쁨입니다.
건강하게 자라주길 매일 기도합니다.`,

      memory: `제목: 50년 만에 만난 친구

1컷 (만남):
동창회에서 옛 친구를 만났습니다.
"자네가 철수야?" 반갑게 손을 잡았습니다.

2컷 (이야기):
"50년 만이네! 그때 그 개구쟁이가 맞나?"
둘이서 옛날 이야기에 웃음꽃이 피었습니다.

3컷 (감동):
"우리 젊었을 때가 그립네. 다들 어디 갔을까?"
친구 눈가에 그리움이 어렸습니다.

4컷 (작별):
"자주 만나세! 전화번호 교환하자고."
50년 만에 다시 찾은 소중한 인연이었습니다.`
    };

    return examples[themeKey] || examples.home;
  };

  const handleStartWriting = () => {
    navigate("/write/editor", {
      state: {
        genre: "fourcut",
        genreLabel: "🎤 4컷 인터뷰",
        genreGuide: "1컷(만남) → 2컷(이야기) → 3컷(감동) → 4컷(작별)",
        themeTitle: theme.title,
        themeKey: theme.key,
        exampleSynopsis
      }
    });
  };

  if (!theme) return null;

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
          <div style={{
            fontSize: "48px",
            marginBottom: "10px"
          }}>
            {theme.icon}
          </div>
          <h1 style={{
            fontSize: "28px",
            fontWeight: "700",
            color: "#1F2937",
            marginBottom: "10px"
          }}>
            {theme.title}
          </h1>
          <p style={{
            fontSize: "16px",
            color: "#6B7280"
          }}>
            {theme.desc}
          </p>
        </div>

        {/* 연습 안내 */}
        <div style={{
          backgroundColor: "#EEF2FF",
          border: "2px solid #818CF8",
          borderRadius: "12px",
          padding: "20px",
          marginBottom: "20px"
        }}>
          <h3 style={{
            fontSize: "18px",
            fontWeight: "700",
            color: "#3730A3",
            marginBottom: "10px"
          }}>
            📚 연습하기
          </h3>
          <p style={{
            fontSize: "14px",
            color: "#4338CA",
            lineHeight: "1.6",
            marginBottom: "10px"
          }}>
            먼저 예시를 보고 어떻게 쓰는지 익혀보세요!<br />
            예시를 참고하여 나만의 이야기를 만들 수 있어요.
          </p>
          <div style={{
            fontSize: "12px",
            color: "#6366F1",
            fontWeight: "600"
          }}>
            💡 꿀팁: 예시를 그대로 따라 쓰거나, 일부만 바꿔서 써도 좋아요!
          </div>
        </div>

        {/* 예시 시놉시스 */}
        <div style={{
          backgroundColor: "white",
          borderRadius: "12px",
          padding: "24px",
          marginBottom: "20px",
          boxShadow: "0 1px 3px rgba(0,0,0,0.1)"
        }}>
          <div style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "15px"
          }}>
            <h3 style={{
              fontSize: "18px",
              fontWeight: "700",
              color: "#1F2937"
            }}>
              ✏️ 예시 작품
            </h3>
            {isLoading && (
              <span style={{
                fontSize: "14px",
                color: "#9C27B0"
              }}>
                🔄 예시 생성 중...
              </span>
            )}
          </div>

          {isLoading ? (
            <div style={{
              textAlign: "center",
              padding: "40px",
              color: "#9CA3AF"
            }}>
              <div style={{ fontSize: "32px", marginBottom: "10px" }}>⏳</div>
              <p>AI가 예시를 만들고 있어요...</p>
            </div>
          ) : (
            <pre style={{
              fontSize: "15px",
              lineHeight: "1.8",
              color: "#374151",
              whiteSpace: "pre-wrap",
              fontFamily: "'Noto Sans KR', sans-serif",
              margin: 0
            }}>
              {exampleSynopsis}
            </pre>
          )}
        </div>

        {/* 4컷 구성 가이드 */}
        <div style={{
          backgroundColor: "#FEF3C7",
          border: "2px solid #F59E0B",
          borderRadius: "12px",
          padding: "20px",
          marginBottom: "20px"
        }}>
          <h3 style={{
            fontSize: "16px",
            fontWeight: "700",
            color: "#92400E",
            marginBottom: "12px"
          }}>
            📝 4컷 작성 가이드
          </h3>
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, 1fr)",
            gap: "10px"
          }}>
            {[
              { num: "1컷", title: "만남", desc: "인터뷰 대상과 첫 만남" },
              { num: "2컷", title: "이야기", desc: "대상의 이야기나 상황" },
              { num: "3컷", title: "감동", desc: "깊은 이야기나 감정" },
              { num: "4컷", title: "작별", desc: "따뜻한 마무리" }
            ].map((cut) => (
              <div
                key={cut.num}
                style={{
                  backgroundColor: "white",
                  padding: "12px",
                  borderRadius: "8px",
                  border: "1px solid #FCD34D"
                }}
              >
                <div style={{
                  fontSize: "14px",
                  fontWeight: "700",
                  color: "#D97706",
                  marginBottom: "4px"
                }}>
                  {cut.num} ({cut.title})
                </div>
                <div style={{
                  fontSize: "12px",
                  color: "#92400E"
                }}>
                  {cut.desc}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 버튼 */}
        <div style={{
          display: "flex",
          gap: "10px"
        }}>
          <button
            onClick={() => navigate("/write/fourcut-theme")}
            style={{
              flex: 1,
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
            ← 테마 다시 선택
          </button>
          <button
            onClick={handleStartWriting}
            style={{
              flex: 2,
              padding: "16px",
              fontSize: "18px",
              fontWeight: "700",
              backgroundColor: "#9C27B0",
              color: "white",
              border: "none",
              borderRadius: "12px",
              cursor: "pointer",
              boxShadow: "0 4px 12px rgba(156, 39, 176, 0.3)"
            }}
          >
            ✍️ 이제 내 이야기 쓰기 →
          </button>
        </div>
      </div>
    </div>
  );
}
