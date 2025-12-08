import { useNavigate } from "react-router-dom";
import { useContext } from "react";
import { FontSizeContext } from "../context/FontSizeContext";
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
  const { size, setSize } = useContext(FontSizeContext);

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

        {/* 오른쪽: 글자크기 & 홈 버튼 */}
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {/* 글자 크기 토글 */}
          <div className="font-size-toggle">
            <button
              className={`font-toggle-btn ${size === "small" ? "active" : ""}`}
              onClick={() => setSize("small")}
              aria-label="작은 글씨"
            >
              가
            </button>
            <button
              className={`font-toggle-btn ${size === "medium" ? "active" : ""}`}
              onClick={() => setSize("medium")}
              aria-label="중간 글씨"
            >
              가
            </button>
            <button
              className={`font-toggle-btn ${size === "large" ? "active" : ""}`}
              onClick={() => setSize("large")}
              aria-label="큰 글씨"
            >
              가
            </button>
          </div>

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
      </div>
    </header>
  );
}
