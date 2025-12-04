import { useNavigate } from "react-router-dom";
import "./HomeNew.css";

export default function HomeNew() {
  const navigate = useNavigate();

  return (
    <div className="home-wrap">
      {/* 상단 환영 영역 */}
      <div className="welcome-box">
        <h1>무엇을<br />만들어볼까요?</h1>
      </div>

      {/* 메뉴 2x2 그리드 */}
      <div className="grid-menu">
        <div className="menu-tile" onClick={() => navigate("/drawing/start")}>
          <span className="emoji">🌈</span>
          <span className="label">그림 만들기</span>
        </div>

        <div className="menu-tile" onClick={() => navigate("/write")}>
          <span className="emoji">✍️</span>
          <span className="label">글쓰기</span>
        </div>

        <div className="menu-tile" onClick={() => navigate("/storybook")}>
          <span className="emoji">📚</span>
          <span className="label">동화책 만들기</span>
        </div>

        <div className="menu-tile" onClick={() => navigate("/my-works")}>
          <span className="emoji">🏆</span>
          <span className="label">내 작품 보기</span>
        </div>
      </div>

      {/* 하단 큰 타일 */}
      <div className="big-tile" onClick={() => navigate("/goods")}>
        🎁 나만의 굿즈 만들기
      </div>

      {/* 하단 작은 메뉴 */}
      <div className="footer-menu">
        <button onClick={() => navigate("/help")}>📄 도움말</button>
        <button onClick={() => navigate("/settings")}>⚙️ 설정</button>
        <button onClick={() => navigate("/qr")}>📱 다른 기기에서 보기</button>
      </div>
    </div>
  );
}
