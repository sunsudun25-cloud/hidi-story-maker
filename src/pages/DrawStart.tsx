import { useNavigate } from "react-router-dom";
import Header from "../components/Header";

export default function DrawStart() {
  const navigate = useNavigate();

  return (
    <div className="screen">
      <Header title="그림" />

      <div className="screen-title">어떤 방식으로 그림을 만드시겠어요?</div>

      <div
        className="option-card primary"
        onClick={() => navigate("/drawing/practice")}
      >
        <div className="option-emoji">🎨</div>
        <div className="option-title">연습하기</div>
        <div className="option-desc">AI가 주제를 제안해드려요</div>
      </div>

      <div
        className="option-card secondary"
        onClick={() => navigate("/drawing/direct")}
      >
        <div className="option-emoji">✏️</div>
        <div className="option-title">직접입력</div>
        <div className="option-desc">원하는 그림을 직접 설명해보세요</div>
      </div>
    </div>
  );
}
