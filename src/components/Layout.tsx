import { Outlet } from "react-router-dom";
import "./Layout.css";

interface LayoutProps {
  children?: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="layout-wrapper">
      <div className="layout-inner">
        {children || <Outlet />}
      </div>

      <footer className="layout-footer">
        <div className="company-name">HI-DI Edu</div>
        <div className="company-slogan">모든 세대를 잇는 AI 스토리 플랫폼</div>
      </footer>
    </div>
  );
}
