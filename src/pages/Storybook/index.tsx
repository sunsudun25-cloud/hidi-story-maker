import { useNavigate } from "react-router-dom";
import StorybookLayout from "../../components/storybook/StorybookLayout";

export default function Storybook() {
  const navigate = useNavigate();

  const btnStyle: React.CSSProperties = {
    padding: "20px",
    fontSize: "18px",
    fontWeight: "700",
    borderRadius: "12px",
    border: "none",
    cursor: "pointer",
    backgroundColor: "#FFE9A8",
    boxShadow: "0 3px 6px rgba(0,0,0,0.15)",
  };

  return (
    <StorybookLayout title="📚 동화책 만들기">
      <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
        
        <button
          onClick={() => navigate("/storybook-manual")}
          style={btnStyle}
        >
          ✍️ 직접 줄거리 입력하기
        </button>

        <button
          onClick={() => navigate("/storybook-ai-suggestion")}
          style={btnStyle}
        >
          🤖 AI가 줄거리 추천하기
        </button>

      </div>
    </StorybookLayout>
  );
}
