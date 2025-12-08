import { Outlet } from "react-router-dom";
import "./Layout.css";

export default function Layout() {
  return (
    <div className="layout-wrapper">
      {/* 실제 페이지 내용이 렌더되는 위치 */}
      <div className="layout-inner">
        <Outlet />
      </div>

      {/* 공통 푸터 */}
      <footer className="layout-footer">
        <div className="company-name">HI-DI Edu</div>
        <div className="company-slogan">모든 세대를 잇는 AI 스토리 플랫폼</div>
      </footer>
    </div>
  );
}
