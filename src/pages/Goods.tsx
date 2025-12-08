import Header from "../components/Header";
import Layout from "../components/Layout";

export default function Goods() {
  return (
    <>
      <Header title="🎁 나만의 굿즈" color="#EAD8FF" />
      
      <Layout>
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">나만의 굿즈 만들기</h1>
          <p style={{ fontSize: "18px", color: "#666" }}>
            내 작품으로 특별한 굿즈를 만들어보세요.
          </p>
        </div>
      </Layout>
    </>
  );
}
