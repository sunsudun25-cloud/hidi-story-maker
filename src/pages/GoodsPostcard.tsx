// src/pages/GoodsPostcard.tsx
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";

export default function GoodsPostcard() {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  const postcardRef = useRef<HTMLDivElement>(null);

  // 이미지 정보 (state에서 전달받음)
  const imageData = location.state?.image;

  // 사용자 입력
  const [line1, setLine1] = useState("");
  const [line2, setLine2] = useState("");
  const [selectedFont, setSelectedFont] = useState<"nanum" | "cute" | "jua">("nanum");
  
  // CORS-safe 이미지 URL (data URL로 변환)
  const [safeImageUrl, setSafeImageUrl] = useState<string>("");

  // 글자체 설정 (웹폰트 로드 확실하게)
  const fontStyles = {
    nanum: { fontFamily: "'Nanum Gothic', 'Malgun Gothic', '맑은 고딕', sans-serif", name: "기본체" },
    cute: { fontFamily: "'Nanum Pen Script', 'Nanum Pen', cursive", name: "손글씨체" },
    jua: { fontFamily: "'Jua', 'Nanum Barun Gothic', sans-serif", name: "둥근체" }
  };

  // 이미지가 없으면 뒤로가기
  useEffect(() => {
    if (!imageData) {
      alert("이미지를 선택해주세요.");
      navigate(-1);
    }
  }, [imageData, navigate]);

  // 이미지를 data URL로 변환 (CORS 문제 해결)
  useEffect(() => {
    if (!imageData?.image) return;

    const convertToDataURL = async () => {
      // 이미 data URL이면 그대로 사용
      if (imageData.image.startsWith('data:')) {
        setSafeImageUrl(imageData.image);
        return;
      }

      try {
        // 원격 이미지를 data URL로 변환
        const response = await fetch(imageData.image);
        const blob = await response.blob();
        const reader = new FileReader();
        
        reader.onloadend = () => {
          setSafeImageUrl(reader.result as string);
        };
        
        reader.onerror = () => {
          // 변환 실패 시 원본 URL 사용 (fallback)
          console.warn("이미지 변환 실패, 원본 URL 사용");
          setSafeImageUrl(imageData.image);
        };
        
        reader.readAsDataURL(blob);
      } catch (error) {
        // fetch 실패 시 원본 URL 사용 (fallback)
        console.warn("이미지 로드 실패, 원본 URL 사용:", error);
        setSafeImageUrl(imageData.image);
      }
    };

    convertToDataURL();
  }, [imageData]);

  // PDF 저장
  const handleSavePDF = async () => {
    if (!postcardRef.current) return;

    try {
      const canvas = await html2canvas(postcardRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff"
      });

      const imgData = canvas.toDataURL("image/png");
      
      // 엽서 크기 (10x15cm = 100x150mm)
      const pdf = new jsPDF({
        orientation: "landscape",
        unit: "mm",
        format: [100, 150]
      });

      pdf.addImage(imgData, "PNG", 0, 0, 150, 100);
      pdf.save(`엽서_${Date.now()}.pdf`);

      alert("✅ PDF로 저장되었습니다!");
    } catch (error) {
      console.error("PDF 저장 오류:", error);
      alert("PDF 저장 중 오류가 발생했습니다.");
    }
  };

  // 이미지 저장
  const handleSaveImage = async () => {
    if (!postcardRef.current) return;

    try {
      const canvas = await html2canvas(postcardRef.current, {
        scale: 3,
        useCORS: true,
        backgroundColor: "#ffffff"
      });

      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          const link = document.createElement("a");
          link.href = url;
          link.download = `엽서_${Date.now()}.png`;
          link.click();
          URL.revokeObjectURL(url);
          
          alert("✅ 이미지로 저장되었습니다!");
        }
      });
    } catch (error) {
      console.error("이미지 저장 오류:", error);
      alert("이미지 저장 중 오류가 발생했습니다.");
    }
  };

  if (!imageData) {
    return null;
  }

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#FFF9F0", padding: "20px", paddingBottom: "80px" }}>
      <div className="responsive-container" style={{ maxWidth: "600px", margin: "0 auto" }}>
        {/* 헤더 */}
        <div className="flex justify-between items-center mb-5">
          <button
            onClick={() => navigate(-1)}
            className="text-[24px] w-10 h-10 flex items-center justify-center bg-white border border-gray-300 rounded-lg cursor-pointer"
          >
            ←
          </button>
          <h2 className="text-[22px] font-bold">✉️ 엽서 만들기</h2>
          <div className="w-10"></div>
        </div>

        {/* 안내 문구 */}
        <div style={{
          background: "#FFF3CD",
          padding: "16px",
          borderRadius: "12px",
          marginBottom: "20px",
          fontSize: "14px",
          lineHeight: "1.6",
          color: "#856404"
        }}>
          <p style={{ margin: 0 }}>
            💡 이미 완성된 엽서입니다!<br />
            문구를 입력하고 글자체를 선택한 후 저장하세요.
          </p>
        </div>

        {/* 엽서 미리보기 */}
        <div
          ref={postcardRef}
          style={{
            width: "100%",
            aspectRatio: "3/2",
            background: "#ffffff",
            borderRadius: "16px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
            overflow: "hidden",
            marginBottom: "24px",
            position: "relative"
          }}
        >
          {/* 이미지 영역 */}
          <div style={{
            width: "100%",
            height: "65%",
            overflow: "hidden"
          }}>
            {safeImageUrl ? (
              <img
                src={safeImageUrl}
                alt="엽서 이미지"
                crossOrigin="anonymous"
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover"
                }}
              />
            ) : (
              <div style={{
                width: "100%",
                height: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "#f0f0f0",
                color: "#666",
                fontSize: "clamp(12px, 3vw, 14px)"
              }}>
                이미지 로딩 중...
              </div>
            )}
          </div>

          {/* 텍스트 영역 */}
          <div style={{
            width: "100%",
            height: "35%",
            background: "#ffffff",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            padding: "clamp(8px, 2vw, 16px)",
            boxSizing: "border-box",
            gap: "clamp(2px, 1vw, 4px)"
          }}>
            <p style={{
              ...fontStyles[selectedFont],
              fontSize: "clamp(16px, 4vw, 22px)",
              margin: 0,
              color: "#333",
              textAlign: "center",
              lineHeight: "1.4",
              wordBreak: "keep-all",
              overflowWrap: "break-word",
              maxWidth: "90%",
              whiteSpace: "pre-wrap"
            }}>
              {line1 || "첫 번째 줄을 입력하세요"}
            </p>
            <p style={{
              ...fontStyles[selectedFont],
              fontSize: "clamp(14px, 3.5vw, 18px)",
              margin: 0,
              color: "#666",
              textAlign: "center",
              lineHeight: "1.4",
              wordBreak: "keep-all",
              overflowWrap: "break-word",
              maxWidth: "90%",
              whiteSpace: "pre-wrap"
            }}>
              {line2 || "두 번째 줄을 입력하세요"}
            </p>
          </div>
        </div>

        {/* 텍스트 입력 */}
        <div style={{ marginBottom: "20px" }}>
          <label style={{
            display: "block",
            fontSize: "16px",
            fontWeight: "600",
            marginBottom: "8px",
            color: "#333"
          }}>
            첫 번째 줄
          </label>
          <input
            type="text"
            value={line1}
            onChange={(e) => setLine1(e.target.value)}
            maxLength={30}
            placeholder="예: 소중한 당신에게"
            style={{
              width: "100%",
              padding: "14px",
              fontSize: "16px",
              border: "2px solid #ddd",
              borderRadius: "12px",
              boxSizing: "border-box"
            }}
          />
        </div>

        <div style={{ marginBottom: "24px" }}>
          <label style={{
            display: "block",
            fontSize: "16px",
            fontWeight: "600",
            marginBottom: "8px",
            color: "#333"
          }}>
            두 번째 줄
          </label>
          <input
            type="text"
            value={line2}
            onChange={(e) => setLine2(e.target.value)}
            maxLength={30}
            placeholder="예: 따뜻한 마음을 전합니다"
            style={{
              width: "100%",
              padding: "14px",
              fontSize: "16px",
              border: "2px solid #ddd",
              borderRadius: "12px",
              boxSizing: "border-box"
            }}
          />
        </div>

        {/* 글자체 선택 */}
        <div style={{ marginBottom: "24px" }}>
          <label style={{
            display: "block",
            fontSize: "16px",
            fontWeight: "600",
            marginBottom: "12px",
            color: "#333"
          }}>
            글자체 선택
          </label>
          <div style={{ display: "flex", gap: "12px" }}>
            {(Object.keys(fontStyles) as Array<keyof typeof fontStyles>).map((font) => (
              <button
                key={font}
                onClick={() => setSelectedFont(font)}
                style={{
                  flex: 1,
                  padding: "16px",
                  fontSize: "16px",
                  fontWeight: "600",
                  background: selectedFont === font ? "#EC407A" : "#f5f5f5",
                  color: selectedFont === font ? "#ffffff" : "#333",
                  border: selectedFont === font ? "2px solid #EC407A" : "2px solid #ddd",
                  borderRadius: "12px",
                  cursor: "pointer",
                  transition: "all 0.2s"
                }}
              >
                {fontStyles[font].name}
              </button>
            ))}
          </div>
        </div>

        {/* 저장 버튼들 */}
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <button
            onClick={handleSavePDF}
            style={{
              width: "100%",
              padding: "18px",
              fontSize: "18px",
              fontWeight: "bold",
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              color: "#ffffff",
              border: "none",
              borderRadius: "12px",
              cursor: "pointer",
              boxShadow: "0 4px 12px rgba(0,0,0,0.15)"
            }}
          >
            📄 PDF로 저장하기
          </button>

          <button
            onClick={handleSaveImage}
            style={{
              width: "100%",
              padding: "18px",
              fontSize: "18px",
              fontWeight: "bold",
              background: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
              color: "#ffffff",
              border: "none",
              borderRadius: "12px",
              cursor: "pointer",
              boxShadow: "0 4px 12px rgba(0,0,0,0.15)"
            }}
          >
            🖼️ 이미지로 저장하기
          </button>
        </div>

        {/* 하단 안내 */}
        <div style={{
          marginTop: "24px",
          padding: "16px",
          background: "#f5f5f5",
          borderRadius: "12px",
          fontSize: "13px",
          color: "#666",
          lineHeight: "1.6",
          textAlign: "center"
        }}>
          <p style={{ margin: "0 0 8px 0", fontWeight: "600", color: "#333" }}>
            📏 엽서 크기 안내
          </p>
          <p style={{ margin: 0 }}>
            표준 엽서 크기: 10×15cm (4×6 inch)
            <br />
            PDF 또는 이미지 파일로 저장하여 인쇄할 수 있습니다.
          </p>
        </div>
      </div>
    </div>
  );
}
