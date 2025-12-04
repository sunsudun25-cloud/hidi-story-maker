import { useNavigate } from "react-router-dom";
import "./Home.css";

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="home-container">
      <div className="home-card">
        <div className="home-icon">AI</div>

        <h1 className="home-title">스토리 메이커</h1>
        <p className="home-subtitle">AI와 함께 만드는 특별한 이야기</p>

        <button className="home-start-btn" onClick={() => navigate("/home-new")}>
          시작하기
        </button>

        <div className="home-info">
          <span className="dot green"></span> 무료로 시작
          <span className="dot yellow"></span> 회원가입 불필요
        </div>
      </div>
    </div>
  );
}
