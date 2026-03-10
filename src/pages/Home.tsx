import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { getCurrentLearner } from "../services/classroomService";
import "./Home.css";

export default function Home() {
  const navigate = useNavigate();
  const location = useLocation();

  // 뒤로가기 방지 로직
  useEffect(() => {
    // 로그인한 사용자만 뒤로가기 방지
    const learner = getCurrentLearner();
    if (!learner) return;

    // 브라우저 히스토리에 현재 페이지 추가
    window.history.pushState(null, "", window.location.href);

    // 뒤로가기 이벤트 감지
    const handlePopState = (e: PopStateEvent) => {
      // 뒤로가기 시도 시 경고 메시지
      const confirmExit = window.confirm(
        "⚠️ 지금 나가면 로그인 화면으로 돌아갑니다.\n\n다시 로그인하셔야 합니다.\n\n정말 나가시겠습니까?"
      );

      if (confirmExit) {
        // 사용자가 확인을 누르면 로그인 페이지로 이동
        navigate("/", { replace: true });
      } else {
        // 취소하면 다시 현재 페이지로
        window.history.pushState(null, "", window.location.href);
      }
    };

    // 이벤트 리스너 등록
    window.addEventListener("popstate", handlePopState);

    // 정리 함수
    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, [navigate, location]);

  return (
    <div className="home-container">
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

        <div className="home-big-tile" onClick={() => navigate("/goods")}>
          <span className="big-tile-icon">🎁</span>
          <span className="big-tile-text">나만의 굿즈 만들기</span>
        </div>

      {/* 추가 메뉴 */}
      <div className="home-extra-menu">
        <button className="extra-menu-item" onClick={() => navigate("/settings")}>
          ⚙️ 설정
        </button>
        <button className="extra-menu-item" onClick={() => alert('다른 기기에서 보기 기능 준비중입니다.')}>
          📱 다른 기기에서 보기
        </button>
      </div>
    </div>
  );
}
