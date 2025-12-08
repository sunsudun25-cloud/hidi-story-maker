import { useNavigate } from "react-router-dom";
import CommonHeader from "../components/CommonHeader";

export default function DrawStart() {
  const navigate = useNavigate();

  return (
    <>
      <CommonHeader title="🎨 그림" color="#C8F3DC" />
      <div className="page-section">

      {/* 제목 + 부제목 */}
      <h2 className="page-title">어떤 방식으로 시작하시겠어요?</h2>
      <p className="page-subtitle">
        시니어를 위한 두 가지 그림 만들기 방법
      </p>

      {/* 연습하기 */}
      <button
        className="menu-card sky"
        onClick={() => navigate("/drawing/practice")}
      >
        <div className="icon">🎨</div>
        <div className="label">연습하기</div>
        <div className="desc">AI가 주제를 제안해드려요</div>
      </button>

      {/* 직접입력 */}
      <button
        className="menu-card yellow"
        onClick={() => navigate("/drawing/direct")}
      >
        <div className="icon">✏️</div>
        <div className="label">직접입력</div>
        <div className="desc">원하는 그림을 직접 그려보세요</div>
      </button>

    </div>
    </>
  );
}
