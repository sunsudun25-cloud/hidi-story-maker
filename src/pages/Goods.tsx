// src/pages/Goods.tsx
import { useNavigate } from "react-router-dom";

export default function Goods() {
  const navigate = useNavigate();

  // 아직 세부 기능은 없으니, 클릭 시 안내만 띄우도록 처리
  const handleComingSoon = (feature: string) => {
    alert(`${feature} 기능은 곧 업데이트될 예정입니다 😊\n지금은 화면 구성만 확인해 주세요.`);
  };

  return (
    <div className="screen">
      <div className="screen-body" style={{ padding: "20px", paddingBottom: "60px" }}>
        {/* 제목 영역 */}
        <div style={{ textAlign: "center", marginBottom: "24px" }}>
          <h1 style={{ fontSize: "24px", fontWeight: "bold", marginBottom: "8px" }}>
            ✨ 나만의 출판물 & 굿즈 만들기
          </h1>
          <p style={{ fontSize: "15px", color: "#666", lineHeight: "1.6" }}>
            AI로 만든 그림, 동화, 글을{" "}
            <span style={{ fontWeight: "600" }}>책 · 앨범 · 굿즈</span>로 제작해 보세요.
            <br />
            시니어·학생·창작자를 위한 출판·굿즈 제작 서비스입니다.
          </p>
        </div>

        {/* 기능 카드들 */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {/* 1) AI 출판 */}
          <button
            type="button"
            onClick={() => handleComingSoon("AI 출판")}
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
              <div style={{ fontSize: "32px" }}>📘</div>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: "18px", fontWeight: "bold", marginBottom: "4px" }}>
                  AI 출판 (책으로 만들기)
                </p>
                <p style={{ fontSize: "14px", color: "#666", lineHeight: "1.5" }}>
                  동화책, 수필집, 기록집 등 내가 쓴 글과 만든 그림을
                  <br />
                  <span style={{ fontWeight: "600" }}>책(PDF · 인쇄용 파일)</span>으로 자동 구성해 드려요.
                </p>
                <p style={{
                  marginTop: "8px",
                  fontSize: "12px",
                  color: "#7B1FA2",
                  background: "#F3E5F5",
                  display: "inline-block",
                  padding: "4px 8px",
                  borderRadius: "8px"
                }}>
                  동화책·글쓰기 페이지에서 만든 작품과 연결됩니다
                </p>
              </div>
            </div>
          </button>

          {/* 2) 실물 굿즈 제작 */}
          <button
            type="button"
            onClick={() => handleComingSoon("실물 굿즈 제작")}
            style={{
              width: "100%",
              textAlign: "left",
              borderRadius: "16px",
              padding: "20px",
              background: "#E8F5E9",
              border: "2px solid #66BB6A",
              boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
              cursor: "pointer",
              transition: "all 0.2s ease"
            }}
          >
            <div style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
              <div style={{ fontSize: "32px" }}>🎁</div>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: "18px", fontWeight: "bold", marginBottom: "4px" }}>
                  실물 굿즈 제작
                </p>
                <p style={{ fontSize: "14px", color: "#666", lineHeight: "1.5" }}>
                  액자, 머그컵, 티셔츠, 퍼즐, 포토북 등
                  <br />
                  <span style={{ fontWeight: "600" }}>승화전사 굿즈</span>로 작품을 남길 수 있어요.
                </p>
                <p style={{
                  marginTop: "8px",
                  fontSize: "12px",
                  color: "#2E7D32",
                  background: "#E8F5E9",
                  display: "inline-block",
                  padding: "4px 8px",
                  borderRadius: "8px"
                }}>
                  추후 공방·기기 연동 서비스로 확장 예정
                </p>
              </div>
            </div>
          </button>

          {/* 3) 전시 & 공유 (디지털 굿즈) */}
          <button
            type="button"
            onClick={() => handleComingSoon("전시 & 공유")}
            style={{
              width: "100%",
              textAlign: "left",
              borderRadius: "16px",
              padding: "20px",
              background: "#E3F2FD",
              border: "2px solid #42A5F5",
              boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
              cursor: "pointer",
              transition: "all 0.2s ease"
            }}
          >
            <div style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
              <div style={{ fontSize: "32px" }}>🖼</div>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: "18px", fontWeight: "bold", marginBottom: "4px" }}>
                  전시 & 공유 (디지털 굿즈)
                </p>
                <p style={{ fontSize: "14px", color: "#666", lineHeight: "1.5" }}>
                  작품을 모아{" "}
                  <span style={{ fontWeight: "600" }}>디지털 앨범·슬라이드북·온라인 전시관</span>으로 만들고
                  <br />
                  QR코드로 가족·친구와 쉽게 공유할 수 있어요.
                </p>
              </div>
            </div>
          </button>

          {/* 4) 창작자 수익화 & 공방 */}
          <button
            type="button"
            onClick={() => handleComingSoon("창작자 수익화 & 공방")}
            style={{
              width: "100%",
              textAlign: "left",
              borderRadius: "16px",
              padding: "20px",
              background: "#FFF3E0",
              border: "2px solid #FFA726",
              boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
              cursor: "pointer",
              transition: "all 0.2s ease"
            }}
          >
            <div style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
              <div style={{ fontSize: "32px" }}>💰</div>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: "18px", fontWeight: "bold", marginBottom: "4px" }}>
                  창작자 수익화 & 공방 연계
                </p>
                <p style={{ fontSize: "14px", color: "#666", lineHeight: "1.5" }}>
                  만든 굿즈를 판매하거나, 승화전사·굿즈 제작 기술을
                  <br />
                  <span style={{ fontWeight: "600" }}>공방 창업·강의 프로그램</span>으로 확장할 수 있어요.
                </p>
                <p style={{
                  marginTop: "8px",
                  fontSize: "12px",
                  color: "#E65100",
                  background: "#FFF3E0",
                  display: "inline-block",
                  padding: "4px 8px",
                  borderRadius: "8px"
                }}>
                  향후 마켓·기기 패키지·창업 과정으로 확장되는 핵심 비즈니스 영역
                </p>
              </div>
            </div>
          </button>
        </div>

        {/* 하단 안내 문구 */}
        <div style={{
          marginTop: "32px",
          textAlign: "center",
          fontSize: "12px",
          color: "#999",
          lineHeight: "1.6"
        }}>
          지금은 화면 구성과 서비스 설명을 위한 체험 버전입니다.
          <br />
          실제 출판·굿즈 제작·판매 기능은 단계적으로 열릴 예정입니다.
        </div>
      </div>
    </div>
  );
}
