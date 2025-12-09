interface StorybookLayoutProps {
  title: string;
  children: React.ReactNode;
}

export default function StorybookLayout({ title, children }: StorybookLayoutProps) {
  return (
    <div style={{ background: "#FAF8F2", minHeight: "100vh" }}>
      <main
        className="responsive-container"
        style={{
          paddingTop: 90,    /* ⭐ 헤더(72px) + 여백(18px) = 90px */
          paddingBottom: 20,
          paddingLeft: 20,
          paddingRight: 20,
        }}
      >
        {children}
      </main>
    </div>
  );
}
