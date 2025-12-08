import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import "./Home.css";

export default function Home() {
  const navigate = useNavigate();

  return (
    <Layout>
      <div className="home-container">
        {/* 타이틀 */}
        <div className="home-title-box">
          <h1 className="home-title">무엇을 만들어볼까요?</h1>
        </div>

        {/* 메뉴 2x2 그리드 */}
        <div className="home-grid-menu">
          <div className="home-menu-tile green" onClick={() => navigate("/write")}>
            <div className="tile-icon">📝</div>
            <div className="tile-label">글쓰기</div>
          </div>

          <div className="home-menu-tile yellow" onClick={() => navigate("/drawing/start")}>
            <div className="tile-icon">🌈</div>
            <div className="tile-label">그림</div>
          </div>

          <div className="home-menu-tile cyan" onClick={() => navigate("/storybook")}>
            <div className="tile-icon">📚</div>
            <div className="tile-label">동화책</div>
          </div>

          <div className="home-menu-tile blue" onClick={() => navigate("/my-works")}>
            <div className="tile-icon">🏆</div>
            <div className="tile-label">내 작품</div>
          </div>
        </div>

        {/* 하단 큰 타일 */}
        <div className="home-big-tile" onClick={() => navigate("/goods")}>
          <span className="big-tile-icon">🎁</span>
          <span className="big-tile-text">나만의 굿즈</span>
        </div>
      </div>
    </Layout>
  );
}
