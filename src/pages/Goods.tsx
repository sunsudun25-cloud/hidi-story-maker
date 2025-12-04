import React from "react";
import Header from "../components/Header";

export default function Goods() {
  return (
    <div className="page-container">
      <Header title="나만의 굿즈 만들기" />
      <h1 className="page-title">나만의 굿즈 만들기</h1>
      <p style={{ fontSize: "18px", textAlign: "center", color: "#666" }}>
        내 작품으로 특별한 굿즈를 만들어보세요.
      </p>
    </div>
  );
}
