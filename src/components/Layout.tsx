import { ReactNode, useContext } from "react";
import "./Layout.css";
import { FontSizeContext } from "../context/FontSizeContext";

interface LayoutProps {
  children?: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { sizeClass } = useContext(FontSizeContext);

  return (
    <div className={`page-container ${sizeClass}`}>
      <main className="page-content">
        {children}
      </main>
      
      <footer className="layout-footer">
        HI-DI Edu<br/>
        모든 세대를 잇는 AI 스토리 플랫폼
      </footer>
    </div>
  );
}
