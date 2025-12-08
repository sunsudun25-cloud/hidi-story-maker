import { useNavigate } from "react-router-dom";
import AppHeader from "../../components/AppHeader";
import "./StorybookMenu.css";

export default function Storybook() {
  const navigate = useNavigate();

  return (
    <div className="page-with-header">
      <AppHeader title="📚 동화책 만들기" tone="blue" />

      <div className="storybook-menu">
        <button 
          onClick={() => navigate("/storybook-manual")} 
          className="big-option-btn"
        >
          <span className="btn-icon">✍️</span>
          <span className="btn-text">직접 줄거리 입력하기</span>
        </button>

        <button 
          onClick={() => navigate("/storybook-ai-suggestion")} 
          className="big-option-btn"
        >
          <span className="btn-icon">🤖</span>
          <span className="btn-text">AI가 줄거리 추천하기</span>
        </button>
      </div>
    </div>
  );
}
