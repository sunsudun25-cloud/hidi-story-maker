import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { getAllStorybooks, deleteStorybook, type Storybook } from "../services/dbService";
import GoodsSelectionModal from "../components/GoodsSelectionModal";

export default function MyWorksStorybookDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [book, setBook] = useState<Storybook | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // ✅ 굿즈 선택 모달 상태
  const [isGoodsModalOpen, setIsGoodsModalOpen] = useState(false);

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
            style={{ maxWidth: "380px", margin: "0 auto", display: "block" }}
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
                    className="w-full rounded-lg mt-2 cursor-pointer"
                    style={{ maxWidth: "280px", height: "auto", objectFit: "cover", margin: "8px auto 0", display: "block" }}
                    onClick={() => window.open(page.imageUrl, "_blank")}
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
        <div>
          {/* 무엇을 만들까요? 버튼 - 가장 상단에 강조 */}
          <button
            onClick={() => setIsGoodsModalOpen(true)}
            style={{
              width: "100%",
              background: "linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%)",
              color: "white",
              fontWeight: "700",
              padding: "16px",
              borderRadius: "12px",
              border: "none",
              cursor: "pointer",
              boxShadow: "0 4px 12px rgba(236, 72, 153, 0.3)",
              marginBottom: "12px",
              fontSize: "18px"
            }}
          >
            🎨 무엇을 만들까요?
          </button>

          {/* 편집하기, 삭제하기 (2열) */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <button
              onClick={handleEdit}
              style={{
                backgroundColor: "#3b82f6",
                color: "white",
                fontWeight: "600",
                padding: "12px 16px",
                borderRadius: "8px",
                border: "none",
                cursor: "pointer",
                boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                fontSize: "16px"
              }}
            >
              ✏️ 편집하기
            </button>

            <button
              onClick={handleDelete}
              style={{
                backgroundColor: "#dc2626",
                color: "white",
                fontWeight: "600",
                padding: "12px 16px",
                borderRadius: "8px",
                border: "none",
                cursor: "pointer",
                boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                fontSize: "16px"
              }}
            >
              🗑️ 삭제하기
            </button>
          </div>

          {/* PDF 출력 */}
          <button
            onClick={handleExport}
            style={{
              width: "100%",
              backgroundColor: "#9333ea",
              color: "white",
              fontWeight: "700",
              padding: "12px 16px",
              borderRadius: "8px",
              border: "none",
              cursor: "pointer",
              boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
              marginTop: "12px",
              fontSize: "16px"
            }}
          >
            📄 PDF 출력
          </button>

          {/* 목록으로 돌아가기 */}
          <button
            onClick={() => navigate("/my-works/storybooks")}
            style={{
              width: "100%",
              backgroundColor: "#9ca3af",
              color: "white",
              fontWeight: "600",
              padding: "12px 16px",
              borderRadius: "8px",
              border: "none",
              cursor: "pointer",
              boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
              marginTop: "12px",
              fontSize: "16px"
            }}
          >
            ← 목록으로 돌아가기
          </button>
        </div>

        {/* ✅ 굿즈 선택 모달 */}
        {book && (
          <GoodsSelectionModal
            isOpen={isGoodsModalOpen}
            onClose={() => setIsGoodsModalOpen(false)}
            artwork={book}
            artworkType="storybook"
          />
        )}
      </div>
    </div>
  );
}
