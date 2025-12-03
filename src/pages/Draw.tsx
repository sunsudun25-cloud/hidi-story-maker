import React from "react";
import { Navigate } from "react-router-dom";

export default function Draw() {
  // /draw로 접근하면 /draw/start로 리다이렉트
  return <Navigate to="/draw/start" replace />;
}
