// src/pages/DrawingPractice.tsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { generateImageViaCloudflare } from "../services/cloudflareImageApi";  // ⭐ Firebase Functions 프록시 사용

export default function DrawingPractice() {
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const examplePrompts = [
    "귀여운 강아지가 공원에서 뛰어노는 장면",
    "봄꽃이 가득한 길을 산책하는 가족",
    "밤하늘의 별을 바라보는 소녀의 뒷모습",
  ];

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      alert("그림 설명을 입력하거나 예시를 선택하세요!");
      return;
    }

    setLoading(true);
    try {
      console.log("🎨 [DrawingPractice] gpt-image-1-mini 모델로 이미지 생성 시작");
      
      // ✅ gpt-image-1-mini 모델 사용 (빠른 생성)
      const imageBase64 = await generateImageViaCloudflare(prompt, "기본", {
        model: "gpt-image-1-mini"
      });

      console.log("✅ [DrawingPractice] 이미지 생성 완료");

      navigate("/result", {
        state: {
          imageUrl: imageBase64,
          prompt,
          style: "연습하기 (GPT-Image Mini)",
        },
      });
    } catch (error) {
      console.error("❌ 이미지 생성 실패:", error);
      alert("이미지를 생성하는 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pb-24">

      <div className="p-3">
        <h2 className="text-2xl font-bold mb-3">원하는 그림을 연습해봐요</h2>

        <p className="text-gray-700 mb-6 leading-relaxed">
          아래 예시를 눌러 바로 사용할 수 있어요.
          또는 직접 문장을 입력해 그림을 생성할 수 있습니다.
        </p>

        <div className="space-y-3 mb-8">
          {examplePrompts.map((text, idx) => (
            <button
              key={idx}
              onClick={() => setPrompt(text)}
              className="w-full bg-gray-100 border border-gray-300 rounded-xl p-4 text-left text-lg hover:bg-gray-200"
            >
              📌 {text}
            </button>
          ))}
        </div>

        <textarea
          className="w-full border border-gray-300 rounded-xl p-4 text-lg min-h-[120px]"
          placeholder="원하는 그림을 설명해 주세요."
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
        />

        <button
          onClick={handleGenerate}
          className="w-full bg-emerald-500 text-white text-xl font-bold py-4 rounded-xl mt-5 hover:bg-emerald-600"
        >
          {loading ? "AI가 그림을 그리는 중입니다..." : "그림 생성하기"}
        </button>
      </div>
    </div>
  );
}
