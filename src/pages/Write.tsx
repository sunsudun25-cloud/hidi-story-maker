import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { safeGeminiCall } from "../services/geminiService";
import { saveStory, getAllStories, type Story } from "../services/dbService";

export default function Write() {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [savedStories, setSavedStories] = useState<Story[]>([]);
  
  // AI 도우미 상태
  const [isAiHelping, setIsAiHelping] = useState(false);
  const [showAiMenu, setShowAiMenu] = useState(false);
  const [isListening, setIsListening] = useState(false);
  
  // 자동 저장
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  const suggestions = [
    "오늘 있었던 일",
    "가족에게 하고 싶은 말", 
    "어린 시절 추억",
    "좋아하는 계절 이야기",
    "내가 좋아하는 것들",
    "소중한 사람에게"
  ];

  // 📂 저장된 글 목록 불러오기
  useEffect(() => {
    loadStories();
  }, []);

  const loadStories = async () => {
    try {
      const stories = await getAllStories();
      setSavedStories(stories);
    } catch (error) {
      console.error("글 목록 불러오기 오류:", error);
    }
  };

  // 💾 저장하기
  const handleSave = async () => {
    if (!title.trim() || !content.trim()) {
      alert("제목과 내용을 모두 입력해주세요!");
      return;
    }

    try {
      await saveStory({
        title: title.trim(),
        content: content.trim(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      
      setLastSaved(new Date());
      alert("✅ 저장되었습니다!");
      loadStories();
    } catch (error) {
      console.error("저장 오류:", error);
      alert("저장 중 오류가 발생했습니다.");
    }
  };

  // 🤖 AI 주제 제안
  const handleAiSuggestTopic = async () => {
    setIsAiHelping(true);
    try {
      const prompt = `
노인 사용자를 위한 글쓰기 주제를 3개 제안해주세요.
각 주제는 간단하고 친근하며, 개인적인 경험을 떠올릴 수 있는 것이어야 합니다.

형식:
1. 주제명
2. 주제명
3. 주제명

예시:
1. 내가 가장 행복했던 순간
2. 손주에게 들려주고 싶은 이야기
3. 젊었을 때의 꿈
`;

      const suggestion = await safeGeminiCall(prompt);
      alert(`💡 AI가 제안하는 주제:\n\n${suggestion}\n\n마음에 드는 주제를 제목에 입력해보세요!`);
    } catch (error) {
      console.error("AI 주제 제안 오류:", error);
      alert("주제 제안 중 오류가 발생했습니다.");
    } finally {
      setIsAiHelping(false);
      setShowAiMenu(false);
    }
  };

  // 🤖 AI 문장 이어쓰기
  const handleAiContinue = async () => {
    if (!content.trim()) {
      alert("먼저 내용을 조금 작성해주세요!");
      return;
    }

    setIsAiHelping(true);
    try {
      const prompt = `
다음은 사용자가 작성 중인 글입니다:

제목: ${title || "(제목 없음)"}

내용:
${content}

---

위 내용을 자연스럽게 이어서 2-3문장 정도 작성해주세요.
노인 사용자가 쓴 것처럼 편안하고 따뜻한 어조로 작성해주세요.
`;

      const continuation = await safeGeminiCall(prompt);
      setContent(content + "\n\n" + continuation);
      alert("✨ AI가 내용을 이어줬어요! 마음에 들지 않으면 자유롭게 수정하세요.");
    } catch (error) {
      console.error("AI 이어쓰기 오류:", error);
      alert("이어쓰기 중 오류가 발생했습니다.");
    } finally {
      setIsAiHelping(false);
      setShowAiMenu(false);
    }
  };

  // 🤖 AI 문법 교정
  const handleAiCorrect = async () => {
    if (!content.trim()) {
      alert("교정할 내용이 없습니다!");
      return;
    }

    setIsAiHelping(true);
    try {
      const prompt = `
다음 글의 맞춤법, 띄어쓰기, 문법을 교정해주세요.
원래 의미와 어조는 최대한 유지하되, 자연스럽게 다듬어주세요.

---
${content}
---

교정된 버전만 출력해주세요 (설명 불필요).
`;

      const corrected = await safeGeminiCall(prompt);
      
      const confirmed = window.confirm(
        "✅ 교정이 완료되었습니다!\n\n" +
        "교정된 내용으로 바꾸시겠습니까?\n\n" +
        "(취소를 누르면 원래 내용을 유지합니다)"
      );
      
      if (confirmed) {
        setContent(corrected);
        alert("✨ 내용이 교정되었습니다!");
      }
    } catch (error) {
      console.error("AI 교정 오류:", error);
      alert("교정 중 오류가 발생했습니다.");
    } finally {
      setIsAiHelping(false);
      setShowAiMenu(false);
    }
  };

  // 🤖 AI 감정 표현 강화
  const handleAiEnhance = async () => {
    if (!content.trim()) {
      alert("강화할 내용이 없습니다!");
      return;
    }

    setIsAiHelping(true);
    try {
      const prompt = `
다음 글의 감정 표현을 더 풍부하게 만들어주세요.
형용사와 감정을 나타내는 표현을 추가하여 더 생동감 있게 만들어주세요.

---
${content}
---

강화된 버전만 출력해주세요 (설명 불필요).
`;

      const enhanced = await safeGeminiCall(prompt);
      
      const confirmed = window.confirm(
        "✨ 감정 표현이 강화되었습니다!\n\n" +
        "강화된 내용으로 바꾸시겠습니까?\n\n" +
        "(취소를 누르면 원래 내용을 유지합니다)"
      );
      
      if (confirmed) {
        setContent(enhanced);
        alert("✨ 내용이 더 풍부해졌습니다!");
      }
    } catch (error) {
      console.error("AI 강화 오류:", error);
      alert("강화 중 오류가 발생했습니다.");
    } finally {
      setIsAiHelping(false);
      setShowAiMenu(false);
    }
  };

  // 🎤 음성 입력
  const handleVoiceInput = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert("죄송합니다. 이 브라우저는 음성 입력을 지원하지 않습니다.");
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.lang = 'ko-KR';
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setContent(content + (content ? "\n\n" : "") + transcript);
      setIsListening(false);
    };

    recognition.onerror = () => {
      alert("음성 인식 중 오류가 발생했습니다.");
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  return (
    <main style={{ padding: "20px", maxWidth: "900px", margin: "0 auto" }}>
      {/* 헤더 */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
        <button
          onClick={() => navigate(-1)}
          style={{
            padding: "12px 20px",
            fontSize: "18px",
            backgroundColor: "#ddd",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
          }}
        >
          ← 뒤로
        </button>
        <h1 style={{ fontSize: "28px", fontWeight: "bold", margin: 0 }}>✍️ 글쓰기</h1>
        <button
          onClick={() => navigate("/home")}
          style={{
            padding: "12px 20px",
            fontSize: "18px",
            backgroundColor: "#ddd",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
          }}
        >
          🏠
        </button>
      </div>

      <p style={{ fontSize: "18px", color: "#666", textAlign: "center", marginBottom: "30px" }}>
        오늘의 이야기를 자유롭게 써보세요
      </p>

      {/* 주제 선택 */}
      <div style={{
        padding: "20px",
        backgroundColor: "white",
        borderRadius: "12px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
        marginBottom: "20px",
      }}>
        <h3 style={{ fontSize: "20px", marginBottom: "12px", fontWeight: "600" }}>
          💡 주제 선택 (선택사항)
        </h3>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginBottom: "12px" }}>
          {suggestions.map((suggestion, index) => (
            <button
              key={index}
              onClick={() => setTitle(suggestion)}
              style={{
                padding: "10px 16px",
                fontSize: "16px",
                backgroundColor: "#E3F2FD",
                border: "1px solid #2196F3",
                borderRadius: "20px",
                cursor: "pointer",
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "#2196F3";
                e.currentTarget.style.color = "white";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "#E3F2FD";
                e.currentTarget.style.color = "black";
              }}
            >
              {suggestion}
            </button>
          ))}
        </div>
        
        <button
          onClick={handleAiSuggestTopic}
          disabled={isAiHelping}
          style={{
            padding: "12px 20px",
            fontSize: "16px",
            backgroundColor: isAiHelping ? "#ccc" : "#FF6B6B",
            color: "white",
            border: "none",
            borderRadius: "8px",
            cursor: isAiHelping ? "not-allowed" : "pointer",
            fontWeight: "bold",
          }}
        >
          {isAiHelping ? "⏳ AI 생각 중..." : "🤖 AI에게 주제 추천받기"}
        </button>
      </div>

      {/* 제목 */}
      <div style={{
        padding: "20px",
        backgroundColor: "white",
        borderRadius: "12px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
        marginBottom: "20px",
      }}>
        <h3 style={{ fontSize: "20px", marginBottom: "12px", fontWeight: "600" }}>
          📝 제목
        </h3>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="글 제목을 입력하세요"
          style={{
            width: "100%",
            padding: "16px",
            fontSize: "18px",
            border: "2px solid #ddd",
            borderRadius: "8px",
            outline: "none",
            transition: "border 0.2s",
          }}
          onFocus={(e) => e.target.style.borderColor = "#2196F3"}
          onBlur={(e) => e.target.style.borderColor = "#ddd"}
        />
      </div>

      {/* 내용 & AI 도우미 */}
      <div style={{
        padding: "20px",
        backgroundColor: "white",
        borderRadius: "12px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
        marginBottom: "20px",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
          <h3 style={{ fontSize: "20px", fontWeight: "600", margin: 0 }}>
            ✏️ 내용
          </h3>
          
          {/* AI 도우미 버튼 */}
          <button
            onClick={() => setShowAiMenu(!showAiMenu)}
            style={{
              padding: "8px 16px",
              fontSize: "16px",
              backgroundColor: "#8B5CF6",
              color: "white",
              border: "none",
              borderRadius: "20px",
              cursor: "pointer",
              fontWeight: "bold",
            }}
          >
            🤖 AI 도우미 {showAiMenu ? "▲" : "▼"}
          </button>
        </div>

        {/* AI 도우미 메뉴 */}
        {showAiMenu && (
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "10px",
            marginBottom: "15px",
            padding: "15px",
            backgroundColor: "#F5F3FF",
            borderRadius: "8px",
          }}>
            <button
              onClick={handleAiContinue}
              disabled={isAiHelping}
              style={{
                padding: "12px",
                fontSize: "14px",
                backgroundColor: isAiHelping ? "#ccc" : "#4CAF50",
                color: "white",
                border: "none",
                borderRadius: "8px",
                cursor: isAiHelping ? "not-allowed" : "pointer",
                fontWeight: "500",
              }}
            >
              ✨ 이어쓰기
            </button>
            
            <button
              onClick={handleAiCorrect}
              disabled={isAiHelping}
              style={{
                padding: "12px",
                fontSize: "14px",
                backgroundColor: isAiHelping ? "#ccc" : "#2196F3",
                color: "white",
                border: "none",
                borderRadius: "8px",
                cursor: isAiHelping ? "not-allowed" : "pointer",
                fontWeight: "500",
              }}
            >
              ✅ 문법 교정
            </button>
            
            <button
              onClick={handleAiEnhance}
              disabled={isAiHelping}
              style={{
                padding: "12px",
                fontSize: "14px",
                backgroundColor: isAiHelping ? "#ccc" : "#FF9800",
                color: "white",
                border: "none",
                borderRadius: "8px",
                cursor: isAiHelping ? "not-allowed" : "pointer",
                fontWeight: "500",
              }}
            >
              💫 감정 강화
            </button>

            <button
              onClick={handleVoiceInput}
              disabled={isListening}
              style={{
                padding: "12px",
                fontSize: "14px",
                backgroundColor: isListening ? "#ccc" : "#E91E63",
                color: "white",
                border: "none",
                borderRadius: "8px",
                cursor: isListening ? "not-allowed" : "pointer",
                fontWeight: "500",
              }}
            >
              {isListening ? "🎤 듣는 중..." : "🎤 음성 입력"}
            </button>
          </div>
        )}

        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="자유롭게 글을 써보세요..."
          style={{
            width: "100%",
            padding: "16px",
            fontSize: "18px",
            border: "2px solid #ddd",
            borderRadius: "8px",
            outline: "none",
            resize: "vertical",
            minHeight: "300px",
            lineHeight: "1.8",
            fontFamily: "inherit",
          }}
          onFocus={(e) => e.target.style.borderColor = "#2196F3"}
          onBlur={(e) => e.target.style.borderColor = "#ddd"}
        />

        <div style={{ marginTop: "12px", fontSize: "14px", color: "#666" }}>
          글자 수: {content.length}자
          {lastSaved && (
            <span style={{ marginLeft: "20px" }}>
              💾 마지막 저장: {lastSaved.toLocaleTimeString('ko-KR')}
            </span>
          )}
        </div>
      </div>

      {/* 팁 */}
      <div style={{
        padding: "15px 20px",
        backgroundColor: "#FFF3CD",
        border: "2px solid #FFC107",
        borderRadius: "8px",
        marginBottom: "20px",
        fontSize: "16px",
      }}>
        💡 <strong>도움말:</strong> 부담 갖지 마세요! 떠오르는 대로 편하게 써보세요. AI 도우미가 언제든 도와드립니다.
      </div>

      {/* 저장 버튼 */}
      <div style={{ display: "flex", gap: "10px" }}>
        <button
          onClick={handleSave}
          style={{
            flex: 1,
            padding: "16px",
            fontSize: "20px",
            backgroundColor: "#4CAF50",
            color: "white",
            border: "none",
            borderRadius: "12px",
            cursor: "pointer",
            fontWeight: "bold",
          }}
        >
          💾 저장하기
        </button>

        <button
          onClick={() => navigate("/my-works")}
          style={{
            flex: 1,
            padding: "16px",
            fontSize: "20px",
            backgroundColor: "#2196F3",
            color: "white",
            border: "none",
            borderRadius: "12px",
            cursor: "pointer",
            fontWeight: "bold",
          }}
        >
          📚 내 작품 보기
        </button>
      </div>
    </main>
  );
}
