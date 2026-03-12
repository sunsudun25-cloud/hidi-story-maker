import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { generateWritingImage } from "../services/imageService";
import { saveStory } from "../services/dbService";

interface CutImage {
  cutNumber: number;
  imageUrl: string;
  question: string;
  answer: string;
  isGenerating: boolean;
}

export default function FourcutImageGeneration() {
  const navigate = useNavigate();
  const location = useLocation();
  const { theme, interviewScene, title, questions, answers } = location.state || {};

  const [cutImages, setCutImages] = useState<CutImage[]>([
    { cutNumber: 1, imageUrl: "", question: questions?.[0] || "", answer: answers?.[0] || "", isGenerating: false },
    { cutNumber: 2, imageUrl: "", question: questions?.[1] || "", answer: answers?.[1] || "", isGenerating: false },
    { cutNumber: 3, imageUrl: "", question: questions?.[2] || "", answer: answers?.[2] || "", isGenerating: false },
    { cutNumber: 4, imageUrl: "", question: questions?.[3] || "", answer: answers?.[3] || "", isGenerating: false }
  ]);

  const [currentGenerating, setCurrentGenerating] = useState(0);
  const [showRegenerateModal, setShowRegenerateModal] = useState(false);
  const [regeneratingCut, setRegeneratingCut] = useState<number | null>(null);
  const [customPrompt, setCustomPrompt] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!theme || !interviewScene || !questions || !answers) {
      navigate("/write/fourcut-theme");
      return;
    }

    // 자동으로 4컷 순차 생성 시작
    generateAllCuts();
  }, []);

  const generateAllCuts = async () => {
    for (let i = 0; i < 4; i++) {
      await generateCutImage(i);
    }
  };

  const generateCutImage = async (cutIndex: number, customPrompt = "") => {
    setCurrentGenerating(cutIndex);
    
    // 이미지 상태 업데이트 (생성 중)
    setCutImages(prev => prev.map((cut, idx) => 
      idx === cutIndex ? { ...cut, isGenerating: true } : cut
    ));

    try {
      // 인터뷰어 설명
      const interviewerDesc = interviewScene.interviewer === "male" 
        ? "professional male news reporter in business attire"
        : "professional female news reporter in business attire";

      // 답변자 설명
      const intervieweeDescMap: { [key: string]: string } = {
        grandmother: "kind elderly grandmother, warm smile",
        grandfather: "wise elderly grandfather, gentle expression",
        youngman: "young man in casual clothes, friendly",
        youngwoman: "young woman in casual clothes, bright smile",
        friend: "middle-aged person, friendly appearance",
        dog: "cute friendly dog, golden retriever style",
        cat: "elegant cat, sitting calmly"
      };
      const intervieweeDesc = intervieweeDescMap[interviewScene.interviewee];

      // 컷별 상황 설명
      const cutDescriptions = [
        "First meeting - interviewer greeting interviewee, friendly introduction",
        "Deep conversation - engaged dialogue, expressing story",
        "Emotional moment - touching scene, meaningful expression",
        "Farewell - warm goodbye, gentle conclusion"
      ];

      // 마스터 이미지 스타일 참조 프롬프트
      const basePrompt = `
Korean webtoon style 4-panel story illustration - Panel ${cutIndex + 1}/4

MASTER IMAGE STYLE REFERENCE:
(Match the exact visual style, character design, and composition from the master image)

Scene: ${interviewScene.location}
Situation: ${cutDescriptions[cutIndex]}

Characters:
- Interviewer: ${interviewerDesc} holding microphone
- Interviewee: ${intervieweeDesc}

Panel ${cutIndex + 1} Story Content:
Interviewer asks: "${questions[cutIndex]}"
Interviewee responds: "${answers[cutIndex]}"

Visual Style (CRITICAL - Must match master image):
- Art style: Soft watercolor illustration, warm pastel colors
- Character consistency: Same character design as master image
- Color palette: Warm afternoon tones, gentle lighting
- Composition: Simple, clean, webtoon shorts format
- Mood: Friendly, professional interview atmosphere

Technical Requirements:
- No text overlay, no Korean letters, no English words
- Clear focus on characters' expressions and body language
- Microphone clearly visible in interviewer's hand
- Background appropriate for ${interviewScene.location}

${customPrompt ? `\nAdditional requirements: ${customPrompt}` : ""}
`.trim();

      console.log(`🎨 ${cutIndex + 1}컷 생성 중:`, {
        question: questions[cutIndex].substring(0, 50),
        answer: answers[cutIndex].substring(0, 50)
      });

      const imageUrl = await generateWritingImage(basePrompt, "인터뷰");

      console.log(`✅ ${cutIndex + 1}컷 생성 완료`);

      // 이미지 상태 업데이트 (완료)
      setCutImages(prev => prev.map((cut, idx) => 
        idx === cutIndex 
          ? { ...cut, imageUrl, isGenerating: false } 
          : cut
      ));
    } catch (error) {
      console.error(`❌ ${cutIndex + 1}컷 생성 오류:`, error);
      alert(`${cutIndex + 1}컷 생성 실패. 다시 시도해주세요.`);
      
      setCutImages(prev => prev.map((cut, idx) => 
        idx === cutIndex ? { ...cut, isGenerating: false } : cut
      ));
    }
  };

  const handleRegenerateCut = (cutIndex: number) => {
    setRegeneratingCut(cutIndex);
    setShowRegenerateModal(true);
  };

  const handleRegenerateConfirm = async () => {
    if (regeneratingCut === null) return;
    
    setShowRegenerateModal(false);
    await generateCutImage(regeneratingCut, customPrompt);
    setCustomPrompt("");
    setRegeneratingCut(null);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // 4컷 스토리 텍스트 생성
      const storyContent = `
1컷 (만남):
📺 인터뷰어: ${questions[0]}
👤 답변: ${answers[0]}

2컷 (이야기):
📺 인터뷰어: ${questions[1]}
👤 답변: ${answers[1]}

3컷 (감동):
📺 인터뷰어: ${questions[2]}
👤 답변: ${answers[2]}

4컷 (작별):
📺 인터뷰어: ${questions[3]}
👤 답변: ${answers[3]}
`.trim();

      // DB 저장
      const storyImages = [
        interviewScene.imageUrl, // 마스터 이미지
        ...cutImages.map(cut => cut.imageUrl)
      ];

      await saveStory({
        title,
        content: storyContent,
        genre: "fourcut",
        images: storyImages
      });

      alert("🎉 4컷 인터뷰가 저장되었습니다!");
      navigate("/myworks/stories");
    } catch (error) {
      console.error("❌ 저장 오류:", error);
      alert("저장 중 오류가 발생했습니다.");
    } finally {
      setIsSaving(false);
    }
  };

  if (!theme || !interviewScene || !questions || !answers) return null;

  const cutLabels = ["만남", "이야기", "감동", "작별"];
  const allImagesGenerated = cutImages.every(cut => cut.imageUrl);

  return (
    <div style={{ minHeight: "100vh", padding: "20px", backgroundColor: "#F3F4F6" }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        {/* 헤더 */}
        <div style={{ textAlign: "center", marginBottom: "30px" }}>
          <div style={{ fontSize: "48px", marginBottom: "10px" }}>{theme.icon}</div>
          <h1 style={{
            fontSize: "28px",
            fontWeight: "700",
            color: "#1F2937",
            marginBottom: "10px"
          }}>
            🎬 4컷 이미지 만들기
          </h1>
          <p style={{ fontSize: "18px", fontWeight: "600", color: "#6B7280" }}>
            {title}
          </p>
        </div>

        {/* 마스터 이미지 */}
        <div style={{
          backgroundColor: "white",
          borderRadius: "12px",
          padding: "24px",
          marginBottom: "30px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          textAlign: "center"
        }}>
          <h3 style={{
            fontSize: "18px",
            fontWeight: "700",
            color: "#1F2937",
            marginBottom: "15px"
          }}>
            📍 마스터 이미지 (스타일 기준)
          </h3>
          <img 
            src={interviewScene.imageUrl} 
            alt="마스터 이미지" 
            style={{ 
              width: "100%", 
              maxWidth: "400px", 
              borderRadius: "12px",
              boxShadow: "0 4px 12px rgba(0,0,0,0.15)"
            }} 
          />
          <p style={{
            marginTop: "12px",
            fontSize: "14px",
            color: "#6B7280"
          }}>
            📍 {interviewScene.location} • 🎤 {interviewScene.interviewer === "male" ? "남자 아나운서" : "여자 아나운서"} • 
            👤 {["할머니", "할아버지", "젊은 남자", "젊은 여자", "친구", "강아지", "고양이"][
              ["grandmother", "grandfather", "youngman", "youngwoman", "friend", "dog", "cat"].indexOf(interviewScene.interviewee)
            ]}
          </p>
        </div>

        {/* 진행 상태 */}
        {!allImagesGenerated && (
          <div style={{
            backgroundColor: "#EEF2FF",
            border: "2px solid #818CF8",
            borderRadius: "12px",
            padding: "20px",
            marginBottom: "30px",
            textAlign: "center"
          }}>
            <p style={{
              fontSize: "16px",
              fontWeight: "700",
              color: "#3730A3",
              marginBottom: "12px"
            }}>
              🎨 4컷 생성 중... ({currentGenerating + 1}/4)
            </p>
            <div style={{
              width: "100%",
              height: "12px",
              backgroundColor: "#E5E7EB",
              borderRadius: "6px",
              overflow: "hidden"
            }}>
              <div style={{ 
                width: `${((currentGenerating + 1) / 4) * 100}%`, 
                height: "100%", 
                backgroundColor: "#9C27B0", 
                transition: "width 0.5s ease"
              }} />
            </div>
            <p style={{
              marginTop: "10px",
              fontSize: "14px",
              color: "#6B7280"
            }}>
              이미지 생성에는 약 1-2분 정도 소요됩니다. 잠시만 기다려주세요!
            </p>
          </div>
        )}

        {/* 2x2 그리드 */}
        <div style={{ 
          display: "grid", 
          gridTemplateColumns: "1fr 1fr", 
          gap: "20px",
          marginBottom: "30px"
        }}>
          {cutImages.map((cut, index) => (
            <div key={index} style={{
              backgroundColor: "white",
              borderRadius: "12px",
              padding: "20px",
              boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
            }}>
              {/* 컷 번호 */}
              <h3 style={{ 
                marginBottom: "15px",
                fontSize: "18px",
                fontWeight: "700",
                color: "#1F2937"
              }}>
                {cut.cutNumber}컷 - {cutLabels[index]}
              </h3>

              {/* 이미지 */}
              {cut.isGenerating ? (
                <div style={{ 
                  width: "100%", 
                  aspectRatio: "1/1",
                  backgroundColor: "#F3F4F6",
                  borderRadius: "8px",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "16px",
                  color: "#6B7280",
                  marginBottom: "15px"
                }}>
                  <div style={{ fontSize: "48px", marginBottom: "10px" }}>🎨</div>
                  <div>생성 중...</div>
                </div>
              ) : cut.imageUrl ? (
                <img 
                  src={cut.imageUrl} 
                  alt={`${cut.cutNumber}컷`} 
                  style={{ 
                    width: "100%", 
                    aspectRatio: "1/1",
                    objectFit: "cover",
                    borderRadius: "8px", 
                    marginBottom: "15px",
                    boxShadow: "0 2px 6px rgba(0,0,0,0.1)"
                  }} 
                />
              ) : (
                <div style={{ 
                  width: "100%", 
                  aspectRatio: "1/1",
                  backgroundColor: "#F3F4F6",
                  borderRadius: "8px",
                  marginBottom: "15px"
                }} />
              )}

              {/* 인터뷰 내용 */}
              <div style={{ 
                backgroundColor: "#F9FAFB", 
                borderRadius: "8px", 
                padding: "12px",
                marginBottom: "12px",
                fontSize: "13px",
                lineHeight: "1.6"
              }}>
                <div style={{ fontWeight: "700", color: "#7C3AED", marginBottom: "6px" }}>
                  📺 {cut.question}
                </div>
                <div style={{ color: "#374151" }}>
                  👤 {cut.answer}
                </div>
              </div>

              {/* 재생성 버튼 */}
              {cut.imageUrl && (
                <button
                  onClick={() => handleRegenerateCut(index)}
                  disabled={cut.isGenerating}
                  style={{
                    width: "100%",
                    padding: "10px",
                    fontSize: "14px",
                    fontWeight: "600",
                    backgroundColor: "white",
                    color: "#7C3AED",
                    border: "2px solid #7C3AED",
                    borderRadius: "8px",
                    cursor: "pointer",
                    transition: "all 0.2s"
                  }}
                >
                  🔄 이 컷 다시 만들기
                </button>
              )}
            </div>
          ))}
        </div>

        {/* 완료 버튼 */}
        {allImagesGenerated && (
          <div style={{ 
            display: "flex", 
            gap: "12px",
            justifyContent: "center"
          }}>
            <button
              onClick={handleSave}
              disabled={isSaving}
              style={{
                padding: "18px 40px",
                fontSize: "18px",
                fontWeight: "700",
                backgroundColor: isSaving ? "#D1D5DB" : "#9C27B0",
                color: "white",
                border: "none",
                borderRadius: "12px",
                cursor: isSaving ? "not-allowed" : "pointer",
                boxShadow: "0 4px 12px rgba(156, 39, 176, 0.3)"
              }}
            >
              {isSaving ? "💾 저장 중..." : "✅ 저장하기"}
            </button>
          </div>
        )}

        {/* 재생성 모달 */}
        {showRegenerateModal && (
          <div style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000
          }}>
            <div style={{
              backgroundColor: "white",
              borderRadius: "12px",
              padding: "30px",
              maxWidth: "500px",
              width: "90%"
            }}>
              <h2 style={{ marginBottom: "20px", fontSize: "22px", fontWeight: "700", color: "#1F2937" }}>
                🔄 {regeneratingCut !== null && regeneratingCut + 1}컷 다시 만들기
              </h2>
              
              <p style={{ marginBottom: "15px", color: "#6B7280", fontSize: "15px" }}>
                수정하고 싶은 내용을 입력하세요:
              </p>
              
              <textarea
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
                placeholder="예: 더 밝게, 웃는 표정으로, 배경을 흐리게..."
                style={{
                  width: "100%",
                  minHeight: "100px",
                  padding: "12px",
                  fontSize: "15px",
                  border: "2px solid #E5E7EB",
                  borderRadius: "8px",
                  marginBottom: "20px",
                  fontFamily: "'Noto Sans KR', sans-serif",
                  resize: "vertical"
                }}
              />

              <div style={{ display: "flex", gap: "10px" }}>
                <button
                  onClick={() => {
                    setShowRegenerateModal(false);
                    setCustomPrompt("");
                    setRegeneratingCut(null);
                  }}
                  style={{
                    flex: 1,
                    padding: "12px",
                    fontSize: "16px",
                    fontWeight: "600",
                    backgroundColor: "white",
                    color: "#6B7280",
                    border: "2px solid #E5E7EB",
                    borderRadius: "8px",
                    cursor: "pointer"
                  }}
                >
                  취소
                </button>
                <button
                  onClick={handleRegenerateConfirm}
                  style={{
                    flex: 1,
                    padding: "12px",
                    fontSize: "16px",
                    fontWeight: "600",
                    backgroundColor: "#7C3AED",
                    color: "white",
                    border: "none",
                    borderRadius: "8px",
                    cursor: "pointer"
                  }}
                >
                  다시 만들기
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
