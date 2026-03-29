import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { safeGeminiCall } from "../services/geminiService";
import { saveStory, getAllStories, type Story, type StoryImage } from "../services/dbService";
import { generateWritingImage, generate4PanelStoryImages } from "../services/imageService";
import { startListening, isSpeechRecognitionSupported } from "../services/speechRecognitionService";
import { uploadImage } from "../services/imageUploadService";
// ⚠️ 손글씨 인식 기능은 현재 비활성화됨
// import { analyzeHandwriting } from "../services/visionService";

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
    themeTitle?: string;
    themeKey?: string;
    exampleSynopsis?: string;
  } | undefined;
  
  const mode = state?.mode || "free";
  const genre = state?.genre || null;
  const genreLabel = state?.genreLabel || null;
  const genreGuide = state?.genreGuide || null;
  const themeTitle = state?.themeTitle || null;
  const themeKey = state?.themeKey || null;
  const exampleSynopsis = state?.exampleSynopsis || null;
  
  const [title, setTitle] = useState(state?.title || "");
  const [content, setContent] = useState(state?.initialContent || "");
  const [savedStories, setSavedStories] = useState<Story[]>([]);
  
  // AI 도우미 상태
  const [isAiHelping, setIsAiHelping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [showAdvancedMenu, setShowAdvancedMenu] = useState(false); // AI 보조작가 메뉴 표시 여부
  
  // 이미지 상태
  const [storyImages, setStoryImages] = useState<StoryImage[]>([]);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [imageLoadingProgress, setImageLoadingProgress] = useState(0); // 일반 이미지 생성 진행률
  const [imageLoadingMessage, setImageLoadingMessage] = useState(""); // 일반 이미지 생성 메시지
  const [imagePromptMode, setImagePromptMode] = useState<"auto" | "manual">("auto"); // 이미지 프롬프트 생성 방식
  const [customImagePrompt, setCustomImagePrompt] = useState(""); // 사용자 직접 입력 프롬프트
  
  // 4컷 이미지 생성 상태
  const [masterImage, setMasterImage] = useState<string | null>(null);
  const [panelImages, setPanelImages] = useState<string[]>([]);
  const [imageProgress, setImageProgress] = useState<{ status: string; progress: number } | null>(null);
  
  // 손글씨 인식 상태
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
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
    ],
    fourcut: [
      "1컷: 아침에 일어나 창문을 열었다.\n햇살이 방 안 가득 들어왔다.",
      "2컷: 손주가 갑자기 놀러 왔다.\n깜짝 선물을 들고 있었다.",
      "3컷: 함께 공원을 산책했다.\n손주 손을 잡으니 마음이 따뜻했다.",
      "4컷: 저녁에 작별 인사를 했다.\n다음 만남을 기약하며 손을 흔들었다."
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
  // 🎨 이미지 생성
  const handleGenerateImage = async () => {
    // 직접 입력 모드에서는 커스텀 프롬프트가 필요
    if (imagePromptMode === "manual") {
      if (!customImagePrompt.trim()) {
        alert("이미지 설명을 입력해주세요!");
        return;
      }
    } else {
      // 자동 생성 모드에서는 글 내용이 필요
      if (!content.trim()) {
        alert("먼저 글을 작성해주세요!");
        return;
      }
    }

    // 4컷 이야기 장르인 경우 4컷 이미지 생성
    if (genre === "fourcut") {
      await handleGenerate4CutImages();
      return;
    }

    setIsGeneratingImage(true);
    setImageLoadingProgress(0);
    setImageLoadingMessage("🧠 AI가 내용을 분석하고 있어요...");
    
    // progressInterval을 외부에 선언하여 catch 블록에서도 접근 가능하게
    let progressInterval: NodeJS.Timeout | null = null;
    
    try {
      console.log("🎨 이미지 생성 시작:", { 
        mode: imagePromptMode,
        genre: genreLabel, 
        contentLength: content.length,
        customPrompt: imagePromptMode === "manual" ? customImagePrompt : null
      });
      
      // 진행률 시뮬레이션 (0% -> 100%)
      progressInterval = setInterval(() => {
        setImageLoadingProgress(prev => {
          const next = prev + 1;
          
          // 메시지 변경
          if (next >= 0 && next < 10) {
            setImageLoadingMessage(imagePromptMode === "manual" ? "🎨 이미지 설명을 분석하고 있어요..." : "🧠 AI가 내용을 분석하고 있어요...");
          } else if (next >= 10 && next < 30) {
            setImageLoadingMessage("🌄 배경을 그리고 있어요...");
          } else if (next >= 30 && next < 60) {
            setImageLoadingMessage("👨‍🎨 주요 요소를 그리고 있어요...");
          } else if (next >= 60 && next < 85) {
            setImageLoadingMessage("✨ 디테일을 추가하고 있어요...");
          } else if (next >= 85 && next < 95) {
            setImageLoadingMessage("🎨 마무리 중...");
          } else if (next >= 95) {
            setImageLoadingMessage("✅ 거의 완성되었어요!");
          }
          
          return next >= 100 ? 100 : next;
        });
      }, 500); // 0.5초마다 1% 증가 (50초 = 100%)
      
      let imageUrl: string;
      let promptText: string;
      
      if (imagePromptMode === "manual") {
        // 직접 입력 모드: 사용자가 입력한 프롬프트 사용
        imageUrl = await generateWritingImage(customImagePrompt, genreLabel || undefined);
        promptText = customImagePrompt;
      } else {
        // 자동 생성 모드: 글 내용 기반으로 프롬프트 생성
        imageUrl = await generateWritingImage(content, genreLabel || undefined);
        promptText = `${genreLabel || "글쓰기"} - ${content.substring(0, 50)}...`;
      }
      
      if (progressInterval) clearInterval(progressInterval);
      setImageLoadingProgress(100);
      setImageLoadingMessage("✅ 이미지 생성 완료!");
      
      // 생성된 이미지 추가
      const newImage: StoryImage = {
        id: crypto.randomUUID(),
        url: imageUrl,
        prompt: promptText,
        createdAt: new Date().toISOString()
      };
      
      setStoryImages([...storyImages, newImage]);
      
      // 직접 입력 모드인 경우 프롬프트 초기화
      if (imagePromptMode === "manual") {
        setCustomImagePrompt("");
      }
      
      // 짧은 대기 후 초기화
      await new Promise(resolve => setTimeout(resolve, 500));
      setImageLoadingProgress(0);
      setImageLoadingMessage("");
      
      alert("✨ 이미지가 생성되었습니다!");
      
    } catch (error) {
      console.error("이미지 생성 오류:", error);
      // 에러 발생 시에도 타이머 정리
      if (progressInterval) clearInterval(progressInterval);
      setImageLoadingProgress(0);
      setImageLoadingMessage("");
      alert("이미지 생성 중 오류가 발생했습니다. 다시 시도해주세요.");
    } finally {
      setIsGeneratingImage(false);
    }
  };

  // 🎬 4컷 이미지 생성
  const handleGenerate4CutImages = async () => {
    if (!content.trim()) {
      alert("먼저 4컷 이야기를 작성해주세요!");
      return;
    }

    // 4컷 패널 분리
    const panels = parse4CutContent(content);
    if (!panels) {
      alert("4컷 형식이 올바르지 않습니다.\n\n각 컷을 구분할 수 있도록 작성해주세요.\n\n예시:\n1컷: ...\n2컷: ...\n3컷: ...\n4컷: ...");
      return;
    }

    const confirmed = window.confirm(
      "🎬 4컷 이미지를 생성하시겠습니까?\n\n" +
      "마스터 이미지 1장 + 각 컷별 이미지 4장이 생성됩니다.\n" +
      "소요 시간: 약 60초\n\n" +
      "생성 중에는 다른 작업을 하지 마세요."
    );

    if (!confirmed) return;

    setIsGeneratingImage(true);
    setMasterImage(null);
    setPanelImages([]);
    
    try {
      console.log("🎬 [4컷 이야기] 이미지 생성 시작:", panels);
      
      const result = await generate4PanelStoryImages(panels, {
        onMasterProgress: (imageUrl) => {
          console.log("✅ [4컷 이야기] 마스터 이미지 생성 완료");
          setMasterImage(imageUrl);
        },
        onPanelProgress: (panelIndex, imageUrl) => {
          console.log(`✅ [4컷 이야기] ${panelIndex + 1}컷 이미지 생성 완료`);
          setPanelImages(prev => {
            const newImages = [...prev];
            newImages[panelIndex] = imageUrl;
            return newImages;
          });
        },
        onProgress: (status, progress) => {
          console.log(`📊 [4컷 이야기] ${status} - ${progress}%`);
          setImageProgress({ status, progress });
        }
      });

      // 결과를 storyImages에 추가 (마스터 + 4컷)
      const allImages: StoryImage[] = [
        {
          id: crypto.randomUUID(),
          url: result.masterImage,
          prompt: "마스터 이미지 (스타일 기준)",
          createdAt: new Date().toISOString()
        },
        ...result.panelImages.map((url, index) => ({
          id: crypto.randomUUID(),
          url,
          prompt: `${index + 1}컷 - ${panels[index].substring(0, 30)}...`,
          createdAt: new Date().toISOString()
        }))
      ];

      setStoryImages([...storyImages, ...allImages]);
      setImageProgress(null);
      
      alert("✨ 4컷 이미지가 모두 생성되었습니다!\n\n마스터 이미지 1장 + 각 컷 4장 = 총 5장");
      
    } catch (error) {
      console.error("❌ [4컷 이야기] 이미지 생성 오류:", error);
      alert("이미지 생성 중 오류가 발생했습니다. 다시 시도해주세요.");
      setImageProgress(null);
    } finally {
      setIsGeneratingImage(false);
    }
  };

  // 4컷 내용 파싱 (1컷, 2컷, 3컷, 4컷 분리)
  const parse4CutContent = (text: string): [string, string, string, string] | null => {
    try {
      // 패턴 1: "1컷:", "2컷:", ... 형식
      const pattern1 = /[1１]컷[:\s：]*([^\n]*(?:\n(?![2-4２-４]컷)[^\n]*)*)/i;
      const pattern2 = /[2２]컷[:\s：]*([^\n]*(?:\n(?![3-4３-４]컷)[^\n]*)*)/i;
      const pattern3 = /[3３]컷[:\s：]*([^\n]*(?:\n(?![4４]컷)[^\n]*)*)/i;
      const pattern4 = /[4４]컷[:\s：]*([^\n]*(?:\n[^\n]*)*)/i;
      
      const match1 = text.match(pattern1);
      const match2 = text.match(pattern2);
      const match3 = text.match(pattern3);
      const match4 = text.match(pattern4);
      
      if (match1 && match2 && match3 && match4) {
        return [
          match1[1].trim(),
          match2[1].trim(),
          match3[1].trim(),
          match4[1].trim()
        ];
      }

      // 패턴 2: 줄바꿈으로 구분된 4개 단락 (각 단락이 2줄 정도)
      const lines = text.split('\n').filter(line => line.trim());
      if (lines.length >= 4) {
        // 4개 그룹으로 나누기
        const group1 = lines.slice(0, Math.ceil(lines.length / 4)).join('\n');
        const group2 = lines.slice(Math.ceil(lines.length / 4), Math.ceil(lines.length / 2)).join('\n');
        const group3 = lines.slice(Math.ceil(lines.length / 2), Math.ceil(lines.length * 3 / 4)).join('\n');
        const group4 = lines.slice(Math.ceil(lines.length * 3 / 4)).join('\n');
        
        if (group1 && group2 && group3 && group4) {
          return [group1, group2, group3, group4];
        }
      }

      return null;
    } catch (error) {
      console.error("4컷 파싱 오류:", error);
      return null;
    }
  };

  // 🗑️ 이미지 삭제
  const handleDeleteImage = (imageId: string) => {
    if (window.confirm("이 이미지를 삭제하시겠습니까?")) {
      setStoryImages(storyImages.filter(img => img.id !== imageId));
      alert("🗑️ 이미지가 삭제되었습니다.");
    }
  };

  const handleSave = async () => {
    if (!title.trim() || !content.trim()) {
      alert("제목과 내용을 모두 입력해주세요!");
      return;
    }

    try {
      console.log("💾 [저장 시작]", {
        title: title.trim(),
        contentLength: content.trim().length,
        genre: genre || "없음",
        images: storyImages.length
      });
      
      await saveStory({
        title: title.trim(),
        content: content.trim(),
        genre: genre || undefined,
        images: storyImages.length > 0 ? storyImages : undefined,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      
      console.log("✅ [저장 완료] IndexedDB에 저장됨");
      
      setLastSaved(new Date());
      alert("✅ 저장되었습니다!");
      loadStories();
      
      // 저장 후 목록 확인
      const allStories = await getAllStories();
      console.log("📚 [전체 글 목록]", allStories.length, "개");
    } catch (error) {
      console.error("❌ [저장 오류]", error);
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

  // 🎤 4컷 인터뷰 예시 삽입
  const handleInsertInterviewExample = () => {
    if (exampleSynopsis) {
      const confirmed = window.confirm(
        "연습 예시를 내용에 추가하시겠습니까?\n\n" +
        "예시를 그대로 쓰거나, 일부만 바꿔서 작성하셔도 좋아요!"
      );
      if (confirmed) {
        setContent(exampleSynopsis);
        alert("✏️ 예시가 추가되었습니다! 자유롭게 수정하세요.");
      }
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
      console.log('📝 [이어쓰기] 시작:', { 
        contentLength: content.length, 
        genre: genreLabel 
      });

      const genreContext = genre 
        ? `\n장르: ${genreLabel}\n장르 가이드: ${genreGuide}`
        : "";

      // 시(poem) 장르 여부 확인
      const isPoem = genre === 'poem';
      
      const prompt = isPoem ? `
다음은 사용자가 작성 중인 시(詩)입니다:

제목: ${title || "(제목 없음)"}

내용:
${content}

---

**시 작성 규칙:**
1. 위 내용을 절대 반복하지 마세요. 새로운 시구(詩句)만 작성하세요.
2. 시의 운율과 리듬을 살려주세요.
3. 비유적, 은유적 표현을 사용하세요.
4. 2~3행의 새로운 시구를 작성하세요.
5. 시는 "~다"로 끝나지 않아도 됩니다. 자유롭게 표현하세요.

노인 사용자가 쓴 것처럼 편안하고 감성적인 어조로 작성해주세요.
위 시에 이어질 아름다운 시구를 작성해주세요.
` : `
다음은 사용자가 작성 중인 글입니다:

제목: ${title || "(제목 없음)"}${genreContext}

내용:
${content}

---

**절대 지켜야 할 규칙:**
1. 위 내용을 절대 반복하지 마세요. 오직 새로운 내용만 작성하세요.
2. 반드시 2~3개의 완전한 문장을 작성하세요.
3. 모든 문장은 반드시 "다.", "었다.", "있다.", "했다." 등으로 끝나야 합니다.
4. 문장이 중간에 끊기는 것은 절대 금지입니다.
5. 마지막 문장도 반드시 완전하게 끝내야 합니다.

**🚫 절대 사용 금지 (구연동화체):**
- "~습니다", "~했습니다", "~입니다" (X)
- "~했지요", "~였지요", "~랍니다" (X)
- "~했단다", "~였단다" (X)
- 이런 표현은 구연동화체로 부자연스럽습니다.

**✅ 사용 가능한 자연스러운 종결:**
- "~했다.", "~였다.", "~이었다." (O)
- "~보였다.", "~느꼈다.", "~생각했다." (O)
- 일반 소설처럼 자연스럽게 작성하세요.

**출력 형식 예시:**
철수는 그녀를 바라보았다. 빗속에서 그녀의 모습은 유난히 외로워 보였다. 그는 자신도 모르게 발걸음을 멈췄다.

위 내용 다음에 자연스럽게 이어질 내용을 작성해주세요.
${genre ? `${genreLabel} 장르의 특성을 살려서 작성해주세요.` : ""}
노인 사용자가 쓴 것처럼 편안하고 따뜻한 어조로 작성하되, 구연동화체("~습니다", "~했지요")는 절대 사용하지 마세요.

다시 한 번 강조: 
- 마지막 문장은 "~했다.", "~였다." 등 자연스러운 과거형으로 완전히 끝내세요!
- "~습니다", "~했지요" 같은 구연동화체는 절대 사용하지 마세요!
`;

      console.log('🚀 [이어쓰기] API 호출 시작');
      const continuation = await safeGeminiCall(prompt);
      
      if (!continuation) {
        console.error('❌ [이어쓰기] API 응답이 비어있음');
        alert('이어쓰기에 실패했습니다.\n\nOpenAI API 키가 설정되어 있는지 확인해주세요.');
        return;
      }

      console.log('✅ [이어쓰기] API 응답 수신:', continuation.substring(0, 100));
      
      // 혹시 AI가 기존 내용을 포함했다면 제거
      let newContent = continuation.trim();
      if (newContent.startsWith(content.trim())) {
        newContent = newContent.substring(content.trim().length).trim();
      }
      
      console.log('🔍 [이어쓰기] 원본 응답:', newContent);
      
      // 🚫 구연동화체 감지 및 제거
      const storyTellingPatterns = [
        /습니다[.!?]/g,
        /했습니다[.!?]/g,
        /입니다[.!?]/g,
        /했지요[.!?]/g,
        /였지요[.!?]/g,
        /랍니다[.!?]/g,
        /했단다[.!?]/g,
        /였단다[.!?]/g,
        /합니다[.!?]/g
      ];
      
      let hasStoryTelling = false;
      for (const pattern of storyTellingPatterns) {
        if (pattern.test(newContent)) {
          hasStoryTelling = true;
          console.warn('⚠️ [이어쓰기] 구연동화체 감지:', pattern);
        }
      }
      
      if (hasStoryTelling) {
        console.warn('🚫 [이어쓰기] 구연동화체 발견 - 자동 수정 시도');
        // 구연동화체를 일반 과거형으로 변환
        newContent = newContent
          .replace(/습니다\./g, '다.')
          .replace(/했습니다\./g, '했다.')
          .replace(/입니다\./g, '이다.')
          .replace(/했지요\./g, '했다.')
          .replace(/였지요\./g, '였다.')
          .replace(/랍니다\./g, '다.')
          .replace(/했단다\./g, '했다.')
          .replace(/였단다\./g, '였다.')
          .replace(/합니다\./g, '한다.');
        console.log('✅ [이어쓰기] 구연동화체 수정 완료:', newContent);
      }
      
      // 시(poem) 장르는 문장 끝 검증 제외
      if (!isPoem) {
        // 강화된 문장 끝 검증 (시가 아닐 때만) - 구연동화체 제외
        const sentenceEndings = ['다.', '다!', '다?', '었다.', '했다.', '있다.', '없다.', '보였다.', '느꼈다.'];
        const hasCompleteEnding = sentenceEndings.some(ending => newContent.endsWith(ending));
        
        if (!hasCompleteEnding) {
          console.warn('⚠️ [이어쓰기] 불완전한 문장 감지, 수정 시작');
          
          // 방법 1: 마지막 완전한 문장까지만 추출
          let lastCompleteIndex = -1;
          for (const ending of sentenceEndings) {
            const index = newContent.lastIndexOf(ending);
            if (index > lastCompleteIndex) {
              lastCompleteIndex = index;
            }
          }
          
          if (lastCompleteIndex > 0) {
            // 마지막 완전한 문장까지만 잘라냄
            const endingLength = sentenceEndings.find(e => 
              newContent.substring(lastCompleteIndex).startsWith(e)
            )?.length || 2;
            newContent = newContent.substring(0, lastCompleteIndex + endingLength).trim();
            console.log('✂️ [이어쓰기] 불완전한 부분 제거:', newContent);
          } else {
            // 방법 2: 완전한 문장이 없으면 마지막에 "다." 추가
            console.warn('⚠️ [이어쓰기] 완전한 문장을 찾을 수 없음');
            // 마지막 글자가 조사나 불완전한 단어면 제거하고 "다." 추가
            if (!/[.!?]$/.test(newContent)) {
              // 마지막 공백 이후 단어를 제거하고 "다." 추가
              const lastSpaceIndex = newContent.lastIndexOf(' ');
              if (lastSpaceIndex > 0) {
                newContent = newContent.substring(0, lastSpaceIndex) + '다.';
                console.log('🔧 [이어쓰기] 강제로 문장 완성:', newContent);
              }
            }
          }
        }
        
        // 최종 검증 (시가 아닐 때만)
        const finalCheck = sentenceEndings.some(ending => newContent.endsWith(ending));
        if (!finalCheck) {
          console.error('❌ [이어쓰기] 여전히 불완전한 문장');
          alert('⚠️ AI가 완전한 문장을 생성하지 못했습니다.\n\n다시 시도해주세요.');
          return;
        }
      } else {
        console.log('📝 [이어쓰기] 시(poem) 장르 - 문장 끝 검증 생략');
      }
      
      console.log('✅ [이어쓰기] 최종 결과:', newContent);
      setContent(content + "\n\n" + newContent);
      console.log('✨ [이어쓰기] 완료');
      alert("✨ AI가 이어쓴 내용이 추가되었습니다.\n\n마음에 들지 않으면 자유롭게 수정하세요.");
    } catch (error) {
      console.error("❌ [이어쓰기] 오류:", error);
      
      // 상세 오류 메시지
      let errorMessage = "이어쓰기 중 오류가 발생했습니다.";
      if (error instanceof Error) {
        errorMessage += `\n\n오류: ${error.message}`;
      }
      errorMessage += "\n\nF12를 눌러 콘솔을 확인해주세요.";
      
      alert(errorMessage);
    } finally {
      setIsAiHelping(false);
    }
  };

  // 🤖 AI 문법 교정 (줄별 처리)
  const handleAiCorrect = async () => {
    if (!content.trim()) {
      alert("교정할 내용이 없습니다!");
      return;
    }

    setIsAiHelping(true);
    try {
      const originalLength = content.length;
      console.log('📝 [문법교정] 시작:', { originalLength });
      
      // 줄 단위로 분리
      const lines = content.split('\n');
      console.log('📝 [문법교정] 총 줄 수:', lines.length);
      
      const correctedLines: string[] = [];
      
      // 각 줄마다 개별적으로 문법 교정
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        
        // 빈 줄은 그대로 유지
        if (line.trim().length === 0) {
          correctedLines.push(line);
          console.log(`📄 [문법교정] ${i + 1}번째 줄: (빈 줄)`);
          continue;
        }
        
        // 너무 짧은 줄 (3자 이하)은 그대로 유지
        if (line.trim().length <= 3) {
          correctedLines.push(line);
          console.log(`📄 [문법교정] ${i + 1}번째 줄: "${line}" → (짧아서 유지)`);
          continue;
        }
        
        console.log(`🚀 [문법교정] ${i + 1}번째 줄 처리 중: "${line}"`);
        
        const prompt = `
다음 한 줄의 맞춤법, 띄어쓰기, 문법만 교정해주세요.

**규칙:**
1. 원문의 모든 단어를 반드시 포함하세요
2. 의미를 바꾸지 마세요
3. 오직 맞춤법, 띄어쓰기, 문법 오류만 고치세요
4. 한 줄로 출력하세요

**예시:**
원문: 오늘은날씨가 좋앗어요
교정: 오늘은 날씨가 좋았어요

원문: 친구들과공원에 갔습니다
교정: 친구들과 공원에 갔습니다

원문: 맛잇는 음식도먹었어요
교정: 맛있는 음식도 먹었어요

**이제 다음 한 줄을 교정해주세요:**
${line}

**출력 형식:**
교정된 한 줄만 출력하세요. 설명이나 부연 설명은 쓰지 마세요.
`;

        try {
          const correctedLine = await safeGeminiCall(prompt);
          
          if (!correctedLine || correctedLine.trim().length === 0) {
            console.warn(`⚠️ [문법교정] ${i + 1}번째 줄 교정 실패 (빈 응답), 원본 유지`);
            correctedLines.push(line);
            continue;
          }
          
          // 여러 줄로 응답한 경우 첫 줄만 사용
          const singleLine = correctedLine.trim().split('\n')[0];
          
          // 원본과 너무 다르면 (길이가 3배 이상 또는 1/3 이하) 원본 유지
          const lengthRatio = singleLine.length / line.length;
          if (lengthRatio > 3 || lengthRatio < 0.33) {
            console.warn(`⚠️ [문법교정] ${i + 1}번째 줄 길이 변화가 너무 큼 (${(lengthRatio * 100).toFixed(0)}%), 원본 유지`);
            correctedLines.push(line);
            continue;
          }
          
          correctedLines.push(singleLine);
          console.log(`✅ [문법교정] ${i + 1}번째 줄: "${line}" → "${singleLine}"`);
          
        } catch (error) {
          console.error(`❌ [문법교정] ${i + 1}번째 줄 처리 오류:`, error);
          correctedLines.push(line); // 오류 시 원본 유지
        }
        
        // API 호출 간격 조절 (과부하 방지)
        if (i < lines.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      }
      
      const corrected = correctedLines.join('\n');
      const correctedLength = corrected.length;
      
      console.log('✅ [문법교정] 완료:', { 
        originalLength, 
        correctedLength,
        ratio: (correctedLength / originalLength * 100).toFixed(1) + '%',
        originalLines: lines.length,
        correctedLines: correctedLines.length
      });
      console.log('📄 [문법교정] 원본 내용:\n', content);
      console.log('📄 [문법교정] 교정된 내용:\n', corrected);
      
      const confirmed = window.confirm(
        "✅ 교정이 완료되었습니다!\n\n" +
        `원본: ${originalLength}자 (${lines.length}줄)\n` +
        `교정: ${correctedLength}자 (${correctedLines.length}줄)\n` +
        `변화: ${correctedLength > originalLength ? '+' : ''}${correctedLength - originalLength}자\n\n` +
        "교정된 내용으로 바꾸시겠습니까?\n\n" +
        "(취소를 누르면 원래 내용을 유지합니다)"
      );
      
      if (confirmed) {
        setContent(corrected);
        console.log('✅ [문법교정] 적용 완료');
        alert("✨ 내용이 교정되었습니다!");
      } else {
        console.log('ℹ️ [문법교정] 사용자가 취소함');
      }
    } catch (error) {
      console.error("❌ [문법교정] 오류:", error);
      alert("교정 중 오류가 발생했습니다.\n\n" + (error instanceof Error ? error.message : "알 수 없는 오류"));
    } finally {
      setIsAiHelping(false);
    }
  };

  // 🤖 AI 감정 표현 강화 (줄별 처리)
  const handleAiEnhance = async () => {
    if (!content.trim()) {
      alert("강화할 내용이 없습니다!");
      return;
    }

    setIsAiHelping(true);
    try {
      const originalLength = content.length;
      console.log('💖 [감정강화] 시작:', { originalLength });
      
      // 줄 단위로 분리
      const lines = content.split('\n');
      console.log('📝 [감정강화] 총 줄 수:', lines.length);
      
      const enhancedLines: string[] = [];
      
      // 각 줄마다 개별적으로 감정 강화
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        
        // 빈 줄은 그대로 유지
        if (line.trim().length === 0) {
          enhancedLines.push(line);
          console.log(`📄 [감정강화] ${i + 1}번째 줄: (빈 줄)`);
          continue;
        }
        
        // 너무 짧은 줄 (3자 이하)은 그대로 유지
        if (line.trim().length <= 3) {
          enhancedLines.push(line);
          console.log(`📄 [감정강화] ${i + 1}번째 줄: "${line}" → (짧아서 유지)`);
          continue;
        }
        
        console.log(`🚀 [감정강화] ${i + 1}번째 줄 처리 중: "${line}"`);
        
        const prompt = `
다음 한 줄의 감정 표현을 더 풍부하게 만들어주세요.

**규칙:**
1. 원문의 모든 단어를 반드시 포함하세요
2. 감정을 나타내는 형용사만 1~2개 추가하세요
3. 문장 구조를 바꾸지 마세요
4. 한 줄로 출력하세요

**예시:**
원문: 새벽에 일어나
강화: 이른 새벽에 일어나

원문: 딸을 위해 김치를 담갔다
강화: 사랑하는 딸을 위해 정성껏 김치를 담갔다

원문: 붉은 고추가루
강화: 선명한 붉은 고추가루

**이제 다음 한 줄을 강화해주세요:**
${line}

**출력 형식:**
강화된 한 줄만 출력하세요. 설명이나 부연 설명은 쓰지 마세요.
`;

        try {
          const enhancedLine = await safeGeminiCall(prompt);
          
          if (!enhancedLine || enhancedLine.trim().length === 0) {
            console.warn(`⚠️ [감정강화] ${i + 1}번째 줄 강화 실패 (빈 응답), 원본 유지`);
            enhancedLines.push(line);
            continue;
          }
          
          // 여러 줄로 응답한 경우 첫 줄만 사용
          const singleLine = enhancedLine.trim().split('\n')[0];
          
          // 원본과 너무 다르면 (길이가 3배 이상 또는 1/3 이하) 원본 유지
          const lengthRatio = singleLine.length / line.length;
          if (lengthRatio > 3 || lengthRatio < 0.33) {
            console.warn(`⚠️ [감정강화] ${i + 1}번째 줄 길이 변화가 너무 큼 (${(lengthRatio * 100).toFixed(0)}%), 원본 유지`);
            enhancedLines.push(line);
            continue;
          }
          
          enhancedLines.push(singleLine);
          console.log(`✅ [감정강화] ${i + 1}번째 줄: "${line}" → "${singleLine}"`);
          
        } catch (error) {
          console.error(`❌ [감정강화] ${i + 1}번째 줄 처리 오류:`, error);
          enhancedLines.push(line); // 오류 시 원본 유지
        }
        
        // API 호출 간격 조절 (과부하 방지)
        if (i < lines.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      }
      
      const enhanced = enhancedLines.join('\n');
      const enhancedLength = enhanced.length;
      
      console.log('✅ [감정강화] 완료:', { 
        originalLength, 
        enhancedLength,
        ratio: (enhancedLength / originalLength * 100).toFixed(1) + '%',
        originalLines: lines.length,
        enhancedLines: enhancedLines.length
      });
      console.log('📄 [감정강화] 원본 내용:\n', content);
      console.log('📄 [감정강화] 강화된 내용:\n', enhanced);
      
      const confirmed = window.confirm(
        "✨ 감정 표현이 강화되었습니다!\n\n" +
        `원본: ${originalLength}자 (${lines.length}줄)\n` +
        `강화: ${enhancedLength}자 (${enhancedLines.length}줄)\n` +
        `변화: ${enhancedLength > originalLength ? '+' : ''}${enhancedLength - originalLength}자\n\n` +
        "강화된 내용으로 바꾸시겠습니까?\n\n" +
        "(취소를 누르면 원래 내용을 유지합니다)"
      );
      
      if (confirmed) {
        setContent(enhanced);
        console.log('✅ [감정강화] 적용 완료');
        alert("✨ 내용이 더 풍부해졌습니다!");
      } else {
        console.log('ℹ️ [감정강화] 사용자가 취소함');
      }
    } catch (error) {
      console.error("❌ [감정강화] 오류:", error);
      alert("감정 강화 중 오류가 발생했습니다.\n\n" + (error instanceof Error ? error.message : "알 수 없는 오류"));
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
    if (!isSpeechRecognitionSupported()) {
      alert("이 브라우저는 음성 인식을 지원하지 않습니다.\n\nChrome, Edge, Safari 브라우저를 사용해주세요.");
      return;
    }

    if (isListening) {
      // 이미 듣는 중이면 중지
      setIsListening(false);
      return;
    }

    setIsListening(true);

    const stopListening = startListening({
      onResult: (text, isFinal) => {
        if (isFinal) {
          // ✅ 최종 결과만 텍스트에 추가
          setContent((prevContent) => {
            return prevContent + (prevContent ? " " : "") + text;
          });
        }
        // 중간 결과는 무시 (이미 화면에 표시됨)
      },
      onError: (error) => {
        alert(error);
        setIsListening(false);
      },
      onEnd: () => {
        // ✅ 음성 인식 종료 시 상태 업데이트
        console.log("🎤 음성 인식 자동 종료");
        setIsListening(false);
      }
    });

    // 컴포넌트가 언마운트될 때 음성 인식 중지
    return () => {
      stopListening();
      setIsListening(false);
    };
  };

  // ✍️ 손글씨 인식
  const handleHandwritingInput = async () => {
    setIsAnalyzing(true);
    try {
      // 이미지 파일 선택 및 업로드
      const result = await uploadImage(true);

      console.log("✅ [WriteEditor] 손글씨 이미지 업로드 완료");

      // ⚠️ 손글씨 인식 기능은 현재 비활성화됨
      // Vision API로 손글씨 분석
      // console.log("🔍 [WriteEditor] 손글씨 분석 시작...");
      // const extractedText = await analyzeHandwriting(result.base64);
      
      // 임시: 손글씨 이미지만 표시
      alert("📸 손글씨 이미지가 업로드되었습니다.\n\n현재 자동 인식 기능은 준비 중입니다.\n직접 내용을 입력해주세요.");

      // console.log("✅ [WriteEditor] 손글씨 분석 완료:", extractedText);

      // // 인식된 텍스트를 내용에 추가
      // if (extractedText && extractedText !== "텍스트를 찾을 수 없습니다") {
      //   setContent(content + (content ? "\n\n" : "") + extractedText);
      //   alert(`✅ 손글씨를 성공적으로 읽었습니다!\n\n인식된 내용:\n"${extractedText.substring(0, 100)}${extractedText.length > 100 ? '...' : ''}"\n\n내용이 추가되었습니다.`);
      // } else {
      //   alert("❌ 손글씨를 인식할 수 없습니다.\n\n다음을 확인해주세요:\n1. 글씨가 명확하게 보이는지\n2. 사진이 흐릿하지 않은지\n3. 조명이 충분한지");
      // }
    } catch (error) {
      console.error("❌ [WriteEditor] 손글씨 분석 실패:", error);
      alert("❌ 손글씨 분석 중 오류가 발생했습니다.\n\n" + (error instanceof Error ? error.message : "알 수 없는 오류"));
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <>
      <style>{`
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
      `}</style>
      
      <main style={{ padding: "10px 20px 20px", maxWidth: "900px", margin: "0 auto" }}>
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

      {/* 주제 선택 (장르가 없고 자유 모드가 아닐 때만 표시) */}
      {!genre && mode !== "free" && (
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

        {/* 4컷 인터뷰 전용 안내 */}
        {genre === "fourcut" && (
          <div style={{
            backgroundColor: "#F3E8FF",
            border: "2px solid #9C27B0",
            borderRadius: "12px",
            padding: "16px",
            marginBottom: "15px",
          }}>
            <div style={{ fontSize: "18px", fontWeight: "bold", color: "#7C3AED", marginBottom: "12px" }}>
              🎤 4컷 인터뷰 작성 가이드
              {themeTitle && (
                <span style={{ fontSize: "16px", fontWeight: "600", color: "#9C27B0", marginLeft: "8px" }}>
                  - {themeTitle}
                </span>
              )}
            </div>
            <div style={{ fontSize: "15px", color: "#555", lineHeight: "1.8" }}>
              <div style={{ marginBottom: "8px" }}>
                <strong style={{ color: "#1976D2" }}>1컷 (만남):</strong> 인터뷰 대상과 첫 만남을 2-3줄로
              </div>
              <div style={{ marginBottom: "8px" }}>
                <strong style={{ color: "#388E3C" }}>2컷 (이야기):</strong> 대상의 이야기나 상황을 2-3줄로
              </div>
              <div style={{ marginBottom: "8px" }}>
                <strong style={{ color: "#F57C00" }}>3컷 (감동):</strong> 깊은 이야기나 감정을 2-3줄로
              </div>
              <div>
                <strong style={{ color: "#E91E63" }}>4컷 (작별):</strong> 따뜻한 마무리를 2-3줄로
              </div>
            </div>
            
            {/* 예시 삽입 버튼 */}
            {exampleSynopsis && (
              <div style={{ marginTop: "12px" }}>
                <button
                  onClick={handleInsertInterviewExample}
                  style={{
                    width: "100%",
                    padding: "12px",
                    fontSize: "15px",
                    fontWeight: "600",
                    backgroundColor: "#9C27B0",
                    color: "white",
                    border: "none",
                    borderRadius: "8px",
                    cursor: "pointer",
                    boxShadow: "0 2px 4px rgba(156, 39, 176, 0.3)"
                  }}
                >
                  ✏️ 연습 예시 가져오기
                </button>
              </div>
            )}
            
            <div style={{ 
              marginTop: "12px", 
              padding: "10px", 
              backgroundColor: "#FFF", 
              borderRadius: "8px",
              fontSize: "14px",
              color: "#666"
            }}>
              💡 <strong>꿀팁:</strong> 예시를 그대로 쓰거나, 일부만 바꿔서 작성하셔도 좋아요!
            </div>
          </div>
        )}

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
              disabled={isAnalyzing}
              style={{
                padding: "16px",
                fontSize: "16px",
                backgroundColor: isListening ? "#E91E63" : "#E91E63",
                color: "white",
                border: isListening ? "2px solid #C2185B" : "none",
                borderRadius: "12px",
                cursor: isAnalyzing ? "not-allowed" : "pointer",
                fontWeight: "600",
                boxShadow: isListening ? "0 0 20px rgba(233, 30, 99, 0.5)" : "0 2px 4px rgba(0,0,0,0.1)",
                animation: isListening ? "pulse 1.5s ease-in-out infinite" : "none",
                position: "relative"
              }}
            >
              {isListening ? "⏹️ 중지하기" : "🎤 음성 입력"}
              {isListening && (
                <span style={{
                  position: "absolute",
                  top: "-8px",
                  right: "-8px",
                  width: "16px",
                  height: "16px",
                  backgroundColor: "#4CAF50",
                  borderRadius: "50%",
                  animation: "blink 1s ease-in-out infinite"
                }}></span>
              )}
            </button>

            <button
              onClick={handleHandwritingInput}
              disabled={isAnalyzing || isListening}
              style={{
                padding: "16px",
                fontSize: "16px",
                backgroundColor: isAnalyzing ? "#ccc" : "#9C27B0",
                color: "white",
                border: "none",
                borderRadius: "12px",
                cursor: isAnalyzing ? "not-allowed" : "pointer",
                fontWeight: "600",
                boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
              }}
            >
              {isAnalyzing ? "🔍 읽는 중..." : "✍️ 손글씨 입력"}
            </button>
          </div>
          
          {/* 이미지 생성 옵션 */}
          <div style={{
            marginTop: "20px",
            padding: "16px",
            backgroundColor: "#F9FAFB",
            borderRadius: "12px",
            border: "1px solid #E5E7EB"
          }}>
            <div style={{
              fontSize: "14px",
              fontWeight: "600",
              color: "#374151",
              marginBottom: "12px"
            }}>
              🎨 이미지 생성 방식
            </div>
            
            {/* 자동 생성 옵션 */}
            <label style={{
              display: "flex",
              alignItems: "center",
              marginBottom: "12px",
              cursor: "pointer"
            }}>
              <input
                type="radio"
                name="imagePromptMode"
                value="auto"
                checked={imagePromptMode === "auto"}
                onChange={(e) => setImagePromptMode(e.target.value as "auto" | "manual")}
                style={{
                  marginRight: "8px",
                  cursor: "pointer"
                }}
              />
              <div>
                <div style={{ fontSize: "14px", fontWeight: "500", color: "#1F2937" }}>
                  글 내용 기반으로 자동 생성
                </div>
                <div style={{ fontSize: "12px", color: "#6B7280", marginTop: "2px" }}>
                  AI가 작성한 글을 분석해서 이미지를 만들어요
                </div>
              </div>
            </label>
            
            {/* 직접 입력 옵션 */}
            <label style={{
              display: "flex",
              alignItems: "flex-start",
              cursor: "pointer"
            }}>
              <input
                type="radio"
                name="imagePromptMode"
                value="manual"
                checked={imagePromptMode === "manual"}
                onChange={(e) => setImagePromptMode(e.target.value as "auto" | "manual")}
                style={{
                  marginRight: "8px",
                  marginTop: "4px",
                  cursor: "pointer"
                }}
              />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: "14px", fontWeight: "500", color: "#1F2937", marginBottom: "4px" }}>
                  이미지 설명 직접 입력하기
                </div>
                <div style={{ fontSize: "12px", color: "#6B7280", marginBottom: "8px" }}>
                  원하는 이미지를 구체적으로 설명해주세요
                </div>
                
                {/* 직접 입력 텍스트 영역 */}
                {imagePromptMode === "manual" && (
                  <textarea
                    value={customImagePrompt}
                    onChange={(e) => setCustomImagePrompt(e.target.value)}
                    placeholder="예: 붉은 노을이 지는 바닷가, 할머니가 혼자 앉아 있는 모습, 따뜻한 분위기"
                    disabled={isGeneratingImage}
                    style={{
                      width: "100%",
                      minHeight: "80px",
                      padding: "12px",
                      fontSize: "14px",
                      border: "1px solid #D1D5DB",
                      borderRadius: "8px",
                      resize: "vertical",
                      fontFamily: "inherit",
                      outline: "none",
                      transition: "border-color 0.2s",
                      backgroundColor: isGeneratingImage ? "#F3F4F6" : "white"
                    }}
                    onFocus={(e) => e.target.style.borderColor = "#9C27B0"}
                    onBlur={(e) => e.target.style.borderColor = "#D1D5DB"}
                  />
                )}
              </div>
            </label>
          </div>
          
          {/* 이미지 생성 버튼 */}
          <button
            onClick={handleGenerateImage}
            disabled={
              isGeneratingImage || 
              (imagePromptMode === "auto" && !content.trim()) ||
              (imagePromptMode === "manual" && !customImagePrompt.trim())
            }
            style={{
              width: "100%",
              marginTop: "10px",
              padding: "16px",
              fontSize: "16px",
              backgroundColor: 
                isGeneratingImage ? "#ccc" : 
                (imagePromptMode === "auto" && content.trim()) || (imagePromptMode === "manual" && customImagePrompt.trim()) 
                  ? "#9C27B0" 
                  : "#ddd",
              color: "white",
              border: "none",
              borderRadius: "12px",
              cursor: 
                isGeneratingImage || 
                (imagePromptMode === "auto" && !content.trim()) ||
                (imagePromptMode === "manual" && !customImagePrompt.trim())
                  ? "not-allowed" 
                  : "pointer",
              fontWeight: "600",
              boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
            }}
          >
            {isGeneratingImage 
              ? (genre === "fourcut" ? "🎬 4컷 이미지 생성 중..." : "🎨 이미지 생성 중...") 
              : (genre === "fourcut" 
                ? (storyImages.length > 0 ? "➕ 4컷 이미지 추가" : "🎬 4컷 이미지 만들기")
                : (storyImages.length > 0 ? "➕ 이미지 추가" : "🎨 이미지 만들기")
              )
            }
          </button>

          {/* 일반 이미지 생성 로딩 UI */}
          {isGeneratingImage && genre !== "fourcut" && (
            <div style={{
              marginTop: "20px",
              padding: "20px",
              backgroundColor: "#F3E8FF",
              borderRadius: "12px",
              border: "2px solid #9C27B0",
              textAlign: "center"
            }}>
              {/* 아이콘 애니메이션 */}
              <div style={{
                fontSize: "72px",
                animation: "pulse 1.5s ease-in-out infinite",
                marginBottom: "16px"
              }}>
                🎨
              </div>
              
              {/* 메시지 */}
              <div style={{
                fontSize: "16px",
                fontWeight: "600",
                color: "#6B21A8",
                marginBottom: "12px"
              }}>
                {imageLoadingMessage}
              </div>
              
              {/* 진행률 바 */}
              <div style={{
                width: "100%",
                height: "8px",
                backgroundColor: "#DDD6FE",
                borderRadius: "4px",
                overflow: "hidden",
                marginBottom: "8px"
              }}>
                <div style={{
                  width: `${imageLoadingProgress}%`,
                  height: "100%",
                  background: "linear-gradient(90deg, #9C27B0 0%, #E91E63 100%)",
                  transition: "width 0.5s ease",
                  borderRadius: "4px"
                }}></div>
              </div>
              
              {/* 퍼센트 */}
              <div style={{
                fontSize: "14px",
                color: "#8B5CF6",
                fontWeight: "600"
              }}>
                {imageLoadingProgress}%
              </div>
              
              {/* 예상 시간 */}
              <div style={{
                fontSize: "12px",
                color: "#9CA3AF",
                marginTop: "8px"
              }}>
                ⏳ 예상 시간: 약 40-60초
              </div>
            </div>
          )}
          
          {/* 4컷 이미지 생성 진행 상황 */}
          {imageProgress && (
            <div style={{
              marginTop: "10px",
              padding: "12px",
              backgroundColor: "#F3E8FF",
              borderRadius: "8px",
              border: "2px solid #9C27B0"
            }}>
              <div style={{
                fontSize: "14px",
                fontWeight: "600",
                color: "#6B21A8",
                marginBottom: "8px"
              }}>
                {imageProgress.status}
              </div>
              <div style={{
                width: "100%",
                height: "20px",
                backgroundColor: "#E9D5FF",
                borderRadius: "10px",
                overflow: "hidden"
              }}>
                <div style={{
                  width: `${imageProgress.progress}%`,
                  height: "100%",
                  backgroundColor: "#9C27B0",
                  transition: "width 0.3s ease"
                }} />
              </div>
              <div style={{
                fontSize: "12px",
                color: "#6B21A8",
                marginTop: "4px",
                textAlign: "right"
              }}>
                {imageProgress.progress}%
              </div>
            </div>
          )}
        </div>

        {/* AI 보조작가 (고급) - 자유 글쓰기 전용 */}
        {!genre && (
          <div style={{ marginBottom: "15px" }}>
            {/* AI 보조작가 메뉴 토글 버튼 */}
            <button
              onClick={() => setShowAdvancedMenu(!showAdvancedMenu)}
              style={{
                width: "100%",
                padding: "16px",
                fontSize: "16px",
                backgroundColor: showAdvancedMenu ? "#EC4899" : "#F3E5F5",
                color: showAdvancedMenu ? "white" : "#EC4899",
                border: "2px solid #EC4899",
                borderRadius: "12px",
                cursor: "pointer",
                fontWeight: "600",
                boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
              }}
            >
              <span>✨ AI 보조작가 (고급)</span>
              <span style={{ fontSize: "12px" }}>
                {showAdvancedMenu ? "▲" : "▼"}
              </span>
            </button>

            {/* AI 보조작가 메뉴 (펼쳤을 때만 표시) */}
            {showAdvancedMenu && (
              <div style={{
                marginTop: "10px",
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
            )}
          </div>
        )}

        {/* 생성된 이미지 표시 */}
        {storyImages.length > 0 && (
          <div style={{
            marginBottom: "20px",
            padding: "15px",
            backgroundColor: "#F3E5F5",
            borderRadius: "12px",
            border: "2px solid #9C27B0",
          }}>
            <div style={{
              fontSize: "18px",
              fontWeight: "600",
              color: "#7B1FA2",
              marginBottom: "15px",
            }}>
              📸 생성된 이미지 ({storyImages.length}개)
            </div>
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
              gap: "15px",
            }}>
              {storyImages.map((image) => (
                <div
                  key={image.id}
                  style={{
                    position: "relative",
                    backgroundColor: "white",
                    borderRadius: "8px",
                    overflow: "hidden",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                  }}
                >
                  <img
                    src={image.url}
                    alt="생성된 이미지"
                    style={{
                      width: "100%",
                      height: "200px",
                      objectFit: "cover",
                    }}
                  />
                  <button
                    onClick={() => handleDeleteImage(image.id)}
                    style={{
                      position: "absolute",
                      top: "8px",
                      right: "8px",
                      padding: "8px 12px",
                      fontSize: "14px",
                      backgroundColor: "rgba(244, 67, 54, 0.9)",
                      color: "white",
                      border: "none",
                      borderRadius: "6px",
                      cursor: "pointer",
                      fontWeight: "600",
                    }}
                  >
                    🗑️ 삭제
                  </button>
                  <div style={{
                    padding: "10px",
                    fontSize: "12px",
                    color: "#666",
                    backgroundColor: "#f5f5f5",
                  }}>
                    {new Date(image.createdAt).toLocaleString('ko-KR')}
                  </div>
                </div>
              ))}
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

      {/* ⭐ Layout 컴포넌트에 푸터가 있으므로 중복 제거 */}
    </main>
    </>
  );
}
