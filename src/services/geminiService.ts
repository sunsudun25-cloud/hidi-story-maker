import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = import.meta.env.VITE_GEMINI_KEY || import.meta.env.VITE_GEMINI_API_KEY;

if (!API_KEY) {
  console.error("⚠️ VITE_GEMINI_KEY 또는 VITE_GEMINI_API_KEY가 설정되지 않았습니다!");
}

// Gemini 모델 초기화
const genAI = new GoogleGenerativeAI(API_KEY);

/**
 * OpenAI DALL-E 3 - 이미지 생성
 * 
 * @param prompt 이미지 생성 프롬프트
 * @param style 스타일 (기본, 동화풍, 수채화, 애니메이션, 연필스케치 등)
 * @returns 생성된 이미지 URL
 */
export async function generateImage(prompt: string, style?: string): Promise<string> {
  console.log("🎯 [generateImage] 함수 시작:", { prompt, style });
  
  const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;

  if (!OPENAI_API_KEY) {
    console.error("❌ [generateImage] OPENAI_API_KEY가 없습니다!");
    throw new Error("⚠️ VITE_OPENAI_API_KEY가 설정되지 않았습니다!");
  }

  console.log("✅ [generateImage] OPENAI_API_KEY 확인됨:", OPENAI_API_KEY.substring(0, 20) + "...");

  // 스타일에 따른 프롬프트 변환
  const styleMap: Record<string, string> = {
    "수채화": "watercolor painting style",
    "watercolor": "watercolor painting style",
    "동화풍": "fairytale illustration style",
    "fairytale": "fairytale illustration style",
    "파스텔톤": "soft pastel colors style",
    "pastel": "soft pastel colors style",
    "따뜻한 스타일": "warm and cozy atmosphere",
    "warm": "warm and cozy atmosphere",
    "애니메이션": "anime illustration style",
    "연필스케치": "pencil sketch style",
    "기본": "illustration style",
    "기본 스타일": "illustration style"
  };

  const stylePrompt = styleMap[style || "기본"] || "illustration style";
  const fullPrompt = `${prompt}. ${stylePrompt}. High quality, detailed, no text or watermarks. Professional artwork.`;

  console.log("🎨 [generateImage] DALL-E 3 이미지 생성 중:", fullPrompt);

  try {
    console.log("📡 [generateImage] OpenAI API 호출...");
    
    const response = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "dall-e-3",
        prompt: fullPrompt,
        n: 1,
        size: "1024x1024",
        quality: "standard"
      })
    });

    console.log("📥 [generateImage] API 응답:", { 
      status: response.status, 
      statusText: response.statusText,
      ok: response.ok 
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("❌ [generateImage] OpenAI API 오류:", errorData);
      throw new Error(`이미지 생성 실패: ${errorData.error?.message || response.statusText}`);
    }

    const data = await response.json();
    console.log("📦 [generateImage] API 응답 데이터:", data);
    
    const imageUrl = data.data[0].url;

    if (!imageUrl) {
      console.error("❌ [generateImage] 이미지 URL이 비어있습니다!");
      throw new Error("이미지 URL을 받지 못했습니다.");
    }

    console.log("✅ [generateImage] 이미지 생성 완료:", imageUrl);
    return imageUrl;
  } catch (error) {
    console.error("❌ [generateImage] 이미지 생성 오류:", error);
    throw error;
  }
}

/**
 * Gemini Pro API - 텍스트 생성 (동화 다음 페이지)
 * @param prevPages 현재까지의 페이지 텍스트 배열
 * @param style 사용자가 선택한 스타일 (동화·모험·힐링 등)
 * @returns 새로 생성된 다음 페이지 내용
 */
export async function generateNextPage(prevPages: string[], style: string): Promise<string> {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    const prompt = `
당신은 고령친화형 동화책을 만드는 작가입니다.
아래는 지금까지의 동화 내용입니다:

${prevPages.map((p, i) => `페이지 ${i + 1}:\n${p}\n`).join("")}

사용자가 선택한 동화 스타일: ${style}

다음 페이지 내용을 3~5문장으로 자연스럽게 이어서 작성해 주세요.
너무 어려운 표현은 피하고, 초등학생도 이해할 수 있는 쉬운 문장으로 작성해주세요.
페이지 전체를 하나의 짧은 단락으로 출력해주세요.
    `;

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    return text.trim();
  } catch (error) {
    console.error("텍스트 생성 오류:", error);
    throw error;
  }
}

/**
 * Gemini Pro API - 글쓰기 도우미 (문장 완성)
 * @param context 현재 글의 맥락
 * @param userInput 사용자가 입력 중인 텍스트
 * @returns AI가 제안하는 다음 문장들
 */
export async function suggestNextSentence(context: string, userInput: string): Promise<string[]> {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    const prompt = `
당신은 글쓰기 도우미입니다.
현재 작성 중인 글의 맥락과 사용자 입력을 보고, 자연스럽게 이어질 수 있는 문장 3개를 제안해주세요.

현재 글의 맥락:
${context}

사용자 입력:
${userInput}

다음과 같은 형식으로 3개의 제안을 해주세요:
1. [첫 번째 제안]
2. [두 번째 제안]
3. [세 번째 제안]
    `;

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    // 숫자로 시작하는 줄만 추출
    const suggestions = text
      .split("\n")
      .filter(line => /^\d+\./.test(line.trim()))
      .map(line => line.replace(/^\d+\.\s*/, "").trim())
      .slice(0, 3);

    return suggestions;
  } catch (error) {
    console.error("문장 제안 오류:", error);
    throw error;
  }
}

/**
 * Gemini Pro API - 주제 제안
 * @param genre 글의 장르 (일기, 편지, 동화, 수필 등)
 * @returns AI가 제안하는 주제 목록
 */
export async function suggestTopics(genre: string): Promise<string[]> {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    const prompt = `
당신은 고령친화형 글쓰기 도우미입니다.
"${genre}" 장르로 글을 쓰고 싶어하는 시니어를 위해, 쉽고 재미있는 주제 5개를 제안해주세요.

다음과 같은 형식으로 제안해주세요:
1. [첫 번째 주제]
2. [두 번째 주제]
3. [세 번째 주제]
4. [네 번째 주제]
5. [다섯 번째 주제]

각 주제는 한 문장으로 간단하고 명확하게 작성해주세요.
    `;

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    // 숫자로 시작하는 줄만 추출
    const topics = text
      .split("\n")
      .filter(line => /^\d+\./.test(line.trim()))
      .map(line => line.replace(/^\d+\.\s*/, "").trim())
      .slice(0, 5);

    return topics;
  } catch (error) {
    console.error("주제 제안 오류:", error);
    throw error;
  }
}

/**
 * Gemini Pro API - 문법 및 맞춤법 검사
 * @param text 검사할 텍스트
 * @returns 수정된 텍스트 및 제안 사항
 */
export async function checkGrammar(text: string): Promise<{
  correctedText: string;
  suggestions: string[];
}> {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    const prompt = `
당신은 한국어 문법 및 맞춤법 검사 도우미입니다.
아래 텍스트를 검토하고, 문법과 맞춤법을 수정해주세요.

원본 텍스트:
${text}

다음 형식으로 응답해주세요:

[수정된 텍스트]
(수정된 전체 텍스트를 여기에 작성)

[수정 사항]
1. [첫 번째 수정 사항 설명]
2. [두 번째 수정 사항 설명]
...
    `;

    const result = await model.generateContent(prompt);
    const response = result.response.text();

    // 응답 파싱
    const parts = response.split("[수정 사항]");
    const correctedText = parts[0]
      .replace("[수정된 텍스트]", "")
      .trim();

    const suggestionsText = parts[1] || "";
    const suggestions = suggestionsText
      .split("\n")
      .filter(line => /^\d+\./.test(line.trim()))
      .map(line => line.replace(/^\d+\.\s*/, "").trim());

    return {
      correctedText,
      suggestions,
    };
  } catch (error) {
    console.error("문법 검사 오류:", error);
    throw error;
  }
}

/**
 * 안전한 Gemini API 호출 (에러 처리 포함)
 * @param prompt 사용자 프롬프트
 * @returns AI 응답 텍스트 또는 null
 */
export async function safeGeminiCall(prompt: string): Promise<string | null> {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    return text.trim();
  } catch (error) {
    console.error("Gemini API 호출 오류:", error);
    alert("AI 응답을 받아오는 중 오류가 발생했습니다. 다시 시도해주세요.");
    return null;
  }
}

/**
 * Main.js에서 가져온 함수들
 */

/**
 * 글쓰기 주제 생성 (장르별 맞춤)
 * @param genre 글의 장르
 * @returns AI가 생성한 질문 목록
 */
export async function generateStoryPrompts(genre: string): Promise<string> {
  console.log("🤖 [generateStoryPrompts] AI 질문 생성 시작:", genre);
  
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    const genreGuides: Record<string, string> = {
      diary: "일기 작성을 위한 질문입니다. 오늘 하루를 돌아보며 답변할 수 있는 질문 3개를 만들어주세요.",
      essay: "에세이 작성을 위한 질문입니다. 깊이 있는 생각을 이끌어낼 수 있는 질문 3개를 만들어주세요.",
      poem: "시 작성을 위한 질문입니다. 감정과 이미지를 떠올릴 수 있는 질문 3개를 만들어주세요.",
      fairytale: "동화 작성을 위한 질문입니다. 이야기의 구조를 잡을 수 있는 질문 3개를 만들어주세요.",
      letter: "편지 작성을 위한 질문입니다. 받는 사람과 전하고 싶은 내용에 대한 질문 3개를 만들어주세요.",
      travel: "여행기 작성을 위한 질문입니다. 여행 경험을 생생하게 떠올릴 수 있는 질문 3개를 만들어주세요.",
      memoir: "회고록 작성을 위한 질문입니다. 과거의 기억을 떠올릴 수 있는 질문 3개를 만들어주세요.",
      autobio: "자서전 작성을 위한 질문입니다. 인생의 중요한 순간을 회상할 수 있는 질문 3개를 만들어주세요."
    };

    const guide = genreGuides[genre] || genreGuides.diary;

    const prompt = `
당신은 글쓰기 도우미입니다.
${guide}

규칙:
1. 각 질문은 한 줄로 작성
2. 간단하고 명확하게
3. 답변하기 쉬운 질문
4. 번호나 불릿 없이 질문만

예시:
오늘 가장 기억에 남는 순간은 무엇인가요?
어떤 감정을 느꼈나요?
내일은 무엇을 하고 싶으신가요?
`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    
    console.log("✅ [generateStoryPrompts] 질문 생성 완료");
    return text.trim();
  } catch (error) {
    console.error("❌ [generateStoryPrompts] 오류:", error);
    throw error;
  }
}

/**
 * 이어쓰기 샘플 생성 (여러 옵션 제공)
 * @param currentText 현재까지 작성된 텍스트
 * @param mood 감정/분위기
 * @returns 3가지 이어쓰기 옵션
 */
export async function generateContinuationSamples(
  currentText: string,
  mood?: string
): Promise<string[]> {
  console.log("🤖 [generateContinuationSamples] 이어쓰기 샘플 생성 시작");
  
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    const moodGuide = mood 
      ? `작성 분위기: ${mood}` 
      : "자연스럽고 부드러운 분위기로";

    const prompt = `
당신은 글쓰기 도우미입니다.
아래 텍스트를 자연스럽게 이어서 3가지 버전으로 작성해주세요.

현재 텍스트:
${currentText}

${moodGuide}

규칙:
1. 각 버전은 2-3문장
2. 서로 다른 방향성
3. 자연스러운 문체
4. 번호만 붙이고 설명 없이

형식:
1. [첫 번째 이어쓰기]
2. [두 번째 이어쓰기]
3. [세 번째 이어쓰기]
`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    // 숫자로 시작하는 줄만 추출
    const samples = text
      .split("\n")
      .filter(line => /^\d+\./.test(line.trim()))
      .map(line => line.replace(/^\d+\.\s*/, "").trim())
      .slice(0, 3);

    console.log("✅ [generateContinuationSamples] 샘플 생성 완료:", samples.length);
    return samples;
  } catch (error) {
    console.error("❌ [generateContinuationSamples] 오류:", error);
    throw error;
  }
}

/**
 * 텍스트 감정 분석 (이미지 생성을 위한)
 * @param text 분석할 텍스트
 * @returns 감정 분석 결과 (긍정/부정, 키워드 등)
 */
export async function analyzeMoodForImage(text: string): Promise<{
  mood: string;
  keywords: string[];
  imagePrompt: string;
}> {
  console.log("🤖 [analyzeMoodForImage] 감정 분석 시작");
  
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    const prompt = `
당신은 텍스트 감정 분석 전문가입니다.
아래 텍스트를 분석하고, 이미지 생성에 적합한 정보를 추출해주세요.

텍스트:
${text}

다음 형식으로 응답해주세요:

[감정]
(행복, 슬픔, 평화, 설렘 등 한 단어)

[키워드]
키워드1, 키워드2, 키워드3

[이미지 프롬프트]
(DALL-E로 이미지 생성에 적합한 영어 프롬프트)
`;

    const result = await model.generateContent(prompt);
    const response = result.response.text();

    // 응답 파싱
    const moodMatch = response.match(/\[감정\]\s*([^\n]+)/);
    const keywordsMatch = response.match(/\[키워드\]\s*([^\n]+)/);
    const promptMatch = response.match(/\[이미지 프롬프트\]\s*([^\n]+)/);

    const mood = moodMatch?.[1]?.trim() || "평화로운";
    const keywords = keywordsMatch?.[1]?.split(",").map(k => k.trim()) || [];
    const imagePrompt = promptMatch?.[1]?.trim() || text.substring(0, 100);

    console.log("✅ [analyzeMoodForImage] 분석 완료:", { mood, keywords });
    
    return { mood, keywords, imagePrompt };
  } catch (error) {
    console.error("❌ [analyzeMoodForImage] 오류:", error);
    throw error;
  }
}

export default {
  generateImage,
  generateNextPage,
  suggestNextSentence,
  suggestTopics,
  checkGrammar,
  safeGeminiCall,
  generateStoryPrompts,
  generateContinuationSamples,
  analyzeMoodForImage,
};
