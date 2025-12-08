import { useNavigate } from "react-router-dom";

export default function WriteStart() {
  const navigate = useNavigate();

  return (
    <div className="screen">
      <div className="screen-title">어떤 방법으로 글을 쓰시겠어요?</div>
      <div className="screen-subtitle">
        시니어를 위한 세 가지 글쓰기 방법
      </div>

      {/* 사진으로 올리기 */}
      <div
        className="option-card primary"
        onClick={() => navigate("/writing/photo")}
      >
        <div className="option-emoji">📷</div>
        <div className="option-title">사진으로 올리기</div>
        <div className="option-desc">사진을 보고 AI가 글감 제안</div>
      </div>

      {/* 직접 입력하기 */}
      <div
        className="option-card secondary"
        onClick={() => navigate("/writing/genre")}
      >
        <div className="option-emoji">✍️</div>
        <div className="option-title">직접 입력하기</div>
        <div className="option-desc">장르 선택 후 AI 질문에 답하기</div>
      </div>

      {/* 말로 입력하기 */}
      <div
        className="option-card"
        style={{ background: "var(--bg-soft-purple)" }}
        onClick={() => navigate("/writing/voice")}
      >
        <div className="option-emoji">🎤</div>
        <div className="option-title">말로 입력하기</div>
        <div className="option-desc">음성을 글로 자동 변환</div>
      </div>

      {/* 추천 안내 */}
      <div style={{
        padding: "16px",
        background: "white",
        borderRadius: "var(--radius-md)",
        border: "1px solid var(--border-soft)",
        textAlign: "center",
        fontSize: "15px",
        color: "var(--text-secondary)",
        marginTop: "var(--space-sm)"
      }}>
        💡 <strong>처음이신가요?</strong> "직접 입력하기"를 추천합니다!
      </div>
    </div>
  );
}
