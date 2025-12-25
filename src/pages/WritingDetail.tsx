import { useLocation, useNavigate } from "react-router-dom";
import { useStory } from "../context/StoryContext";

export default function WritingDetail() {
  const location = useLocation();
  const navigate = useNavigate();
  const { stories, deleteStory } = useStory();

  const storyId = location.state?.id;
  const story = stories.find((s) => s.id === storyId);

  if (!story) {
    return (
      <div className="pb-24">
        <div className="p-5">
          <div className="bg-red-50 border border-red-300 rounded-xl p-6 text-center">
            <p className="text-xl text-red-600 font-semibold mb-4">
              글을 찾을 수 없습니다.
            </p>
            <button
              onClick={() => navigate("/gallery")}
              className="bg-emerald-500 text-white px-6 py-3 rounded-xl text-lg font-bold hover:bg-emerald-600 transition-colors"
            >
              갤러리로 돌아가기
            </button>
          </div>
        </div>
      </div>
    );
  }

  const handleDelete = () => {
    if (confirm("정말 삭제하시겠습니까?")) {
      deleteStory(story.id);
      alert("✅ 삭제되었습니다.");
      navigate("/gallery");
    }
  };

  const handleEdit = () => {
    navigate("/writing/editor", {
      state: {
        genre: "custom", // 기존 글은 장르 정보가 없을 수 있음
        label: story.title,
        content: story.content,
        id: story.id,
      },
    });
  };

  const handleDownload = () => {
    // 텍스트를 파일로 다운로드
    const content = `${story.title}\n\n작성일: ${new Date(story.createdAt).toLocaleDateString('ko-KR')}\n\n${story.content || story.description}`;
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${story.title}-${Date.now()}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    alert("📥 글이 다운로드되었습니다!");
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: story.title,
          text: story.content || story.description,
        });
        alert("✅ 공유되었습니다!");
      } catch (err) {
        console.error("공유 실패:", err);
      }
    } else {
      // 공유 기능이 없으면 클립보드에 복사
      const content = `${story.title}\n\n${story.content || story.description}`;
      navigator.clipboard.writeText(content).then(() => {
        alert("📋 클립보드에 복사되었습니다!");
      }).catch(() => {
        alert("이 브라우저는 공유 기능을 지원하지 않습니다.");
      });
    }
  };

  return (
    <div className="pb-28" style={{ minHeight: "100vh", backgroundColor: "#FFF9F0" }}>
      <div className="max-w-4xl mx-auto p-5">
        {/* 제목 */}
        <h2 className="text-3xl font-bold mb-3">
          📖 {story.title}
        </h2>

        {/* 작성일 */}
        <p className="text-gray-500 mb-6 text-sm">
          작성일: {new Date(story.createdAt).toLocaleDateString('ko-KR')}
        </p>

        {/* 이미지 (있는 경우) */}
        {story.image && (
          <div className="flex justify-center mb-6">
            <img
              src={story.image}
              alt={story.title}
              className="rounded-2xl shadow-lg cursor-pointer"
              style={{ maxWidth: "380px", width: "100%", height: "auto" }}
              onClick={() => window.open(story.image, "_blank")}
            />
          </div>
        )}

        {/* 본문 */}
        <div className="p-5 border-2 rounded-xl bg-white leading-relaxed text-lg whitespace-pre-line min-h-[300px]">
          {story.content || story.description}
        </div>

        {/* 액션 버튼들 - 내작품관리 스타일 */}
        <div className="flex flex-col gap-2.5 mt-6">
          {/* 다운로드 */}
          <button
            onClick={handleDownload}
            className="py-3 px-4 bg-emerald-500 text-white rounded-xl text-[16px] font-semibold hover:bg-emerald-600 transition shadow-sm"
          >
            📥 다운로드
          </button>

          {/* 공유하기 */}
          <button
            onClick={handleShare}
            className="py-3 px-4 bg-blue-500 text-white rounded-xl text-[16px] font-semibold hover:bg-blue-600 transition shadow-sm"
          >
            📤 공유하기
          </button>

          {/* 수정하기 */}
          <button
            onClick={handleEdit}
            className="py-3 px-4 bg-indigo-500 text-white rounded-xl text-[16px] font-semibold hover:bg-indigo-600 transition shadow-sm"
          >
            ✏️ 수정하기
          </button>

          {/* 삭제하기 */}
          <button
            onClick={handleDelete}
            className="py-3 px-4 bg-rose-500 text-white rounded-xl text-[16px] font-semibold hover:bg-rose-600 transition shadow-sm"
          >
            🗑️ 삭제하기
          </button>

          {/* 다시 만들기 */}
          <button
            onClick={() => navigate("/writing")}
            className="py-3 px-4 bg-purple-600 text-white rounded-xl text-[16px] font-bold hover:bg-purple-700 transition shadow-sm"
          >
            ✨ 다시 만들기
          </button>

          {/* 목록으로 돌아가기 */}
          <button
            onClick={() => navigate("/gallery")}
            className="py-3 px-4 bg-gray-400 text-white rounded-xl text-[16px] font-semibold hover:bg-gray-500 transition shadow-sm mt-2"
          >
            ← 목록으로 돌아가기
          </button>
        </div>
      </div>
    </div>
  );
}
