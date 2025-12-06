import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import LoadingSpinner from "../components/LoadingSpinner";
import { safeGeminiCall } from "../services/geminiService";

export default function WritingPhoto() {
  const navigate = useNavigate();
  
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyzeImage = async () => {
    if (!selectedImage) {
      alert("먼저 사진을 선택해주세요.");
      return;
    }

    setLoading(true);

    try {
      const prompt = `
당신은 글쓰기 도우미입니다.
사용자가 업로드한 사진을 보고, 다음을 제공해주세요:

1. 사진에서 보이는 것 (3가지)
2. 이 사진으로 쓸 수 있는 글 주제 (3가지)
3. 글쓰기 시작 문장 제안 (1개)

친절하고 쉬운 말로 작성해주세요.

형식:
[사진 설명]
- 항목1
- 항목2
- 항목3

[글 주제]
1. 주제1
2. 주제2
3. 주제3

[시작 문장]
"..."
`;

      const result = await safeGeminiCall(prompt);

      if (result) {
        // 결과를 에디터로 전달
        navigate("/writing/editor", {
          state: {
            genre: "photo",
            label: "사진으로 쓴 글",
            initialText: `📷 사진 분석 결과\n\n${result}\n\n---\n\n`,
          },
        });
      }
    } catch (error) {
      console.error("사진 분석 오류:", error);
      alert("사진 분석 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pb-24">
      <Header title="사진으로 올리기" />

      <div className="p-5">
        <h2 className="text-2xl font-bold mb-4">📷 사진으로 글쓰기</h2>

        <p className="text-gray-700 mb-6 leading-relaxed text-lg">
          사진을 올리면 AI가 글감을 제안해드려요
        </p>

        {/* 이미지 업로드 영역 */}
        <div className="mb-6">
          <label
            htmlFor="image-upload"
            className="
              block w-full h-64 border-2 border-dashed border-gray-300
              rounded-2xl bg-gray-50 cursor-pointer
              hover:border-blue-500 hover:bg-blue-50
              transition-all duration-200
              flex flex-col items-center justify-center
            "
          >
            {selectedImage ? (
              <img
                src={selectedImage}
                alt="업로드한 사진"
                className="w-full h-full object-cover rounded-2xl"
              />
            ) : (
              <>
                <div className="text-6xl mb-3">📷</div>
                <p className="text-lg font-semibold text-gray-700">
                  사진을 선택하세요
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  클릭해서 파일 선택
                </p>
              </>
            )}
          </label>
          <input
            id="image-upload"
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
          />
        </div>

        {/* 사진 변경 버튼 */}
        {selectedImage && (
          <button
            onClick={() => setSelectedImage(null)}
            className="
              w-full py-3 text-lg font-semibold
              bg-gray-100 text-gray-700 rounded-xl
              hover:bg-gray-200
              transition-colors duration-200
              mb-4
            "
          >
            🔄 다른 사진 선택
          </button>
        )}

        {/* AI 분석 버튼 */}
        <button
          onClick={handleAnalyzeImage}
          disabled={!selectedImage || loading}
          className="
            w-full py-4 text-xl font-bold rounded-xl
            bg-blue-500 text-white shadow-lg 
            hover:bg-blue-600
            active:scale-95
            disabled:bg-gray-300 disabled:cursor-not-allowed
            transition-all duration-200
          "
        >
          {loading ? (
            <div className="flex items-center justify-center gap-2">
              <LoadingSpinner />
              <span>AI가 사진을 분석하고 있어요...</span>
            </div>
          ) : (
            "🤖 AI 분석 시작"
          )}
        </button>

        {/* 도움말 */}
        <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-200">
          <p className="text-sm text-blue-800">
            💡 <strong>Tip:</strong> 가족사진, 여행사진, 풍경사진 등 어떤 사진이든 좋아요!
          </p>
        </div>

        {/* 뒤로 가기 */}
        <button
          onClick={() => navigate("/write")}
          className="
            w-full py-3 text-lg font-semibold mt-4
            bg-gray-100 text-gray-700 rounded-xl
            hover:bg-gray-200
            transition-colors duration-200
          "
        >
          ← 글쓰기 방법 선택으로
        </button>
      </div>
    </div>
  );
}
