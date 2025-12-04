import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

// Gemini 모델 초기화
const genAI = new GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-pro" });

/**
 * 동화 다음 페이지 생성 함수
 * @param prevPages 현재까지의 페이지 텍스트 배열
 * @param style 사용자가 선택한 스타일 (동화·모험·힐링 등)
 * @returns string 새로 생성된 다음 페이지 내용
 */
export async function generateNextPage(prevPages: string[], style: string) {
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

  return text;
}
