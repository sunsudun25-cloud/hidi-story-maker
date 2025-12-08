import { useNavigate } from "react-router-dom";
import "./CommonHeader.css";

interface CommonHeaderProps {
  title: string;
  color?: string;
}

export default function CommonHeader({ title, color }: CommonHeaderProps) {
  const navigate = useNavigate();

  return (
    <header
      className="common-header"
      style={{ backgroundColor: color || "#FFEFB3" }}
    >
      <button className="header-btn" onClick={() => navigate(-1)}>←</button>

      <h1 className="header-title">{title}</h1>

      <button className="header-btn" onClick={() => navigate("/home")}>🏠</button>
    </header>
  );
}
