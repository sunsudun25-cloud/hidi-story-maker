import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAllStorybooks, deleteStorybook, type Storybook } from "../services/dbService";

export default function MyWorksStorybooks() {
  const [books, setBooks] = useState<Storybook[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadStorybooks();
  }, []);

  const loadStorybooks = async () => {
    setIsLoading(true);
    try {
      const data = await getAllStorybooks();
      setBooks(data.reverse());
    } catch (error) {
      console.error("동화책 불러오기 오류:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("이 동화책을 삭제하시겠습니까?")) return;

    try {
      await deleteStorybook(id);
      setBooks((prev) => prev.filter((b) => b.id !== id));
      alert("✅ 동화책이 삭제되었습니다.");
    } catch (error) {
      console.error("삭제 오류:", error);
      alert("삭제 중 오류가 발생했습니다.");
    }
  };

  if (isLoading) {
    return (
      <div className="screen">
        <div className="screen-body">
          <p className="text-center text-[18px] text-gray-600 mt-10">불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="screen">
      <div className="screen-body p-4">
        {/* 헤더 */}
        <div className="flex justify-between items-center mb-4">
          <button
            onClick={() => navigate("/my-works")}
            className="text-[24px] w-10 h-10 flex items-center justify-center"
          >
            ←
          </button>
          <h2 className="text-[22px] font-bold">📕 내 동화책</h2>
          <div className="w-10"></div>
        </div>

        {/* 동화책 없음 */}
        {books.length === 0 ? (
          <div className="text-center mt-10">
            <p className="text-[20px] text-gray-600 mb-6">저장된 동화책이 없습니다.</p>
            <button
              className="px-6 py-3 bg-purple-500 text-white rounded-xl text-[18px] font-semibold"
              onClick={() => navigate("/storybook")}
            >
              동화책 만들러 가기
            </button>
          </div>
        ) : (
          /* 동화책 갤러리 */
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {books.map((book) => (
              <div
                key={book.id}
                className="relative bg-white border-2 border-gray-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all cursor-pointer"
                onClick={() => navigate(`/my-works/storybooks/${book.id}`)}
              >
                {/* 표지 이미지 */}
                <div className="relative aspect-[3/4] bg-gradient-to-br from-purple-100 to-purple-200">
                  {book.coverImageUrl ? (
                    <img
                      src={book.coverImageUrl}
                      alt={book.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <span className="text-[48px]">📕</span>
                    </div>
                  )}

                  {/* 삭제 버튼 */}
                  <button
                    className="absolute top-2 right-2 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full shadow-lg flex items-center justify-center hover:bg-red-500 hover:text-white transition-all"
                    onClick={(e) => handleDelete(book.id!, e)}
                    title="삭제"
                  >
                    <span className="text-[16px]">🗑️</span>
                  </button>
                </div>

                {/* 정보 */}
                <div className="p-3">
                  <h3 className="text-[16px] font-bold text-gray-800 mb-1 truncate">
                    {book.title || "제목 없음"}
                  </h3>
                  <p className="text-[12px] text-gray-500">
                    {book.pages.length}페이지
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
