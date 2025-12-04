interface PdfPreviewModalProps {
  layout: string;
  onClose: () => void;
  onConfirm: () => void;
}

export default function PdfPreviewModal({ layout, onClose, onConfirm }: PdfPreviewModalProps) {
  const sample = {
    title: "표지 제목 예시",
    text: "이곳에 텍스트가 들어갑니다.\n실제 PDF 생성 시 내용이 자동으로 교체됩니다.",
    image: "/sample-image.jpg", // 예시 이미지 (없으면 배경 처리)
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-5 w-[90%] max-w-xl">
        <h2 className="text-2xl font-bold mb-4">
          PDF 미리보기 — {layout}안
        </h2>

        {/* 미리보기 박스 */}
        <div className="border border-gray-300 rounded-xl overflow-hidden mb-5 shadow-lg">
          {/* A안 — 그림 위 / 글 아래 */}
          {layout === "A" && (
            <div className="p-4">
              <div className="bg-gray-200 h-52 w-full mb-4 flex items-center justify-center">
                <span className="text-gray-600">[이미지 영역]</span>
              </div>
              <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                {sample.text}
              </p>
            </div>
          )}

          {/* B안 — 이미지 전체 */}
          {layout === "B" && (
            <div className="bg-gray-300 h-80 w-full flex items-center justify-center">
              <span className="text-gray-600">[전체 이미지 페이지]</span>
            </div>
          )}

          {/* C안 — 반반 */}
          {layout === "C" && (
            <div className="p-4">
              <div className="bg-gray-200 h-40 w-full mb-4 flex items-center justify-center">
                <span className="text-gray-600">[이미지 영역]</span>
              </div>
              <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                {sample.text}
              </p>
            </div>
          )}
        </div>

        {/* 버튼들 */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 bg-gray-300 rounded-lg font-bold hover:bg-gray-400"
          >
            닫기
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-3 bg-emerald-500 text-white rounded-lg font-bold hover:bg-emerald-600"
          >
            이 레이아웃으로 PDF 저장
          </button>
        </div>
      </div>
    </div>
  );
}
