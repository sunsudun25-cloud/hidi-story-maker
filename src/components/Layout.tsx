import { ReactNode } from "react";
import "./Layout.css";

interface LayoutProps {
  children?: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="page-container">
      {/* 본문 */}
      <div style={{ width: "100%" }}>
        {children}
      </div>

      {/* 공통 푸터 */}
      <footer className="layout-footer">
        <div className="company-name">HI-DI Edu</div>
        <div className="company-slogan">
          모든 세대를 잇는 AI 스토리 플랫폼
        </div>
      </footer>
    </div>
  );
}
