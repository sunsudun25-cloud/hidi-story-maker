import { Outlet } from "react-router-dom";
import "./Layout.css";

export default function Layout() {
  return (
    <div className="page-container">
      
      {/* 페이지 내용 */}
      <div className="page-content">
        <Outlet />   {/* ← 여기로 자식 페이지가 렌더링됨 */}
      </div>

      {/* 공통 푸터 */}
      <footer className="layout-footer">
        <div className="company-name">HI-DI Edu</div>
        <div className="company-slogan">모든 세대를 잇는 AI 스토리 플랫폼</div>
      </footer>
    </div>
  );
}
