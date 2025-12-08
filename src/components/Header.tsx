// src/components/Header.tsx

import { useNavigate } from "react-router-dom";
import { headerColors } from "../styles/headerColors";

interface HeaderProps {
  title: string;
}

export default function Header({ title }: HeaderProps) {
  const navigate = useNavigate();

  const color = headerColors[title] || "#FFD84D";

  return (
    <header
      className="
        w-full fixed top-0 left-0 z-50
        flex items-center justify-between
        px-6 py-4 shadow-md
        rounded-b-[32px]
      "
      style={{ backgroundColor: color }}
    >
      {/* Back */}
      <button
        onClick={() => navigate(-1)}
        className="
          w-12 h-12 bg-white rounded-full shadow
          flex items-center justify-center text-2xl
        "
      >
        ←
      </button>

      {/* Title */}
      <h1 className="text-2xl font-bold text-gray-900">
        {title}
      </h1>

      {/* Home */}
      <button
        onClick={() => navigate("/home")}
        className="
          w-12 h-12 bg-white rounded-full shadow
          flex items-center justify-center text-2xl
        "
      >
        🏠
      </button>
    </header>
  );
}
