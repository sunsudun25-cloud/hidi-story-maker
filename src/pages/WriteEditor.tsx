import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { safeGeminiCall } from "../services/geminiService";
import { saveStory, getAllStories, type Story } from "../services/dbService";

export default function WriteEditor() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as { 
    mode?: string; 
    title?: string; 
    initialContent?: string;
    genre?: string;
    genreLabel?: string;
    genreGuide?: string;
  } | undefined;
  
  const mode = state?.mode || "free";
  const genre = state?.genre || null;
  const genreLabel = state?.genreLabel || null;
  const genreGuide = state?.genreGuide || null;
  
  const [title, setTitle] = useState(state?.title || "");
  const [content, setContent] = useState(state?.initialContent || "");
  const [savedStories, setSavedStories] = useState<Story[]>([]);
  
  // AI 도우미 상태
  const [isAiHelping, setIsAiHelping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  
  // 자동 저장
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  // 장르별 예시 문장
  const genreExamples: { [key: string]: string[] } = {
    diary: [
      "오늘 아침 7시에 일어났다. 날씨가 맑았다.",
      "점심에는 손주들이 놀러 왔다.",
      "저녁 산책을 하며 많은 생각이 들었다."
    ],
    letter: [
      "사랑하는 OO에게,\n\n잘 지내고 있니? 오랜만에 편지를 쓰네.",
      "요즘 날씨가 추워졌구나. 건강 조심하렴.",
      "다음에 시간 되면 한번 보자. 건강하게 잘 지내길 바란다.\n\n사랑을 담아, ○○○ 올림"
    ],
    essay: [
      "문득 창밖을 바라보니 가을이 깊어가고 있었다.",
      "나는 항상 아침에 일찍 일어나는 것을 좋아한다.",
      "인생을 돌아보면 후회보다는 감사할 일이 더 많았던 것 같다."
    ],
    poem: [
      "가을 하늘 맑고 푸르네\n바람 불어 낙엽 지네",
      "어린 시절 그리워\n고향집 마당가의 감나무",
      "세월은 흘러가도\n그대와의 추억은 남아"
    ],
    novel: [
      "옛날 어느 작은 마을에 한 소년이 살고 있었다.",
      "어느 날 소년은 숲 속에서 이상한 빛을 발견했다.",
      "그 빛은 소년을 마법의 세계로 이끌었고, 그의 모험이 시작되었다."
    ],
    autobio: [
      "나는 1950년 경상남도 작은 마을에서 태어났다.",
      "어린 시절, 우리 집은 가난했지만 행복했다.",
      "20대 청년이 되어 서울로 상경했을 때가 기억난다."
    ]
  };

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

  // 🎯 장르별 초기 설정
  useEffect(() => {
    if (genre && genreExamples[genre]) {
      // 장르가 있으면 자동으로 예시 문장 표시
      console.log(`장르: ${genreLabel}, 가이드: ${genreGuide}`);
    }
  }, [genre]);

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

  // 🤖 장르별 AI 예시 문장 삽입
  const handleInsertGenreExample = () => {
    if (genre && genreExamples[genre]) {
      const examples = genreExamples[genre];
      const exampleText = examples.join("\n\n");
      setContent(content + (content ? "\n\n" : "") + exampleText);
      alert(`📝 ${genreLabel} 예시 문장이 추가되었습니다! 자유롭게 수정하세요.`);
    }
  };

  // 🤖 AI 주제 제안
  const handleAiSuggestTopic = async () => {
    setIsAiHelping(true);
    try {
      const genreContext = genre 
        ? `\n\n참고: 사용자가 선택한 장르는 "${genreLabel}"입니다. 이 장르에 적합한 주제를 제안해주세요.`
        : "";

      const prompt = `
노인 사용자를 위한 글쓰기 주제를 3개 제안해주세요.
각 주제는 간단하고 친근하며, 개인적인 경험을 떠올릴 수 있는 것이어야 합니다.${genreContext}

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
      const genreContext = genre 
        ? `\n장르: ${genreLabel}\n장르 가이드: ${genreGuide}`
        : "";

      const prompt = `
다음은 사용자가 작성 중인 글입니다:

제목: ${title || "(제목 없음)"}${genreContext}

내용:
${content}

---

위 내용을 자연스럽게 이어서 2-3문장 정도 작성해주세요.
${genre ? `${genreLabel} 장르의 특성을 살려서 작성해주세요.` : ""}
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
    }
  };

  // 🤖 고급 AI 기능: 글 구성 제안
  const handleAiStructureSuggest = async () => {
    setIsAiHelping(true);
    try {
      const prompt = `
사용자가 다음 주제로 글을 쓰려고 합니다:

제목: ${title || "(제목 없음)"}
${genre ? `장르: ${genreLabel}` : ""}

이 주제에 대한 글 구성(개요)을 제안해주세요.
서론-본론-결론 또는 적절한 단락 구성을 제시해주세요.

형식:
1. 도입부: (어떤 내용으로 시작할지)
2. 전개부: (어떤 내용을 다룰지)
3. 마무리: (어떻게 끝낼지)
`;

      const structure = await safeGeminiCall(prompt);
      alert(`📊 AI가 제안하는 글 구성:\n\n${structure}\n\n이 구성을 참고하여 글을 써보세요!`);
    } catch (error) {
      console.error("AI 구성 제안 오류:", error);
      alert("구성 제안 중 오류가 발생했습니다.");
    } finally {
      setIsAiHelping(false);
    }
  };

  // 🤖 고급 AI 기능: 문장 다듬기
  const handleAiPolish = async () => {
    if (!content.trim()) {
      alert("다듬을 내용이 없습니다!");
      return;
    }

    setIsAiHelping(true);
    try {
      const prompt = `
다음 글을 더 세련되고 문학적으로 다듬어주세요.
비유, 은유, 수사적 표현을 적절히 사용하되, 원래의 의미는 유지해주세요.

---
${content}
---

다듬어진 버전만 출력해주세요.
`;

      const polished = await safeGeminiCall(prompt);
      
      const confirmed = window.confirm(
        "✨ 문장이 다듬어졌습니다!\n\n" +
        "다듬어진 내용으로 바꾸시겠습니까?\n\n" +
        "(취소를 누르면 원래 내용을 유지합니다)"
      );
      
      if (confirmed) {
        setContent(polished);
        alert("✨ 글이 더 세련되어졌습니다!");
      }
    } catch (error) {
      console.error("AI 다듬기 오류:", error);
      alert("다듬기 중 오류가 발생했습니다.");
    } finally {
      setIsAiHelping(false);
    }
  };

  // 🤖 고급 AI 기능: 글 분석
  const handleAiAnalyze = async () => {
    if (!content.trim()) {
      alert("분석할 내용이 없습니다!");
      return;
    }

    setIsAiHelping(true);
    try {
      const prompt = `
다음 글을 분석해주세요:

---
${content}
---

다음 항목을 분석해서 알려주세요:
1. 전체적인 어조 (따뜻함, 슬픔, 기쁨 등)
2. 주요 감정
3. 가독성 수준
4. 개선할 점 1-2가지
5. 잘 쓰인 부분 1-2가지
`;

      const analysis = await safeGeminiCall(prompt);
      alert(`📊 AI 글 분석 결과:\n\n${analysis}`);
    } catch (error) {
      console.error("AI 분석 오류:", error);
      alert("분석 중 오류가 발생했습니다.");
    } finally {
      setIsAiHelping(false);
    }
  };

  // 🤖 고급 AI 기능: 제목 추천
  const handleAiTitleSuggest = async () => {
    if (!content.trim()) {
      alert("내용을 먼저 작성해주세요!");
      return;
    }

    setIsAiHelping(true);
    try {
      const prompt = `
다음 글의 내용을 읽고 적절한 제목을 3개 제안해주세요:

---
${content}
---

형식:
1. 제목1
2. 제목2
3. 제목3
`;

      const titles = await safeGeminiCall(prompt);
      alert(`📝 AI가 제안하는 제목:\n\n${titles}\n\n마음에 드는 제목을 선택해보세요!`);
    } catch (error) {
      console.error("AI 제목 제안 오류:", error);
      alert("제목 제안 중 오류가 발생했습니다.");
    } finally {
      setIsAiHelping(false);
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
        <h1 style={{ fontSize: "28px", fontWeight: "bold", margin: 0 }}>
          {genreLabel || "✍️ 글쓰기"}
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

      {/* 장르 가이드 (장르가 있을 경우만 표시) */}
      {genre && genreGuide && (
        <div style={{
          padding: "15px 20px",
          backgroundColor: "#E8F5E9",
          border: "2px solid #4CAF50",
          borderRadius: "8px",
          marginBottom: "20px",
          fontSize: "16px",
        }}>
          💡 <strong>{genreLabel} 작성 가이드:</strong> {genreGuide}
          {genre && genreExamples[genre] && (
            <button
              onClick={handleInsertGenreExample}
              style={{
                marginLeft: "15px",
                padding: "8px 12px",
                fontSize: "14px",
                backgroundColor: "#4CAF50",
                color: "white",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer",
              }}
            >
              📝 예시 문장 추가
            </button>
          )}
        </div>
      )}

      <p style={{ fontSize: "18px", color: "#666", textAlign: "center", marginBottom: "30px" }}>
        {genre 
          ? `${genreLabel} 형식에 맞춰 자유롭게 써보세요` 
          : "오늘의 이야기를 자유롭게 써보세요"}
      </p>

      {/* 주제 선택 (장르가 없을 때만 표시) */}
      {!genre && (
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
      )}

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
        <h3 style={{ fontSize: "20px", fontWeight: "600", marginBottom: "15px" }}>
          ✏️ 내용
        </h3>

        {/* 기본 AI 도우미 메뉴 - 항상 표시 */}
        <div style={{
          marginBottom: "15px",
        }}>
          <div style={{
            fontSize: "16px",
            fontWeight: "600",
            color: "#8B5CF6",
            marginBottom: "10px",
          }}>
            🤖 기본 도우미
          </div>
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, 1fr)",
            gap: "10px",
          }}>
            <button
              onClick={handleAiContinue}
              disabled={isAiHelping}
              style={{
                padding: "16px",
                fontSize: "16px",
                backgroundColor: isAiHelping ? "#ccc" : "#4CAF50",
                color: "white",
                border: "none",
                borderRadius: "12px",
                cursor: isAiHelping ? "not-allowed" : "pointer",
                fontWeight: "600",
                boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
              }}
            >
              ✨ 이어쓰기
            </button>
            
            <button
              onClick={handleAiCorrect}
              disabled={isAiHelping}
              style={{
                padding: "16px",
                fontSize: "16px",
                backgroundColor: isAiHelping ? "#ccc" : "#2196F3",
                color: "white",
                border: "none",
                borderRadius: "12px",
                cursor: isAiHelping ? "not-allowed" : "pointer",
                fontWeight: "600",
                boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
              }}
            >
              ✅ 문법 교정
            </button>
            
            <button
              onClick={handleAiEnhance}
              disabled={isAiHelping}
              style={{
                padding: "16px",
                fontSize: "16px",
                backgroundColor: isAiHelping ? "#ccc" : "#FF9800",
                color: "white",
                border: "none",
                borderRadius: "12px",
                cursor: isAiHelping ? "not-allowed" : "pointer",
                fontWeight: "600",
                boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
              }}
            >
              💫 감정 강화
            </button>

            <button
              onClick={handleVoiceInput}
              disabled={isListening}
              style={{
                padding: "16px",
                fontSize: "16px",
                backgroundColor: isListening ? "#ccc" : "#E91E63",
                color: "white",
                border: "none",
                borderRadius: "12px",
                cursor: isListening ? "not-allowed" : "pointer",
                fontWeight: "600",
                boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
              }}
            >
              {isListening ? "👂 듣는 중..." : "🎤 음성 입력"}
            </button>
          </div>
        </div>

        {/* 고급 AI 보조작가 메뉴 (자유 글쓰기 모드) - 항상 표시 */}
        {!genre && (
          <div style={{
            marginBottom: "15px",
          }}>
            <div style={{
              fontSize: "16px",
              fontWeight: "600",
              color: "#EC4899",
              marginBottom: "10px",
            }}>
              ✨ AI 보조작가 (고급)
            </div>
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(2, 1fr)",
              gap: "10px",
            }}>
              <button
                onClick={handleAiStructureSuggest}
                disabled={isAiHelping}
                style={{
                  padding: "16px",
                  fontSize: "16px",
                  backgroundColor: isAiHelping ? "#ccc" : "#8B5CF6",
                  color: "white",
                  border: "none",
                  borderRadius: "12px",
                  cursor: isAiHelping ? "not-allowed" : "pointer",
                  fontWeight: "600",
                  boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                }}
              >
                📊 글 구성 제안
              </button>
              
              <button
                onClick={handleAiPolish}
                disabled={isAiHelping}
                style={{
                  padding: "16px",
                  fontSize: "16px",
                  backgroundColor: isAiHelping ? "#ccc" : "#EC4899",
                  color: "white",
                  border: "none",
                  borderRadius: "12px",
                  cursor: isAiHelping ? "not-allowed" : "pointer",
                  fontWeight: "600",
                  boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                }}
              >
                ✨ 문장 다듬기
              </button>
              
              <button
                onClick={handleAiAnalyze}
                disabled={isAiHelping}
                style={{
                  padding: "16px",
                  fontSize: "16px",
                  backgroundColor: isAiHelping ? "#ccc" : "#F59E0B",
                  color: "white",
                  border: "none",
                  borderRadius: "12px",
                  cursor: isAiHelping ? "not-allowed" : "pointer",
                  fontWeight: "600",
                  boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                }}
              >
                📊 글 분석
              </button>

              <button
                onClick={handleAiTitleSuggest}
                disabled={isAiHelping}
                style={{
                  padding: "16px",
                  fontSize: "16px",
                  backgroundColor: isAiHelping ? "#ccc" : "#10B981",
                  color: "white",
                  border: "none",
                  borderRadius: "12px",
                  cursor: isAiHelping ? "not-allowed" : "pointer",
                  fontWeight: "600",
                  boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                }}
              >
                📝 제목 추천
              </button>
            </div>
          </div>
        )}

        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={genre 
            ? `${genreLabel} 형식에 맞춰 자유롭게 글을 써보세요...` 
            : "자유롭게 글을 써보세요... AI 보조작가가 도와드립니다!"}
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
        padding: "20px",
        backgroundColor: "#FFF3CD",
        border: "2px solid #FFC107",
        borderRadius: "8px",
        marginBottom: "20px",
        fontSize: "16px",
        lineHeight: "1.8",
      }}>
        <div style={{ fontWeight: "bold", fontSize: "18px", marginBottom: "10px" }}>
          💡 AI 도우미 사용법
        </div>
        
        {genre ? (
          // 장르별 도움말
          <div>
            <div style={{ marginBottom: "8px" }}>
              <strong>🤖 기본 도우미</strong> 버튼을 눌러보세요:
            </div>
            <ul style={{ margin: "8px 0", paddingLeft: "20px" }}>
              <li style={{ marginBottom: "6px" }}>
                <strong>✨ 이어쓰기</strong> - 지금까지 쓴 내용에 이어서 AI가 자동으로 작성해드려요
              </li>
              <li style={{ marginBottom: "6px" }}>
                <strong>✅ 문법 교정</strong> - 맞춤법, 띄어쓰기를 자동으로 고쳐드려요
              </li>
              <li style={{ marginBottom: "6px" }}>
                <strong>💫 감정 강화</strong> - 표현을 더 풍부하고 감동적으로 만들어드려요
              </li>
              <li style={{ marginBottom: "6px" }}>
                <strong>🎤 음성 입력</strong> - 말로 하면 자동으로 글로 써드려요
              </li>
            </ul>
          </div>
        ) : (
          // 자유 글쓰기 도움말
          <div>
            <div style={{ marginBottom: "8px" }}>
              <strong>🤖 기본 도우미</strong>와 <strong>✨ AI 보조작가</strong> 버튼을 활용하세요:
            </div>
            <div style={{ marginBottom: "12px" }}>
              <strong>📌 기본 도우미:</strong>
              <ul style={{ margin: "6px 0", paddingLeft: "20px" }}>
                <li>✨ 이어쓰기 - 내용을 이어서 작성</li>
                <li>✅ 문법 교정 - 맞춤법, 띄어쓰기 수정</li>
                <li>💫 감정 강화 - 표현을 더 풍부하게</li>
                <li>🎤 음성 입력 - 말로 글쓰기</li>
              </ul>
            </div>
            <div>
              <strong>📌 AI 보조작가 (고급):</strong>
              <ul style={{ margin: "6px 0", paddingLeft: "20px" }}>
                <li>📊 글 구성 제안 - 서론, 본론, 결론 짜드려요</li>
                <li>✨ 문장 다듬기 - 문학적으로 세련되게 만들어요</li>
                <li>📊 글 분석 - 어조, 감정, 개선점 알려드려요</li>
                <li>📝 제목 추천 - 내용에 맞는 제목 3개 제안해요</li>
              </ul>
            </div>
          </div>
        )}
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
