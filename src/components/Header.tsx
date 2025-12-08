import { useNavigate } from "react-router-dom";

interface HeaderProps {
  title: string;
  color?: string;
}

export default function Header({ title, color = "#B5D7FF" }: HeaderProps) {
  const navigate = useNavigate();

  return (
    <header 
      className="w-full fixed top-0 left-0 z-50 py-4 shadow-md rounded-b-3xl 
                 flex items-center justify-between px-5"
      style={{ backgroundColor: color }}
    >
      {/* Back */}
      <button
        onClick={() => navigate(-1)}
        className="w-12 h-12 bg-white rounded-full flex items-center
                   justify-center shadow text-2xl font-bold"
      >
        ←
      </button>

      {/* Title */}
      <h1 className="text-2xl font-bold text-gray-900">{title}</h1>

      {/* Home */}
      <button
        onClick={() => navigate("/home")}
        className="w-12 h-12 bg-white rounded-full flex items-center 
                   justify-center shadow text-2xl"
      >
        🏠
      </button>
    </header>
  );
}
