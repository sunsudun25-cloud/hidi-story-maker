import { useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import "./StorybookEditor.css";

export default function StorybookEditor() {
  const navigate = useNavigate();
  const { state } = useLocation();

  const [currentPage, setCurrentPage] = useState(1);

  if (!state) {
    return (
      <div style={{ padding: 20 }}>
        ⚠ 동화책 정보가 없습니다.  
        <br />
        홈으로 돌아가 다시 시도해주세요.
        <button
          style={{ marginTop: 20 }}
          onClick={() => navigate("/storybook")}
        >
          홈으로
        </button>
      </div>
    );
  }

  const { title, prompt, style, coverImageUrl } = state;

  const exampleText = [
    "달빛을 먹으면 힘이 나는 토끼는 오늘도 친구들을 만나기 위해 숲속을 달려갑니다.",
    "숲속 깊은 곳에서 토끼는 이상한 빛을 발견하게 됩니다.",
    "그 빛을 따라가자, 놀라운 모험이 시작되는데…"
  ];

  return (
    <div className="editor-container">
      {/* 🔵 상단 헤더 */}
      <header className="editor-header">
        <button className="header-btn" onClick={() => navigate(-1)}>←</button>
        <h1 className="editor-title">동화책 편집</h1>
        <button className="header-btn" onClick={() => navigate("/")}>🏠</button>
      </header>

      {/* 제목 */}
      <h2 className="book-title">{title}</h2>

      {/* 표지 이미지 */}
      <div className="cover-box">
        <img src={coverImageUrl} alt="book cover" />
      </div>

      {/* 페이지 내용 */}
      <div className="page-content">
        <div className="page-number">📄 {currentPage} 페이지</div>

        <textarea
          className="page-textarea"
          defaultValue={exampleText[currentPage - 1]}
        ></textarea>
      </div>

      {/* 페이지 이동 버튼 */}
      <div className="page-controls">
        <button
          className="control-btn"
          disabled={currentPage === 1}
          onClick={() => setCurrentPage((p) => p - 1)}
        >
          ← 이전
        </button>

        <button
          className="control-btn"
          disabled={currentPage === exampleText.length}
          onClick={() => setCurrentPage((p) => p + 1)}
        >
          다음 →
        </button>
      </div>

      {/* 아래 버튼 */}
      <div className="bottom-actions">
        <button
          className="secondary-btn"
          onClick={() => alert("다음 페이지 자동 생성 기능은 곧 추가됩니다!")}
        >
          ➕ 페이지 자동생성
        </button>

        <button
          className="primary-btn"
          onClick={() => alert("저장 기능은 곧 연결됩니다!")}
        >
          💾 저장하기
        </button>
      </div>
    </div>
  );
}
