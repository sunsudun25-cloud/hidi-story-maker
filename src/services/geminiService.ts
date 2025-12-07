/**
 * geminiService.ts — Google GenAI 최신 SDK 기반 재작성
 * @google/genai (v1 API) 사용
 */

import { GoogleGenAI } from "@google/genai";

// =============================================================
// 1) API KEY 불러오기
// =============================================================
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

if (!API_KEY) {
  console.error("❌ Gemini API KEY가 설정되지 않았습니다!");
}

// 최신 SDK 클라이언트
const genAI = new GoogleGenAI({
  apiKey: API_KEY,
});

// 기본 모델
const MODEL = "gemini-2.0-flash-exp"; // 가장 빠르고 최신 (실험 버전)

// =============================================================
// 2) 안전 호출 래퍼
// =============================================================
export async function safeGeminiCall(prompt: string): Promise<string | null> {
  try {
    const response = await genAI.models.generateContent({
      model: MODEL,
      contents: prompt,
    });

    const text = response?.text();
    return text?.trim() ?? null;
  } catch (err) {
    console.error("❌ Gemini API 호출 오류:", err);
    return null;
  }
}

// =============================================================
// 3) 다음 페이지 생성 (동화책용)
// =============================================================
export async function generateNextPage(
  prevPages: string[],
  mainPrompt: string,
  style: string
): Promise<string> {
  const prompt = `
당신은 어린이 동화책 작가입니다.

전체 줄거리:
${mainPrompt}

이전 페이지 내용:
${prevPages.join("\n")}

다음 페이지 내용을 3~5문장으로 자연스럽게 이어서 작성하세요.
스타일: ${style}
`;

  const result = await safeGeminiCall(prompt);
  return result ?? "다음 페이지를 생성할 수 없습니다.";
}

// =============================================================
// 4) 문장 제안 (글쓰기 이어쓰기)
// =============================================================
export async function suggestNextSentence(
  context: string,
  userInput: string
): Promise<string[]> {
  const prompt = `
당신은 글쓰기 도우미입니다.
아래 내용을 보고 자연스럽게 이어질 문장을 3개 제안하세요.

전체 문맥:
${context}

현재 입력:
${userInput}

형식:
1. 문장1
2. 문장2
3. 문장3
`;

  const text = await safeGeminiCall(prompt);
  if (!text) return [];

  return text
    .split("\n")
    .filter((l) => /^\d+\./.test(l.trim()))
    .map((l) => l.replace(/^\d+\.\s*/, "").trim());
}

// =============================================================
// 5) 장르별 질문 생성 (AI 질문 3개 생성)
// =============================================================
export async function generateStoryPrompts(genre: string): Promise<string> {
  const guide: Record<string, string> = {
    diary: "오늘 하루를 돌아볼 수 있는 질문",
    essay: "깊이 있는 생각을 유도하는 질문",
    novel: "주인공과 사건 전개를 떠올릴 수 있는 질문",
    poem: "감정과 이미지를 상상할 수 있는 질문",
    letter: "마음을 전할 수 있는 질문",
    travel: "여행 경험을 떠올릴 질문",
    memoir: "추억과 회상을 돕는 질문",
    autobio: "인생의 전환점과 의미 관련 질문",
  };

  const guideText = guide[genre] || "글쓰기 도움 질문";

  const prompt = `
당신은 글쓰기 코치입니다.
장르: ${genre}

${guideText} 3개를 만들어주세요.
불릿, 숫자 없이 한 줄 질문 3개만 출력하세요.
`;

  const result = await safeGeminiCall(prompt);
  return result ?? "";
}

// =============================================================
// 6) 이어쓰기 샘플 생성 (3개 버전)
// =============================================================
export async function generateContinuationSamples(
  currentText: string,
  mood?: string
): Promise<string[]> {
  const prompt = `
당신은 글쓰기 도우미입니다.
아래 텍스트를 자연스럽게 이어서 2~3문장으로 이어쓰기 3개 버전을 만들어주세요.

텍스트:
${currentText}

분위기: ${mood || "자연스럽고 부드럽게"}

형식:
1. 이어쓰기1
2. 이어쓰기2
3. 이어쓰기3
`;

  const text = await safeGeminiCall(prompt);
  if (!text) return [];

  return text
    .split("\n")
    .filter((l) => /^\d+\./.test(l.trim()))
    .map((l) => l.replace(/^\d+\.\s*/, "").trim());
}

// =============================================================
// 7) 감정 분석 (이미지 프롬프트 생성용)
// =============================================================
export async function analyzeMoodForImage(text: string) {
  const prompt = `
당신은 감정 분석 전문가입니다.
아래 텍스트의 감정을 한 단어로 분석하고, 핵심 키워드 3개, 그리고 이미지 생성용 프롬프트를 작성하세요.

텍스트:
${text}

형식:
[감정]
감정

[키워드]
키워드1, 키워드2, 키워드3

[이미지 프롬프트]
프롬프트
`;

  const result = await safeGeminiCall(prompt);
  if (!result) {
    return {
      mood: "평온",
      keywords: [],
      imagePrompt: text.slice(0, 50),
    };
  }

  const mood = result.match(/\[감정\]\s*([\s\S]*?)\[/)?.[1]?.trim() ?? "평온";
  const keywords = result
    .match(/\[키워드\]\s*([^\n]+)/)?.[1]
    ?.split(",")
    .map((s) => s.trim()) ?? [];
  const imagePrompt = result.match(/\[이미지 프롬프트\]\s*([\s\S]*)/)?.[1]?.trim() ?? "";

  return { mood, keywords, imagePrompt };
}

export default {
  safeGeminiCall,
  generateNextPage,
  suggestNextSentence,
  generateStoryPrompts,
  generateContinuationSamples,
  analyzeMoodForImage,
};
