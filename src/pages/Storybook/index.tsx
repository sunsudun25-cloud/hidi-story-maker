import { useNavigate } from "react-router-dom";
import Layout from "../../components/Layout";
import Header from "../../components/Header";

export default function Storybook() {
  const navigate = useNavigate();

  return (
    <Layout>
      <div className="screen">
        <Header title="📚 동화책 만들기" />

        <div className="screen-body storybook-menu">
          <button
            className="primary-card-btn"
            onClick={() => navigate("/storybook-manual")}
          >
            ✍️ 직접 줄거리 입력하기
          </button>

          <button
            className="primary-card-btn"
            onClick={() => navigate("/storybook-ai-suggestion")}
          >
            🤖 AI가 줄거리 추천하기
          </button>
        </div>
      </div>
    </Layout>
  );
}
