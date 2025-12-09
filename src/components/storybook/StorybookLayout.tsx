interface StorybookLayoutProps {
  title: string;
  children: React.ReactNode;
}

export default function StorybookLayout({ title, children }: StorybookLayoutProps) {
  return (
    <div style={{ background: "#FAF8F2", minHeight: "100vh", paddingTop: "10px", paddingBottom: "20px" }}>
      <main className="responsive-container">
        {children}
      </main>
    </div>
  );
}
