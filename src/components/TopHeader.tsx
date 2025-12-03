import React from "react";
import { useNavigate } from "react-router-dom";

interface HeaderProps {
  title: string;
  onBack?: () => void;
  onHome?: () => void;
}

export default function TopHeader({ title, onBack, onHome }: HeaderProps) {
  const navigate = useNavigate();

  return (
    <header
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "12px 20px",
        background: "#A8CBFF",
        borderBottomLeftRadius: "16px",
        borderBottomRightRadius: "16px",
        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
        fontSize: "20px",
        fontWeight: 700,
      }}
    >
      <button
        style={iconBtn}
        onClick={onBack ?? (() => navigate(-1))}
      >
        ←
      </button>

      <span>{title}</span>

      <button
        style={iconBtn}
        onClick={onHome ?? (() => navigate("/home"))}
      >
        🏠
      </button>
    </header>
  );
}

const iconBtn = {
  width: "40px",
  height: "40px",
  background: "white",
  borderRadius: "50%",
  border: "none",
  fontSize: "20px",
  cursor: "pointer",
  boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
};
