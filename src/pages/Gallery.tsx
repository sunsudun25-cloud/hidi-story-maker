import { useStory } from "../context/StoryContext";
import StoryCard from "../components/StoryCard";

export default function Gallery() {
  const { stories, deleteStory } = useStory();

  // 작품 없는 경우 안내 메시지
  if (!stories.length) {
    return (
      <div className="p-6 text-center">
        <h2 className="text-2xl font-bold mb-4">내 작품 보기</h2>
        <p className="text-lg text-gray-600 leading-relaxed">
          아직 저장된 작품이 없어요. <br />
          그림 만들기 또는 동화책 만들기에서 작품을 만들어보세요!
        </p>
      </div>
    );
  }

  return (
    <div className="p-4 pb-24">
      <h2 className="text-2xl font-bold mb-4">내 작품 보기</h2>

      {/* ⭐ 반응형 그리드 구성 */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {stories.map((story) => (
          <StoryCard 
            key={story.id} 
            story={story} 
            onDelete={deleteStory}
          />
        ))}
      </div>
    </div>
  );
}
