import React from "react";
import { useNavigate } from "react-router-dom";

export default function TestButtons() {
  const navigate = useNavigate();

  return (
    <main>
      <h1 className="page-title">글로벌 버튼 스타일 테스트</h1>
      <p className="page-subtitle">시니어 친화형 버튼 예시</p>

      <div className="card">
        <h3 style={{ marginBottom: "16px", fontSize: "20px" }}>기본 버튼 (.btn)</h3>
        <button className="btn" onClick={() => alert("연습하기 클릭!")}>
          연습하기
        </button>
        <button 
          className="btn" 
          onClick={() => alert("직접 입력하기 클릭!")}
          style={{ marginTop: "12px" }}
        >
          직접 입력하기
        </button>
        <button 
          className="btn" 
          onClick={() => alert("다음 클릭!")}
          style={{ marginTop: "12px" }}
        >
          다음
        </button>
      </div>

      <div className="card">
        <h3 style={{ marginBottom: "16px", fontSize: "20px" }}>보조 버튼 (.btn-secondary)</h3>
        <button className="btn-secondary" onClick={() => alert("취소!")}>
          취소
        </button>
        <button 
          className="btn-secondary"
          onClick={() => alert("뒤로가기!")}
          style={{ marginTop: "12px" }}
        >
          뒤로가기
        </button>
      </div>

      <div className="card">
        <h3 style={{ marginBottom: "16px", fontSize: "20px" }}>칩 스타일 (.chip)</h3>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
          <span className="chip">수채화</span>
          <span className="chip active">파스텔톤</span>
          <span className="chip">동화 스타일</span>
          <span className="chip">밝고 따뜻한</span>
        </div>
      </div>

      <div className="tip-box">
        💡 글로벌 CSS 변수를 사용하여 일관된 스타일을 적용할 수 있습니다.
      </div>

      <div className="card option-card" onClick={() => alert("옵션 카드 클릭!")}>
        <div>
          <div style={{ fontSize: "24px", marginBottom: "8px" }}>🎨</div>
          <div style={{ fontSize: "18px", fontWeight: "600" }}>그림 그리기</div>
          <div style={{ fontSize: "14px", color: "var(--text-light)" }}>AI와 함께 그림을 만들어요</div>
        </div>
        <div style={{ fontSize: "24px" }}>→</div>
      </div>

      <button 
        className="btn" 
        onClick={() => navigate("/home")}
        style={{ marginTop: "20px" }}
      >
        🏠 홈으로 돌아가기
      </button>
    </main>
  );
}
