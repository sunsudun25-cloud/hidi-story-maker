// src/components/TopHeader.tsx
import React from "react";
import { useNavigate } from "react-router-dom";
import "./TopHeader.css";

export default function TopHeader({ title }: { title: string }) {
  const navigate = useNavigate();

  return (
    <div className="top-header-wrapper">
      <button className="header-btn" onClick={() => navigate(-1)}>
        ←
      </button>

      <h2 className="header-title">{title}</h2>

      <button className="header-btn" onClick={() => navigate("/home")}>
        🏠
      </button>
    </div>
  );
}
