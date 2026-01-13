/**
 * geminiService.ts - Firebase Functions 프록시 전용
 * 프론트엔드에서는 절대 Gemini SDK를 직접 호출하지 않는다!
 */

const REGION = "asia-northeast1"; 
const PROJECT_ID = "story-make-fbbd7";

export const FUNCTIONS_URL = {
  text: `https://${REGION}-${PROJECT_ID}.cloudfunctions.net/geminiText`,
  image: `https://${REGION}-${PROJECT_ID}.cloudfunctions.net/generateImage`
};

/** Firebase Functions POST 호출 */
async function callFunction(url: string, payload: any) {
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      console.error("❌ Functions 오류:", res.status, url);
      return null;
    }

    const data = await res.json();
    if (!data.success) {
      console.error("❌ Functions 응답 오류:", data);
      return null;
    }
    // ✅ imageData 우선 사용 (CORS-safe Data URL)
    return data.text ?? data.imageData ?? data.imageUrl ?? null;
  } catch (err) {
    console.error("❌ 네트워크 오류:", err);
    return null;
  }
}

/** 텍스트 생성 (Cloudflare Functions 사용) */
export async function generateText(prompt: string): Promise<string | null> {
  try {
    // ✅ Cloudflare Pages Functions 사용 (Firebase Functions 대체)
    const apiUrl = `${window.location.origin}/api/generate-text`;
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ prompt })
    });

    if (!response.ok) {
      console.error('❌ [generateText] API 오류:', response.status);
      return null;
    }

    const data = await response.json();
    
    if (!data.success || !data.text) {
      console.error('❌ [generateText] 응답 오류:', data);
      return null;
    }

    return data.text;

  } catch (error) {
    console.error('❌ [generateText] 오류:', error);
    return null;
  }
}

/** 이미지 생성 */
export async function generateImage(prompt: string, style?: string): Promise<string | null> {
  return await callFunction(FUNCTIONS_URL.image, { prompt, style });
}

/**
 * AI 응답에서 불필요한 멘트 제거
 * "네, 알겠습니다", "---", "[n페이지]" 등 제거
 */
export function sanitizeAiStoryText(text: string): string {
  if (!text) return text;

  return text
    // AI 인사말/응답 제거
    .replace(/^네[,! ]*알겠습니다[^\n]*\n?/gim, "")
    .replace(/^알겠습니다[^\n]*\n?/gim, "")
    .replace(/^물론입니다[^\n]*\n?/gim, "")
    .replace(/^좋습니다[^\n]*\n?/gim, "")
    .replace(/^그럼[,! ]*[^\n]*작성해\s*드릴게요[^\n]*\n?/gim, "")
    .replace(/^다음과\s*같이[^\n]*\n?/gim, "")
    // 구분선 제거
    .replace(/^\s*---+\s*$/gm, "")
    .replace(/^\s*===+\s*$/gm, "")
    // 페이지 번호 제거
    .replace(/^\s*\[\s*\d+\s*페이지\s*\]\s*\n?/gim, "")
    .replace(/^\s*\d+\s*페이지\s*[:\-]\s*\n?/gim, "")
    // 제목/라벨 제거
    .replace(/^\s*제목\s*[:：]\s*[^\n]*\n?/gim, "")
    .replace(/^\s*내용\s*[:：]\s*\n?/gim, "")
    // 따옴표 제거
    .replace(/^["「『]/gm, "")
    .replace(/["」』]$/gm, "")
    // 여러 줄바꿈을 두 줄바꿈으로
    .replace(/\n{3,}/g, "\n\n")
    // 앞뒤 공백 제거
    .trim();
}

/** 하위 호환성을 위한 별칭들 */
export const callGemini = generateText;
export const safeGeminiCall = generateText;

/** 동화책 – 다음 페이지 생성 */
export async function generateNextPage(
  prevPages: string[], 
  mainPrompt: string, 
  style: string
): Promise<string | null> {
  const prompt = `
당신은 어린이 동화책 작가입니다.

전체 줄거리:
${mainPrompt}

이전 페이지 내용:
${prevPages.join("\n")}

다음 내용을 3~5문장으로 자연스럽게 이어서 작성하세요.
스타일: ${style}

⚠️ 출력 규칙 (반드시 지켜주세요):
- 안내문, 설명, 인사말, 머리말을 쓰지 마세요.
- "네, 알겠습니다", "물론입니다", "다음과 같이" 같은 문장을 쓰지 마세요.
- "---", "[n페이지]" 같은 구분 표시를 쓰지 마세요.
- 오직 동화 본문 문단만 출력하세요.
- 번호, 따옴표, 제목 없이 문단으로만 작성하세요.
- 직접 이야기를 시작하세요.
`;

  const rawText = await generateText(prompt);
  if (!rawText) return null;
  
  // AI 응답 정리
  return sanitizeAiStoryText(rawText);
}

/** 글쓰기 이어쓰기 */
export async function suggestNextSentence(
  context: string, 
  userInput: string
): Promise<string[]> {
  const prompt = `
아래 문장을 자연스럽게 이어질 3개의 문장을 제안하세요.

문맥:
${context}

입력:
${userInput}

형식:
1. 문장1
2. 문장2
3. 문장3
`;

  const text = await generateText(prompt);
  if (!text) return [];

  return text
    .split("\n")
    .filter((l) => /^\d+\./.test(l))
    .map((l) => l.replace(/^\d+\.\s*/, "").trim());
}

/** 장르별 질문 생성 */
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

  return await generateText(prompt) ?? "";
}

/** 이어쓰기 샘플 생성 (Cloudflare Functions 사용) */
export async function generateContinuationSamples(
  currentText: string,
  mood?: string
): Promise<string[]> {
  try {
    // ✅ Cloudflare Pages Functions 사용 (Firebase Functions 대체)
    const apiUrl = `${window.location.origin}/api/continue-writing`;
    
    console.log('📝 [generateContinuationSamples] API 호출:', apiUrl);
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        currentText,
        mood: mood || "자연스럽고 부드럽게",
        count: 3
      })
    });

    if (!response.ok) {
      console.error('❌ [generateContinuationSamples] API 오류:', response.status);
      return [];
    }

    const data = await response.json();
    
    if (!data.success || !data.samples) {
      console.error('❌ [generateContinuationSamples] 응답 오류:', data);
      return [];
    }

    console.log('✅ [generateContinuationSamples] 샘플 개수:', data.samples.length);
    return data.samples;

  } catch (error) {
    console.error('❌ [generateContinuationSamples] 오류:', error);
    return [];
  }
}

/** 감정 분석 (이미지 프롬프트 생성용) */
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

  const result = await generateText(prompt);
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

/** 동화책 줄거리 추천 */
export async function suggestStoryPlots(genre: string = "동화"): Promise<string[]> {
  const prompt = `
어린이를 위한 ${genre} 줄거리를 3개 추천해주세요.
각 줄거리는 한 문장으로 간단하게 작성하세요.

출력 형식:
1. 첫 번째 줄거리
2. 두 번째 줄거리
3. 세 번째 줄거리
`;

  const text = await generateText(prompt);
  if (!text) return ["줄거리를 생성할 수 없습니다"];

  const plots = text
    .split("\n")
    .map((s) => s.trim())
    .filter((s) => s.length > 0 && /^\d+\./.test(s))
    .map((s) => s.replace(/^\d+\.\s*/, ""));

  return plots.length > 0 ? plots.slice(0, 3) : ["줄거리 생성 실패"];
}

/** 동화책 초안 생성 (3페이지) */
export async function generateStoryPages(
  title: string,
  plotSummary: string,
  style: string
): Promise<string[]> {
  const prompt = `
당신은 어린이를 위한 동화 작가입니다.
다음 정보를 바탕으로 정확히 3개의 페이지로 구성된 동화를 작성해주세요.

제목: ${title}
줄거리: ${plotSummary}
스타일: ${style}

**중요 규칙:**
1. 정확히 3개의 페이지를 작성하세요
2. 각 페이지는 3-5문장으로 구성하세요
3. 각 페이지는 [page1], [page2], [page3] 형식으로 시작하세요
4. 어린이가 이해하기 쉬운 간단한 문장을 사용하세요
5. 각 페이지가 자연스럽게 이어지도록 작성하세요

출력 형식:
[page1]
첫 번째 페이지 내용...

[page2]
두 번째 페이지 내용...

[page3]
세 번째 페이지 내용...
`;

  const raw = await generateText(prompt);
  if (!raw) {
    console.warn("⚠ Gemini returned empty response");
    return ["내용 생성 실패"];
  }

  // [pageN] 마커로 분리
  const pageRegex = /\[page\d+\]\s*([\s\S]*?)(?=\[page\d+\]|$)/gi;
  const matches = [...raw.matchAll(pageRegex)];
  
  const pages = matches
    .map(match => match[1].trim())
    .filter(text => text.length > 0);

  console.log("📘 [geminiService] 생성된 페이지:", pages.length);

  if (pages.length === 0) {
    // 마커가 없으면 줄바꿈으로 분리
    const fallbackPages = raw
      .split("\n")
      .map(s => s.trim())
      .filter(s => s.length > 0);
    
    return fallbackPages.length > 0 ? fallbackPages.slice(0, 3) : ["페이지 생성 실패"];
  }

  return pages.slice(0, 3); // 최대 3페이지만 반환
}

/** 주제 제안 (시니어 친화적) */
export async function suggestTopics(genre: string): Promise<string[]> {
  const prompt = `
시니어 분들이 쉽게 작성할 수 있는 ${genre} 주제를 5개 추천해주세요.
각 주제는 간단하고 친근한 문장으로 작성하세요.

출력 형식:
1. 첫 번째 주제
2. 두 번째 주제
3. 세 번째 주제
4. 네 번째 주제
5. 다섯 번째 주제
`;

  const text = await generateText(prompt);
  if (!text) return ["주제를 생성할 수 없습니다"];

  const topics = text
    .split("\n")
    .map((s) => s.trim())
    .filter((s) => s.length > 0 && /^\d+\./.test(s))
    .map((s) => s.replace(/^\d+\.\s*/, ""));

  return topics.length > 0 ? topics.slice(0, 5) : ["주제 생성 실패"];
}

/** 문법 및 맞춤법 검사 */
export async function checkGrammar(text: string): Promise<{
  corrected: string;
  suggestions: string[];
}> {
  const prompt = `
다음 텍스트의 문법과 맞춤법을 검사하고 수정해주세요.

텍스트:
${text}

출력 형식:
[수정된 텍스트]
수정된 전체 텍스트

[제안 사항]
1. 첫 번째 제안
2. 두 번째 제안
`;

  const raw = await generateText(prompt);
  if (!raw) {
    return {
      corrected: text,
      suggestions: ["검사 결과를 생성할 수 없습니다"],
    };
  }

  const correctedMatch = raw.match(/\[수정된 텍스트\]\s*([\s\S]*?)\s*\[제안 사항\]/);
  const corrected = correctedMatch ? correctedMatch[1].trim() : text;

  const suggestionsMatch = raw.match(/\[제안 사항\]\s*([\s\S]*)/);
  const suggestionsRaw = suggestionsMatch ? suggestionsMatch[1] : "";
  
  const suggestions = suggestionsRaw
    .split("\n")
    .map(s => s.trim())
    .filter(s => s.length > 0 && /^\d+\./.test(s))
    .map(s => s.replace(/^\d+\.\s*/, ""));

  return {
    corrected,
    suggestions: suggestions.length > 0 ? suggestions : ["특별한 수정 사항이 없습니다"],
  };
}

export default {
  callGemini,
  safeGeminiCall,
  generateText,
  generateImage,
  generateNextPage,
  suggestNextSentence,
  generateStoryPrompts,
  generateContinuationSamples,
  analyzeMoodForImage,
  suggestStoryPlots,
  generateStoryPages,
  suggestTopics,
  checkGrammar,
};
