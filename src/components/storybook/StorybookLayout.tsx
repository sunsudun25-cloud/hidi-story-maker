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
          padding: 20,
        }}
      >
        {children}
      </main>
    </div>
  );
}
