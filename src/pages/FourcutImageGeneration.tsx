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
  const cutRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    if (!theme || !interviewScene || !questions || !answers) {
      navigate("/write/fourcut-theme");
      return;
    }
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      console.log("📸 4컷 이미지 캡처 시작...");
      
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

      // 4컷 각각을 이미지로 캡처
      const cutImages: string[] = [];
      
      for (let i = 0; i < 4; i++) {
        const element = cutRefs.current[i];
        if (element) {
          console.log(`📸 ${i + 1}컷 캡처 중...`);
          const canvas = await html2canvas(element, {
            backgroundColor: "#ffffff",
            scale: 2, // 고해상도
            logging: false,
            useCORS: true,
            allowTaint: true
          });
          const imageData = canvas.toDataURL("image/png");
          cutImages.push(imageData);
          console.log(`✅ ${i + 1}컷 캡처 완료`);
        }
      }

      console.log(`✅ 총 ${cutImages.length}개 이미지 캡처 완료`);

      // DB 저장 - StoryImage 형식으로 변환 (마스터 이미지 제외, 4컷만 저장)
      const cutLabels = ["만남", "이야기", "감동", "작별"];
      const allImages = cutImages.map((img, i) => ({
        id: crypto.randomUUID(),
        url: img,
        prompt: `${i + 1}컷 - ${cutLabels[i]}`,
        createdAt: new Date().toISOString()
      }));
      
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
            ✨ 완벽한 스타일 일관성!
          </h3>
          <p style={{
            fontSize: "14px",
            color: "#4338CA",
            lineHeight: "1.6"
          }}>
            마스터 이미지를 4컷 모두에 사용하여<br />
            스타일이 완벽하게 일치해요!
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
            📍 인터뷰 장면 (마스터 이미지)
          </h3>
          <img 
            src={interviewScene.imageUrl} 
            alt="마스터 이미지" 
            style={{ 
              width: "100%", 
              maxWidth: "500px", 
              borderRadius: "12px",
              boxShadow: "0 4px 12px rgba(0,0,0,0.15)"
            }} 
          />
          <p style={{
            marginTop: "15px",
            fontSize: "14px",
            color: "#6B7280",
            lineHeight: "1.6"
          }}>
            📍 {interviewScene.location}<br />
            🎤 {interviewScene.interviewer === "male" ? "남자 아나운서" : "여자 아나운서"} • 
            👤 {["할머니", "할아버지", "젊은 남자", "젊은 여자", "친구", "강아지", "고양이"][
              ["grandmother", "grandfather", "youngman", "youngwoman", "friend", "dog", "cat"].indexOf(interviewScene.interviewee)
            ]}
          </p>
        </div>

        {/* 2x2 그리드 - 동일한 이미지 + 각 컷 내용 */}
        <div style={{ 
          display: "grid", 
          gridTemplateColumns: "1fr 1fr", 
          gap: "20px",
          marginBottom: "30px"
        }}>
          {cutData.map((cut, index) => (
            <div 
              key={index} 
              ref={(el) => (cutRefs.current[index] = el)}
              style={{
                backgroundColor: "white",
                borderRadius: "12px",
                padding: "20px",
                boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
              }}
            >
              {/* 컷 번호 */}
              <h3 style={{ 
                marginBottom: "15px",
                fontSize: "18px",
                fontWeight: "700",
                color: "#1F2937"
              }}>
                {cut.cutNumber}컷 - {cutLabels[index]}
              </h3>

              {/* 마스터 이미지 (모든 컷 동일) */}
              <img 
                src={interviewScene.imageUrl} 
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

              {/* 인터뷰 내용 */}
              <div style={{ 
                backgroundColor: "#F9FAFB", 
                borderRadius: "8px", 
                padding: "12px",
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
            </div>
          ))}
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
