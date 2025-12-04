import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = import.meta.env.VITE_GEMINI_KEY || import.meta.env.VITE_GEMINI_API_KEY;

if (!API_KEY) {
  console.error("⚠️ VITE_GEMINI_KEY 또는 VITE_GEMINI_API_KEY가 설정되지 않았습니다!");
}

// Gemini 모델 초기화
const genAI = new GoogleGenerativeAI(API_KEY);

/**
 * Gemini Pro Vision API - 이미지 생성
 * @param prompt 이미지 생성 프롬프트
 * @param style 스타일 (수채화, 파스텔톤, 동화 스타일 등)
 * @returns Base64 인코딩된 이미지 URL
 */
export async function generateImage(prompt: string, style?: string): Promise<string> {
  try {
    const fullPrompt = style ? `${prompt}. 스타일: ${style}` : prompt;

    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro-vision:generateImage?key=${API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: fullPrompt,
          size: "1024x1024",
        }),
      }
    );

    if (!res.ok) {
      throw new Error(`API 응답 오류: ${res.status} ${res.statusText}`);
    }

    const data = await res.json();
    
    if (!data.candidates?.[0]?.image?.base64) {
      throw new Error("이미지 데이터를 받지 못했습니다.");
    }

    const base64Image = data.candidates[0].image.base64;
    return `data:image/png;base64,${base64Image}`;
  } catch (error) {
    console.error("이미지 생성 오류:", error);
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

export default {
  generateImage,
  generateNextPage,
  suggestNextSentence,
  suggestTopics,
  checkGrammar,
};
