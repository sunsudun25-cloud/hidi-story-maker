import { useNavigate } from "react-router-dom";

export default function Storybook() {
  const navigate = useNavigate();

  return (
    
      <div className="screen">

        <div className="screen-body storybook-menu">
          <button
            className="primary-card-btn"
            onClick={() => navigate("/storybook-manual")}
          >
            ✍️ 직접 줄거리 입력하기
          </button>

          <button
            className="primary-card-btn"
            onClick={() => navigate("/storybook-ai-suggestion")}
          >
            🤖 AI가 줄거리 추천하기
          </button>
        </div>
      </div>
    
  );
}
