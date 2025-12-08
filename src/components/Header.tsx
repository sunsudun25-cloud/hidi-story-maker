// src/components/Header.tsx
import { useNavigate } from "react-router-dom";

interface HeaderProps {
  title: string;
  color?: string;   // 페이지별 배경색 (없으면 기본색)
}

export default function Header({ title, color = "#D8E9FF" }: HeaderProps) {
  const navigate = useNavigate();

  return (
    <header
      className="w-full shadow-sm rounded-b-3xl"
      style={{
        backgroundColor: color,
        padding: "16px 0",
      }}
    >
      <div className="max-w-[480px] mx-auto px-4 flex items-center justify-between">
        {/* 뒤로가기 버튼 (동그라미 고정) */}
        <button
          onClick={() => navigate(-1)}
          className="header-btn"
        >
          ←
        </button>

        {/* 가운데 제목 */}
        <h1 className="text-xl font-bold text-gray-800">
          {title}
        </h1>

        {/* 홈 버튼 (동그라미 고정) */}
        <button
          onClick={() => navigate("/home")}
          className="header-btn"
        >
          🏠
        </button>
      </div>
    </header>
  );
}
