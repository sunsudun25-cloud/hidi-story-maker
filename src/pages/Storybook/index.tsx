import { useNavigate } from "react-router-dom";
import Layout from "../../components/Layout";
import "./Storybook.css";

export default function Storybook() {
  const navigate = useNavigate();

  // AI 추천 페이지로 이동
  const handleGoToAISuggestion = () => {
    navigate("/storybook-ai-suggestion");
  };

  // 직접 입력 페이지로 이동
  const handleGoToManualInput = () => {
    navigate("/storybook-manual");
  };

  return (
    <Layout title="동화책" color="#D8E9FF">
      <div className="storybook-page">
        {/* 시작 안내 */}
        <div style={{ 
          textAlign: "center", 
          fontSize: "20px", 
          fontWeight: "bold",
          marginBottom: "30px",
          color: "#374151"
        }}>
          동화책 만들기를 어떻게 시작할까요?
        </div>

        {/* 선택 버튼 */}
        <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
          {/* 직접 입력하기 버튼 */}
          <button
            onClick={handleGoToManualInput}
            style={{
              padding: "25px 20px",
              backgroundColor: "#F3F4F6",
              border: "2px solid #E5E7EB",
              borderRadius: "16px",
              fontSize: "16px",
              fontWeight: "600",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "15px",
              transition: "all 0.2s",
              color: "#1F2937"
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "#EFF6FF";
              e.currentTarget.style.borderColor = "#3B82F6";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "#F3F4F6";
              e.currentTarget.style.borderColor = "#E5E7EB";
            }}
          >
            <span style={{ fontSize: "32px" }}>✍️</span>
            <div style={{ flex: 1, textAlign: "left" }}>
              <div style={{ fontSize: "18px", fontWeight: "bold", marginBottom: "5px" }}>직접 입력하기</div>
              <div style={{ fontSize: "14px", color: "#6B7280" }}>주인공과 스토리를 직접 설정</div>
            </div>
          </button>

          {/* AI에게 추천받기 버튼 */}
          <button
            onClick={handleGoToAISuggestion}
            style={{
              padding: "25px 20px",
              backgroundColor: "#FDF4FF",
              border: "2px solid #F3E8FF",
              borderRadius: "16px",
              fontSize: "16px",
              fontWeight: "600",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "15px",
              transition: "all 0.2s",
              color: "#1F2937"
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "#FAF5FF";
              e.currentTarget.style.borderColor = "#A855F7";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "#FDF4FF";
              e.currentTarget.style.borderColor = "#F3E8FF";
            }}
          >
            <span style={{ fontSize: "32px" }}>🎯</span>
            <div style={{ flex: 1, textAlign: "left" }}>
              <div style={{ fontSize: "18px", fontWeight: "bold", marginBottom: "5px" }}>AI에게 추천받기</div>
              <div style={{ fontSize: "14px", color: "#6B7280" }}>AI가 준비한 재미있는 아이디어</div>
            </div>
          </button>
        </div>
      </div>
    </Layout>
  );
}
