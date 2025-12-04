import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import "./DirectInput.css";

export default function DirectInput() {
  const navigate = useNavigate();

  return (
    <div className="page-container">
      {/* Header 컴포넌트 사용 */}
      <Header title="직접 입력" />

      {/* 설명문 */}
      <div className="section-title">
        원하는 그림을 자세히 설명해주세요 😊
      </div>

      {/* 예시 박스 */}
      <div className="example-box">
        <strong>예시</strong>
        <p>파란 하늘 아래 초록 들판에서 고양이가 나비와 놀고 있는 모습</p>
      </div>

      {/* 입력창 */}
      <textarea
        className="input-area"
        placeholder="여기에 그리고 싶은 그림을 설명해주세요…"
      />

      {/* 버튼들 */}
      <button className="action-btn">🖼 사진 또는 그림 업로드</button>
      <button className="action-btn">🎤 말로 입력</button>
      <button className="action-btn">💡 도움말</button>
      <button className="action-btn">🗑 지우기</button>

      {/* 접을 수 있는 고급 옵션 */}
      <details className="details-box">
        <summary>⚙ 고급 옵션 (선택 사항)</summary>
        <p>여기에 고급 옵션 UI 들어갈 예정…</p>
      </details>

      {/* 최종 생성 버튼 */}
      <button className="primary-btn">🚀 그림 만들기</button>
    </div>
  );
}
