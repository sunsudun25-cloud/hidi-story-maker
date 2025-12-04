import { useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import { generateNextPage } from "../utils/gemini";
import "./StorybookEditor.css";

type PageData = {
  text: string;
};

export default function StorybookEditor() {
  const navigate = useNavigate();
  const { state } = useLocation();

  const [pages, setPages] = useState<PageData[]>([
    { text: "달빛을 먹으면 힘이 나는 토끼는 오늘도 친구들을 만나기 위해 숲속을 달려갑니다." },
    { text: "숲속 깊은 곳에서 토끼는 이상한 빛을 발견하게 됩니다." },
    { text: "그 빛을 따라가자, 놀라운 모험이 시작되는데…" }
  ]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);

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

  // 텍스트 업데이트 핸들러
  const handleTextChange = (index: number, newText: string) => {
    const newPages = [...pages];
    newPages[index].text = newText;
    setPages(newPages);
  };

  // 페이지 자동생성 핸들러
  const handleAutoGenerate = async () => {
    setIsGenerating(true);

    try {
      // 현재까지의 모든 페이지 텍스트 수집
      const prevTexts = pages.map(p => p.text);
      
      // Gemini API로 다음 페이지 생성
      const nextPageText = await generateNextPage(prevTexts, style || "동화 스타일");
      
      // 새 페이지 추가
      setPages([...pages, { text: nextPageText }]);
      
      // 새 페이지로 이동
      setCurrentPage(pages.length + 1);
      
      alert("✨ 새로운 페이지가 생성되었습니다!");
    } catch (err) {
      console.error("페이지 생성 오류:", err);
      alert("페이지 생성 중 오류가 발생했습니다. 다시 시도해주세요.");
    } finally {
      setIsGenerating(false);
    }
  };

  // 저장 핸들러 (준비 중)
  const handleSave = () => {
    const storybook = {
      title,
      prompt,
      style,
      coverImageUrl,
      pages,
      createdAt: new Date().toISOString()
    };

    console.log("📘 저장할 동화책:", storybook);
    
    // TODO: IndexedDB에 저장
    alert("💾 저장 기능은 곧 연결됩니다!\n\n현재 콘솔에 데이터가 출력되었습니다.");
  };

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
          value={pages[currentPage - 1]?.text || ""}
          onChange={(e) => handleTextChange(currentPage - 1, e.target.value)}
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
          disabled={currentPage === pages.length}
          onClick={() => setCurrentPage((p) => p + 1)}
        >
          다음 →
        </button>
      </div>

      {/* 아래 버튼 */}
      <div className="bottom-actions">
        <button
          className="secondary-btn"
          onClick={handleAutoGenerate}
          disabled={isGenerating}
        >
          {isGenerating ? "⏳ 생성 중..." : "➕ 페이지 자동생성"}
        </button>

        <button
          className="primary-btn"
          onClick={handleSave}
        >
          💾 저장하기
        </button>
      </div>
    </div>
  );
}
