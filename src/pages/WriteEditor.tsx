import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { safeGeminiCall } from "../services/geminiService";
import { saveStory, getAllStories, type Story, type StoryImage } from "../services/dbService";
import { generateWritingImage } from "../services/imageService";
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
  const [showAdvancedMenu, setShowAdvancedMenu] = useState(false); // AI 보조작가 메뉴 표시 여부
  
  // 이미지 상태
  const [storyImages, setStoryImages] = useState<StoryImage[]>([]);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  
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
    if (!content.trim()) {
      alert("먼저 글을 작성해주세요!");
      return;
    }

    setIsGeneratingImage(true);
    try {
      console.log("🎨 이미지 생성 시작:", { genre: genreLabel, contentLength: content.length });
      
      // 글쓰기 전용 이미지 생성 (장르 정보 포함)
      const imageUrl = await generateWritingImage(content, genreLabel || undefined);
      
      // 생성된 이미지 추가
      const newImage: StoryImage = {
        id: crypto.randomUUID(),
        url: imageUrl,
        prompt: `${genreLabel || "글쓰기"} - ${content.substring(0, 50)}...`,
        createdAt: new Date().toISOString()
      };
      
      setStoryImages([...storyImages, newImage]);
      alert("✨ 이미지가 생성되었습니다!");
      
    } catch (error) {
      console.error("이미지 생성 오류:", error);
      alert("이미지 생성 중 오류가 발생했습니다. 다시 시도해주세요.");
    } finally {
      setIsGeneratingImage(false);
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
      await saveStory({
        title: title.trim(),
        content: content.trim(),
        genre: genre || undefined,
        images: storyImages.length > 0 ? storyImages : undefined,
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
3. 모든 문장은 반드시 "다.", "습니다.", "요.", "네." 등으로 끝나야 합니다.
4. 문장이 중간에 끊기는 것은 절대 금지입니다.
5. 마지막 문장도 반드시 완전하게 끝내야 합니다.

**출력 형식:**
첫 번째 문장입니다. 두 번째 문장입니다. 세 번째 문장입니다.

위 내용 다음에 자연스럽게 이어질 내용을 작성해주세요.
${genre ? `${genreLabel} 장르의 특성을 살려서 작성해주세요.` : ""}
노인 사용자가 쓴 것처럼 편안하고 따뜻한 어조로 작성해주세요.

다시 한 번 강조: 마지막 문장은 "다.", "습니다.", "요." 등으로 완전히 끝나야 합니다!
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
      
      // 시(poem) 장르는 문장 끝 검증 제외
      if (!isPoem) {
        // 강화된 문장 끝 검증 (시가 아닐 때만)
        const sentenceEndings = ['다.', '다!', '다?', '습니다.', '습니다!', '습니다?', '요.', '요!', '요?', '네.', '네!', '네?', '어요.', '어요!', '죠.', '죠!'];
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

  // 🤖 AI 문법 교정
  const handleAiCorrect = async () => {
    if (!content.trim()) {
      alert("교정할 내용이 없습니다!");
      return;
    }

    setIsAiHelping(true);
    try {
      const originalLength = content.length;
      console.log('📝 [문법교정] 시작:', { originalLength });
      
      const prompt = `
다음 글의 맞춤법, 띄어쓰기, 문법만 교정해주세요.

**절대 규칙 (반드시 지켜야 함):**
1. 원문의 모든 내용을 반드시 포함해야 합니다.
2. 문장을 삭제하거나 생략하지 마세요.
3. 의미를 바꾸지 마세요.
4. 단어를 바꾸지 마세요.
5. 오직 맞춤법, 띄어쓰기, 문법 오류만 고치세요.
6. 원문의 길이와 비슷하게 유지하세요.
7. 전체 글을 그대로 출력하세요 (요약이나 설명 금지).

**원문:**
${content}

**출력 형식:**
교정된 전체 글만 출력하세요. "교정 완료" 같은 설명은 절대 쓰지 마세요.
원문의 모든 문장을 빠짐없이 포함해서 출력하세요.
`;

      console.log('🚀 [문법교정] API 호출 시작');
      const corrected = await safeGeminiCall(prompt);
      
      if (!corrected || corrected.trim().length === 0) {
        console.error('❌ [문법교정] 빈 응답');
        alert("❌ 교정 결과가 비어있습니다.\n\n다시 시도해주세요.");
        return;
      }

      const correctedLength = corrected.trim().length;
      console.log('✅ [문법교정] API 응답 수신:', { 
        originalLength, 
        correctedLength,
        ratio: (correctedLength / originalLength * 100).toFixed(1) + '%'
      });

      // 원본과 교정본 길이 차이가 너무 크면 거부
      const lengthRatio = correctedLength / originalLength;
      
      if (lengthRatio < 0.7) {
        console.error('❌ [문법교정] 너무 많이 삭제됨:', lengthRatio);
        alert(
          "❌ 교정 실패: AI가 내용을 너무 많이 삭제했습니다.\n\n" +
          `원본: ${originalLength}자\n` +
          `교정: ${correctedLength}자 (${(lengthRatio * 100).toFixed(0)}%)\n\n` +
          "다시 시도해주세요."
        );
        return;
      }

      if (lengthRatio < 0.85) {
        const proceed = window.confirm(
          "⚠️ 교정된 내용이 원본보다 짧습니다.\n\n" +
          `원본: ${originalLength}자\n` +
          `교정: ${correctedLength}자 (${(lengthRatio * 100).toFixed(0)}%)\n\n` +
          "그래도 적용하시겠습니까?\n\n" +
          "(취소를 누르면 원래 내용을 유지합니다)"
        );
        if (!proceed) {
          console.log('ℹ️ [문법교정] 사용자가 취소함');
          return;
        }
      }
      
      const confirmed = window.confirm(
        "✅ 교정이 완료되었습니다!\n\n" +
        `원본: ${originalLength}자\n` +
        `교정: ${correctedLength}자\n` +
        `변화: ${correctedLength > originalLength ? '+' : ''}${correctedLength - originalLength}자\n\n` +
        "교정된 내용으로 바꾸시겠습니까?\n\n" +
        "(취소를 누르면 원래 내용을 유지합니다)"
      );
      
      if (confirmed) {
        setContent(corrected.trim());
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
    if (!isSpeechRecognitionSupported()) {
      alert("이 브라우저는 음성 인식을 지원하지 않습니다.\n\nChrome, Edge, Safari 브라우저를 사용해주세요.");
      return;
    }

    setIsListening(true);

    const stopListening = startListening(
      (text) => {
        // 인식된 텍스트를 기존 내용에 추가
        setContent(content + (content ? "\n\n" : "") + text);
        setIsListening(false);
      },
      (error) => {
        alert(error);
        setIsListening(false);
      }
    );

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
              disabled={isListening || isAnalyzing}
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
          
          {/* 이미지 생성 버튼 */}
          <button
            onClick={handleGenerateImage}
            disabled={isGeneratingImage || !content.trim()}
            style={{
              width: "100%",
              marginTop: "10px",
              padding: "16px",
              fontSize: "16px",
              backgroundColor: isGeneratingImage ? "#ccc" : content.trim() ? "#9C27B0" : "#ddd",
              color: "white",
              border: "none",
              borderRadius: "12px",
              cursor: isGeneratingImage || !content.trim() ? "not-allowed" : "pointer",
              fontWeight: "600",
              boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
            }}
          >
            {isGeneratingImage ? "🎨 이미지 생성 중..." : storyImages.length > 0 ? "➕ 이미지 추가" : "🎨 이미지 만들기"}
          </button>
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
  );
}
