import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAllStorybooks, deleteStorybook, getAllImages, deleteImage, getAllStories, deleteStory, type Storybook, type SavedImage, type Story } from "../services/dbService";

type TabType = "storybooks" | "stories" | "images";

export default function MyWorks() {
  const [activeTab, setActiveTab] = useState<TabType>("storybooks");
  const [storybooks, setStorybooks] = useState<Storybook[]>([]);
  const [stories, setStories] = useState<Story[]>([]);
  const [images, setImages] = useState<SavedImage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [storybooksData, storiesData, imagesData] = await Promise.all([
        getAllStorybooks(),
        getAllStories(),
        getAllImages()
      ]);
      setStorybooks(storybooksData.reverse()); // 최신순
      setStories(storiesData.reverse()); // 최신순
      setImages(imagesData.reverse()); // 최신순
    } catch (error) {
      console.error("데이터 불러오기 오류:", error);
      alert("작품을 불러오는 중 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteStorybook = async (id: number) => {
    if (!confirm("이 동화책을 삭제하시겠습니까?")) return;

    try {
      await deleteStorybook(id);
      alert("✅ 동화책이 삭제되었습니다.");
      loadData();
    } catch (error) {
      console.error("삭제 오류:", error);
      alert("삭제 중 오류가 발생했습니다.");
    }
  };

  const handleDeleteStory = async (id: number) => {
    if (!confirm("이 글을 삭제하시겠습니까?")) return;

    try {
      await deleteStory(id);
      alert("✅ 글이 삭제되었습니다.");
      loadData();
    } catch (error) {
      console.error("삭제 오류:", error);
      alert("삭제 중 오류가 발생했습니다.");
    }
  };

  const handleDeleteImage = async (id: number) => {
    if (!confirm("이 이미지를 삭제하시겠습니까?")) return;

    try {
      await deleteImage(id);
      alert("✅ 이미지가 삭제되었습니다.");
      loadData();
    } catch (error) {
      console.error("삭제 오류:", error);
      alert("삭제 중 오류가 발생했습니다.");
    }
  };

  if (isLoading) {
    return (
      
        <div className="screen">
          <div className="screen-body">
            <p className="text-[18px] text-center text-gray-600">불러오는 중...</p>
          </div>
        </div>
      
    );
  }

  return (
    
      <div className="screen">
        <div className="screen-body">

      {/* 탭 전환 - 박스 형태 */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {/* 동화책 */}
        <button
          className={`flex flex-col items-center justify-center p-4 rounded-2xl transition-all ${
            activeTab === "storybooks"
              ? "bg-gradient-to-br from-purple-400 to-purple-600 text-white shadow-lg scale-105"
              : "bg-white border-2 border-gray-200 text-gray-700 hover:border-purple-300"
          }`}
          onClick={() => setActiveTab("storybooks")}
        >
          <div className="text-[36px] mb-2">📕</div>
          <div className="text-[15px] font-bold">동화책</div>
          <div className={`text-[13px] mt-1 ${activeTab === "storybooks" ? "text-white" : "text-gray-500"}`}>
            {storybooks.length}개
          </div>
        </button>

        {/* 글쓰기 */}
        <button
          className={`flex flex-col items-center justify-center p-4 rounded-2xl transition-all ${
            activeTab === "stories"
              ? "bg-gradient-to-br from-green-400 to-green-600 text-white shadow-lg scale-105"
              : "bg-white border-2 border-gray-200 text-gray-700 hover:border-green-300"
          }`}
          onClick={() => setActiveTab("stories")}
        >
          <div className="text-[36px] mb-2">📝</div>
          <div className="text-[15px] font-bold">글쓰기</div>
          <div className={`text-[13px] mt-1 ${activeTab === "stories" ? "text-white" : "text-gray-500"}`}>
            {stories.length}개
          </div>
        </button>

        {/* 이미지 */}
        <button
          className={`flex flex-col items-center justify-center p-4 rounded-2xl transition-all ${
            activeTab === "images"
              ? "bg-gradient-to-br from-blue-400 to-blue-600 text-white shadow-lg scale-105"
              : "bg-white border-2 border-gray-200 text-gray-700 hover:border-blue-300"
          }`}
          onClick={() => setActiveTab("images")}
        >
          <div className="text-[36px] mb-2">🎨</div>
          <div className="text-[15px] font-bold">이미지</div>
          <div className={`text-[13px] mt-1 ${activeTab === "images" ? "text-white" : "text-gray-500"}`}>
            {images.length}개
          </div>
        </button>
      </div>

      {/* 동화책 탭 */}
      {activeTab === "storybooks" && (
        <div>
          {storybooks.length === 0 ? (
            <div className="text-center mt-10">
              <p className="text-[20px] text-gray-600 mb-6">
                저장된 동화책이 없습니다.
              </p>
              <button
                className="px-6 py-3 bg-purple-500 text-white rounded-xl text-[18px] font-semibold"
                onClick={() => navigate("/storybook")}
              >
                동화책 만들러 가기
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {storybooks.map((book) => (
                <div
                  key={book.id}
                  className="relative group bg-white border-2 border-gray-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all"
                >
                  {/* 커버 이미지 */}
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

                    {/* 액션 버튼 - 우측 상단 */}
                    <div className="absolute top-2 right-2 flex flex-col gap-2">
                      {/* 편집 버튼 */}
                      <button
                        className="w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full shadow-lg flex items-center justify-center hover:bg-purple-500 hover:text-white transition-all"
                        onClick={() =>
                          navigate("/storybook-editor-modify", {
                            state: {
                              title: book.title,
                              prompt: book.prompt,
                              style: book.style,
                              coverImageUrl: book.coverImageUrl,
                              pages: book.pages,
                            },
                          })
                        }
                        title="편집하기"
                      >
                        <span className="text-[18px]">✏️</span>
                      </button>

                      {/* PDF 출력 버튼 */}
                      <button
                        className="w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full shadow-lg flex items-center justify-center hover:bg-blue-500 hover:text-white transition-all"
                        onClick={() =>
                          navigate("/storybook-export", {
                            state: {
                              title: book.title,
                              pages: book.pages,
                              coverImageUrl: book.coverImageUrl,
                            },
                          })
                        }
                        title="PDF 출력"
                      >
                        <span className="text-[18px]">📕</span>
                      </button>

                      {/* 삭제 버튼 */}
                      <button
                        className="w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full shadow-lg flex items-center justify-center hover:bg-red-500 hover:text-white transition-all"
                        onClick={() => book.id && handleDeleteStorybook(book.id)}
                        title="삭제"
                      >
                        <span className="text-[18px]">🗑️</span>
                      </button>
                    </div>
                  </div>

                  {/* 제목 + 정보 */}
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
      )}

      {/* 글쓰기 탭 */}
      {activeTab === "stories" && (
        <div>
          {stories.length === 0 ? (
            <div className="text-center mt-10">
              <p className="text-[20px] text-gray-600 mb-6">
                저장된 글이 없습니다.
              </p>
              <button
                className="px-6 py-3 bg-green-500 text-white rounded-xl text-[18px] font-semibold"
                onClick={() => navigate("/write")}
              >
                글쓰기 시작하기
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {stories.map((story) => (
                <div
                  key={story.id}
                  className="border rounded-xl p-4 bg-white shadow hover:shadow-lg transition"
                >
                  {/* 제목 */}
                  <h3 className="text-[20px] font-bold mb-2">{story.title}</h3>

                  {/* 내용 미리보기 */}
                  <p className="text-[16px] text-gray-700 mb-3 line-clamp-3">
                    {story.content}
                  </p>

                  {/* 이미지 미리보기 */}
                  {story.images && story.images.length > 0 && (
                    <div className="mb-3">
                      <div className="text-[14px] text-purple-600 font-semibold mb-2">
                        📸 이미지 {story.images.length}개
                      </div>
                      <div className="flex gap-2 overflow-x-auto">
                        {story.images.map((img) => (
                          <img
                            key={img.id}
                            src={img.url}
                            alt="Story image"
                            className="w-20 h-20 object-cover rounded-lg border-2 border-purple-200"
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 메타 정보 */}
                  <div className="text-[14px] text-gray-500 mb-3">
                    <p>글자 수: {story.content.length}자</p>
                    <p>
                      작성일:{" "}
                      {new Date(story.createdAt).toLocaleString("ko-KR", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                  </div>

                  {/* 액션 버튼 */}
                  <div className="flex gap-2">
                    <button
                      className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg text-[16px] font-semibold"
                      onClick={() =>
                        navigate("/write/editor", {
                          state: {
                            title: story.title,
                            initialContent: story.content,
                          },
                        })
                      }
                    >
                      ✏️ 수정하기
                    </button>

                    <button
                      className="px-4 py-2 bg-red-500 text-white rounded-lg text-[16px] font-semibold"
                      onClick={() => story.id && handleDeleteStory(story.id)}
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 이미지 탭 */}
      {activeTab === "images" && (
        <div>
          {images.length === 0 ? (
            <div className="text-center mt-10">
              <p className="text-[20px] text-gray-600 mb-6">
                저장된 이미지가 없습니다.
              </p>
              <button
                className="px-6 py-3 bg-blue-500 text-white rounded-xl text-[18px] font-semibold"
                onClick={() => navigate("/image/practice")}
              >
                이미지 만들러 가기
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              {images.map((item) => (
                <div
                  key={item.id}
                  className="border rounded-xl p-3 bg-white shadow hover:shadow-lg transition"
                >
                  <img
                    src={item.image}
                    alt="저장된 이미지"
                    className="w-full h-40 object-cover rounded-xl mb-2 cursor-pointer"
                    onClick={() => window.open(item.image, "_blank")}
                  />

                  <p className="text-[14px] text-gray-700 mb-2 line-clamp-2">
                    {item.prompt}
                  </p>

                  <p className="text-[12px] text-gray-400 mb-2">
                    {new Date(item.createdAt).toLocaleDateString("ko-KR")}
                  </p>

                  {/* 액션 버튼 */}
                  <div className="flex gap-2">
                    <button
                      className="flex-1 px-3 py-1.5 bg-blue-500 text-white rounded-lg text-[14px] font-semibold"
                      onClick={() => {
                        const link = document.createElement("a");
                        link.href = item.image;
                        link.download = `ai-image-${item.id || Date.now()}.png`;
                        link.click();
                      }}
                    >
                      📥
                    </button>

                    <button
                      className="flex-1 px-3 py-1.5 bg-red-500 text-white rounded-lg text-[14px] font-semibold"
                      onClick={() => item.id && handleDeleteImage(item.id)}
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

        </div>
      </div>
    
  );
}
