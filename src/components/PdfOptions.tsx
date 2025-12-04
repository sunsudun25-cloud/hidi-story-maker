import { useState } from "react";
import PdfPreviewModal from "./PdfPreviewModal";

interface PdfOptionsProps {
  onConfirm: (options: { margin: string; fontSize: string; layout: string }) => void;
  onClose?: () => void;
}

export default function PdfOptions({ onConfirm, onClose }: PdfOptionsProps) {
  const [margin, setMargin] = useState("normal");
  const [fontSize, setFontSize] = useState("medium");
  const [layout, setLayout] = useState("A");
  const [showPreview, setShowPreview] = useState(false);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white p-5 rounded-xl shadow-xl w-full max-w-md mx-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">PDF 옵션 선택</h2>
          {onClose && (
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-2xl leading-none"
            >
              ×
            </button>
          )}
        </div>

        {/* 여백 선택 */}
        <div className="mb-4">
          <label className="font-semibold block mb-2">여백 선택</label>
          <select
            value={margin}
            onChange={(e) => setMargin(e.target.value)}
            className="w-full p-3 border rounded-lg"
          >
            <option value="small">좁게</option>
            <option value="normal">기본</option>
            <option value="large">넓게</option>
          </select>
        </div>

        {/* 글자 크기 선택 */}
        <div className="mb-4">
          <label className="font-semibold block mb-2">글자 크기</label>
          <select
            value={fontSize}
            onChange={(e) => setFontSize(e.target.value)}
            className="w-full p-3 border rounded-lg"
          >
            <option value="large">크게</option>
            <option value="medium">중간</option>
            <option value="small">작게</option>
          </select>
        </div>

        {/* 레이아웃 선택 */}
        <div className="mb-4">
          <label className="font-semibold block mb-2">PDF 레이아웃</label>
          <div className="space-y-2">
            {/* A안 */}
            <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
              <input
                type="radio"
                name="layout"
                value="A"
                checked={layout === "A"}
                onChange={() => setLayout("A")}
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
                checked={layout === "B"}
                onChange={() => setLayout("B")}
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
                checked={layout === "C"}
                onChange={() => setLayout("C")}
                className="w-4 h-4"
              />
              <span className="font-semibold">C안 — 그림/글 반반</span>
            </label>
          </div>
        </div>

        {/* 미리보기 버튼 */}
        <button
          onClick={() => setShowPreview(true)}
          className="w-full mb-4 py-3 bg-blue-500 text-white rounded-lg font-bold hover:bg-blue-600"
        >
          📄 레이아웃 미리보기
        </button>

        {/* 버튼 그룹 */}
        <div className="flex gap-2">
          {onClose && (
            <button
              onClick={onClose}
              className="flex-1 bg-gray-300 text-gray-700 p-3 rounded-lg font-bold hover:bg-gray-400"
            >
              취소
            </button>
          )}
          <button
            onClick={() => onConfirm({ margin, fontSize, layout })}
            className="flex-1 bg-emerald-500 text-white p-3 rounded-lg font-bold hover:bg-emerald-600"
          >
            적용하기
          </button>
        </div>
      </div>

      {/* 미리보기 모달 */}
      {showPreview && (
        <PdfPreviewModal
          layout={layout}
          onClose={() => setShowPreview(false)}
          onConfirm={() => {
            setShowPreview(false);
            onConfirm({ margin, fontSize, layout });
          }}
        />
      )}
    </div>
  );
}
