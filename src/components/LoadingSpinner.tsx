import './LoadingSpinner.css';

interface LoadingSpinnerProps {
  text?: string;
}

export default function LoadingSpinner({ text = "잠시만 기다려주세요..." }: LoadingSpinnerProps) {
  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      padding: "40px 0"
    }}>
      <div className="lds-dual-ring"></div>
      <p style={{ marginTop: 20, fontSize: 20, color: "#333", fontWeight: 500 }}>{text}</p>
    </div>
  );
}
