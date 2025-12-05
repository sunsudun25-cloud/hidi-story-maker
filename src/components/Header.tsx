import { useNavigate } from "react-router-dom";

interface HeaderProps {
  title: string;
}

export default function Header({ title }: HeaderProps) {
  const navigate = useNavigate();
  
  return (
    <header className="w-full bg-[#B5D7FF] py-3 shadow-md rounded-b-2xl flex items-center justify-between px-4">
      {/* 이전 버튼 */}
      <button
        onClick={() => navigate(-1)}
        className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow hover:bg-gray-50 transition-colors"
      >
        ←
      </button>

      {/* 중앙 제목 */}
      <h1 className="text-lg font-bold text-gray-800">{title}</h1>

      {/* 홈으로 */}
      <button
        onClick={() => navigate("/home")}
        className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow text-xl hover:bg-gray-50 transition-colors"
      >
        🏠
      </button>
    </header>
  );
}
