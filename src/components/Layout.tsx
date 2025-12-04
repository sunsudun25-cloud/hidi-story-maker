import { Outlet } from "react-router-dom";
import "./Layout.css";

export default function Layout() {
  return (
    <div className="layout-wrapper">
      <div className="layout-inner">
        <Outlet />
      </div>
    </div>
  );
}
