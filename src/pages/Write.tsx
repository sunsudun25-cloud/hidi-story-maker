import { useNavigate } from "react-router-dom";
import { useState } from "react";

export default function Write() {
  const navigate = useNavigate();
  const [selectedOption, setSelectedOption] = useState<string | null>(null);

  const handleOptionSelect = (option: string) => {
    setSelectedOption(option);
    
    // 각 옵션별로 다른 state를 전달하여 WriteEditor로 이동
    if (option === "practice") {
      // 연습하기: AI 주제 제안 모드
      navigate("/write/editor", { state: { mode: "practice" } });
    } else if (option === "select") {
      // 선택하기: 카테고리 선택 모드
      navigate("/write/editor", { state: { mode: "select" } });
    } else if (option === "free") {
      // 작성하기: 자유 작성 모드
      navigate("/write/editor", { state: { mode: "free" } });
    }
  };

  return (
    <main style={{ 
      padding: "20px", 
      maxWidth: "800px", 
      margin: "0 auto",
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column",
    }}>
      {/* 헤더 */}
      <div style={{ 
        display: "flex", 
        alignItems: "center", 
        justifyContent: "space-between", 
        marginBottom: "40px" 
      }}>
        <button
          onClick={() => navigate(-1)}
          style={{
            padding: "12px 20px",
            fontSize: "18px",
            backgroundColor: "#ddd",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
          }}
        >
          ← 뒤로
        </button>
        <h1 style={{ fontSize: "28px", fontWeight: "bold", margin: 0 }}>
          ✍️ 글쓰기
        </h1>
        <button
          onClick={() => navigate("/home")}
          style={{
            padding: "12px 20px",
            fontSize: "18px",
            backgroundColor: "#ddd",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
          }}
        >
          🏠
        </button>
      </div>

      <p style={{ 
        fontSize: "20px", 
        color: "#666", 
        textAlign: "center", 
        marginBottom: "50px",
        lineHeight: "1.6",
      }}>
        어떤 방법으로 글을 쓰시겠어요?
      </p>

      {/* 옵션 카드들 */}
      <div style={{ 
        display: "flex", 
        flexDirection: "column", 
        gap: "20px",
        flex: 1,
      }}>
        {/* 옵션 1: 연습하기 */}
        <button
          onClick={() => handleOptionSelect("practice")}
          style={{
            padding: "30px",
            backgroundColor: "#E8F5E9",
            border: "3px solid #4CAF50",
            borderRadius: "16px",
            cursor: "pointer",
            textAlign: "center",
            transition: "all 0.3s",
            boxShadow: selectedOption === "practice" ? "0 4px 12px rgba(76, 175, 80, 0.3)" : "none",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "scale(1.02)";
            e.currentTarget.style.boxShadow = "0 4px 12px rgba(76, 175, 80, 0.3)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "scale(1)";
            e.currentTarget.style.boxShadow = selectedOption === "practice" ? "0 4px 12px rgba(76, 175, 80, 0.3)" : "none";
          }}
        >
          <div style={{ fontSize: "48px", marginBottom: "15px" }}>💡</div>
          <h2 style={{ 
            fontSize: "24px", 
            fontWeight: "bold", 
            marginBottom: "10px",
            color: "#2E7D32",
          }}>
            처음 시작하시나요?
          </h2>
          <p style={{ 
            fontSize: "18px", 
            color: "#555",
            lineHeight: "1.6",
          }}>
            간단한 주제로 차근차근<br />
            부담없이 쓸을 글부터 시작
          </p>
          <div style={{
            marginTop: "15px",
            padding: "12px 24px",
            backgroundColor: "#4CAF50",
            color: "white",
            borderRadius: "24px",
            fontSize: "18px",
            fontWeight: "bold",
            display: "inline-block",
          }}>
            연습하기
          </div>
        </button>

        {/* 옵션 2: 선택하기 */}
        <button
          onClick={() => handleOptionSelect("select")}
          style={{
            padding: "30px",
            backgroundColor: "#E3F2FD",
            border: "3px solid #2196F3",
            borderRadius: "16px",
            cursor: "pointer",
            textAlign: "center",
            transition: "all 0.3s",
            boxShadow: selectedOption === "select" ? "0 4px 12px rgba(33, 150, 243, 0.3)" : "none",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "scale(1.02)";
            e.currentTarget.style.boxShadow = "0 4px 12px rgba(33, 150, 243, 0.3)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "scale(1)";
            e.currentTarget.style.boxShadow = selectedOption === "select" ? "0 4px 12px rgba(33, 150, 243, 0.3)" : "none";
          }}
        >
          <div style={{ fontSize: "48px", marginBottom: "15px" }}>📝</div>
          <h2 style={{ 
            fontSize: "24px", 
            fontWeight: "bold", 
            marginBottom: "10px",
            color: "#1565C0",
          }}>
            어떤 글을 쓰고 싶나요
          </h2>
          <p style={{ 
            fontSize: "18px", 
            color: "#555",
            lineHeight: "1.6",
          }}>
            장르를 선택하고 글을 시작해보세요
          </p>
          <div style={{
            marginTop: "15px",
            padding: "12px 24px",
            backgroundColor: "#2196F3",
            color: "white",
            borderRadius: "24px",
            fontSize: "18px",
            fontWeight: "bold",
            display: "inline-block",
          }}>
            선택하기
          </div>
        </button>

        {/* 옵션 3: 작성하기 */}
        <button
          onClick={() => handleOptionSelect("free")}
          style={{
            padding: "30px",
            backgroundColor: "#F3E5F5",
            border: "3px solid #9C27B0",
            borderRadius: "16px",
            cursor: "pointer",
            textAlign: "center",
            transition: "all 0.3s",
            boxShadow: selectedOption === "free" ? "0 4px 12px rgba(156, 39, 176, 0.3)" : "none",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "scale(1.02)";
            e.currentTarget.style.boxShadow = "0 4px 12px rgba(156, 39, 176, 0.3)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "scale(1)";
            e.currentTarget.style.boxShadow = selectedOption === "free" ? "0 4px 12px rgba(156, 39, 176, 0.3)" : "none";
          }}
        >
          <div style={{ fontSize: "48px", marginBottom: "15px" }}>✍️</div>
          <h2 style={{ 
            fontSize: "24px", 
            fontWeight: "bold", 
            marginBottom: "10px",
            color: "#6A1B9A",
          }}>
            자유롭게 써 보세요
          </h2>
          <p style={{ 
            fontSize: "18px", 
            color: "#555",
            lineHeight: "1.6",
          }}>
            장르 구분 없이 편안하게 써보세요
          </p>
          <div style={{
            marginTop: "15px",
            padding: "12px 24px",
            backgroundColor: "#9C27B0",
            color: "white",
            borderRadius: "24px",
            fontSize: "18px",
            fontWeight: "bold",
            display: "inline-block",
          }}>
            작성하기
          </div>
        </button>
      </div>

      {/* 하단 팁 */}
      <div style={{
        marginTop: "40px",
        padding: "20px",
        backgroundColor: "#FFF3CD",
        border: "2px solid #FFC107",
        borderRadius: "12px",
        textAlign: "center",
      }}>
        <p style={{ fontSize: "16px", color: "#666", lineHeight: "1.6", margin: 0 }}>
          💡 <strong>도움말:</strong> 어떤 방법을 선택하셔도 AI가 도와드립니다!
        </p>
      </div>
    </main>
  );
}
