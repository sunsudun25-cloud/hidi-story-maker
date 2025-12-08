interface StorybookLayoutProps {
  title: string;
  children: React.ReactNode;
}

export default function StorybookLayout({ title, children }: StorybookLayoutProps) {
  return (
    <div style={{ background: "#FAF8F2", minHeight: "100vh" }}>
      <main
        style={{
          maxWidth: 480,
          margin: "0 auto",
          padding: 20,
        }}
      >
        {children}
      </main>
    </div>
  );
}
