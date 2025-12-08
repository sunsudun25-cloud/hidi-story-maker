import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import Header from "../components/Header";
import "./DrawStart.css";

export default function DrawStart() {
  const navigate = useNavigate();

  return (
    <Layout>
      <div className="screen">
        <Header title="그림" />

        <div className="screen-body">
        <p className="draw-start-subtitle">
          어떤 방식으로 그림을 만드시겠어요?
        </p>

        <div className="draw-start-buttons">

          {/* 연습하기 */}
          <button
            className="draw-mode-btn"
            style={{ backgroundColor: "#FFF4C7" }}
            onClick={() => navigate("/drawing/practice")}
          >
            <span className="btn-emoji">🎨</span>
            <span className="btn-label">연습하기</span>
            <span className="btn-desc">AI가 주제를 제안해드려요</span>
          </button>

          {/* 직접입력 */}
          <button
            className="draw-mode-btn"
            style={{ backgroundColor: "#DFFFE2" }}
            onClick={() => navigate("/drawing/direct")}
          >
            <span className="btn-emoji">✏️</span>
            <span className="btn-label">직접입력</span>
            <span className="btn-desc">원하는 그림을 직접 설명해보세요</span>
          </button>

        </div>
        </div>
      </div>
    </Layout>
  );
}
