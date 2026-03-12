import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { generateWritingImage } from "../services/imageService";
import { generateImageViaCloudflare } from "../services/cloudflareImageApi";
import { startListening, isSpeechRecognitionSupported } from "../services/speechRecognitionService";

export default function FourcutInterviewSetup() {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = location.state?.theme;

  const [selectedLocation, setSelectedLocation] = useState("");
  const [selectedInterviewer, setSelectedInterviewer] = useState("");
  const [selectedInterviewee, setSelectedInterviewee] = useState("");
  const [selectedStyle, setSelectedStyle] = useState("animation");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isListening, setIsListening] = useState<string | null>(null); // "appearance" | "clothes" | "features" | null
  
  // 마스터 이미지 확인
  const [masterImageUrl, setMasterImageUrl] = useState("");
  const [showMasterConfirm, setShowMasterConfirm] = useState(false);
  const [customPrompt, setCustomPrompt] = useState("");
  const [basePrompt, setBasePrompt] = useState("");
  
  // 캐릭터 DNA 설정
  const [showCharacterModal, setShowCharacterModal] = useState(false);
  const [characterDNA, setCharacterDNA] = useState({
    appearance: "",
    clothes: "",
    features: ""
  });

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
    { key: "boyChild", label: "남자 어린이", icon: "👦", desc: "귀엽고 밝은 남자아이" },
    { key: "girlChild", label: "여자 어린이", icon: "👧", desc: "귀엽고 밝은 여자아이" },
    { key: "dog", label: "강아지", icon: "🐕", desc: "귀엽고 충성스러운 강아지 (상상 인터뷰)" },
    { key: "cat", label: "고양이", icon: "🐈", desc: "우아하고 독립적인 고양이 (상상 인터뷰)" }
  ];

  // 그림 스타일
  const artStyles = [
    { 
      key: "animation", 
      label: "애니메이션", 
      icon: "🎬", 
      desc: "밝고 생동감 있는 애니메이션",
      prompt: "Vibrant animation style, bright colors, clean lines, cartoon aesthetic",
      model: "dall-e-3" as const
    },
    { 
      key: "illustration", 
      label: "일러스트", 
      icon: "✏️", 
      desc: "세련된 디지털 일러스트",
      prompt: "Modern digital illustration, clean vector style, professional artwork",
      model: "dall-e-3" as const
    },
    { 
      key: "3d", 
      label: "3D", 
      icon: "🎮", 
      desc: "입체적인 3D 렌더링",
      prompt: "3D rendered style, volumetric lighting, detailed textures, Pixar-like quality",
      model: "dall-e-3" as const
    },
    { 
      key: "realistic", 
      label: "실사", 
      icon: "📸", 
      desc: "사실적인 사진 같은 이미지",
      prompt: "Photorealistic photograph style",
      model: "dall-e-3" as const
    },
    { 
      key: "cinematic", 
      label: "시네마풍", 
      icon: "🎥", 
      desc: "영화 같은 분위기",
      prompt: "Cinematic movie scene, dramatic lighting, film grain, Hollywood production quality, anamorphic lens",
      model: "dall-e-3" as const
    }
  ];

  // 음성 입력 핸들러
  const handleVoiceInput = (field: "appearance" | "clothes" | "features") => {
    if (!isSpeechRecognitionSupported()) {
      alert("음성 인식을 지원하지 않는 브라우저입니다.\nChrome, Edge, Safari를 사용해주세요.");
      return;
    }

    setIsListening(field);
    startListening({
      onResult: (text) => {
        setCharacterDNA(prev => ({
          ...prev,
          [field]: prev[field] + (prev[field] ? " " : "") + text
        }));
      },
      onError: (error) => {
        console.error("음성 인식 오류:", error);
        alert(`음성 인식 오류: ${error}`);
        setIsListening(null);
      },
      onEnd: () => {
        setIsListening(null);
      }
    });
  };

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
        boyChild: "cute young boy, cheerful expression",
        girlChild: "cute young girl, cheerful expression",
        dog: "cute friendly dog, golden retriever style",
        cat: "elegant cat, sitting calmly"
      };
      let intervieweeDesc = intervieweeDescMap[selectedInterviewee];
      
      // 캐릭터 DNA 추가
      if (characterDNA.appearance || characterDNA.clothes || characterDNA.features) {
        const dnaDetails = [
          characterDNA.appearance && `Appearance: ${characterDNA.appearance}`,
          characterDNA.clothes && `Clothing: ${characterDNA.clothes}`,
          characterDNA.features && `Features: ${characterDNA.features}`
        ].filter(Boolean).join(", ");
        
        intervieweeDesc += `. ${dnaDetails}`;
      }
      
      // 선택된 스타일 정보
      const selectedStyleInfo = artStyles.find(s => s.key === selectedStyle) || artStyles[0];
      const stylePrompt = selectedStyleInfo.prompt;
      const styleModel = selectedStyleInfo.model;

      // 프롬프트 생성 (실사 스타일은 한국어 기반으로 특별 처리)
      let prompt: string;
      
      if (selectedStyle === "realistic") {
        // 실사 스타일: 순수 영어 포토저널리즘 프롬프트
        const interviewerEnglish = selectedInterviewer === "male" ? "Korean male news reporter" : "Korean female news reporter";
        const intervieweeEnglishMap: Record<string, string> = {
          grandmother: "Korean elderly grandmother",
          grandfather: "Korean elderly grandfather",
          youngMan: "Korean young man",
          youngWoman: "Korean young woman",
          boyChild: "Korean boy child",
          girlChild: "Korean girl child",
          dog: "friendly dog (golden retriever)",
          cat: "elegant cat"
        };
        const intervieweeEnglish = intervieweeEnglishMap[selectedInterviewee] || "interviewee";
        
        // 캐릭터 DNA 영어로 변환
        let dnaText = "";
        if (characterDNA.appearance || characterDNA.clothes || characterDNA.features) {
          const dnaParts = [
            characterDNA.appearance && `Appearance: ${characterDNA.appearance}`,
            characterDNA.clothes && `Clothing: ${characterDNA.clothes}`,
            characterDNA.features && `Features: ${characterDNA.features}`
          ].filter(Boolean);
          dnaText = dnaParts.length > 0 ? `\nCharacter details: ${dnaParts.join(", ")}` : "";
        }
        
        // 장소 영어 변환 매핑
        const locationEnglishMap: Record<string, string> = {
          "고속도로 휴게소": "highway rest stop convenience store",
          "기차역 플랫폼": "train station platform",
          "버스 터미널": "bus terminal waiting area",
          "공항 로비": "airport lobby",
          "편의점 계산대": "convenience store checkout counter",
          "시장 골목": "traditional market alley",
          "택배 차량": "delivery truck",
          "거리 청소": "street cleaning area",
          "봄꽃이 핀 공원": "park with spring flowers",
          "여름 바닷가": "summer beach",
          "단풍길": "autumn foliage path",
          "눈 내린 거리": "snowy street",
          "집 거실": "home living room",
          "가족 식당": "family restaurant",
          "공원 벤치": "park bench",
          "할머니 댁 마당": "grandmother's house yard",
          "오래된 골목": "old alley",
          "고향 학교 앞": "hometown school entrance",
          "추억의 카페": "nostalgic vintage cafe",
          "특별한 장소": "special memorable place"
        };
        const locationEnglish = locationEnglishMap[selectedLocation] || selectedLocation;
        
        prompt = `
A photojournalistic documentary photograph: ${interviewerEnglish} interviewing ${intervieweeEnglish} with a microphone at ${locationEnglish}.${dnaText}

CRITICAL SCENE REQUIREMENTS:
- Setting: ${locationEnglish} with realistic, detailed background appropriate for this location
- Two people: ${interviewerEnglish} (holding microphone) and ${intervieweeEnglish}
- Both subjects clearly visible in frame, facing each other
- Microphone prominently visible between them
- Natural interview posture and positioning
- Authentic Korean people with realistic Korean facial features and proportions

PHOTOREALISM REQUIREMENTS:
- REAL photograph taken with professional DSLR camera (Canon/Nikon/Sony)
- Photojournalism / documentary photography style
- Natural lighting with realistic shadows and highlights
- Real human skin with pores, wrinkles, texture, and natural imperfections
- Genuine candid moment captured on camera
- Realistic depth of field with natural bokeh
- Professional news photography composition

STRICTLY FORBIDDEN:
- NO 3D rendering, CGI, or computer graphics
- NO illustration, digital art, or drawing
- NO animation, cartoon, or anime style
- NO game graphics or cel-shading
- NO storybook or fairy tale illustration
- NO smooth plastic skin or overly perfect features
- NO readable text, signs, Korean letters, or English words
- NO stock photo aesthetic or overly posed look

This must look EXACTLY like a real photograph from an actual Korean news broadcast or documentary, NOT artwork or illustration.
`.trim();
      } else {
        // 다른 스타일: 영어 프롬프트
        prompt = `
A warm interview scene in ${selectedLocation}.
${interviewerDesc} holding a microphone, interviewing ${intervieweeDesc}.

Style: ${stylePrompt}
Mood: Friendly, professional, welcoming
Composition: Two subjects in conversation, natural interview setting
Details: Microphone clearly visible, appropriate background for ${selectedLocation}

People/Animals:
- Interviewer: ${interviewerDesc}
- Interviewee: ${intervieweeDesc}

No text, no Korean letters, no English words, no labels.
Clear, simple composition suitable for storytelling.
`.trim();
      }

      console.log("🎨 인터뷰 장면 생성:", {
        location: selectedLocation,
        interviewer: selectedInterviewer,
        interviewee: selectedInterviewee,
        style: selectedStyle,
        model: styleModel,
        prompt: prompt.substring(0, 200) + "..."
      });

      // 선택된 스타일의 모델을 사용하여 이미지 생성
      const imageUrl = await generateWritingImage(prompt, "인터뷰", {
        model: styleModel as any,
        size: "1024x1024",
        quality: "hd"  // DALL-E 3: standard | hd
      });

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
      // 실사 스타일이면 한국어로, 아니면 영어로 추가 요구사항 작성
      const additionalReq = selectedStyle === "realistic" 
        ? `추가 요구사항: ${customPrompt}`
        : `Additional requirements: ${customPrompt}`;
      
      const updatedPrompt = basePrompt + "\n\n" + additionalReq;
      
      console.log("🔄 마스터 이미지 재생성:", {
        customPrompt,
        style: selectedStyle,
        updatedPrompt: updatedPrompt.substring(0, 200) + "..."
      });

      // 원래 선택한 스타일의 모델 사용
      const selectedStyleObj = artStyles.find(s => s.key === selectedStyle);
      const modelToUse = selectedStyleObj?.model || "dall-e-3";
      
      const imageUrl = await generateWritingImage(updatedPrompt, "인터뷰", {
        model: modelToUse as any,
        size: "1024x1024",
        quality: "hd"  // DALL-E 3: standard | hd
      });

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

        {/* 2. 그림 스타일 선택 */}
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
            🎨 2. 그림 스타일을 선택하세요
          </h3>
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, 1fr)",
            gap: "10px"
          }}>
            {artStyles.map((style) => (
              <button
                key={style.key}
                onClick={() => setSelectedStyle(style.key)}
                style={{
                  padding: "16px",
                  fontSize: "14px",
                  fontWeight: "600",
                  backgroundColor: selectedStyle === style.key ? "#EC4899" : "white",
                  color: selectedStyle === style.key ? "white" : "#374151",
                  border: selectedStyle === style.key ? "2px solid #EC4899" : "2px solid #E5E7EB",
                  borderRadius: "8px",
                  cursor: "pointer",
                  transition: "all 0.2s",
                  textAlign: "left"
                }}
              >
                <div style={{ fontSize: "28px", marginBottom: "6px" }}>
                  {style.icon}
                </div>
                <div style={{ fontWeight: "700", marginBottom: "4px" }}>
                  {style.label}
                </div>
                <div style={{ 
                  fontSize: "11px", 
                  opacity: 0.8,
                  fontWeight: "400"
                }}>
                  {style.desc}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* 3. 인터뷰어 선택 */}
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
            🎤 3. 인터뷰어를 선택하세요 (항상 사람)
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

        {/* 4. 답변자 선택 + 캐릭터 DNA */}
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
            👤 4. 인터뷰 답변자를 선택하세요
          </h3>
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, 1fr)",
            gap: "10px"
          }}>
            {interviewees.map((interviewee) => (
              <button
                key={interviewee.key}
                onClick={() => {
                  setSelectedInterviewee(interviewee.key);
                  setShowCharacterModal(true);
                }}
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

        {/* 캐릭터 DNA 설정 모달 */}
        {showCharacterModal && (
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
              width: "90%",
              maxHeight: "80vh",
              overflowY: "auto"
            }}>
              <h2 style={{ 
                marginBottom: "20px", 
                fontSize: "22px", 
                fontWeight: "700", 
                color: "#1F2937" 
              }}>
                {interviewees.find(i => i.key === selectedInterviewee)?.icon} {interviewees.find(i => i.key === selectedInterviewee)?.label} 캐릭터 DNA 설정
              </h2>
              
              <p style={{ 
                marginBottom: "20px", 
                color: "#6B7280", 
                fontSize: "14px",
                lineHeight: "1.6"
              }}>
                캐릭터의 외모, 옷차림, 특징을 자유롭게 설명해주세요!<br />
                (선택사항입니다. 입력하지 않으면 기본 설정이 적용돼요)
              </p>

              {/* 외모 */}
              <div style={{ marginBottom: "20px" }}>
                <label style={{
                  display: "block",
                  fontSize: "14px",
                  fontWeight: "600",
                  color: "#374151",
                  marginBottom: "8px"
                }}>
                  👁️ 외모 (얼굴, 머리, 눈 등)
                </label>
                <textarea
                  value={characterDNA.appearance}
                  onChange={(e) => setCharacterDNA({ ...characterDNA, appearance: e.target.value })}
                  placeholder="예: 은발, 둥근 안경, 따뜻한 미소, 주름진 얼굴"
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
                <button
                  onClick={() => handleVoiceInput("appearance")}
                  disabled={isListening !== null}
                  style={{
                    width: "100%",
                    marginTop: "8px",
                    padding: "10px",
                    fontSize: "14px",
                    fontWeight: "600",
                    backgroundColor: isListening === "appearance" ? "#D1D5DB" : "#10B981",
                    color: "white",
                    border: "none",
                    borderRadius: "8px",
                    cursor: isListening !== null ? "not-allowed" : "pointer"
                  }}
                >
                  {isListening === "appearance" ? "👂 듣고 있어요..." : "🎤 음성으로 입력하기"}
                </button>
              </div>

              {/* 옷차림 */}
              <div style={{ marginBottom: "20px" }}>
                <label style={{
                  display: "block",
                  fontSize: "14px",
                  fontWeight: "600",
                  color: "#374151",
                  marginBottom: "8px"
                }}>
                  👔 옷차림
                </label>
                <textarea
                  value={characterDNA.clothes}
                  onChange={(e) => setCharacterDNA({ ...characterDNA, clothes: e.target.value })}
                  placeholder="예: 한복, 꽃무늬 카디건, 면 바지"
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
                <button
                  onClick={() => handleVoiceInput("clothes")}
                  disabled={isListening !== null}
                  style={{
                    width: "100%",
                    marginTop: "8px",
                    padding: "10px",
                    fontSize: "14px",
                    fontWeight: "600",
                    backgroundColor: isListening === "clothes" ? "#D1D5DB" : "#10B981",
                    color: "white",
                    border: "none",
                    borderRadius: "8px",
                    cursor: isListening !== null ? "not-allowed" : "pointer"
                  }}
                >
                  {isListening === "clothes" ? "👂 듣고 있어요..." : "🎤 음성으로 입력하기"}
                </button>
              </div>

              {/* 특징 */}
              <div style={{ marginBottom: "20px" }}>
                <label style={{
                  display: "block",
                  fontSize: "14px",
                  fontWeight: "600",
                  color: "#374151",
                  marginBottom: "8px"
                }}>
                  ✨ 특징 (키, 체형, 악세사리 등)
                </label>
                <textarea
                  value={characterDNA.features}
                  onChange={(e) => setCharacterDNA({ ...characterDNA, features: e.target.value })}
                  placeholder="예: 작은 키, 지팡이를 짚고 있음, 금목걸이"
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
                <button
                  onClick={() => handleVoiceInput("features")}
                  disabled={isListening !== null}
                  style={{
                    width: "100%",
                    marginTop: "8px",
                    padding: "10px",
                    fontSize: "14px",
                    fontWeight: "600",
                    backgroundColor: isListening === "features" ? "#D1D5DB" : "#10B981",
                    color: "white",
                    border: "none",
                    borderRadius: "8px",
                    cursor: isListening !== null ? "not-allowed" : "pointer"
                  }}
                >
                  {isListening === "features" ? "👂 듣고 있어요..." : "🎤 음성으로 입력하기"}
                </button>
              </div>

              {/* 버튼 */}
              <div style={{ display: "flex", gap: "10px" }}>
                <button
                  onClick={() => {
                    setShowCharacterModal(false);
                    setSelectedInterviewee("");
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
                  onClick={() => setShowCharacterModal(false)}
                  style={{
                    flex: 1,
                    padding: "12px",
                    fontSize: "16px",
                    fontWeight: "600",
                    backgroundColor: "#10B981",
                    color: "white",
                    border: "none",
                    borderRadius: "8px",
                    cursor: "pointer"
                  }}
                >
                  확인
                </button>
              </div>
            </div>
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
