import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { safeGeminiCall } from "../services/geminiService";
import LoadingSpinner from "../components/LoadingSpinner";
import { useStorybook } from "../context/StorybookContext";
import StorybookLayout from "../components/storybook/StorybookLayout";
import "./Storybook/Storybook.css";

type PlotSuggestion = {
  id: number;
  title: string;
  plot: string;
};

export default function StorybookAISuggestion() {
  const navigate = useNavigate();
  const storybookContext = useStorybook();

  const [suggestions, setSuggestions] = useState<PlotSuggestion[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [isCreatingDraft, setIsCreatingDraft] = useState(false);

  // -----------------------------
  // 1) AI에게 3개 줄거리 추천 받기
  // -----------------------------
  const handleGenerateSuggestions = async () => {
    setIsGenerating(true);
    try {
      const prompt = `
당신은 어린이 동화책 작가입니다.
어린이가 좋아할 만한 동화책 줄거리를 3개 만들어주세요.

각 줄거리는 다음 형식으로 작성해주세요:

제목: [동화책 제목]
줄거리: [3-5문장으로 간단한 줄거리]

---

조건:
- 각 줄거리는 서로 다른 주제와 분위기
- 따뜻하고 희망적인 이야기
- 명확한 주인공과 모험 요소
- 어린이가 이해하기 쉬운 내용
- 교훈이나 메시지 포함

3개의 동화책 줄거리를 위 형식에 맞춰 작성해주세요.
`;

      const result = await safeGeminiCall(prompt);
      
      if (result) {
        // AI 응답 파싱
        const parsedSuggestions = parseAISuggestions(result);
        setSuggestions(parsedSuggestions);
      } else {
        alert("줄거리 생성에 실패했습니다. 다시 시도해주세요.");
      }
    } catch (err: any) {
      console.error("AI 추천 생성 오류:", err);
      
      // Rate Limit 에러 처리
      if (err?.status === 429 || err?.message?.includes('429') || err?.message?.includes('rate limit')) {
        alert("현재 많은 사용자가 접속하여 잠시 대기 중입니다.\n10초 후에 다시 시도해주세요.");
      } else {
        alert("줄거리 생성 중 오류가 발생했습니다.\n잠시 후 다시 시도해주세요.");
      }
    } finally {
      setIsGenerating(false);
    }
  };

  // AI 응답 파싱
  const parseAISuggestions = (text: string): PlotSuggestion[] => {
    const suggestions: PlotSuggestion[] = [];
    
    // null/undefined 체크
    if (!text || typeof text !== 'string') {
      console.error('❌ parseAISuggestions: Invalid text input:', text);
      return [];
    }
    
    const blocks = text.split("---").filter(b => b.trim());

    blocks.forEach((block, index) => {
      const titleMatch = block.match(/제목:\s*(.+?)(?:\n|$)/);
      const plotMatch = block.match(/줄거리:\s*(.+?)(?:\n\n|$)/s);

      if (titleMatch && plotMatch) {
        suggestions.push({
          id: index + 1,
          title: titleMatch[1].trim(),
          plot: plotMatch[1].trim()
        });
      }
    });

    // 파싱 실패 시 기본 줄거리 제공
    if (suggestions.length === 0) {
      suggestions.push(
        {
          id: 1,
          title: "별을 찾아 떠나는 여행",
          plot: "하늘에서 떨어진 작은 별을 집으로 돌려보내기 위해 용감한 소녀가 친구들과 함께 모험을 떠납니다. 여정 속에서 우정과 용기의 소중함을 배웁니다."
        },
        {
          id: 2,
          title: "마법의 씨앗",
          plot: "할머니께 받은 신비한 씨앗을 심은 소년. 씨앗에서 자란 나무는 소원을 이루어주지만, 진정한 행복은 다른 곳에 있다는 걸 깨닫게 됩니다."
        },
        {
          id: 3,
          title: "구름 위의 도시",
          plot: "구름을 타고 하늘 높이 올라간 아이들이 신기한 구름 도시를 발견합니다. 그곳에서 상상력과 꿈의 힘을 배우며 특별한 경험을 하게 됩니다."
        }
      );
    }

    return suggestions.slice(0, 3); // 최대 3개
  };

  // -----------------------------
  // 2) 추천 선택 → 초안 생성 → Editor 이동
  // -----------------------------
  const handleSelectSuggestion = async () => {
    if (selectedId === null) {
      alert("줄거리를 선택해주세요!");
      return;
    }

    const selected = suggestions.find(s => s.id === selectedId);
    if (!selected) return;

    console.log("📘 선택된 줄거리:", selected.title);

    setIsCreatingDraft(true);

    try {
      // ------------------------------
      // Gemini AI로 3페이지 초안 생성
      // ------------------------------
      const draftPrompt = `
당신은 어린이를 위한 동화책 작가입니다.
아래 줄거리를 기반으로 동화책 초안 3페이지를 작성하세요.

제목: ${selected.title}
줄거리: ${selected.plot}

각 페이지는 3~5문장으로 구성하세요.
따뜻하고 희망적인 이야기로 작성해주세요.

출력 형식:
[page1]
내용...

[page2]
내용...

[page3]
내용...
      `;

      const raw = await safeGeminiCall(draftPrompt);

      // ------------------------------
      // 페이지 분리 및 파싱
      // ------------------------------
      const pages: { text: string }[] = [];
      
      // null/undefined 체크
      if (!raw || typeof raw !== 'string') {
        console.error('❌ 초안 생성 실패: API 응답이 없습니다');
        alert('동화책 초안 생성에 실패했습니다.\n잠시 후 다시 시도해주세요.');
        setIsCreatingDraft(false);
        return;
      }
      
      const blocks = raw.split(/\[page\d+\]/);
      
      blocks.forEach(block => {
        const text = block.trim();
        if (text && text.length > 10) {
          pages.push({ text });
        }
      });

      // 최소 1페이지는 보장
      if (pages.length === 0) {
        pages.push({ text: "동화책의 첫 페이지입니다. 내용을 수정해주세요." });
      }

      console.log("✅ 생성된 페이지:", pages.length);

      // ------------------------------
      // Context에 저장
      // ------------------------------
      storybookContext.resetStorybook();
      storybookContext.setTitle(selected.title);
      storybookContext.setPrompt(selected.plot);
      storybookContext.setStyle("동화 스타일");
      storybookContext.setStoryPages(pages);

      // ------------------------------
      // Editor로 이동 (pages 전달)
      // ------------------------------
      navigate("/storybook-editor", {
        state: {
          title: selected.title,
          prompt: selected.plot,
          style: "동화 스타일",
          pages,
        },
      });

    } catch (err: any) {
      console.error("초안 생성 오류:", err);
      
      // Rate Limit 에러 처리
      if (err?.status === 429 || err?.message?.includes('429') || err?.message?.includes('rate limit')) {
        alert("현재 많은 사용자가 접속하여 잠시 대기 중입니다.\n10초 후에 다시 시도해주세요.");
      } else {
        alert("동화책 초안 생성 중 오류가 발생했습니다.\n잠시 후 다시 시도해주세요.");
      }
    } finally {
      setIsCreatingDraft(false);
    }
  };

  return (
    <StorybookLayout title="📚 AI 줄거리 추천">
      {isGenerating || isCreatingDraft ? (
        <LoadingSpinner text={
          isGenerating 
            ? "AI가 재미있는 이야기를 생각하고 있어요... 🤖✨" 
            : "AI가 동화책 초안을 만드는 중이에요... 📚✨"
        } />
      ) : (
        <div className="storybook-page">
          {suggestions.length === 0 ? (
            <>
              {/* AI 추천 안내 */}
              <div style={{
                textAlign: "center",
                padding: "40px 20px",
                backgroundColor: "#F0F9FF",
                borderRadius: "16px",
                marginBottom: "30px"
              }}>
                <div style={{ fontSize: "48px", marginBottom: "20px" }}>🤖</div>
                <h2 style={{ fontSize: "20px", fontWeight: "bold", marginBottom: "15px", color: "#1E40AF" }}>
                  AI가 동화책 줄거리를 추천해드려요!
                </h2>
                <p style={{ fontSize: "16px", color: "#3B82F6", lineHeight: "1.6" }}>
                  버튼을 누르면 AI가 3가지 재미있는<br />
                  동화책 이야기를 만들어줍니다.
                </p>
              </div>

              {/* AI 추천 받기 버튼 */}
              <button
                onClick={handleGenerateSuggestions}
                style={{
                  width: "100%",
                  padding: "20px",
                  backgroundColor: "#8B5CF6",
                  color: "white",
                  border: "none",
                  borderRadius: "12px",
                  fontSize: "18px",
                  fontWeight: "bold",
                  cursor: "pointer",
                  boxShadow: "0 4px 6px rgba(139, 92, 246, 0.3)"
                }}
              >
                ✨ AI 줄거리 추천받기
              </button>
            </>
          ) : (
            <>
              {/* 추천된 줄거리 목록 */}
              <div style={{ marginBottom: "20px" }}>
                <h3 style={{ fontSize: "18px", fontWeight: "bold", marginBottom: "15px", color: "#374151" }}>
                  💡 AI가 추천하는 동화책 줄거리
                </h3>
                <p style={{ fontSize: "14px", color: "#6B7280", marginBottom: "20px" }}>
                  마음에 드는 이야기를 선택해주세요. 선택 후 수정도 가능합니다!
                </p>
              </div>

              {/* 줄거리 카드 */}
              <div style={{ display: "flex", flexDirection: "column", gap: "15px", marginBottom: "25px" }}>
                {suggestions.map((suggestion) => (
                  <div
                    key={suggestion.id}
                    onClick={() => setSelectedId(suggestion.id)}
                    style={{
                      padding: "20px",
                      backgroundColor: selectedId === suggestion.id ? "#EEF2FF" : "#FFFFFF",
                      border: `2px solid ${selectedId === suggestion.id ? "#6366F1" : "#E5E7EB"}`,
                      borderRadius: "12px",
                      cursor: "pointer",
                      transition: "all 0.2s"
                    }}
                  >
                    {/* 선택 체크 */}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: "10px" }}>
                      <div style={{ flex: 1 }}>
                        <h4 style={{ fontSize: "16px", fontWeight: "bold", color: "#1F2937", marginBottom: "8px" }}>
                          {suggestion.title}
                        </h4>
                        <p style={{ fontSize: "14px", color: "#4B5563", lineHeight: "1.6", margin: 0 }}>
                          {suggestion.plot}
                        </p>
                      </div>
                      <div style={{
                        width: "24px",
                        height: "24px",
                        borderRadius: "50%",
                        border: `2px solid ${selectedId === suggestion.id ? "#6366F1" : "#D1D5DB"}`,
                        backgroundColor: selectedId === suggestion.id ? "#6366F1" : "#FFFFFF",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        marginLeft: "10px",
                        flexShrink: 0
                      }}>
                        {selectedId === suggestion.id && (
                          <span style={{ color: "white", fontSize: "14px" }}>✓</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* 버튼 그룹 */}
              <div style={{ display: "flex", gap: "10px" }}>
                <button
                  onClick={handleGenerateSuggestions}
                  style={{
                    flex: 1,
                    padding: "15px",
                    backgroundColor: "#F3F4F6",
                    color: "#374151",
                    border: "2px solid #E5E7EB",
                    borderRadius: "8px",
                    fontSize: "16px",
                    fontWeight: "600",
                    cursor: "pointer"
                  }}
                >
                  🔄 다시 추천받기
                </button>
                <button
                  onClick={handleSelectSuggestion}
                  disabled={selectedId === null}
                  style={{
                    flex: 1,
                    padding: "15px",
                    backgroundColor: selectedId !== null ? "#6366F1" : "#D1D5DB",
                    color: "white",
                    border: "none",
                    borderRadius: "8px",
                    fontSize: "16px",
                    fontWeight: "600",
                    cursor: selectedId !== null ? "pointer" : "not-allowed"
                  }}
                >
                  ✨ 선택하고 동화책 만들기
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </StorybookLayout>
  );
}
