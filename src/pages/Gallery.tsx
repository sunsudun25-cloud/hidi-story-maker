import { useState } from "react";
import { useStory } from "../context/StoryContext";
import { generateStoryPDF, type Story, type StoryPDFOptions } from "../services/pdfService";
import PdfOptions from "../components/PdfOptions";

export default function Gallery() {
  const { stories, deleteStory } = useStory();
  const [showPdfModal, setShowPdfModal] = useState(false);
  const [selectedStory, setSelectedStory] = useState<Story | null>(null);

  // 작품 없는 경우 안내 메시지
  if (!stories.length) {
    return (
      <div className="p-6 text-center">
        <h2 className="text-2xl font-bold mb-4">내 작품 보기</h2>
        <p className="text-lg text-gray-600 leading-relaxed">
          아직 저장된 작품이 없어요. <br />
          그림 만들기 또는 동화책 만들기에서 작품을 만들어보세요!
        </p>
      </div>
    );
  }

  return (
    <div className="p-4 pb-24">
      <h2 className="text-2xl font-bold mb-4">내 작품 보기</h2>

      {/* ⭐ 반응형 그리드 구성 */}
      <div className="
        grid 
        grid-cols-2 
        sm:grid-cols-3 
        lg:grid-cols-4 
        gap-4
      ">
        {stories.map((story) => (
          <div 
            key={story.id}
            className="
              bg-white border rounded-xl shadow 
              overflow-hidden flex flex-col
            "
          >
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
              <h3 className="
                text-[18px] font-semibold 
                leading-tight line-clamp-2
              ">
                {story.title}
              </h3>
            </div>

            {/* 버튼 그룹 */}
            <div className="flex flex-col gap-0">
              {/* PDF 저장 버튼 */}
              <button
                onClick={() => {
                  setSelectedStory(story);
                  setShowPdfModal(true);
                }}
                className="
                  bg-emerald-500 text-white 
                  py-3 text-[16px] font-bold 
                  w-full hover:bg-emerald-600
                "
              >
                PDF로 저장하기
              </button>

              {/* 삭제 버튼 */}
              <button
                onClick={() => {
                  if (window.confirm("정말 삭제하시겠어요?\n삭제 후 복구는 불가능합니다.")) {
                    deleteStory(story.id);
                    alert("삭제되었습니다.");
                  }
                }}
                className="
                  bg-red-500 text-white 
                  py-3 text-[16px] font-bold 
                  w-full rounded-b-xl hover:bg-red-600
                "
              >
                삭제하기
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* PDF 옵션 모달 */}
      {showPdfModal && selectedStory && (
        <PdfOptions
          onConfirm={async (options: StoryPDFOptions) => {
            setShowPdfModal(false);
            try {
              await generateStoryPDF(selectedStory, options);
              alert("✅ PDF가 다운로드되었습니다!");
            } catch (error) {
              console.error("PDF 생성 오류:", error);
              alert("PDF 생성 중 오류가 발생했습니다.");
            }
            setSelectedStory(null);
          }}
          onClose={() => {
            setShowPdfModal(false);
            setSelectedStory(null);
          }}
        />
      )}
    </div>
  );
}
