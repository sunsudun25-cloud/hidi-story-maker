import Layout from "../components/Layout";

export default function Goods() {
  return (
    <Layout title="나만의 굿즈" color="#EAD8FF">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">나만의 굿즈 만들기</h1>
        <p style={{ fontSize: "18px", color: "#666" }}>
          내 작품으로 특별한 굿즈를 만들어보세요.
        </p>
      </div>
    </Layout>
  );
}
