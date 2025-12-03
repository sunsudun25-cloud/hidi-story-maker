import React from "react";
import { useNavigate } from "react-router-dom";
import TopHeader from "../components/TopHeader";
import "./DrawStart.css";

export default function DrawStart() {
  const navigate = useNavigate();

  return (
    <>
      <TopHeader title="그림 그리기" />
      <div className="draw-start-container">
        <p className="draw-start-subtitle">어떤 방식으로 시작하시겠어요?</p>

      <div className="draw-start-buttons">
        <button
          className="draw-mode-btn practice-btn"
          onClick={() => navigate("/draw/practice")}
        >
          <span className="btn-emoji">🎨</span>
          <span className="btn-label">연습하기</span>
          <span className="btn-desc">AI가 주제를 제안해드려요</span>
        </button>

        <button
          className="draw-mode-btn direct-btn"
          onClick={() => navigate("/draw/direct")}
        >
          <span className="btn-emoji">✏️</span>
          <span className="btn-label">직접입력</span>
          <span className="btn-desc">원하는 그림을 직접 그려보세요</span>
        </button>
      </div>

    </div>
    </>
  );
}
