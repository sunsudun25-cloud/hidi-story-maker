import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";

export default function Write() {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  const suggestions = [
    "오늘 있었던 일",
    "가족에게 하고 싶은 말",
    "어린 시절 추억",
    "좋아하는 계절 이야기"
  ];

  const handleSave = () => {
    if (!title.trim() || !content.trim()) {
      alert("제목과 내용을 모두 입력해주세요!");
      return;
    }
    alert(`저장되었습니다!\n제목: ${title}`);
  };

  return (
    <main>
      <Header title="글쓰기" />
      <h1 className="page-title">글쓰기</h1>
      <p className="page-subtitle">오늘의 이야기를 자유롭게 써보세요</p>

      <div className="card">
        <h3 style={{ fontSize: "20px", marginBottom: "12px", fontWeight: "600" }}>
          주제 선택 (선택사항)
        </h3>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
          {suggestions.map((suggestion, index) => (
            <span
              key={index}
              className="chip"
              onClick={() => setTitle(suggestion)}
            >
              {suggestion}
            </span>
          ))}
        </div>
      </div>

      <div className="card">
        <h3 style={{ fontSize: "20px", marginBottom: "12px", fontWeight: "600" }}>
          제목
        </h3>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="글 제목을 입력하세요"
        />
      </div>

      <div className="card">
        <h3 style={{ fontSize: "20px", marginBottom: "12px", fontWeight: "600" }}>
          내용
        </h3>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="자유롭게 글을 써보세요..."
          rows={10}
          style={{
            resize: "vertical",
            minHeight: "200px"
          }}
        />
      </div>

      <div className="tip-box">
        💡 <strong>도움말:</strong> 부담 갖지 마세요! 떠오르는 대로 편하게 써보세요.
      </div>

      <button className="btn" onClick={handleSave}>
        💾 저장하기
      </button>

      <button
        className="btn-secondary"
        onClick={() => navigate("/home")}
        style={{ marginTop: "12px" }}
      >
        ← 홈으로
      </button>
    </main>
  );
}
