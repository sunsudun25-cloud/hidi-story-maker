import { ReactNode } from "react";
import Header from "./Header";
import "./Layout.css";

interface LayoutProps {
  title: string;
  color: string;
  children: ReactNode;
}

export default function Layout({ title, color, children }: LayoutProps) {
  return (
    <div className="layout-wrapper">
      
      {/* 헤더가 이제 Layout 안으로 들어옵니다 */}
      <Header title={title} color={color} />

      {/* 본문 */}
      <div className="layout-inner">
        {children}
      </div>

      {/* 공통 푸터 */}
      <footer className="layout-footer">
        <div className="company-name">HI-DI Edu</div>
        <div className="company-slogan">모든 세대를 잇는 AI 스토리 플랫폼</div>
      </footer>
    </div>
  );
}
