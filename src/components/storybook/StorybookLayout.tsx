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

      <main
        style={{
          maxWidth: "480px",
          margin: "0 auto",
          padding: "20px",
        }}
      >
        {children}
      </main>
    </div>
  );
}
