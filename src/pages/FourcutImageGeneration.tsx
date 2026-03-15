import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { saveStory } from "../services/dbService";
import html2canvas from "html2canvas";

interface CutData {
  cutNumber: number;
  question: string;
  answer: string;
}

export default function FourcutImageGeneration() {
  const navigate = useNavigate();
  const location = useLocation();
  const { theme, interviewScene, title, questions, answers } = location.state || {};

  const [cutData] = useState<CutData[]>([
    { cutNumber: 1, question: questions?.[0] || "", answer: answers?.[0] || "" },
    { cutNumber: 2, question: questions?.[1] || "", answer: answers?.[1] || "" },
    { cutNumber: 3, question: questions?.[2] || "", answer: answers?.[2] || "" },
    { cutNumber: 4, question: questions?.[3] || "", answer: answers?.[3] || "" }
  ]);

  const [isSaving, setIsSaving] = useState(false);
  const [masterImageBase64, setMasterImageBase64] = useState<string>("");
  const finalCardRef = useRef<HTMLDivElement | null>(null); // 최종 카드 (마스터 이미지 + 4컷 텍스트)

  useEffect(() => {
    if (!theme || !interviewScene || !questions || !answers) {
      navigate("/write/fourcut-theme");
      return;
    }

    // 마스터 이미지를 Base64로 미리 변환 (CORS 문제 해결)
    const convertImageToBase64 = async () => {
      try {
        console.log("🔄 마스터 이미지 Base64 변환 중...");
        const response = await fetch(interviewScene.imageUrl);
        const blob = await response.blob();
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64 = reader.result as string;
          setMasterImageBase64(base64);
          console.log("✅ 마스터 이미지 Base64 변환 완료:", base64.length, "bytes");
        };
        reader.readAsDataURL(blob);
      } catch (error) {
        console.error("❌ 이미지 변환 실패:", error);
        // 실패 시 원본 URL 사용
        setMasterImageBase64(interviewScene.imageUrl);
      }
    };

    convertImageToBase64();
  }, [theme, interviewScene, questions, answers, navigate]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      console.log("📸 4컷 통합 이미지 캡처 시작...");
      
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

      // ✅ Base64 이미지 준비 확인
      if (!masterImageBase64) {
        alert("이미지가 아직 준비되지 않았습니다. 잠시 후 다시 시도해주세요.");
        return;
      }

      console.log("⏳ DOM 렌더링 대기 중...");
      await new Promise(resolve => setTimeout(resolve, 300));

      // ✅ 최종 카드 (마스터 이미지 1개 + 4컷 텍스트) 캡처
      let combinedImage: string;
      
      if (finalCardRef.current) {
        console.log("📸 4컷 카드 캡처 중 (Base64 이미지 + 텍스트)...");
        const canvas = await html2canvas(finalCardRef.current, {
          backgroundColor: "#ffffff",
          scale: 1.5, // 적정 해상도 (모바일 최적화)
          logging: false,
          useCORS: false, // Base64 이미지 사용하므로 불필요
          allowTaint: true, // Base64는 taint 허용
          width: 500, // 카드 너비 고정
          windowWidth: 500
        });
        
        // JPEG 압축 (품질 0.75 - 용량 최소화)
        combinedImage = canvas.toDataURL("image/jpeg", 0.75);
        const imageSizeKB = (combinedImage.length * 0.75 / 1024).toFixed(2);
        console.log(`✅ 4컷 카드 캡처 완료 (크기: ${canvas.width}x${canvas.height}px, 용량: 약 ${imageSizeKB} KB)`);
        console.log(`📊 Base64 길이: ${combinedImage.length}, 미리보기: ${combinedImage.substring(0, 100)}...`);
      } else {
        throw new Error("4컷 카드를 찾을 수 없습니다.");
      }

      // 통합 이미지 하나만 저장
      const cutImages = [combinedImage];

      // DB 저장 - 통합 이미지 하나만 저장
      const allImages = [{
        id: crypto.randomUUID(),
        url: combinedImage,
        prompt: "4컷 통합 이미지 (만남-이야기-감동-작별)",
        createdAt: new Date().toISOString()
      }];
      
      const savedId = await saveStory({
        title,
        content: storyContent,
        genre: "fourcut",
        images: allImages // 4컷 이미지만 저장
      });

      console.log("✅ DB 저장 완료:", savedId);

      // 결과 페이지로 이동 (저장된 ID와 함께)
      navigate("/write/fourcut-story-result", {
        state: {
          savedId,
          title,
          storyContent,
          imageUrl: interviewScene.imageUrl,
          cutImages, // 4컷 이미지들
          theme
        }
      });
    } catch (error) {
      console.error("❌ 저장 오류:", error);
      alert("저장 중 오류가 발생했습니다.");
    } finally {
      setIsSaving(false);
    }
  };

  if (!theme || !interviewScene || !questions || !answers) return null;

  const cutLabels = ["만남", "이야기", "감동", "작별"];

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
            🎬 4컷 인터뷰 완성
          </h1>
          <p style={{ fontSize: "18px", fontWeight: "600", color: "#6B7280" }}>
            {title}
          </p>
        </div>

        {/* 안내 박스 */}
        <div style={{
          backgroundColor: "#EEF2FF",
          border: "2px solid #818CF8",
          borderRadius: "12px",
          padding: "20px",
          marginBottom: "30px",
          textAlign: "center"
        }}>
          <h3 style={{
            fontSize: "18px",
            fontWeight: "700",
            color: "#3730A3",
            marginBottom: "10px"
          }}>
            ✨ 한 장의 이미지로 저장!
          </h3>
          <p style={{
            fontSize: "14px",
            color: "#4338CA",
            lineHeight: "1.6"
          }}>
            마스터 이미지 + 4컷 스토리를 한 장으로 캡처해요<br />
            용량 절감 & SNS 공유 최적화!
          </p>
        </div>

        {/* ✅ 최종 저장될 카드 (이 부분만 캡처) */}
        <div 
          ref={finalCardRef}
          style={{
            backgroundColor: "#FFFFFF",
            borderRadius: "16px",
            padding: "20px",
            boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
            marginBottom: "30px",
            maxWidth: "500px",
            margin: "0 auto 30px auto",
            width: "100%"
          }}
        >
          {/* 제목 헤더 */}
          <div style={{
            textAlign: "center",
            marginBottom: "16px",
            borderBottom: "3px solid #9C27B0",
            paddingBottom: "12px"
          }}>
            <div style={{ fontSize: "28px", marginBottom: "6px" }}>{theme.icon}</div>
            <h2 style={{
              fontSize: "20px",
              fontWeight: "700",
              color: "#1F2937",
              margin: 0
            }}>
              {title}
            </h2>
          </div>

          {/* 마스터 이미지 (크게 상단에 배치) */}
          <div style={{
            textAlign: "center",
            marginBottom: "16px"
          }}>
            <img 
              src={masterImageBase64 || interviewScene.imageUrl} 
              alt="마스터 이미지"
              style={{ 
                width: "100%",
                borderRadius: "10px",
                boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
              }} 
            />
            <p style={{
              marginTop: "8px",
              fontSize: "11px",
              color: "#6B7280",
              lineHeight: "1.4"
            }}>
              📍 {interviewScene.location} • 
              🎤 {interviewScene.interviewer === "male" ? "남자 아나운서" : "여자 아나운서"} • 
              👤 {["할머니", "할아버지", "젊은 남자", "젊은 여자", "친구", "강아지", "고양이"][
                ["grandmother", "grandfather", "youngman", "youngwoman", "friend", "dog", "cat"].indexOf(interviewScene.interviewee)
              ]}
            </p>
          </div>

          {/* 4컷 텍스트 카드 (2x2 그리드) */}
          <div style={{ 
            display: "grid", 
            gridTemplateColumns: "1fr 1fr", 
            gap: "10px"
          }}>
            {cutData.map((cut, index) => (
              <div 
                key={index}
                style={{
                  backgroundColor: "#F9FAFB",
                  borderRadius: "8px",
                  padding: "12px",
                  border: "2px solid #E5E7EB",
                  display: "flex",
                  flexDirection: "column",
                  gap: "6px"
                }}
              >
                {/* 컷 번호 + 라벨 */}
                <div style={{
                  fontSize: "13px",
                  fontWeight: "700",
                  color: "#9C27B0",
                  borderBottom: "2px solid #E9D5FF",
                  paddingBottom: "4px"
                }}>
                  {cut.cutNumber}컷 - {cutLabels[index]}
                </div>

                {/* 질문 */}
                <div style={{
                  fontSize: "11px",
                  fontWeight: "600",
                  color: "#7C3AED",
                  lineHeight: "1.4",
                  whiteSpace: "pre-wrap",
                  wordBreak: "break-word"
                }}>
                  📺 {cut.question}
                </div>

                {/* 답변 */}
                <div style={{
                  fontSize: "11px",
                  color: "#374151",
                  lineHeight: "1.5",
                  whiteSpace: "pre-wrap",
                  wordBreak: "break-word"
                }}>
                  👤 {cut.answer}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 저장 버튼 */}
        <div style={{ 
          display: "flex", 
          gap: "12px",
          justifyContent: "center"
        }}>
          <button
            onClick={() => navigate("/write/fourcut-practice", { 
              state: { theme, interviewScene } 
            })}
            style={{
              padding: "16px 32px",
              fontSize: "16px",
              fontWeight: "600",
              backgroundColor: "white",
              color: "#6B7280",
              border: "2px solid #E5E7EB",
              borderRadius: "12px",
              cursor: "pointer"
            }}
          >
            ← 답변 수정하기
          </button>
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

        {/* 하단 안내 */}
        <div style={{
          marginTop: "30px",
          padding: "16px",
          backgroundColor: "#FEF3C7",
          border: "2px solid #F59E0B",
          borderRadius: "12px",
          fontSize: "14px",
          color: "#92400E",
          lineHeight: "1.6",
          textAlign: "center"
        }}>
          💡 <strong>Tip:</strong> 마스터 이미지가 마음에 안 드시면<br />
          "← 답변 수정하기"를 누르고 처음부터 다시 만들어보세요!
        </div>
      </div>
    </div>
  );
}
