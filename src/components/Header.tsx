import { useNavigate } from "react-router-dom";

interface HeaderProps {
  title: string;
  color: string;
}

export default function Header({ title, color }: HeaderProps) {
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
        
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="header-btn"
        >
          ←
        </button>

        {/* Title */}
        <h1 className="text-xl font-bold text-gray-800">
          {title}
        </h1>

        {/* Home Button */}
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
