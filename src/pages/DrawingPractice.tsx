import { useState } from "react";
import Header from "../components/Header";
import { useNavigate } from "react-router-dom";

export default function DrawingPractice() {
  const [prompt, setPrompt] = useState("");
  const navigate = useNavigate();

  const examplePrompts = [
    "귀여운 강아지가 공원에서 뛰어노는 장면",
    "봄꽃이 가득한 길을 산책하는 가족",
    "밤하늘의 별을 바라보는 소녀의 뒷모습",
  ];

  return (
    <div className="pb-24">
      <Header title="연습하기" />

      {/* 페이지 본문 */}
      <div className="p-5">
        {/* 큰 제목 */}
        <h2 className="text-2xl font-bold mb-3">
          원하는 그림을 연습해봐요
        </h2>

        {/* 설명 */}
        <p className="text-gray-700 mb-6 leading-relaxed">
          아래 예시 문장을 눌러 바로 사용할 수 있어요.  
          또는 직접 문장을 입력해 그림을 생성할 수 있습니다.
        </p>

        {/* 예시 박스들 */}
        <div className="space-y-3 mb-8">
          {examplePrompts.map((text, idx) => (
            <button
              key={idx}
              onClick={() => setPrompt(text)}
              className="
                w-full bg-gray-100 border border-gray-300 
                rounded-xl p-4 text-left text-lg leading-relaxed
                hover:bg-gray-200 transition
              "
            >
              📌 {text}
            </button>
          ))}
        </div>

        {/* 입력창 */}
        <textarea
          className="
            w-full border border-gray-300 rounded-xl p-4 
            text-lg min-h-[120px] leading-relaxed
            focus:outline-none focus:ring-2 focus:ring-emerald-500
          "
          placeholder="원하는 그림을 설명해 주세요."
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
        />

        {/* 버튼 */}
        <button
          onClick={() => {
            if (!prompt.trim()) {
              alert("먼저 문장을 입력하거나 예시를 선택해주세요.");
              return;
            }
            navigate("/drawing/result", { state: { prompt } });
          }}
          className="
            w-full bg-emerald-500 text-white text-xl font-bold 
            py-4 rounded-xl mt-5 hover:bg-emerald-600 transition
          "
        >
          그림 생성하기
        </button>
      </div>
    </div>
  );
}
