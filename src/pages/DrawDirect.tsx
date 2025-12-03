import React from "react";
import TopHeader from "../components/TopHeader";

export default function DrawDirect() {
  return (
    <>
      <TopHeader title="직접입력" />

      <div style={{ padding: "24px", fontSize: "20px" }}>
        <h2>직접입력 페이지입니다.</h2>
        <p>원하는 그림을 직접 그려보세요.</p>
      </div>
    </>
  );
}
