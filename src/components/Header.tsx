import React from 'react';
import "./Header.css";
import { useNavigate } from "react-router-dom";

interface HeaderProps {
  title: string;
}

export default function Header({ title }: HeaderProps) {
  const nav = useNavigate();

  return (
    <div className="header-container">
      <button className="header-btn" onClick={() => nav(-1)}>←</button>

      <h1 className="header-title">{title}</h1>

      <button className="header-btn" onClick={() => nav("/home")}>🏠</button>
    </div>
  );
}
