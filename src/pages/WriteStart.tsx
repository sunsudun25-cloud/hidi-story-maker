import { useNavigate } from "react-router-dom";

export default function WriteStart() {
  const navigate = useNavigate();

  return (
    <div className="write-start-container page-section">
      {/* 제목 + 부제목 */}
      <h2 className="page-title">어떤 방법으로 글을 쓰시겠어요?</h2>
      <p className="page-subtitle">
        시니어를 위한 세 가지 글쓰기 방법
      </p>

      {/* 사진으로 올리기 */}
      <button
        className="menu-card sky"
        onClick={() => navigate("/writing/photo")}
      >
        <div className="icon">📷</div>
        <div className="label">사진으로 올리기</div>
        <div className="desc">사진을 보고 AI가 글감 제안</div>
      </button>

      {/* 직접 입력하기 */}
      <button
        className="menu-card yellow"
        onClick={() => navigate("/writing/genre")}
      >
        <div className="icon">✍️</div>
        <div className="label">직접 입력하기</div>
        <div className="desc">장르 선택 후 AI 질문에 답하기</div>
      </button>

      {/* 말로 입력하기 */}
      <button
        className="menu-card purple"
        onClick={() => navigate("/writing/voice")}
      >
        <div className="icon">🎤</div>
        <div className="label">말로 입력하기</div>
        <div className="desc">음성을 글로 자동 변환</div>
      </button>

      {/* 추천 안내 */}
      <div className="tip-box mt-4">
        💡 <strong>처음이신가요?</strong> "직접 입력하기"를 추천합니다!
      </div>
    </div>
  );
}
