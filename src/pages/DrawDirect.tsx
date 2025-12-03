import React from "react";
import { useNavigate } from "react-router-dom";

export default function DrawDirect() {
  const navigate = useNavigate();

  return (
    <div style={{ padding: "24px", fontSize: "20px" }}>
      <h2>직접입력 페이지입니다.</h2>
      <p>원하는 그림을 직접 그려보세요.</p>
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
