import { useNavigate } from "react-router-dom";
import "./Storybook.css";

export default function Storybook() {
  const navigate = useNavigate();

  return (
    <div className="screen">
      <div className="storybook-container">
        <div className="storybook-options">
          {/* 옵션 1: 직접 입력 */}
          <button className="storybook-option storybook-option-yellow" onClick={() => navigate("/storybook-manual")}>
            <div className="option-icon">✍️</div>
            <h3 className="option-title">직접 줄거리 입력하기</h3>
            <p className="option-desc">
              내가 상상한 이야기를<br />
              직접 입력해서 동화책 만들기
            </p>
          </button>

          {/* 옵션 2: AI 추천 */}
          <button className="storybook-option storybook-option-purple" onClick={() => navigate("/storybook-ai-suggestion")}>
            <div className="option-icon">🤖</div>
            <h3 className="option-title">AI가 줄거리 추천하기</h3>
            <p className="option-desc">
              AI가 재미있는 동화 줄거리를<br />
              추천해드려요
            </p>
          </button>
        </div>
      </div>
    </div>
  );
}
