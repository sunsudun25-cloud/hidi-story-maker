import { useNavigate } from "react-router-dom";

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
    <>
      {/* 📚 동화책 전용 파란 헤더 */}
      <div className="storybook-header">
        <button className="storybook-back" onClick={() => navigate(-1)}>←</button>
        <h1 className="storybook-title">📚 동화책 만들기</h1>
        <button className="storybook-home" onClick={() => navigate("/home")}>🏠</button>
      </div>

      <div className="page-section">
        <h2 className="page-title">동화책 만들기를 어떻게 시작할까요?</h2>

        <button
          className="menu-card sky"
          onClick={handleGoToManualInput}
        >
          <div className="icon">✍️</div>
          <div className="label">직접 입력하기</div>
          <div className="desc">주인공과 스토리를 직접 설정</div>
        </button>

        <button
          className="menu-card purple"
          onClick={handleGoToAISuggestion}
        >
          <div className="icon">🎯</div>
          <div className="label">AI에게 추천받기</div>
          <div className="desc">AI가 준비한 재미있는 아이디어</div>
        </button>
      </div>

      {/* 공통 푸터 */}
      <footer className="layout-footer">
        <div className="company-name">HI-DI Edu</div>
        <div className="company-slogan">모든 세대를 잇는 AI 스토리 플랫폼</div>
      </footer>
    </>
  );
}
