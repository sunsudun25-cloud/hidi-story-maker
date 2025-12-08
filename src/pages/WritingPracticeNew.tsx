import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { safeGeminiCall } from "../services/geminiService";

export default function WritingPracticeNew() {
  const navigate = useNavigate();
  const [content, setContent] = useState("");
  const [suggestedTopic, setSuggestedTopic] = useState("오늘의 기분이나 날씨에 대해 써보세요");
  const [isLoadingTopic, setIsLoadingTopic] = useState(false);
  const [isListening, setIsListening] = useState(false);

  // 🎯 초기 AI 주제 제안
  useEffect(() => {
    generateRandomTopic();
  }, []);

  // 🤖 랜덤 주제 생성
  const generateRandomTopic = async () => {
    setIsLoadingTopic(true);
    try {
      const prompt = `
노인 사용자를 위한 간단한 글쓰기 연습 주제를 1개만 제안해주세요.
2-3문장 정도로 쓸 수 있는 쉽고 일상적인 주제여야 합니다.

형식: "~에 대해 써보세요" 형태로 출력

예시:
- 오늘의 기분이나 날씨에 대해 써보세요
- 어제 저녁에 무엇을 드셨는지 써보세요
- 요즘 가장 좋아하는 TV 프로그램에 대해 써보세요
`;

      const topic = await safeGeminiCall(prompt);
      setSuggestedTopic(topic.trim());
    } catch (error) {
      console.error("주제 생성 오류:", error);
      // 오류 시 기본 주제 사용
      const defaultTopics = [
        "오늘의 기분이나 날씨에 대해 써보세요",
        "어제 저녁에 무엇을 드셨는지 써보세요",
        "요즘 가장 좋아하는 것에 대해 써보세요",
        "오늘 하루 중 가장 기억에 남는 순간을 써보세요"
      ];
      setSuggestedTopic(defaultTopics[Math.floor(Math.random() * defaultTopics.length)]);
    } finally {
      setIsLoadingTopic(false);
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

  // 🗑️ 내용 지우기
  const handleClear = () => {
    if (!content.trim()) return;
    
    const confirmed = window.confirm("작성한 내용을 모두 지우시겠습니까?");
    if (confirmed) {
      setContent("");
    }
  };

  // 🔄 다른 주제로 연습하기
  const handleNewTopic = () => {
    const confirmed = window.confirm(
      "새로운 주제로 변경하시겠습니까?\n\n" +
      "현재 작성 중인 내용은 유지됩니다."
    );
    if (confirmed) {
      generateRandomTopic();
    }
  };

  // 💡 연습 완료하기
  const handleComplete = () => {
    if (!content.trim()) {
      alert("내용을 작성해주세요!");
      return;
    }

    const confirmed = window.confirm(
      "연습을 완료하고 저장하시겠습니까?\n\n" +
      "본격적인 글쓰기로 이어서 작성할 수 있습니다."
    );
    
    if (confirmed) {
      // WriteEditor로 이동하면서 내용 전달
      navigate("/write/editor", {
        state: {
          mode: "practice",
          title: suggestedTopic.replace(" 써보세요", ""),
          initialContent: content
        }
      });
    }
  };

  // 💾 임시 저장하기
  const handleSave = () => {
    if (!content.trim()) {
      alert("저장할 내용이 없습니다!");
      return;
    }

    try {
      // localStorage에 임시 저장
      localStorage.setItem("writing_practice_temp", JSON.stringify({
        topic: suggestedTopic,
        content: content,
        savedAt: new Date().toISOString()
      }));
      
      alert("✅ 임시 저장되었습니다!\n\n나중에 다시 이어서 작성할 수 있습니다.");
    } catch (error) {
      console.error("임시 저장 오류:", error);
      alert("임시 저장 중 오류가 발생했습니다.");
    }
  };

  // 📂 임시 저장된 내용 불러오기
  useEffect(() => {
    try {
      const saved = localStorage.getItem("writing_practice_temp");
      if (saved) {
        const data = JSON.parse(saved);
        const confirmed = window.confirm(
          "이전에 작성하던 내용이 있습니다.\n\n" +
          `주제: ${data.topic}\n` +
          `저장 시간: ${new Date(data.savedAt).toLocaleString('ko-KR')}\n\n` +
          "이어서 작성하시겠습니까?"
        );
        
        if (confirmed) {
          setSuggestedTopic(data.topic);
          setContent(data.content);
          // 불러온 후 삭제
          localStorage.removeItem("writing_practice_temp");
        }
      }
    } catch (error) {
      console.error("불러오기 오류:", error);
    }
  }, []);

  return (
    <main style={{ 
      padding: "20px", 
      maxWidth: "800px", 
      margin: "0 auto",
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column",
    }}>
      {/* 헤더 */}
      <div style={{ 
        display: "flex", 
        alignItems: "center", 
        justifyContent: "space-between", 
        marginBottom: "30px" 
      }}>
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
        <h1 style={{ fontSize: "28px", fontWeight: "bold", margin: 0 }}>
          ✍️ 글쓰기 연습
        </h1>
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

      {/* AI 제안 주제 */}
      <div style={{
        padding: "20px",
        backgroundColor: "#E8F5E9",
        border: "2px solid #4CAF50",
        borderRadius: "12px",
        marginBottom: "20px",
        textAlign: "center",
      }}>
        <div style={{ fontSize: "32px", marginBottom: "10px" }}>💡</div>
        <p style={{ 
          fontSize: "20px", 
          fontWeight: "600",
          color: "#2E7D32",
          lineHeight: "1.6",
          margin: 0,
        }}>
          {isLoadingTopic ? "새로운 주제를 생각하고 있어요..." : suggestedTopic}
        </p>
      </div>

      {/* 텍스트 입력 영역 */}
      <div style={{
        flex: 1,
        marginBottom: "20px",
      }}>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="여기에 자유롭게 써보세요... 2-3문장부터 시작해보세요!"
          style={{
            width: "100%",
            height: "300px",
            padding: "20px",
            fontSize: "20px",
            lineHeight: "1.8",
            border: "2px solid #ddd",
            borderRadius: "12px",
            outline: "none",
            resize: "vertical",
            fontFamily: "inherit",
          }}
          onFocus={(e) => e.target.style.borderColor = "#4CAF50"}
          onBlur={(e) => e.target.style.borderColor = "#ddd"}
        />
        <div style={{ marginTop: "10px", fontSize: "16px", color: "#666", textAlign: "right" }}>
          {content.length}자
        </div>
      </div>

      {/* 버튼들 */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: "12px",
      }}>
        {/* 말로 입력하기 */}
        <button
          onClick={handleVoiceInput}
          disabled={isListening}
          style={{
            padding: "16px",
            fontSize: "18px",
            backgroundColor: isListening ? "#ccc" : "#E91E63",
            color: "white",
            border: "none",
            borderRadius: "12px",
            cursor: isListening ? "not-allowed" : "pointer",
            fontWeight: "bold",
          }}
        >
          {isListening ? "🎤 듣는 중..." : "🔍 말로 입력하기"}
        </button>

        {/* 내용 지우기 */}
        <button
          onClick={handleClear}
          disabled={!content.trim()}
          style={{
            padding: "16px",
            fontSize: "18px",
            backgroundColor: content.trim() ? "#FF5722" : "#ccc",
            color: "white",
            border: "none",
            borderRadius: "12px",
            cursor: content.trim() ? "pointer" : "not-allowed",
            fontWeight: "bold",
          }}
        >
          🗑️ 내용 지우기
        </button>

        {/* 다른 주제로 연습하기 */}
        <button
          onClick={handleNewTopic}
          disabled={isLoadingTopic}
          style={{
            padding: "16px",
            fontSize: "18px",
            backgroundColor: isLoadingTopic ? "#ccc" : "#2196F3",
            color: "white",
            border: "none",
            borderRadius: "12px",
            cursor: isLoadingTopic ? "not-allowed" : "pointer",
            fontWeight: "bold",
            gridColumn: "span 2",
          }}
        >
          {isLoadingTopic ? "⏳ 새 주제 생성 중..." : "🔄 다른 주제로 연습하기"}
        </button>

        {/* 연습 완료하기 */}
        <button
          onClick={handleComplete}
          disabled={!content.trim()}
          style={{
            padding: "18px",
            fontSize: "20px",
            backgroundColor: content.trim() ? "#4CAF50" : "#ccc",
            color: "white",
            border: "none",
            borderRadius: "12px",
            cursor: content.trim() ? "pointer" : "not-allowed",
            fontWeight: "bold",
          }}
        >
          💡 연습 완료하기
        </button>

        {/* 임시 저장하기 */}
        <button
          onClick={handleSave}
          disabled={!content.trim()}
          style={{
            padding: "18px",
            fontSize: "20px",
            backgroundColor: content.trim() ? "#FF9800" : "#ccc",
            color: "white",
            border: "none",
            borderRadius: "12px",
            cursor: content.trim() ? "pointer" : "not-allowed",
            fontWeight: "bold",
          }}
        >
          💾 임시 저장하기
        </button>
      </div>

      {/* 안내 메시지 */}
      <div style={{
        marginTop: "20px",
        padding: "15px",
        backgroundColor: "#FFF3CD",
        border: "2px solid #FFC107",
        borderRadius: "8px",
        textAlign: "center",
      }}>
        <p style={{ fontSize: "16px", color: "#666", lineHeight: "1.6", margin: 0 }}>
          💡 <strong>팁:</strong> 부담 없이 2-3문장만 써보세요!<br />
          연습이 끝나면 본격적인 글쓰기로 이어갈 수 있습니다.
        </p>
      </div>
    </main>
  );
}
