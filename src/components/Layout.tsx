import { Outlet, useLocation, useNavigate } from "react-router-dom";
import TopHeader from "./TopHeader";

export default function Layout() {
  const location = useLocation();
  const navigate = useNavigate();

  // 홈 화면에서는 헤더 숨기기
  const hideHeaderOnPaths = ["/", "/welcome", "/onboarding", "/home"];
  const shouldHideHeader = hideHeaderOnPaths.includes(location.pathname);

  return (
    <div>
      {!shouldHideHeader && (
        <TopHeader title={getPageTitle(location.pathname)} />
      )}

      <main>
        <Outlet />
      </main>
    </div>
  );
}

// ❗ 각 페이지에 맞는 제목 자동 설정
function getPageTitle(path: string) {
  if (path.includes("/drawing/practice")) return "연습하기";
  if (path.includes("/drawing/direct")) return "직접입력";
  if (path.includes("/drawing/start")) return "그림 그리기";
  if (path.includes("/drawing")) return "그림 만들기";
  if (path.includes("/write")) return "글쓰기";
  if (path.includes("/storybook")) return "동화책 만들기";
  if (path.includes("/my-works")) return "내 작품 보기";
  if (path.includes("/goods")) return "나만의 굿즈";

  return "";
}
