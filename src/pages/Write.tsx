import { useNavigate } from "react-router-dom";
import "./Write.css";

export default function Write() {
  const navigate = useNavigate();

  const handleOptionSelect = (option: string) => {
    if (option === "practice") {
      navigate("/writing/practice");
    } else if (option === "select") {
      navigate("/writing/genre");
    } else if (option === "free") {
      navigate("/write/editor", { state: { mode: "free" } });
    }
  };

  return (
    <div className="screen">
      <div className="write-container">
        <div className="write-options">
          {/* 옵션 1: 연습하기 */}
          <button className="write-option write-option-green" onClick={() => handleOptionSelect("practice")}>
            <div className="option-icon">💡</div>
            <h3 className="option-title">처음 시작하시나요?</h3>
            <p className="option-desc">
              간단한 주제로 차근차근<br />
              부담없이 글부터 시작
            </p>
            <span className="option-badge option-badge-green">연습하기</span>
          </button>

          {/* 옵션 2: 선택하기 */}
          <button className="write-option write-option-blue" onClick={() => handleOptionSelect("select")}>
            <div className="option-icon">📝</div>
            <h3 className="option-title">어떤 글을 쓰고 싶나요?</h3>
            <p className="option-desc">
              일기, 편지, 수필 등<br />
              장르를 선택하고 시작해보세요
            </p>
            <span className="option-badge option-badge-blue">선택하기</span>
          </button>

          {/* 옵션 3: 자유 작성 */}
          <button className="write-option write-option-purple" onClick={() => handleOptionSelect("free")}>
            <div className="option-icon">✍️</div>
            <h3 className="option-title">자유롭게 써 보세요</h3>
            <p className="option-desc">
              장르 구분 없이 편하게 쓰세요<br />
              <strong>AI 보조작가가 함께 도와드려요</strong>
            </p>
            <span className="option-badge option-badge-purple">작성하기</span>
          </button>
        </div>

        {/* 하단 도움말 */}
        <div className="write-tip">
          💡 어떤 방법을 선택하셔도 AI가 함께 도와드립니다!
        </div>
      </div>
    </div>
  );
}
