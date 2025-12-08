import { useNavigate } from "react-router-dom";
import StorybookLayout from "../../components/StorybookLayout";

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
    <StorybookLayout title="📚 동화책 만들기">
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
    </StorybookLayout>
  );
}
