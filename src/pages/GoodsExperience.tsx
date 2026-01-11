// src/pages/GoodsExperience.tsx
import { useNavigate } from "react-router-dom";

export default function GoodsExperience() {
  const navigate = useNavigate();

  const handleComingSoon = (item: string) => {
    alert(`${item} 제작 기능은 곧 준비될 예정입니다! 😊`);
  };

  const handlePostcardClick = () => {
    // 엽서는 내 작품에서 시작해야 하므로 내 작품 관리로 안내
    if (confirm("엽서 만들기는 '내 작품 관리'에서 시작합니다.\n\n그림을 선택하고 '엽서로 만들기' 버튼을 눌러주세요.\n\n내 작품 관리로 이동하시겠습니까?")) {
      navigate("/my-works/images");
    }
  };

  return (
    <div className="screen">
      <div className="screen-body" style={{ padding: "20px", paddingBottom: "60px" }}>
        {/* 상단 뒤로가기 */}
        <button
          onClick={() => navigate(-1)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            padding: "8px 16px",
            marginBottom: "20px",
            background: "transparent",
            border: "1px solid #ddd",
            borderRadius: "8px",
            cursor: "pointer",
            fontSize: "14px",
            color: "#666"
          }}
        >
          ← 뒤로 가기
        </button>

        {/* 제목 영역 */}
        <div style={{ textAlign: "center", marginBottom: "24px" }}>
          <h1 style={{ fontSize: "24px", fontWeight: "bold", marginBottom: "8px" }}>
            🎨 체험형 굿즈 만들기
          </h1>
          <p style={{ fontSize: "15px", color: "#666", lineHeight: "1.6" }}>
            간편하게 만들어보는 나만의 굿즈
            <br />
            내가 만든 그림으로 특별한 굿즈를 제작해보세요
          </p>
        </div>

        {/* 굿즈 카드들 */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {/* 1) 엽서 */}
          <button
            type="button"
            onClick={handlePostcardClick}
            style={{
              width: "100%",
              textAlign: "left",
              borderRadius: "16px",
              padding: "20px",
              background: "#FFF9C4",
              border: "2px solid #FFD54F",
              boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
              cursor: "pointer",
              transition: "all 0.2s ease"
            }}
          >
            <div style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
              <div style={{ fontSize: "48px" }}>✉️</div>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: "20px", fontWeight: "bold", marginBottom: "6px" }}>
                  엽서 만들기
                </p>
                <p style={{ fontSize: "14px", color: "#666", lineHeight: "1.6", marginBottom: "0" }}>
                  내가 만든 그림을 엽서로 제작
                  <br />
                  소중한 사람에게 마음을 전하세요
                </p>
                <p style={{
                  marginTop: "12px",
                  fontSize: "12px",
                  color: "#F57F17",
                  fontWeight: "500"
                }}>
                  📏 크기: 10×15cm (4×6 inch)
                </p>
              </div>
            </div>
          </button>

          {/* 2) 명함 */}
          <button
            type="button"
            onClick={() => handleComingSoon("명함")}
            style={{
              width: "100%",
              textAlign: "left",
              borderRadius: "16px",
              padding: "20px",
              background: "#E1F5FE",
              border: "2px solid #4FC3F7",
              boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
              cursor: "pointer",
              transition: "all 0.2s ease"
            }}
          >
            <div style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
              <div style={{ fontSize: "48px" }}>💼</div>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: "20px", fontWeight: "bold", marginBottom: "6px" }}>
                  명함 만들기
                </p>
                <p style={{ fontSize: "14px", color: "#666", lineHeight: "1.6", marginBottom: "0" }}>
                  나만의 그림과 정보로 명함 디자인
                  <br />
                  개성 있는 명함으로 나를 소개하세요
                </p>
                <p style={{
                  marginTop: "12px",
                  fontSize: "12px",
                  color: "#0277BD",
                  fontWeight: "500"
                }}>
                  📏 크기: 90×50mm (표준 명함 사이즈)
                </p>
              </div>
            </div>
          </button>

          {/* 3) 아크릴 무드등 */}
          <button
            type="button"
            onClick={() => handleComingSoon("아크릴 무드등")}
            style={{
              width: "100%",
              textAlign: "left",
              borderRadius: "16px",
              padding: "20px",
              background: "#F3E5F5",
              border: "2px solid #BA68C8",
              boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
              cursor: "pointer",
              transition: "all 0.2s ease"
            }}
          >
            <div style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
              <div style={{ fontSize: "48px" }}>💡</div>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: "20px", fontWeight: "bold", marginBottom: "6px" }}>
                  아크릴 무드등 만들기
                </p>
                <p style={{ fontSize: "14px", color: "#666", lineHeight: "1.6", marginBottom: "0" }}>
                  그림이 빛나는 아크릴 무드등
                  <br />
                  특별한 인테리어 소품으로 활용하세요
                </p>
                <p style={{
                  marginTop: "12px",
                  fontSize: "12px",
                  color: "#7B1FA2",
                  fontWeight: "500"
                }}>
                  💡 LED 조명 포함 • 다양한 색상 모드
                </p>
              </div>
            </div>
          </button>
        </div>

        {/* 하단 안내 문구 */}
        <div style={{
          marginTop: "32px",
          padding: "16px",
          background: "#F5F5F5",
          borderRadius: "12px",
          textAlign: "center",
          fontSize: "13px",
          color: "#666",
          lineHeight: "1.6"
        }}>
          <p style={{ margin: "0 0 8px 0", fontWeight: "600", color: "#333" }}>
            💡 체험형 굿즈 만들기란?
          </p>
          <p style={{ margin: 0 }}>
            내가 만든 그림을 활용해 간편하게 굿즈를 제작하는 서비스입니다.
            <br />
            각 항목을 클릭하면 굿즈 제작 화면으로 이동합니다.
          </p>
        </div>
      </div>
    </div>
  );
}
