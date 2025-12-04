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
    </div>
  );
}
