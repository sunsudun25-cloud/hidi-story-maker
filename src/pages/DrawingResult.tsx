import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Header from "../components/Header";
import { useStory } from "../context/StoryContext";
import { generateImage } from "../services/geminiService";

export default function DrawingResult() {
  const navigate = useNavigate();
  const location = useLocation();
  const { addStory } = useStory();

  // 전달된 prompt, style 받기
  const { prompt, style } = location.state || {};

  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // 페이지 로드 시 자동 생성
  useEffect(() => {
    if (!prompt) {
      alert("잘못된 접근입니다.");
      navigate("/drawing/direct");
      return;
    }

    createImage();
  }, []);

  // AI 이미지 생성 함수
  async function createImage() {
    setLoading(true);
    setError(false);

    try {
      const result = await generateImage(prompt, style);
      setImage(result);
    } catch (err) {
      console.error(err);
      setError(true);
    }

    setLoading(false);
  }

  // 저장하기
  function handleSave() {
    if (!image) return;

    addStory({
      title: prompt.slice(0, 20),
      content: `스타일: ${style}\n${prompt}`,
      description: prompt,
      image,
    });

    alert("✅ 저장되었습니다!");
    navigate("/gallery");
  }

  return (
    <div className="pb-24">
      <Header title="그림 만들기" />

      <div className="p-5">
        {/* 로딩 화면 */}
        {loading && (
          <div className="text-center mt-20">
            <div className="animate-spin w-14 h-14 border-4 border-gray-400 border-t-transparent rounded-full mx-auto mb-6"></div>
            <p className="text-xl font-semibold">🎨 그림을 만드는 중입니다...</p>
          </div>
        )}

        {/* 오류 화면 */}
        {!loading && error && (
          <div className="text-center mt-20">
            <p className="text-xl text-red-500 font-semibold mb-3">
              그림 생성에 실패했습니다.
            </p>
            <button
              onClick={createImage}
              className="bg-emerald-500 text-white px-6 py-3 rounded-xl text-lg font-bold hover:bg-emerald-600 transition-colors"
            >
              다시 시도하기
            </button>
          </div>
        )}

        {/* 생성된 이미지 표시 */}
        {!loading && !error && image && (
          <>
            <div className="w-full rounded-xl overflow-hidden shadow-lg mb-5">
              <img src={image} alt="Generated" className="w-full object-cover" />
            </div>

            <div className="bg-gray-50 p-4 rounded-xl mb-6">
              <p className="text-lg text-gray-700 leading-relaxed">
                <strong>문장:</strong> {prompt}
              </p>
              <p className="text-lg text-gray-700 leading-relaxed mt-2">
                <strong>스타일:</strong> {style}
              </p>
            </div>

            {/* 버튼들 */}
            <div className="space-y-3">
              <button
                onClick={createImage}
                className="w-full bg-gray-200 text-gray-800 py-4 rounded-xl text-lg font-bold hover:bg-gray-300 transition-colors"
              >
                🔄 다시 생성하기
              </button>

              <button
                onClick={handleSave}
                className="w-full bg-emerald-500 text-white py-4 rounded-xl text-lg font-bold hover:bg-emerald-600 transition-colors"
              >
                💾 저장하기
              </button>

              <button
                onClick={() => navigate("/")}
                className="w-full bg-gray-100 text-gray-700 py-4 rounded-xl text-lg font-bold hover:bg-gray-200 transition-colors"
              >
                🏠 홈으로 이동
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
