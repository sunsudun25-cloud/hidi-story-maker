import { useNavigate } from "react-router-dom";

interface HeaderProps {
  title: string;
}

export default function Header({ title }: HeaderProps) {
  const navigate = useNavigate();

  return (
    <header className="app-header">
      <button className="header-btn" onClick={() => navigate(-1)}>
        ←
      </button>
      <h1 className="app-header-title">{title}</h1>
      <button className="header-btn" onClick={() => navigate("/home")}>
        🏠
      </button>
    </header>
  );
}
