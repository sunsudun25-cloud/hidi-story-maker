import { useNavigate } from "react-router-dom";
import "./Home.css"; // 스타일 분리

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="home-container">
      <h2 className="home-title">무엇을 만들어볼까요?</h2>

      <div className="grid-row">
        <button className="menu-card yellow" onClick={() => navigate("/draw")}>
          <span className="emoji">🌈</span>
          <span className="label">그림 만들기</span>
        </button>

        <button className="menu-card green" onClick={() => navigate("/write")}>
          <span className="emoji">✍️</span>
          <span className="label">글쓰기</span>
        </button>
      </div>

      <div className="grid-row">
        <button className="menu-card mint" onClick={() => navigate("/storybook")}>
          <span className="emoji">📚</span>
          <span className="label">동화책 만들기</span>
        </button>

        <button className="menu-card blue" onClick={() => navigate("/my-works")}>
          <span className="emoji">🏆</span>
          <span className="label">내 작품 보기</span>
        </button>
      </div>

      <div className="full-row">
        <button className="menu-card purple" onClick={() => navigate("/goods")}>
          <span className="emoji">🎁</span>
          <span className="label">나만의 굿즈 만들기</span>
        </button>
      </div>

      <div className="other-device">
        <span className="gear">⚙️</span> 다른 기기에서 작품 보기
      </div>
    </div>
  );
}
