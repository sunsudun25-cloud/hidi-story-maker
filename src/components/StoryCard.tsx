import { useState } from "react";
import { generateStoryPDF, type Story, type StoryPDFOptions } from "../services/pdfService";
import PdfOptions from "./PdfOptions";

interface StoryCardProps {
  story: Story;
  onDelete: (id: string) => void;
}

export default function StoryCard({ story, onDelete }: StoryCardProps) {
  const [showOptions, setShowOptions] = useState(false);

  return (
    <>
      <div className="bg-white border rounded-xl shadow overflow-hidden flex flex-col">
        {/* 이미지 비율 고정 */}
        <div className="w-full aspect-[4/5] overflow-hidden">
          <img 
            src={story.image} 
            alt={story.title}
            className="w-full h-full object-cover"
          />
        </div>

        {/* 제목 */}
        <div className="p-3 flex-1">
          <h3 className="text-[18px] font-semibold leading-tight line-clamp-2">
            {story.title}
          </h3>
        </div>

        {/* 버튼 그룹 */}
        <div className="flex flex-col gap-0">
          {/* PDF 저장 버튼 */}
          <button
            onClick={() => setShowOptions(true)}
            className="bg-emerald-500 text-white py-3 text-[16px] font-bold w-full hover:bg-emerald-600"
          >
            PDF로 저장하기
          </button>

          {/* 삭제 버튼 */}
          <button
            onClick={() => {
              if (window.confirm("정말 삭제하시겠어요?\n삭제 후 복구는 불가능합니다.")) {
                onDelete(story.id);
                alert("삭제되었습니다.");
              }
            }}
            className="bg-red-500 text-white py-3 text-[16px] font-bold w-full rounded-b-xl hover:bg-red-600"
          >
            삭제하기
          </button>
        </div>
      </div>

      {/* PDF 옵션 모달 */}
      {showOptions && (
        <PdfOptions
          onConfirm={async (options: StoryPDFOptions) => {
            setShowOptions(false);
            try {
              await generateStoryPDF(story, options);
              alert("✅ PDF가 다운로드되었습니다!");
            } catch (error) {
              console.error("PDF 생성 오류:", error);
              alert("PDF 생성 중 오류가 발생했습니다.");
            }
          }}
          onClose={() => setShowOptions(false)}
        />
      )}
    </>
  );
}
