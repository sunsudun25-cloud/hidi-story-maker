import { Outlet, useLocation } from "react-router-dom";
import Header from "./Header"; 
import "./Layout.css";

export default function Layout() {
  const location = useLocation();

  // 헤더 제목 자동 매핑 (필요 시 확장 가능)
  const pageTitleMap: Record<string, string> = {
    "/home": "무엇을 만들어볼까요?",
    
    // 그림
    "/drawing/start": "그림",
    "/drawing/practice": "연습하기",
    "/drawing/direct": "직접입력",
    "/drawing/result": "그림 결과",
    
    // 글쓰기
    "/write": "글쓰기",
    "/write/start": "글쓰기",
    "/writing/photo": "사진으로 올리기",
    "/writing/voice": "말로 입력하기",
    "/writing/genre": "장르 선택",
    "/writing/genre/questions": "질문",
    "/writing/questions": "AI 질문",
    "/writing/practice": "글쓰기 연습",
    "/writing/editor": "글쓰기",
    "/writing/detail": "글 상세",
    "/writing/help": "도움말",
    
    // 동화책
    "/storybook": "동화책 만들기",
    "/storybook-manual": "직접 줄거리 입력",
    "/storybook-ai-suggestion": "AI 줄거리 추천",
    "/storybook-editor": "동화책 편집",
    "/storybook-export": "동화책 내보내기",
    
    // 작품
    "/my-works": "내 작품",
    "/gallery": "갤러리",
    
    // 굿즈
    "/goods": "나만의 굿즈 만들기",
  };

  const title = pageTitleMap[location.pathname] || "";

  return (
    <div className="page-container">
      {title && <Header title={title} />}

      <main className="page-content">
        <Outlet />
      </main>

      <footer className="layout-footer">
        <div className="company-name">HI-DI Edu</div>
        <div className="company-slogan">모든 세대를 잇는 AI 스토리 플랫폼</div>
      </footer>
    </div>
  );
}
