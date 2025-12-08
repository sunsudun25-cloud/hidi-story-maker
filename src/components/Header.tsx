import { useNavigate, useLocation } from "react-router-dom";
import "./Header.css";

export default function Header() {
  const navigate = useNavigate();
  const location = useLocation();

  // 경로별 헤더 제목 자동 매핑
  const pageTitleMap: Record<string, string> = {
    "/home": "무엇을 만들어볼까요?",
    
    // 그림
    "/drawing/start": "그림",
    "/drawing/practice": "연습하기",
    "/drawing/direct": "직접입력",
    "/drawing/result": "그림 결과",
    "/direct-input": "직접 입력",
    
    // 글쓰기
    "/write": "글쓰기",
    "/write/start": "글쓰기",
    "/write/practice": "글쓰기 연습",
    "/write/editor": "글쓰기",
    "/writing/photo": "사진으로 올리기",
    "/writing/voice": "말로 입력하기",
    "/writing/genre": "장르 선택",
    "/writing/questions": "AI 질문",
    "/writing/practice": "글쓰기 연습",
    "/writing/editor": "글쓰기",
    "/writing/detail": "글 상세",
    "/writing/help": "도움말",
    
    // 동화책
    "/storybook": "동화책 만들기",
    "/storybook-manual": "동화책 만들기",
    "/storybook-ai-suggestion": "동화책 만들기",
    "/storybook-editor": "동화책 편집",
    "/storybook-export": "동화책 내보내기",
    
    // 작품
    "/my-works": "내 작품",
    "/gallery": "갤러리",
    
    // 굿즈
    "/goods": "나만의 굿즈 만들기",
    
    // 기타
    "/result": "결과 보기",
    "/image/practice": "이미지 만들기",
    "/image/custom": "이미지 커스텀",
    "/image/result": "이미지 결과",
  };

  const title = pageTitleMap[location.pathname] || "HI-DI Story Maker";

  return (
    <header className="app-header">
      <button className="header-btn" onClick={() => navigate(-1)}>
        ←
      </button>
      <h1 className="app-header-title">{title}</h1>
      <button className="header-btn" onClick={() => navigate("/home")}>
        🏠
      </button>
    </header>
  );
}
