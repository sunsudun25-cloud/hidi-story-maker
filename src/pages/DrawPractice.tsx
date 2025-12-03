import React from "react";
import { useNavigate } from "react-router-dom";

export default function DrawPractice() {
  const navigate = useNavigate();

  return (
    <div style={{ padding: "24px", fontSize: "20px" }}>
      <h2>연습하기 페이지입니다.</h2>
      <p>AI가 주제를 제안해드립니다.</p>
      <button
        onClick={() => navigate("/draw")}
        style={{
          marginTop: "20px",
          padding: "12px 24px",
          fontSize: "16px",
          cursor: "pointer"
        }}
      >
        ← 뒤로가기
      </button>
    </div>
  );
}
