import { Outlet, useLocation } from "react-router-dom";
import Header from "./Header";
import "./Layout.css";

export default function Layout() {
  const location = useLocation();

  // 헤더가 필요 없는 페이지 목록 (로그인/온보딩만)
  const showHeader = ![
    "/", 
    "/login", 
    "/onboarding"
  ].includes(location.pathname);

  return (
    <div className="page-container">
      
      {/* 공통 헤더 */}
      {showHeader && <Header />}

      {/* 본문 */}
      <main className="page-content">
        <Outlet />
      </main>

      {/* 공통 푸터 */}
      <footer className="layout-footer">
        <div className="company-name">HI-DI Edu</div>
        <div className="company-slogan">모든 세대를 잇는 AI 스토리 플랫폼</div>
      </footer>
    </div>
  );
}
