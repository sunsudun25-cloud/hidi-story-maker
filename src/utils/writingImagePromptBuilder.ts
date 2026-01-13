// src/utils/writingImagePromptBuilder.ts
// 글쓰기 전용 이미지 프롬프트 생성 (연령 중립, 장르 오해 차단)

export type GenreKey = "일기" | "편지" | "수필" | "동화" | "자유글";

export interface WritingImageInput {
  text: string;           // 사용자가 쓴 글
  genre?: GenreKey;       // 장르 (문체 가이드일 뿐)
  explicitAge?: string;   // 명시적 연령 정보 (예: "어린 시절", "할머니")
}

export interface WritingImageOutput {
  finalPrompt: string;
  detectedCharacters: boolean;  // 등장인물 감지 여부
  ageNeutral: boolean;          // 연령 중립 처리 여부
  imageStrategy: "background" | "silhouette" | "with-character"; // 이미지 전략
}

/** 1) 장르별 이미지 권장 방향 (연령 무관) */
const genreImageGuidance: Record<GenreKey, string> = {
  "일기": "Today's scene: sky, room, path, daily objects. Focus on places and moments, not people's faces.",
  "편지": "Warm scenery with soft light. Small props like paper, envelope silhouettes, gentle background. No people's faces.",
  "수필": "Nature, seasons, atmospheric mood. Landscape-focused, emotional color palette. Minimal or no people.",
  "동화": "Storybook illustration style with clear lines and bright colors. Not necessarily children. Keep characters age-neutral if present.",
  "자유글": "Neutral, balanced illustration matching the text's mood. Background or silhouette preferred over detailed people."
};

/** 2) 텍스트에서 연령 키워드 감지 */
const ageKeywords = [
  "어린", "아이", "아기", "유아", "어린이", "청소년", "학생",
  "할머니", "할아버지", "노인", "어르신", "중년", "장년"
];

function detectExplicitAge(text: string): string | null {
  for (const keyword of ageKeywords) {
    if (text.includes(keyword)) {
      return keyword;
    }
  }
  return null;
}

/** 3) 등장인물 감지 (간단한 휴리스틱) */
function detectCharacters(text: string): boolean {
  const characterIndicators = [
    "나는", "나의", "내가", "우리", "친구", "가족", "엄마", "아빠",
    "사람", "그는", "그녀는", "누군가", "아저씨", "아줌마"
  ];
  return characterIndicators.some(ind => text.includes(ind));
}

/** 4) 최종 프롬프트 빌더 */
export function buildWritingImagePrompt(input: WritingImageInput): WritingImageOutput {
  const { text, genre, explicitAge } = input;
  
  // Step 1: 연령 정보 확인
  const detectedAge = explicitAge || detectExplicitAge(text);
  
  // Step 2: 등장인물 감지
  const hasCharacters = detectCharacters(text);
  
  // Step 3: 이미지 전략 결정
  let imageStrategy: "background" | "silhouette" | "with-character";
  let characterGuidance: string;
  
  if (!hasCharacters) {
    // A) 등장인물 없음 → 배경 중심
    imageStrategy = "background";
    characterGuidance = "Landscape or object-focused illustration. NO people at all.";
  } else if (detectedAge) {
    // B) 등장인물 + 연령 명시 → 연령 반영 가능
    imageStrategy = "with-character";
    characterGuidance = `People with age context: "${detectedAge}". Draw based on text description.`;
  } else {
    // C) 등장인물 + 연령 미명시 → 강력한 연령 차단
    imageStrategy = "silhouette";
    characterGuidance = `
🚫 CRITICAL: NO AGE ESTIMATION ALLOWED
- DO NOT draw children
- DO NOT draw adults
- DO NOT draw elderly people
- DO NOT show faces, body details, or age indicators

✅ ONLY ALLOWED:
- Back views (뒷모습)
- Distant silhouettes
- Shadowy figures
- Focus on SCENE, not people

If text says "we played in the stream":
❌ WRONG: Draw children playing
✅ RIGHT: Draw the stream with water ripples, sunlight, and distant shadows

Default approach: PREFER SCENES OVER PEOPLE.
`.trim();
  }
  
  // Step 4: 장르 가이드 (장르는 스타일일 뿐, 연령 추론 금지)
  const genreGuidance = genre ? genreImageGuidance[genre] : genreImageGuidance["자유글"];
  
  // Step 5: 감정 톤 추출 (간단한 색감 매핑)
  let emotionalTone = "Soft, warm lighting with gentle colors.";
  if (text.includes("기쁨") || text.includes("즐거")) {
    emotionalTone = "Bright, cheerful colors with vibrant lighting.";
  } else if (text.includes("슬픔") || text.includes("외로")) {
    emotionalTone = "Muted colors, soft shadows, melancholic mood.";
  } else if (text.includes("평온") || text.includes("고요")) {
    emotionalTone = "Calm, peaceful colors with balanced lighting.";
  }
  
  // Step 6: 최종 프롬프트 조립 (규칙을 최우선 배치)
  const finalPrompt = `
=== 🚫 ABSOLUTE PROHIBITION - READ THIS FIRST ===
If age is NOT explicitly mentioned in the text:
❌ DO NOT assume or guess age (NO children, NO adults, NO elderly)
❌ DO NOT draw recognizable faces or age-identifiable body features
❌ DO NOT interpret story context to estimate age

=== ✅ MANDATORY APPROACH ===
When text mentions people but NO age specified:
1️⃣ FIRST CHOICE (PREFERRED): Draw the SCENE without people
   - Focus on: places, objects, atmosphere, environment
   - Example: "우리는 물장구치며 놀았다" 
     → ✅ Draw: stream, water ripples, sunlight, nature
     → ❌ NEVER: children or people playing

2️⃣ SECOND CHOICE (if people are absolutely necessary):
   - Back views only (뒷모습)
   - Distant silhouettes (먼 실루엣)
   - Shadowy figures with NO age indicators
   
=== IMAGE STRATEGY ===
${characterGuidance}

=== GENRE GUIDANCE (Genre ≠ Age) ===
${genreGuidance}
Note: "일기" ≠ elderly, "동화" ≠ children

=== EMOTIONAL TONE ===
${emotionalTone}

=== TEXT CONTENT - First 500 chars ===
${text.substring(0, 500)}

=== STYLE ===
Warm, gentle watercolor illustration.
Age-neutral, scene-focused, high quality.
No text, watermark, or logo.
`.trim();

  return {
    finalPrompt,
    detectedCharacters: hasCharacters,
    ageNeutral: !detectedAge,
    imageStrategy
  };
}
