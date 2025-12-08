import { useNavigate } from "react-router-dom";

export default function StorybookHeader({ title }: { title: string }) {
  const navigate = useNavigate();

  return (
    <header
      style={{
        backgroundColor: "#CFE2FF",
        padding: "14px 20px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        borderRadius: "0 0 20px 20px",
        boxShadow: "0 3px 6px rgba(0,0,0,0.1)",
        maxWidth: "480px",
        margin: "0 auto",
      }}
    >
      <button
        onClick={() => navigate(-1)}
        style={{
          width: "42px",
          height: "42px",
          borderRadius: "50%",
          background: "white",
          border: "none",
          fontSize: "20px",
          cursor: "pointer",
        }}
      >
        ←
      </button>

      <h1 style={{ fontSize: "20px", fontWeight: "700" }}>{title}</h1>

      <button
        onClick={() => navigate("/home")}
        style={{
          width: "42px",
          height: "42px",
          borderRadius: "50%",
          background: "white",
          border: "none",
          fontSize: "22px",
          cursor: "pointer",
        }}
      >
        🏠
      </button>
    </header>
  );
}
