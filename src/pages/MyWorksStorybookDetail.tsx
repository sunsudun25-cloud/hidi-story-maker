import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { getAllStorybooks, deleteStorybook, type Storybook } from "../services/dbService";

export default function MyWorksStorybookDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [book, setBook] = useState<Storybook | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadStorybook();
  }, [id]);

  const loadStorybook = async () => {
    setIsLoading(true);
    try {
      const list = await getAllStorybooks();
      const found = list.find((b) => String(b.id) === id);
      setBook(found || null);
    } catch (error) {
      console.error("동화책 불러오기 오류:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = () => {
    if (!book) return;
    navigate("/storybook-editor-modify", {
      state: {
        title: book.title,
        prompt: book.prompt,
        style: book.style,
        coverImageUrl: book.coverImageUrl,
        pages: book.pages,
      },
    });
  };

  const handleExport = () => {
    if (!book) return;
    navigate("/storybook-export", {
      state: {
        title: book.title,
        pages: book.pages,
        coverImageUrl: book.coverImageUrl,
      },
    });
  };

  const handleDelete = async () => {
    if (!book || !confirm("이 동화책을 삭제하시겠습니까?")) return;

    try {
      await deleteStorybook(book.id!);
      alert("✅ 동화책이 삭제되었습니다.");
      navigate("/my-works/storybooks");
    } catch (error) {
      console.error("삭제 오류:", error);
      alert("삭제 중 오류가 발생했습니다.");
    }
  };

  if (isLoading) {
    return (
      <div style={{ minHeight: "100vh", backgroundColor: "#FFF9F0", padding: "20px" }}>
        <div className="responsive-container">
          <p className="text-center text-[18px] text-gray-600 mt-10">불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (!book) {
    return (
      <div style={{ minHeight: "100vh", backgroundColor: "#FFF9F0", padding: "20px" }}>
        <div className="responsive-container p-6">
          <p className="text-center text-[18px] text-gray-600">동화책을 찾을 수 없습니다.</p>
          <div className="text-center mt-4">
            <button
              onClick={() => navigate("/my-works/storybooks")}
              className="px-6 py-3 bg-purple-500 text-white rounded-xl"
            >
              목록으로 돌아가기
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#FFF9F0", padding: "20px" }}>
      <div className="responsive-container p-4">
        {/* 헤더 */}
        <div className="flex justify-between items-center mb-4">
          <button
            onClick={() => navigate("/my-works/storybooks")}
            className="text-[24px] w-10 h-10 flex items-center justify-center"
          >
            ←
          </button>
          <h2 className="text-[22px] font-bold">동화책 상세</h2>
          <div className="w-10"></div>
        </div>

        {/* 표지 이미지 */}
        {book.coverImageUrl && (
          <img
            src={book.coverImageUrl}
            alt={book.title}
            className="w-full rounded-2xl shadow-lg mb-6 cursor-pointer"
            onClick={() => window.open(book.coverImageUrl, "_blank")}
          />
        )}

        {/* 제목 및 정보 */}
        <h2 className="text-[24px] font-bold text-gray-800 mb-2">{book.title}</h2>
        <div className="flex items-center gap-2 mb-6 text-[14px] text-gray-500">
          <span>{book.pages.length}페이지</span>
          {book.style && (
            <>
              <span>·</span>
              <span>{book.style}</span>
            </>
          )}
        </div>

        {/* 페이지 미리보기 */}
        <div className="bg-gray-50 rounded-2xl p-4 mb-6">
          <h3 className="text-[18px] font-bold mb-3">📄 페이지 미리보기</h3>
          <div className="space-y-3">
            {book.pages.slice(0, 3).map((page, idx) => (
              <div key={idx} className="bg-white rounded-xl p-3 border border-gray-200">
                <p className="text-[13px] text-gray-600 mb-1">페이지 {idx + 1}</p>
                <p
                  className="text-[14px] text-gray-700"
                  style={{
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                  }}
                >
                  {page.text}
                </p>
                {page.imageUrl && (
                  <img
                    src={page.imageUrl}
                    alt={`Page ${idx + 1}`}
                    className="w-full h-32 object-cover rounded-lg mt-2"
                  />
                )}
              </div>
            ))}
            {book.pages.length > 3 && (
              <p className="text-[13px] text-gray-500 text-center">
                외 {book.pages.length - 3}페이지 더 보기...
              </p>
            )}
          </div>
        </div>

        {/* 액션 버튼들 */}
        <div className="flex flex-col gap-2.5">
          {/* 편집하기 */}
          <button
            onClick={handleEdit}
            className="py-2.5 px-4 bg-blue-500 text-white rounded-lg text-[15px] font-semibold hover:bg-blue-600 transition shadow-sm"
          >
            ✏️ 편집하기
          </button>

          {/* PDF 출력 */}
          <button
            onClick={handleExport}
            className="py-2.5 px-4 bg-purple-500 text-white rounded-lg text-[15px] font-semibold hover:bg-purple-600 transition shadow-sm"
          >
            📄 PDF 출력
          </button>

          {/* 삭제 */}
          <button
            onClick={handleDelete}
            className="py-2.5 px-4 bg-rose-500 text-white rounded-lg text-[15px] font-semibold hover:bg-rose-600 transition shadow-sm"
          >
            🗑️ 삭제하기
          </button>
        </div>
      </div>
    </div>
  );
}
