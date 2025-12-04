import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { generateStoryPDF, type Story } from "../services/pdfService";
import PdfPreviewModal from "./PdfPreviewModal";

interface StoryCardProps {
  story: Story;
  onDelete: (id: string) => void;
}

export default function StoryCard({ story, onDelete }: StoryCardProps) {
  const navigate = useNavigate();
  const [showLayoutSelector, setShowLayoutSelector] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [selectedLayout, setSelectedLayout] = useState("A");

  return (
    <>
      <div className="bg-white border rounded-xl shadow overflow-hidden flex flex-col">
        {/* 이미지 비율 고정 - 클릭하면 상세 페이지로 */}
        <div 
          className="w-full aspect-[4/5] overflow-hidden cursor-pointer hover:opacity-90 transition-opacity"
          onClick={() => navigate("/writing/detail", { state: { id: story.id } })}
        >
          <img 
            src={story.image} 
            alt={story.title}
            className="w-full h-full object-cover"
          />
        </div>

        {/* 제목 - 클릭하면 상세 페이지로 */}
        <div 
          className="p-3 flex-1 cursor-pointer hover:bg-gray-50 transition-colors"
          onClick={() => navigate("/writing/detail", { state: { id: story.id } })}
        >
          <h3 className="text-[18px] font-semibold leading-tight line-clamp-2">
            {story.title}
          </h3>
        </div>

        {/* 버튼 그룹 */}
        <div className="flex flex-col gap-0">
          {/* 상세보기 버튼 */}
          <button
            onClick={() => navigate("/writing/detail", { state: { id: story.id } })}
            className="bg-blue-500 text-white py-3 text-[16px] font-bold w-full hover:bg-blue-600"
          >
            📖 상세보기
          </button>

          {/* PDF 저장 버튼 */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowLayoutSelector(true);
            }}
            className="bg-emerald-500 text-white py-3 text-[16px] font-bold w-full hover:bg-emerald-600"
          >
            PDF로 저장하기
          </button>

          {/* 삭제 버튼 */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (window.confirm("정말 삭제하시겠어요?\n삭제 후 복구는 불가능합니다.")) {
                onDelete(story.id);
                alert("✅ 삭제되었습니다.");
              }
            }}
            className="bg-red-500 text-white py-3 text-[16px] font-bold w-full rounded-b-xl hover:bg-red-600"
          >
            삭제하기
          </button>
        </div>
      </div>

      {/* 레이아웃 선택 모달 */}
      {showLayoutSelector && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white p-5 rounded-xl shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">PDF 레이아웃 선택</h2>
              <button
                onClick={() => setShowLayoutSelector(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl leading-none"
              >
                ×
              </button>
            </div>

            <div className="space-y-3">
              {/* A안 */}
              <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  name="layout"
                  value="A"
                  checked={selectedLayout === "A"}
                  onChange={() => setSelectedLayout("A")}
                  className="w-4 h-4"
                />
                <span className="font-semibold">A안 — 그림 위 / 글 아래</span>
              </label>

              {/* B안 */}
              <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  name="layout"
                  value="B"
                  checked={selectedLayout === "B"}
                  onChange={() => setSelectedLayout("B")}
                  className="w-4 h-4"
                />
                <span className="font-semibold">B안 — 그림 전체 페이지</span>
              </label>

              {/* C안 */}
              <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  name="layout"
                  value="C"
                  checked={selectedLayout === "C"}
                  onChange={() => setSelectedLayout("C")}
                  className="w-4 h-4"
                />
                <span className="font-semibold">C안 — 그림/글 반반</span>
              </label>
            </div>

            {/* 버튼 */}
            <button
              onClick={() => {
                setShowLayoutSelector(false);
                setShowPreview(true); // 🔹 미리보기 열기
              }}
              className="mt-5 bg-emerald-500 text-white w-full py-3 rounded-lg font-bold hover:bg-emerald-600"
            >
              선택 완료
            </button>
          </div>
        </div>
      )}

      {/* 미리보기 모달 */}
      {showPreview && (
        <PdfPreviewModal
          layout={selectedLayout}
          onClose={() => setShowPreview(false)}
          onConfirm={async () => {
            setShowPreview(false);
            try {
              await generateStoryPDF(story, { layout: selectedLayout });
              alert("✅ PDF가 다운로드되었습니다!");
            } catch (error) {
              console.error("PDF 생성 오류:", error);
              alert("PDF 생성 중 오류가 발생했습니다.");
            }
          }}
        />
      )}
    </>
  );
}
