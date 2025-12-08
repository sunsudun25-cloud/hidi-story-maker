import { useNavigate } from "react-router-dom";
import "./CanvasHeader.css";

interface CanvasHeaderProps {
  title: string;
}

export default function CanvasHeader({ title }: CanvasHeaderProps) {
  const navigate = useNavigate();

  return (
    <header className="page-header">
      <button className="header-btn" onClick={() => navigate(-1)} aria-label="뒤로가기">
        ←
      </button>
      <h1 className="header-title">{title}</h1>
      <button className="header-btn" onClick={() => navigate("/home")} aria-label="홈으로">
        🏠
      </button>
    </header>
  );
}
