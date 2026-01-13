// src/utils/promptBuilder.ts

export type PurposeKey = "story" | "memory" | "class" | "photo";
export type MoodKey = "bright" | "warm" | "calm" | "dreamy";

export interface PromptBuildInput {
  userText: string;
  purpose: PurposeKey;
  mood?: MoodKey;
  styleLabel?: string; // "기본" | "수채화" | ...
  lightCorrection?: boolean; // ✅ 약한 보정 모드 (Practice용)
}

export interface PromptBuildOutput {
  finalPrompt: string;
  resolvedStyleLabel: string;   // 실제 적용된 스타일(표시용)
  resolvedStyleText: string;    // styleMapping 결과
  purposeDirective: string;
  moodDirective: string;
}

/** 1) 스타일 매핑 */
export const styleMapping: Record<string, string> = {
  "수채화": "soft watercolor wash, visible paper texture, uneven brush strokes, gentle warm light, hand-painted imperfections",
  "파스텔톤": "pastel colors, soft gradients, gentle atmosphere, light and airy, minimal clutter",
  "동화풍": "children's book illustration, clear lines, bright colors, storybook quality, friendly and readable composition",
  "애니메이션": "anime-inspired illustration, clean line art, soft shading, friendly and cute, not realistic photo",
  "연필스케치": "pencil sketch, monochrome, hatching, hand-drawn lines, artistic rendering",
  "감성 사진 같은 그림": "photo-inspired illustration with natural lighting and subtle realistic details, but still an illustration (not a real photo)",
  "기본": "illustration style, balanced composition, pleasing aesthetics"
};

/** 2) 목적별 기본 스타일(스타일 미선택 시 자동) */
export const purposeDefaultStyle: Record<PurposeKey, string> = {
  story: "동화풍",
  memory: "수채화",
  class: "파스텔톤",
  photo: "감성 사진 같은 그림"
};

/** 3) 목적 지시문 (구도/복잡도/용도) */
export const purposeDirectives: Record<PurposeKey, string> = {
  story:
    "Single-page illustration for a storybook. Clear subject, readable composition, leave comfortable negative space. Not a comic panel. Not a multi-page spread.",
  memory:
    "Emotional, cozy illustration. Soft lighting, gentle shadows, warm tone. Keep it simple and not busy.",
  class:
    "Presentation-friendly illustration. Clean layout, uncluttered background, clear focal point, high readability.",
  photo:
    "Photo-inspired illustration with natural lighting and subtle realistic details, but still an illustration (not a real photo)."
};

/** 4) 분위기 지시문 */
export const moodDirectives: Record<MoodKey, string> = {
  bright: "Bright, positive, welcoming atmosphere.",
  warm: "Warm, cozy, comforting atmosphere.",
  calm: "Calm, quiet, peaceful atmosphere.",
  dreamy: "Dreamy, magical, gentle atmosphere."
};

/** 5) 텍스트 방지(과격 단어 제거 버전) */
export const negativeConstraints = `
=== NEGATIVE CONSTRAINTS ===
No readable text or letters (no English, no Korean).
No watermark, no logo.
No signs, labels, captions, numbers, or symbols.
Pure illustration only.
`;

/** 6) 품질(간단 명료) */
export const qualityFooter = `
=== QUALITY ===
Clean composition, readable, not busy.
High quality illustration with consistent style.
`;

/** 7) 사용자 입력 보정(너무 짧거나 비면 기본값 추가) */
function normalizeUserText(text: string): string {
  const t = (text || "").trim();
  if (!t) return "A simple, friendly illustration of a cute subject in a bright natural background.";
  if (t.length < 6) return `${t}, simple background, clear subject, gentle lighting`;
  return t;
}

/** 8) 최종 프롬프트 빌더 */
export function buildAutoPrompt(input: PromptBuildInput): PromptBuildOutput {
  const userText = normalizeUserText(input.userText);

  // 스타일 결정: (1) 사용자가 선택한 스타일이 유효하면 사용 (2) 아니면 목적 기본값
  const styleLabel =
    input.styleLabel && input.styleLabel !== "기본"
      ? input.styleLabel
      : purposeDefaultStyle[input.purpose] || "기본";

  const styleText = styleMapping[styleLabel] || styleMapping["기본"];
  const purposeText = purposeDirectives[input.purpose] || purposeDirectives.memory;
  const moodText = input.mood ? moodDirectives[input.mood] : "Bright and friendly atmosphere.";

  // ✅ 약한 보정 모드: 프롬프트 연습용 (Practice 전용)
  if (input.lightCorrection) {
    // 사용자 입력을 최대한 존중, 최소한의 스타일 가이드만 추가
    const finalPrompt = `
${userText}

Style: ${styleLabel}
${styleText}

No readable text, no watermark.
`.trim();

    return {
      finalPrompt,
      resolvedStyleLabel: styleLabel,
      resolvedStyleText: styleText,
      purposeDirective: purposeText,
      moodDirective: moodText
    };
  }

  // ✅ 기본 모드: 전체 구조 적용 (DrawDirect 등)
  const finalPrompt = `
[STYLE DIRECTIVE]
StyleLabel: ${styleLabel}
Rendering: ${styleText}

[PURPOSE DIRECTIVE]
${purposeText}

[MOOD]
${moodText}

[USER REQUEST]
${userText}

${negativeConstraints}
${qualityFooter}
`.trim();

  return {
    finalPrompt,
    resolvedStyleLabel: styleLabel,
    resolvedStyleText: styleText,
    purposeDirective: purposeText,
    moodDirective: moodText
  };
}
