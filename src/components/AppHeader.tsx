import { useNavigate } from "react-router-dom";
import "./AppHeader.css";

type HeaderTone = "blue" | "green" | "yellow";

interface AppHeaderProps {
  title: string;
  tone?: HeaderTone;     // 색상 계열 (기본: blue)
  showBack?: boolean;
  showHome?: boolean;
}

export default function AppHeader({
  title,
  tone = "blue",
  showBack = true,
  showHome = true,
}: AppHeaderProps) {
  const navigate = useNavigate();

  const bgClass =
    tone === "green"
      ? "header-green"
      : tone === "yellow"
      ? "header-yellow"
      : "header-blue";

  return (
    <header className={`app-header ${bgClass}`}>
      <div className="app-header-inner">
        {/* 뒤로가기 */}
        {showBack ? (
          <button
            className="header-circle-btn"
            onClick={() => navigate(-1)}
            aria-label="뒤로가기"
          >
            ←
          </button>
        ) : (
          <div className="header-circle-btn header-circle-placeholder" />
        )}

        {/* 제목 */}
        <h1 className="app-header-title">{title}</h1>

        {/* 홈 버튼 */}
        {showHome ? (
          <button
            className="header-circle-btn"
            onClick={() => navigate("/home")}
            aria-label="홈으로"
          >
            🏠
          </button>
        ) : (
          <div className="header-circle-btn header-circle-placeholder" />
        )}
      </div>
    </header>
  );
}
