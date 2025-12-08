import { ReactNode, useContext } from "react";
import "./Layout.css";
import { FontSizeContext } from "../context/FontSizeContext";

interface LayoutProps {
  children?: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { sizeClass } = useContext(FontSizeContext);

  return (
    <div className={`layout-root ${sizeClass}`}>
      <div className="layout-inner">
        {children}
      </div>

      <footer className="layout-footer">
        <div className="company-name">HI-DI Edu</div>
        <div className="company-slogan">
          모든 세대를 잇는 AI 스토리 플랫폼
        </div>
      </footer>
    </div>
  );
}
