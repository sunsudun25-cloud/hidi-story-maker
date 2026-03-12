import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { generateWritingImage } from "../services/imageService";

export default function FourcutInterviewSetup() {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = location.state?.theme;

  const [selectedLocation, setSelectedLocation] = useState("");
  const [selectedInterviewer, setSelectedInterviewer] = useState("");
  const [selectedInterviewee, setSelectedInterviewee] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  
  // 마스터 이미지 확인
  const [masterImageUrl, setMasterImageUrl] = useState("");
  const [showMasterConfirm, setShowMasterConfirm] = useState(false);
  const [customPrompt, setCustomPrompt] = useState("");
  const [basePrompt, setBasePrompt] = useState("");

  // 테마별 장소
  const locations: { [key: string]: string[] } = {
    home: ["고속도로 휴게소", "기차역 플랫폼", "버스 터미널", "공항 로비"],
    work: ["편의점 계산대", "시장 골목", "택배 차량 앞", "거리 청소 중"],
    season: ["봄꽃 가득한 공원", "여름 해변", "가을 단풍길", "눈 내리는 거리"],
    family: ["집 거실", "가족 식당", "공원 벤치", "할머니 댁 마당"],
    memory: ["옛날 골목", "고향 학교 앞", "오래된 카페", "추억의 장소"]
  };

  // 인터뷰어 (항상 사람)
  const interviewers = [
    { key: "male", label: "남자 아나운서", icon: "👨‍💼", desc: "친근하고 전문적인 남성 리포터" },
    { key: "female", label: "여자 아나운서", icon: "👩‍💼", desc: "따뜻하고 세심한 여성 리포터" }
  ];

  // 답변자 (사람 + 동물)
  const interviewees = [
    { key: "grandmother", label: "할머니", icon: "👵", desc: "자상하고 따뜻한 할머니" },
    { key: "grandfather", label: "할아버지", icon: "👴", desc: "인자하고 지혜로운 할아버지" },
    { key: "youngman", label: "젊은 남자", icon: "👨", desc: "활기찬 청년" },
    { key: "youngwoman", label: "젊은 여자", icon: "👩", desc: "밝고 긍정적인 여성" },
    { key: "friend", label: "친구", icon: "🧑‍🤝‍🧑", desc: "오랜 친구" },
    { key: "dog", label: "강아지", icon: "🐕", desc: "귀엽고 충성스러운 강아지 (상상 인터뷰)" },
    { key: "cat", label: "고양이", icon: "🐈", desc: "우아하고 독립적인 고양이 (상상 인터뷰)" }
  ];

  const handleGenerateScene = async () => {
    if (!selectedLocation || !selectedInterviewer || !selectedInterviewee) {
      alert("장소, 인터뷰어, 답변자를 모두 선택해주세요!");
      return;
    }

    setIsGenerating(true);
    try {
      // 인터뷰어 설명
      const interviewerDesc = selectedInterviewer === "male" 
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
      const intervieweeDesc = intervieweeDescMap[selectedInterviewee];

      // 프롬프트 생성
      const prompt = `
A warm interview scene in ${selectedLocation}.
${interviewerDesc} holding a microphone, interviewing ${intervieweeDesc}.

Style: Soft watercolor illustration, warm pastel colors
Mood: Friendly, professional, welcoming
Composition: Two subjects in conversation, natural interview setting
Details: Microphone clearly visible, appropriate background for ${selectedLocation}

People/Animals:
- Interviewer: ${interviewerDesc}
- Interviewee: ${intervieweeDesc}

No text, no Korean letters, no English words, no labels.
Clear, simple composition suitable for storytelling.
`.trim();

      console.log("🎨 인터뷰 장면 생성:", {
        location: selectedLocation,
        interviewer: selectedInterviewer,
        interviewee: selectedInterviewee,
        prompt: prompt.substring(0, 200) + "..."
      });

      const imageUrl = await generateWritingImage(prompt, "인터뷰");

      console.log("✅ 인터뷰 장면 생성 완료");

      // 마스터 이미지 확인 단계로 이동
      setMasterImageUrl(imageUrl);
      setBasePrompt(prompt);
      setShowMasterConfirm(true);
    } catch (error) {
      console.error("❌ 인터뷰 장면 생성 오류:", error);
      alert("이미지 생성 중 오류가 발생했습니다. 다시 시도해주세요.");
    } finally {
      setIsGenerating(false);
    }
  };

  // 마스터 이미지 승인
  const handleMasterApprove = () => {
    navigate("/write/fourcut-practice", {
      state: {
        theme,
        interviewScene: {
          imageUrl: masterImageUrl,
          location: selectedLocation,
          interviewer: selectedInterviewer,
          interviewee: selectedInterviewee,
          prompt: basePrompt
        }
      }
    });
  };

  // 마스터 이미지 재생성
  const handleMasterRegenerate = async () => {
    if (!customPrompt.trim()) {
      alert("수정하고 싶은 내용을 입력해주세요!");
      return;
    }

    setIsGenerating(true);
    setShowMasterConfirm(false);
    
    try {
      const updatedPrompt = basePrompt + "\n\nAdditional requirements: " + customPrompt;
      
      console.log("🔄 마스터 이미지 재생성:", {
        customPrompt,
        updatedPrompt: updatedPrompt.substring(0, 200) + "..."
      });

      const imageUrl = await generateWritingImage(updatedPrompt, "인터뷰");

      console.log("✅ 마스터 이미지 재생성 완료");

      // 다시 확인 단계로
      setMasterImageUrl(imageUrl);
      setBasePrompt(updatedPrompt);
      setCustomPrompt("");
      setShowMasterConfirm(true);
    } catch (error) {
      console.error("❌ 마스터 이미지 재생성 오류:", error);
      alert("이미지 재생성 중 오류가 발생했습니다. 다시 시도해주세요.");
    } finally {
      setIsGenerating(false);
    }
  };

  if (!theme) {
    navigate("/write/fourcut-theme");
    return null;
  }

  const themeLocations = locations[theme.key] || locations.home;

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
            인터뷰 장면 만들기
          </h1>
          <p style={{
            fontSize: "16px",
            color: "#6B7280",
            lineHeight: "1.6"
          }}>
            {theme.title}<br />
            어떤 장면에서 인터뷰를 할까요?
          </p>
        </div>

        {/* 안내 박스 */}
        <div style={{
          backgroundColor: "#EEF2FF",
          border: "2px solid #818CF8",
          borderRadius: "12px",
          padding: "20px",
          marginBottom: "30px"
        }}>
          <h3 style={{
            fontSize: "18px",
            fontWeight: "700",
            color: "#3730A3",
            marginBottom: "10px"
          }}>
            🎬 인터뷰 장면 설정
          </h3>
          <p style={{
            fontSize: "14px",
            color: "#4338CA",
            lineHeight: "1.6"
          }}>
            장소, 인터뷰어, 답변자를 선택하면<br />
            AI가 인터뷰 장면 이미지를 만들어드려요!<br />
            그 이미지를 보면서 4컷 인터뷰를 작성할 수 있어요.
          </p>
        </div>

        {/* 1. 장소 선택 */}
        <div style={{
          backgroundColor: "white",
          borderRadius: "12px",
          padding: "24px",
          marginBottom: "20px",
          boxShadow: "0 1px 3px rgba(0,0,0,0.1)"
        }}>
          <h3 style={{
            fontSize: "18px",
            fontWeight: "700",
            color: "#1F2937",
            marginBottom: "15px"
          }}>
            📍 1. 인터뷰 장소를 선택하세요
          </h3>
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, 1fr)",
            gap: "10px"
          }}>
            {themeLocations.map((loc) => (
              <button
                key={loc}
                onClick={() => setSelectedLocation(loc)}
                style={{
                  padding: "16px",
                  fontSize: "15px",
                  fontWeight: "600",
                  backgroundColor: selectedLocation === loc ? "#9C27B0" : "white",
                  color: selectedLocation === loc ? "white" : "#374151",
                  border: selectedLocation === loc ? "2px solid #9C27B0" : "2px solid #E5E7EB",
                  borderRadius: "8px",
                  cursor: "pointer",
                  transition: "all 0.2s"
                }}
              >
                {loc}
              </button>
            ))}
          </div>
        </div>

        {/* 2. 인터뷰어 선택 */}
        <div style={{
          backgroundColor: "white",
          borderRadius: "12px",
          padding: "24px",
          marginBottom: "20px",
          boxShadow: "0 1px 3px rgba(0,0,0,0.1)"
        }}>
          <h3 style={{
            fontSize: "18px",
            fontWeight: "700",
            color: "#1F2937",
            marginBottom: "15px"
          }}>
            🎤 2. 인터뷰어를 선택하세요 (항상 사람)
          </h3>
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, 1fr)",
            gap: "10px"
          }}>
            {interviewers.map((interviewer) => (
              <button
                key={interviewer.key}
                onClick={() => setSelectedInterviewer(interviewer.key)}
                style={{
                  padding: "20px",
                  fontSize: "15px",
                  fontWeight: "600",
                  backgroundColor: selectedInterviewer === interviewer.key ? "#3B82F6" : "white",
                  color: selectedInterviewer === interviewer.key ? "white" : "#374151",
                  border: selectedInterviewer === interviewer.key ? "2px solid #3B82F6" : "2px solid #E5E7EB",
                  borderRadius: "8px",
                  cursor: "pointer",
                  transition: "all 0.2s",
                  textAlign: "left"
                }}
              >
                <div style={{ fontSize: "32px", marginBottom: "8px" }}>
                  {interviewer.icon}
                </div>
                <div style={{ fontWeight: "700", marginBottom: "4px" }}>
                  {interviewer.label}
                </div>
                <div style={{ 
                  fontSize: "12px", 
                  opacity: 0.8,
                  fontWeight: "400"
                }}>
                  {interviewer.desc}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* 3. 답변자 선택 */}
        <div style={{
          backgroundColor: "white",
          borderRadius: "12px",
          padding: "24px",
          marginBottom: "20px",
          boxShadow: "0 1px 3px rgba(0,0,0,0.1)"
        }}>
          <h3 style={{
            fontSize: "18px",
            fontWeight: "700",
            color: "#1F2937",
            marginBottom: "15px"
          }}>
            👤 3. 인터뷰 답변자를 선택하세요
          </h3>
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, 1fr)",
            gap: "10px"
          }}>
            {interviewees.map((interviewee) => (
              <button
                key={interviewee.key}
                onClick={() => setSelectedInterviewee(interviewee.key)}
                style={{
                  padding: "16px",
                  fontSize: "14px",
                  fontWeight: "600",
                  backgroundColor: selectedInterviewee === interviewee.key ? "#10B981" : "white",
                  color: selectedInterviewee === interviewee.key ? "white" : "#374151",
                  border: selectedInterviewee === interviewee.key ? "2px solid #10B981" : "2px solid #E5E7EB",
                  borderRadius: "8px",
                  cursor: "pointer",
                  transition: "all 0.2s",
                  textAlign: "left"
                }}
              >
                <div style={{ fontSize: "28px", marginBottom: "6px" }}>
                  {interviewee.icon}
                </div>
                <div style={{ fontWeight: "700", marginBottom: "4px" }}>
                  {interviewee.label}
                </div>
                <div style={{ 
                  fontSize: "11px", 
                  opacity: 0.8,
                  fontWeight: "400"
                }}>
                  {interviewee.desc}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* 버튼 */}
        {!showMasterConfirm && (
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
              onClick={handleGenerateScene}
              disabled={isGenerating || !selectedLocation || !selectedInterviewer || !selectedInterviewee}
              style={{
                flex: 2,
                padding: "16px",
                fontSize: "18px",
                fontWeight: "700",
                backgroundColor: (isGenerating || !selectedLocation || !selectedInterviewer || !selectedInterviewee) 
                  ? "#D1D5DB" 
                  : "#9C27B0",
                color: "white",
                border: "none",
                borderRadius: "12px",
                cursor: (isGenerating || !selectedLocation || !selectedInterviewer || !selectedInterviewee) 
                  ? "not-allowed" 
                  : "pointer",
                boxShadow: "0 4px 12px rgba(156, 39, 176, 0.3)"
              }}
            >
              {isGenerating ? "🎨 인터뷰 장면 만드는 중..." : "🎬 인터뷰 장면 만들기"}
            </button>
          </div>
        )}

        {/* 마스터 이미지 확인 */}
        {showMasterConfirm && (
          <div style={{
            backgroundColor: "white",
            borderRadius: "12px",
            padding: "30px",
            marginTop: "20px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.1)"
          }}>
            <div style={{
              textAlign: "center",
              marginBottom: "30px"
            }}>
              <div style={{ fontSize: "64px", marginBottom: "10px" }}>🎬</div>
              <h2 style={{
                fontSize: "24px",
                fontWeight: "700",
                color: "#1F2937",
                marginBottom: "10px"
              }}>
                마스터 이미지 완성!
              </h2>
              <p style={{
                fontSize: "16px",
                color: "#6B7280"
              }}>
                이 이미지가 마음에 드시나요?<br />
                이 스타일로 4컷 이미지를 만들어요!
              </p>
            </div>

            {/* 마스터 이미지 */}
            <div style={{
              marginBottom: "30px",
              textAlign: "center"
            }}>
              <img
                src={masterImageUrl}
                alt="마스터 이미지"
                style={{
                  width: "100%",
                  maxWidth: "500px",
                  borderRadius: "12px",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.2)"
                }}
              />
            </div>

            {/* 이미지 정보 */}
            <div style={{
              backgroundColor: "#F9FAFB",
              borderRadius: "8px",
              padding: "16px",
              marginBottom: "20px",
              fontSize: "14px",
              color: "#6B7280",
              lineHeight: "1.6"
            }}>
              📍 <strong>장소:</strong> {selectedLocation}<br />
              🎤 <strong>인터뷰어:</strong> {selectedInterviewer === "male" ? "남자 아나운서" : "여자 아나운서"}<br />
              👤 <strong>답변자:</strong> {interviewees.find(i => i.key === selectedInterviewee)?.label}
            </div>

            {/* 프롬프트 수정 */}
            <div style={{
              marginBottom: "20px"
            }}>
              <label style={{
                display: "block",
                fontSize: "14px",
                fontWeight: "600",
                color: "#374151",
                marginBottom: "8px"
              }}>
                💡 수정하고 싶은 부분이 있나요? (선택사항)
              </label>
              <textarea
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
                placeholder="예: 더 밝게, 웃는 표정으로, 배경을 흐리게..."
                style={{
                  width: "100%",
                  minHeight: "80px",
                  padding: "12px",
                  fontSize: "14px",
                  border: "2px solid #E5E7EB",
                  borderRadius: "8px",
                  fontFamily: "'Noto Sans KR', sans-serif",
                  resize: "vertical"
                }}
              />
            </div>

            {/* 버튼 */}
            <div style={{
              display: "flex",
              gap: "10px"
            }}>
              {customPrompt.trim() && (
                <button
                  onClick={handleMasterRegenerate}
                  disabled={isGenerating}
                  style={{
                    flex: 1,
                    padding: "16px",
                    fontSize: "16px",
                    fontWeight: "600",
                    backgroundColor: isGenerating ? "#D1D5DB" : "#F59E0B",
                    color: "white",
                    border: "none",
                    borderRadius: "12px",
                    cursor: isGenerating ? "not-allowed" : "pointer"
                  }}
                >
                  {isGenerating ? "🔄 다시 만드는 중..." : "🔄 다시 만들기"}
                </button>
              )}
              <button
                onClick={handleMasterApprove}
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
                ✅ 마음에 들어요! 다음 단계로
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
