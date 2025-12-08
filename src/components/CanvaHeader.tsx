import { useNavigate } from "react-router-dom";

interface CanvaHeaderProps {
  title: string;
  color?: string; // 페이지별 헤더 배경색
}

export default function CanvaHeader({
  title,
  color = "var(--canva-blue)",
}: CanvaHeaderProps) {
  const navigate = useNavigate();

  return (
    <header
      className="header-wrapper"
      style={{ "--header-color": color } as React.CSSProperties}
    >
      <button className="header-btn" onClick={() => navigate(-1)}>
        ←
      </button>

      <div className="canva-header-title">{title}</div>

      <button className="header-btn" onClick={() => navigate("/home")}>
        🏠
      </button>
    </header>
  );
}
