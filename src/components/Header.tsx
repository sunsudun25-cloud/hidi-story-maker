import React from 'react';
import "./Header.css";
import { useNavigate } from "react-router-dom";

interface HeaderProps {
  title: string;
}

export default function Header({ title }: HeaderProps) {
  const nav = useNavigate();

  const goBack = () => nav(-1);
  const goHome = () => nav("/home");

  return (
    <div className="header">
      <button className="header-btn" onClick={goBack}>←</button>
      <h1 className="header-title">{title}</h1>
      <button className="header-btn" onClick={goHome}>🏠</button>
    </div>
  );
}
