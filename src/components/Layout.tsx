// src/components/Layout.tsx

import { Outlet } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import "./Layout.css";

export default function Layout() {
  const navigate = useNavigate();

  return (
    <div className="layout-wrapper">
      <div className="layout-inner">
        <Outlet />

        {/* 공통 하단 메뉴 */}
        <div className="footer">
          <button className="footer-btn" onClick={() => navigate("/help")}>
            📄 도움말
          </button>
          <button className="footer-btn" onClick={() => navigate("/settings")}>
            ⚙️ 설정
          </button>
          <button className="footer-btn" onClick={() => navigate("/qr")}>
            📱 다른 기기에서 보기
          </button>
        </div>

        {/* 회사 정보 */}
        <div className="footer-company">
          <div className="company-name">HI-DI Edu</div>
          <div className="company-slogan">모든 세대를 잇는 AI 스토리 플랫폼</div>
        </div>
      </div>
    </div>
  );
}
