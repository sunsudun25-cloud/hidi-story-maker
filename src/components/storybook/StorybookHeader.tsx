import { useNavigate } from "react-router-dom";

export default function StorybookHeader({ title }: { title: string }) {
  const navigate = useNavigate();

  const btnStyle: React.CSSProperties = {
    width: "42px",
    height: "42px",
    borderRadius: "50%",
    background: "white",
    border: "none",
    fontSize: "20px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
  };

  return (
    <header
      style={{
        backgroundColor: "#CFE2FF",
        padding: "14px 20px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        borderRadius: "0 0 20px 20px",
        maxWidth: "480px",
        margin: "0 auto",
        boxShadow: "0 3px 6px rgba(0,0,0,0.1)"
      }}
    >
      <button onClick={() => navigate(-1)} style={btnStyle}>←</button>

      <h1 style={{ fontSize: "20px", fontWeight: "700" }}>{title}</h1>

      <button onClick={() => navigate("/home")} style={btnStyle}>🏠</button>
    </header>
  );
}
