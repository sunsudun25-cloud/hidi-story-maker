/**
 * 이미지 생성 스타일 프리셋
 * - 각 스타일은 완전히 독립적으로 관리
 * - 공통 프롬프트 없음 (혼용 방지)
 * - 스타일별 최적 모델, 사이즈, 품질 설정
 */

export interface StylePreset {
  key: string;
  label: string;
  icon: string;
  description: string;
  
  // 이미지 생성 설정
  model: string;
  size: string;
  quality: string;
  
  // 프롬프트 구성
  scenePrefix: string;        // 장면 앞에 붙는 프리픽스
  styleSuffix: string;        // 스타일 설명
  compositionGuide: string;   // 구도 가이드
  negativePrompt: string;     // 금지 프롬프트
}

/**
 * 실사 스타일 (📸)
 * - GPT Image 모델 사용
 * - 포토저널리즘 스타일
 * - DSLR 촬영 느낌
 */
export const REALISTIC_STYLE: StylePreset = {
  key: "realistic",
  label: "실사 (📸)",
  icon: "📸",
  description: "실제 사진처럼 사실적인 이미지",
  
  model: "gpt-image-1",
  size: "1536x1024",
  quality: "high",
  
  scenePrefix: "A real news interview photo.",
  styleSuffix: `
Photojournalism style.
Natural lighting, shallow depth of field.
DSLR camera, 50mm lens.
Realistic skin texture, natural expressions.
Documentary feel, candid moment.
Professional news photography.
  `.trim(),
  
  compositionGuide: `
Composition: Medium shot, eye-level angle.
Background: Natural bokeh, out of focus.
Lighting: Soft natural light, no harsh shadows.
  `.trim(),
  
  negativePrompt: `
ABSOLUTELY NO: illustration, cartoon, anime, 3D render, CGI, painting, drawing, 
stylized, artistic, fantasy, unrealistic, overly perfect skin, 
plastic look, video game, Pixar style, cute eyes, exaggerated features,
text, Korean text, English text, signs, watermarks, logos.
  `.trim()
};

/**
 * 3D 렌더링 스타일 (🎮)
 * - DALL-E 3 모델 사용
 * - Blender/Cinema 4D 느낌
 * - 자연스러운 입체감
 */
export const RENDER_3D_STYLE: StylePreset = {
  key: "3d",
  label: "3D 렌더링 (🎮)",
  icon: "🎮",
  description: "입체적인 3D 렌더링 이미지",
  
  model: "dall-e-3",
  size: "1024x1024",
  quality: "hd",
  
  scenePrefix: "A 3D CGI rendering of",
  styleSuffix: `
Neutral 3D CGI rendering.
Natural human proportions, realistic materials.
Proper lighting and shadows, volumetric effects.
Clean textures, subtle reflections.
Blender or Cinema 4D style rendering.
Professional 3D visualization.
  `.trim(),
  
  compositionGuide: `
Composition: Clear subject separation from background.
Camera: Natural 3D perspective, slight depth.
Lighting: Three-point lighting, soft ambient.
  `.trim(),
  
  negativePrompt: `
NO: cartoon eyes, Pixar style, overly cute, exaggerated features,
chibi, anime style, stylized faces, unrealistic proportions,
text, Korean hangul, English letters, signs, watermarks.
  `.trim()
};

/**
 * 일러스트 스타일 (✏️)
 * - DALL-E 3 모델 사용
 * - 따뜻한 동화책 느낌
 * - 부드러운 색감
 */
export const ILLUSTRATION_STYLE: StylePreset = {
  key: "illustration",
  label: "일러스트 (✏️)",
  icon: "✏️",
  description: "따뜻한 동화책 스타일",
  
  model: "dall-e-3",
  size: "1024x1024",
  quality: "hd",
  
  scenePrefix: "A warm storybook illustration of",
  styleSuffix: `
Warm, gentle digital illustration.
Soft pastel colors, clean lines.
Children's book style, friendly atmosphere.
Simple organized background.
Educational and inviting feel.
  `.trim(),
  
  compositionGuide: `
Composition: Clear storytelling layout.
Style: Consistent storybook aesthetic.
Colors: Harmonious warm palette.
  `.trim(),
  
  negativePrompt: `
NO: text, letters, words, Korean hangul, English text, numbers, signs,
realistic photo, 3D render, dark mood, complex background.
  `.trim()
};

/**
 * 애니메이션 스타일 (🎬)
 * - DALL-E 3 모델 사용
 * - 밝고 생동감 있는 느낌
 * - 표정과 감정 강조
 */
export const ANIMATION_STYLE: StylePreset = {
  key: "animation",
  label: "애니메이션 (🎬)",
  icon: "🎬",
  description: "생동감 있는 애니메이션 스타일",
  
  model: "dall-e-3",
  size: "1024x1024",
  quality: "hd",
  
  scenePrefix: "A bright animation scene of",
  styleSuffix: `
Vibrant animation style.
Expressive facial emotions, dynamic poses.
Bright vivid colors, high contrast.
Clear character outlines, smooth shading.
Lively and energetic atmosphere.
  `.trim(),
  
  compositionGuide: `
Composition: Clear storytelling shot.
Animation: Smooth character animation style.
Expression: Emphasized emotions and reactions.
  `.trim(),
  
  negativePrompt: `
NO: text, words, Korean text, English letters, signs, watermarks,
realistic photo, 3D CGI, dark mood, static pose.
  `.trim()
};

/**
 * 모든 스타일 프리셋
 */
export const ALL_STYLE_PRESETS: StylePreset[] = [
  REALISTIC_STYLE,
  RENDER_3D_STYLE,
  ILLUSTRATION_STYLE,
  ANIMATION_STYLE
];

/**
 * 스타일 키로 프리셋 찾기
 */
export function getStylePreset(styleKey: string): StylePreset {
  const preset = ALL_STYLE_PRESETS.find(p => p.key === styleKey);
  if (!preset) {
    console.warn(`⚠️ Unknown style key: ${styleKey}, using default 3D`);
    return RENDER_3D_STYLE;
  }
  return preset;
}

/**
 * 스타일 프리셋 검증
 */
export function validateStylePreset(preset: StylePreset): boolean {
  if (!preset.model || !preset.size || !preset.quality) {
    console.error("❌ Invalid style preset: missing model/size/quality");
    return false;
  }
  if (!preset.styleSuffix || !preset.compositionGuide || !preset.negativePrompt) {
    console.error("❌ Invalid style preset: missing prompt components");
    return false;
  }
  return true;
}
