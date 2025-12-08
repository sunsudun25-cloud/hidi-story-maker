import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function DrawingDirect() {
  const navigate = useNavigate();
  const [prompt, setPrompt] = useState("");
  const [style, setStyle] = useState("기본");

  const styles = ["기본", "동화풍", "수채화", "애니메이션", "연필스케치"];

  function handleSubmit() {
    if (!prompt.trim()) {
      alert("문장을 입력해주세요!");
      return;
    }

    // /drawing/result로 이동하면서 prompt와 style 전달
    navigate("/drawing/result", {
      state: { prompt, style },
    });
  }

  return (
    <div className="pb-24">

      <div className="p-5">
        <h2 className="text-2xl font-bold mb-6">어떤 그림을 만들까요?</h2>

        {/* 프롬프트 입력 */}
        <div className="mb-6">
          <label className="block text-lg font-semibold mb-3">문장 입력</label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="w-full p-4 border-2 border-gray-300 rounded-xl text-lg resize-none focus:border-emerald-500 focus:outline-none"
            rows={4}
            placeholder="예: 귀여운 강아지가 뛰어노는 장면"
          />
        </div>

        {/* 스타일 선택 */}
        <div className="mb-8">
          <label className="block text-lg font-semibold mb-3">스타일 선택</label>
          <div className="grid grid-cols-2 gap-3">
            {styles.map((s) => (
              <button
                key={s}
                onClick={() => setStyle(s)}
                className={`p-4 rounded-xl text-lg font-semibold border-2 transition-all ${
                  style === s
                    ? "bg-emerald-500 text-white border-emerald-600"
                    : "bg-white text-gray-700 border-gray-300 hover:border-emerald-400"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* 생성 버튼 */}
        <button
          onClick={handleSubmit}
          className="w-full bg-emerald-500 text-white py-4 rounded-xl text-xl font-bold hover:bg-emerald-600 transition-colors"
        >
          그림 생성하기
        </button>
      </div>
    </div>
  );
}
