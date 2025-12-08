// 📁 src/components/Layout.tsx

import { Outlet } from "react-router-dom";
import Header from "./Header";
import "./Layout.css";

export default function Layout() {
  return (
    <div className="layout-wrapper">
      {/* 공통 헤더 */}
      <Header />

      {/* 페이지 본문 */}
      <main className="layout-content">
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
