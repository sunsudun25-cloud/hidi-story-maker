import { useNavigate } from "react-router-dom";
import "./HomeNew.css";

export default function HomeNew() {
  const navigate = useNavigate();

  return (
    <div className="home-container">
      <div className="home-welcome">
        <h2>👋 환영합니다!</h2>
        <p>AI 스토리 메이커와 함께  
          <br />오늘 무엇을 만들어볼까요?</p>
      </div>

      <div className="menu-list">
        <div className="menu-card" onClick={() => navigate("/drawing/start")}>
          <span className="emoji">🌈</span>
          <span className="title">그림 만들기</span>
          <span className="desc">원하는 그림을 쉽게 만들어요</span>
        </div>

        <div className="menu-card" onClick={() => navigate("/write")}>
          <span className="emoji">✍️</span>
          <span className="title">글쓰기</span>
          <span className="desc">짧은 글부터 편하게 시작</span>
        </div>

        <div className="menu-card" onClick={() => navigate("/storybook")}>
          <span className="emoji">📚</span>
          <span className="title">동화책 만들기</span>
          <span className="desc">AI가 도와주는 이야기책</span>
        </div>

        <div className="menu-card" onClick={() => navigate("/my-works")}>
          <span className="emoji">🏆</span>
          <span className="title">내 작품 보기</span>
          <span className="desc">지금까지 만든 작품들</span>
        </div>

        <div className="menu-card" onClick={() => navigate("/goods")}>
          <span className="emoji">🎁</span>
          <span className="title">나만의 굿즈 만들기</span>
          <span className="desc">내 그림으로 굿즈 제작</span>
        </div>
      </div>

      <div className="home-footer">
        <button className="footer-btn" onClick={() => navigate("/help")}>
          📄 도움말
        </button>
        <button className="footer-btn" onClick={() => navigate("/settings")}>
          ⚙️ 설정
        </button>
        <button className="footer-btn" onClick={() => navigate("/qr")}>
          📱 다른 기기에서 보기
        </button>
      </div>
    </div>
  );
}
