import { useNavigate } from "react-router-dom";
import "./WritingPractice.css";

export default function WritingPractice() {
  const navigate = useNavigate();

  const topics = [
    { icon: "🧒", title: "어린 시절 추억", desc: "가장 기억에 남는 순간을 떠올려보세요" },
    { icon: "👨‍👩‍👧", title: "가족 이야기", desc: "소중한 가족과의 시간을 기록해보세요" },
    { icon: "🌿", title: "자연 풍경", desc: "아름다운 자연을 글로 표현해보세요" },
    { icon: "🍜", title: "음식 이야기", desc: "기억에 남는 음식에 대해 써보세요" },
    { icon: "✈️", title: "여행 경험", desc: "다녀온 여행지의 추억을 나눠보세요" },
  ];

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#FFF9F0", paddingBottom: "20px" }}>
      <div className="responsive-container">
        <h2 className="screen-title">주제를 선택하세요</h2>
        <p className="screen-subtitle">
          아래 주제 중 하나를 선택하면<br />
          AI가 글쓰기를 도와드려요 ✨
        </p>

        <div className="wp-list">
          {topics.map((t, index) => (
            <button
              key={index}
              className="wp-card"
              onClick={() => navigate("/write/editor", { state: { mode: "practice", title: t.title } })}
            >
              <div className="wp-icon">{t.icon}</div>
              <div className="wp-card-content">
                <div className="wp-card-title">{t.title}</div>
                <div className="wp-card-desc">{t.desc}</div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
