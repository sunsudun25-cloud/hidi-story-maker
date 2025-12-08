import { useNavigate } from "react-router-dom";
import "./Home.css";

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="home-container">
        {/* 타이틀 */}
        <div className="home-title-box">
          <h1 className="home-title">무엇을 만들어볼까요?</h1>
        </div>

        {/* 메뉴 2x2 그리드 */}
        <div className="home-grid-menu">
          {/* 첫 번째: 그림 */}
          <div className="home-menu-tile green" onClick={() => navigate("/drawing/start")}>
            <div className="tile-icon">🌈</div>
            <div className="tile-label">그림</div>
          </div>

          {/* 두 번째: 글쓰기 */}
          <div className="home-menu-tile yellow" onClick={() => navigate("/write")}>
            <div className="tile-icon">📝</div>
            <div className="tile-label">글쓰기</div>
          </div>

          {/* 세 번째: 동화책 */}
          <div className="home-menu-tile cyan" onClick={() => navigate("/storybook")}>
            <div className="tile-icon">📚</div>
            <div className="tile-label">동화책</div>
          </div>

          {/* 네 번째: 내 작품 */}
          <div className="home-menu-tile blue" onClick={() => navigate("/my-works")}>
            <div className="tile-icon">🏆</div>
            <div className="tile-label">내 작품</div>
          </div>
        </div>

        {/* 하단 큰 타일 */}
        <div className="home-big-tile" onClick={() => navigate("/goods")}>
          <span className="big-tile-icon">🎁</span>
          <span className="big-tile-text">나만의 굿즈 만들기</span>
        </div>

        {/* 하단 작은 메뉴 */}
        <div className="home-footer-menu">
          <button className="footer-menu-btn" onClick={() => navigate("/help")}>
            📄 도움말
          </button>
          <button className="footer-menu-btn" onClick={() => navigate("/settings")}>
            ⚙️ 설정
          </button>
          <button className="footer-menu-btn" onClick={() => navigate("/qr")}>
            📱 다른 기기에서 보기
          </button>
        </div>

        {/* 회사 정보 푸터 */}
        <div className="home-company-footer">
          <div className="company-name">HI-DI Edu</div>
          <div className="company-slogan">모든 세대를 잇는 AI 스토리 플랫폼</div>
        </div>
      </div>
  );
}
