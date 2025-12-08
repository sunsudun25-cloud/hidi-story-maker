import StorybookHeader from "./StorybookHeader";

export default function StorybookLayout({
  title,
  children
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div style={{ background: "#FAF8F2", minHeight: "100vh" }}>
      <StorybookHeader title={title} />

      <div style={{ maxWidth: "480px", margin: "0 auto", padding: "20px" }}>
        {children}
      </div>

      {/* 공통 푸터 */}
      <footer className="layout-footer">
        <div className="company-name">HI-DI Edu</div>
        <div className="company-slogan">모든 세대를 잇는 AI 스토리 플랫폼</div>
      </footer>
    </div>
  );
}
