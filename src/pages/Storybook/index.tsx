import React from "react";
import Header from "../../components/Header";

export default function Storybook() {
  return (
    <div className="page-container">
      <Header title="동화책 만들기" />
      <h1 className="page-title">동화책 만들기</h1>
      <p style={{ fontSize: "18px", textAlign: "center", color: "#666" }}>
        AI와 함께 나만의 동화책을 만들어보세요.
      </p>
    </div>
  );
}
