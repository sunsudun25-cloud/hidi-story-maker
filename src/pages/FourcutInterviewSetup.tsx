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

  // 테마별 장소 (인터뷰 장면에 적합하게 수정)
  const locations: { [key: string]: string[] } = {
    home: ["고속도로 휴게소 보행로", "기차역 플랫폼", "버스 터미널 대합실", "공항 로비"],
    work: ["편의점 앞", "시장 골목", "택배 차량 옆", "거리 청소 현장"],
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

  // 그림 스타일 (4단 구조: 스타일 + 구도 + 금지)
  const artStyles = [
    { 
      key: "realistic", 
      label: "실사", 
      icon: "📸", 
      desc: "사실적인 사진 같은 이미지",
      style: "실제 뉴스 현장 사진. 포토저널리즘. 자연광. DSLR 촬영 느낌. 현실적인 피부 질감.",
      composition: "실제 인터뷰 사진 구도. 중간 거리 촬영. 배경 자연스러운 아웃포커스.",
      negative: "일러스트, 만화, 애니메이션, 3D 렌더링 느낌 없이. 글자, 간판, 포스터 없이.",
      model: "gpt-image-1" as const,
      size: "1536x1024" as const
    },
    { 
      key: "3d", 
      label: "3D 렌더링", 
      icon: "🎮", 
      desc: "입체적인 3D CGI",
      style: "중립적인 3D CGI 렌더링. 자연스러운 인체 비율. 입체감 있는 조명과 그림자. 선명한 재질 표현. 전문적인 3D 장면 구성. 과장된 만화 얼굴 없이.",
      composition: "입체감 있는 장면 구성. 인물과 배경이 분리되어 보이고, 카메라 시점이 자연스러운 3D 장면 구도. 지나치게 정면 고정된 포스터 느낌 없이. 손은 주머니에 넣지 않고 자연스럽게 보이도록.",
      negative: "글자, 간판, 포스터, 자막, 읽을 수 있는 텍스트 없이. 픽사풍, 장난감 같은 캐릭터, 과장된 큰 눈, 지나치게 귀여운 얼굴 없이. 주머니에 손 넣은 포즈 없이.",
      model: "dall-e-3" as const,
      size: "1024x1024" as const
    },
    { 
      key: "illustration", 
      label: "일러스트", 
      icon: "✏️", 
      desc: "따뜻한 디지털 일러스트",
      style: "따뜻하고 깔끔한 디지털 일러스트. 부드러운 색감. 친근한 인물 표현. 교육용 그림처럼 이해하기 쉬운 장면. 단순하고 정돈된 배경.",
      composition: "동화책 장면처럼 정돈된 구도. 인물이 잘 보이고 배경은 단순하게 정리된 화면. 손은 주머니에 넣지 않고 자연스럽게 보이도록.",
      negative: "글자, 간판, 포스터, 자막, 읽을 수 있는 텍스트 없이. 주머니에 손 넣은 포즈 없이.",
      model: "dall-e-3" as const,
      size: "1024x1024" as const
    },
    { 
      key: "animation", 
      label: "애니메이션", 
      icon: "🎬", 
      desc: "생동감 있는 애니메이션",
      style: "밝고 생동감 있는 애니메이션 스타일. 감정이 잘 보이는 표정. 선명한 색감. 이야기 전달이 쉬운 장면.",
      composition: "이야기 장면이 잘 보이는 애니메이션 구도. 인물의 표정과 동작이 잘 드러나도록 구성. 손은 주머니에 넣지 않고 자연스럽게 보이도록.",
      negative: "글자, 간판, 포스터, 자막, 읽을 수 있는 텍스트 없이. 주머니에 손 넣은 포즈 없이.",
      model: "dall-e-3" as const,
      size: "1024x1024" as const
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
      const styleModel = selectedStyleInfo.model;

      // ⭐ 아나운서 DNA (고정된 외모와 복장 + 손 포즈)
      const interviewerDNA = selectedInterviewer === "male"
        ? "한국인 남성 아나운서 30대, 검은 단발머리, 정장에 넥타이, 한 손에 마이크 들고 다른 손은 자연스럽게 내려놓음"
        : "한국인 여성 아나운서 30대, 단정한 헤어스타일, 정장 차림, 한 손에 마이크 들고 다른 손은 자연스럽게 내려놓음";
      
      const interviewerKorean = selectedInterviewer === "male" ? "남자 아나운서" : "여자 아나운서";
      
      // ⭐ 답변자 DNA (한국인 특징 강조 + 손 포즈)
      const intervieweeDetailMap: Record<string, string> = {
        grandmother: "한국인 할머니 70대, 흰 머리, 따뜻한 미소, 양손 자연스럽게 앞에",
        grandfather: "한국인 할아버지 70대, 흰 머리, 온화한 표정, 양손 자연스럽게 앞에",
        youngman: "한국인 젊은 남자 20대, 검은 머리, 캐주얼한 옷차림, 양손 자연스럽게 몸 옆에",
        youngwoman: "한국인 젊은 여자 20대, 검은 머리, 캐주얼한 옷차림, 양손 자연스럽게 몸 옆에",
        boyChild: "한국인 남자 어린이 7-10세, 검은 머리, 밝은 표정, 양손 자연스럽게",
        girlChild: "한국인 여자 어린이 7-10세, 검은 머리, 밝은 표정, 양손 자연스럽게",
        dog: "골든 리트리버 강아지, 밝은 갈색 털",
        cat: "회색 고양이, 조용히 앉아 있는 모습"
      };
      let intervieweeDetail = intervieweeDetailMap[selectedInterviewee] || "답변자";
      
      const intervieweeKoreanMap: Record<string, string> = {
        grandmother: "할머니",
        grandfather: "할아버지",
        youngman: "젊은 남자",
        youngwoman: "젊은 여자",
        boyChild: "남자 어린이",
        girlChild: "여자 어린이",
        dog: "강아지",
        cat: "고양이"
      };
      const intervieweeKorean = intervieweeKoreanMap[selectedInterviewee] || "답변자";
      
      // ⭐ 사용자가 추가한 캐릭터 DNA
      let dnaText = "";
      if (characterDNA.appearance || characterDNA.clothes || characterDNA.features) {
        const dnaParts = [
          characterDNA.appearance && `외모: ${characterDNA.appearance}`,
          characterDNA.clothes && `옷차림: ${characterDNA.clothes}`,
          characterDNA.features && `특징: ${characterDNA.features}`
        ].filter(Boolean);
        if (dnaParts.length > 0) {
          dnaText = ` 추가 설명: ${dnaParts.join(", ")}.`;
          // 사용자 DNA가 있으면 기본 설명 대체
          intervieweeDetail = `${intervieweeKorean} - ${dnaParts.join(", ")}`;
        }
      }
      
      // ⭐ 4단 구조 프롬프트 조합
      // A. 장면 프롬프트 (위치 명시: 왼쪽=아나운서, 오른쪽=답변자)
      const scenePrompt = `${selectedLocation}에서 인터뷰 장면. 왼쪽에 ${interviewerDNA}, 오른쪽에 ${intervieweeDetail}. 두 사람은 마주 보고 대화 중.${dnaText}`;
      
      // B. 스타일 프롬프트
      const styleGuide = selectedStyleInfo.style;
      
      // C. 구도 프롬프트 (스타일별 다름)
      const compositionGuide = selectedStyleInfo.composition;
      
      // D. 금지 프롬프트 (스타일별 다름)
      const negativePrompt = selectedStyleInfo.negative;
      
      // 최종 프롬프트 조합: A + B + C + D
      const prompt = `${scenePrompt} ${styleGuide} ${compositionGuide} ${negativePrompt}`.trim();

      // 스타일별 이미지 크기 및 품질 설정
      const imageSize = selectedStyleInfo.size || "1024x1024";
      const imageQuality = selectedStyle === "realistic" ? "high" : "hd";  // GPT Image: high, DALL-E: hd

      // ⭐ 상세 디버깅 로그 (4단 구조 확인)
      const debugPayload = {
        styleMode: selectedStyle,
        scenePrompt,
        stylePrompt: styleGuide,
        compositionPrompt: compositionGuide,
        negativePrompt,
        finalPrompt: prompt,
        requestBody: {
          model: styleModel,
          size: imageSize,
          quality: imageQuality
        }
      };
      console.log("🔍 [IMAGE DEBUG - CLIENT]", JSON.stringify(debugPayload, null, 2));

      // ⭐ useRawPrompt: true로 설정하여 프롬프트를 그대로 사용
      console.log("📤 [API 호출 직전] 최종 프롬프트:", prompt);
      console.log("📤 [API 호출 직전] 모델:", styleModel, "크기:", imageSize, "품질:", imageQuality);
      
      const imageUrl = await generateWritingImage(prompt, "인터뷰", {
        model: styleModel as any,
        size: imageSize,
        quality: imageQuality,
        useRawPrompt: true  // ⭐ 클라이언트 프롬프트를 그대로 사용
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
      // 모든 스타일에서 한국어로 추가 요구사항 작성
      const additionalReq = `추가 요구사항: ${customPrompt}`;
      
      const updatedPrompt = basePrompt + " " + additionalReq;
      
      console.log("🔄 마스터 이미지 재생성:", {
        customPrompt,
        style: selectedStyle,
        updatedPrompt: updatedPrompt.substring(0, 200) + "..."
      });

      // 원래 선택한 스타일의 모델, 크기, 품질 사용
      const selectedStyleObj = artStyles.find(s => s.key === selectedStyle);
      const modelToUse = selectedStyleObj?.model || "dall-e-3";
      const sizeToUse = selectedStyleObj?.size || "1024x1024";
      const qualityToUse = selectedStyle === "realistic" ? "high" : "hd";
      
      const imageUrl = await generateWritingImage(updatedPrompt, "인터뷰", {
        model: modelToUse as any,
        size: sizeToUse,
        quality: qualityToUse,
        useRawPrompt: true  // ⭐ 재생성 시에도 프롬프트 그대로 사용
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
