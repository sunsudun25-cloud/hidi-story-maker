import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import { getAllPostcards, deletePostcard, type Postcard } from "../services/dbService";
import { getCurrentLearner } from "../services/classroomService";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";

export default function MyWorksPostcardDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [item, setItem] = useState<Postcard | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const postcardRef = useRef<HTMLDivElement>(null);

  // 글자체 설정
  const fontStyles = {
    nanum: { fontFamily: "'Nanum Gothic', 'Malgun Gothic', '맑은 고딕', sans-serif", name: "기본체" },
    cute: { fontFamily: "'Nanum Pen Script', 'Nanum Pen', cursive", name: "손글씨체" },
    jua: { fontFamily: "'Jua', 'Nanum Barun Gothic', sans-serif", name: "둥근체" }
  };

  useEffect(() => {
    loadPostcard();
  }, [id]);

  const loadPostcard = async () => {
    setIsLoading(true);
    try {
      const list = await getAllPostcards();
      const found = list.find((i) => String(i.id) === id);
      setItem(found || null);
    } catch (error) {
      console.error("엽서 불러오기 오류:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadPDF = async () => {
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

  const handleDownloadImage = async () => {
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

  const handleSubmit = async () => {
    if (!item) return;

    // 학생 정보 확인
    const learner = getCurrentLearner();
    if (!learner) {
      const goToLogin = confirm(
        "로그인이 필요합니다.\n\n수업 코드로 로그인하시겠습니까?"
      );
      if (goToLogin) {
        navigate("/onboarding");
      }
      return;
    }

    if (!confirm("이 엽서를 선생님께 제출하시겠습니까?")) return;

    setIsSubmitting(true);
    try {
      // 엽서를 이미지로 변환
      if (!postcardRef.current) {
        throw new Error("엽서 렌더링 오류");
      }

      const canvas = await html2canvas(postcardRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff"
      });

      const imageDataUrl = canvas.toDataURL("image/png");

      // Firestore에 제출
      const { saveArtifact } = await import("../services/classroomService");
      
      const result = await saveArtifact({
        learnerId: learner.learnerId,
        type: "image",  // 엽서는 image 타입으로 저장
        title: `엽서 - ${item.line1}`,
        data: {
          line1: item.line1,
          line2: item.line2,
          font: item.font,
          originalImageUrl: item.imageUrl
        },
        files: {
          postcard: imageDataUrl
        }
      });

      alert(`✅ 제출 완료!\n\n선생님께서 갤러리에서 확인하실 수 있습니다.`);
    } catch (error: any) {
      console.error("제출 오류:", error);
      alert(`제출 중 오류가 발생했습니다.\n\n${error.message || "다시 시도해주세요."}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!item || !confirm("이 엽서를 삭제하시겠습니까?")) return;

    try {
      await deletePostcard(item.id!);
      alert("✅ 엽서가 삭제되었습니다.");
      navigate("/my-works/postcards");
    } catch (error) {
      console.error("삭제 오류:", error);
      alert("삭제 중 오류가 발생했습니다.");
    }
  };

  if (isLoading) {
    return (
      <div style={{ minHeight: "100vh", backgroundColor: "#FFF9F0", padding: "20px" }}>
        <div className="responsive-container">
          <p className="text-center text-[18px] text-gray-600 mt-10">불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (!item) {
    return (
      <div style={{ minHeight: "100vh", backgroundColor: "#FFF9F0", padding: "20px" }}>
        <div className="responsive-container p-6">
          <p className="text-center text-[18px] text-gray-600">엽서를 찾을 수 없습니다.</p>
          <div className="text-center mt-4">
            <button
              onClick={() => navigate("/my-works/postcards")}
              className="px-6 py-3 bg-blue-500 text-white rounded-xl"
            >
              목록으로 돌아가기
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#FFF9F0", padding: "20px", paddingBottom: "80px" }}>
      <div className="responsive-container" style={{ maxWidth: "600px", margin: "0 auto" }}>
        {/* 헤더 */}
        <div className="flex justify-between items-center mb-5">
          <button
            onClick={() => navigate("/my-works/postcards")}
            className="text-[24px] w-10 h-10 flex items-center justify-center bg-white border border-gray-300 rounded-lg cursor-pointer"
          >
            ←
          </button>
          <h2 className="text-[22px] font-bold">📮 엽서 상세</h2>
          <div className="w-10"></div>
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
            <img
              src={item.imageUrl}
              alt="엽서 이미지"
              crossOrigin="anonymous"
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover"
              }}
            />
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
              ...fontStyles[item.font],
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
              {item.line1}
            </p>
            <p style={{
              ...fontStyles[item.font],
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
              {item.line2}
            </p>
          </div>
        </div>

        {/* 생성일 */}
        <div className="text-center text-[13px] text-gray-500 mb-6">
          {new Date(item.createdAt).toLocaleString("ko-KR")}
        </div>

        {/* 액션 버튼들 */}
        <div className="flex flex-col gap-3">
          {/* 선생님께 제출 버튼 - 가장 상단에 강조 */}
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="py-5 px-5 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl text-[18px] font-bold hover:from-purple-600 hover:to-pink-600 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "제출 중..." : "👩‍🏫 선생님께 제출하기"}
          </button>

          {/* 1행: PDF 저장 + 이미지 저장 */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={handleDownloadPDF}
              className="py-4 px-5 bg-blue-500 text-white rounded-xl text-[17px] font-bold hover:bg-blue-600 transition-all duration-200 shadow-md hover:shadow-lg"
            >
              📄 PDF 저장
            </button>
            <button
              onClick={handleDownloadImage}
              className="py-4 px-5 bg-emerald-500 text-white rounded-xl text-[17px] font-bold hover:bg-emerald-600 transition-all duration-200 shadow-md hover:shadow-lg"
            >
              🖼️ 이미지 저장
            </button>
          </div>

          {/* 2행: 삭제하기 */}
          <button
            onClick={handleDelete}
            className="py-4 px-5 bg-rose-500 text-white rounded-xl text-[17px] font-bold hover:bg-rose-600 transition-all duration-200 shadow-md hover:shadow-lg"
          >
            🗑️ 삭제하기
          </button>
        </div>
      </div>
    </div>
  );
}
