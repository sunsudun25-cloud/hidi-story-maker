import { useNavigate } from "react-router-dom";

export default function StorybookHeader({ title }: { title: string }) {
  const navigate = useNavigate();

  const btnStyle = {
    width: 42,
    height: 42,
    borderRadius: "50%",
    background: "white",
    border: "none",
    fontSize: 20,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
  } as React.CSSProperties;

  return (
    <header
      style={{
        backgroundColor: "#CFE2FF",
        padding: "14px 20px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        borderRadius: "0 0 20px 20px",
        maxWidth: 480,
        margin: "0 auto",
        boxShadow: "0 3px 6px rgba(0,0,0,0.1)",
      }}
    >
      <button onClick={() => navigate(-1)} style={btnStyle}>
        ←
      </button>

      <h1 style={{ fontSize: 20, fontWeight: 700 }}>{title}</h1>

      <button onClick={() => navigate("/home")} style={btnStyle}>
        🏠
      </button>
    </header>
  );
}
