/**
 * Image Service
 * 이미지 다운로드, 변환, 최적화 등 이미지 관련 유틸리티 함수
 */

import { generateImageViaCloudflare, type ImageModel } from './cloudflareImageApi';

/**
 * 지원 모델 타입 정의
 */
export type SupportedModel = ImageModel;

// ============================================
// 🚀 P0 패키지: "사람 그릴까 말까" 자동 판단
// ============================================

type PersonPolicy =
  | { includePeople: false; peopleHint?: string }
  | { includePeople: true; peopleHint: string };

/**
 * 텍스트에서 사람 포함 여부를 자동으로 판단
 * @param text 사용자 입력 텍스트
 * @returns 사람 포함 정책
 */
function detectPersonPolicy(text: string): PersonPolicy {
  const t = (text || "");

  // 1) 명시적으로 "사람 없음"을 원한 경우
  const explicitNoPeople = /(사람\s*없|인물\s*없|no people|without people)/i.test(t);
  if (explicitNoPeople) return { includePeople: false };

  // 2) 이름/동반 표현
  const hasNamedPerson =
    /([가-힣]{2,4})(이|가|와|과)\s*함께/.test(t) || // "철수와 함께"
    /(철수|영희|민수|지수|준호|민지|유나|서준|지민)/.test(t); // 자주 쓰는 이름

  // 3) 인물 키워드
  const hasPersonKeyword =
    /(친구|엄마|아빠|부모|할머니|할아버지|선생님|아이|어린이|학생|아들|딸|가족|남자|여자|소년|소녀|커플|연인|사람|인물)/.test(t);

  // ✅ 핵심 변경: "나/내가/우리" 같은 1인칭은 사람 포함 트리거로 쓰지 않음
  // 자서전은 대부분 1인칭이므로, 대명사만으로는 사람을 그리지 않음
  // const hasPronoun = /(나|내가|우리|우리가|그|그녀|그들)/.test(t);

  // 4) 사람 포함 판단 (이름/인물키워드 있을 때만)
  if (hasNamedPerson || hasPersonKeyword) {
    let peopleHint = "people present, friendly expressions, natural proportions";

    if (/(아이|어린이|소년|소녀|학생)/.test(t)) {
      peopleHint = "children present, cheerful and age-appropriate, friendly faces";
    } else if (/(할머니|할아버지|시니어|노인)/.test(t)) {
      peopleHint = "older adults present, warm and dignified, friendly expressions";
    } else {
      // 연령중립
      peopleHint = "age-neutral adults (do not assume elderly)";
    }

    return { includePeople: true, peopleHint };
  }

  // 5) 기본은 사람 미포함
  return { includePeople: false };
}

/**
 * 동화 이미지 생성 (Cloudflare Pages Function)
 * 🚀 P0 패키지: "사람 그릴까 말까" + 연령 중립 자동 적용
 * @param text 페이지 내용 또는 장면 설명
 * @param options 추가 옵션 (스타일, 분위기, 캐릭터 정보, 모델 선택 등)
 * @returns 이미지 URL
 */
export async function generateStoryImage(
  text: string,
  options?: {
    style?: string;
    mood?: string;
    character?: string;  // 캐릭터 일관성 프롬프트
    model?: SupportedModel;
    size?: "1024x1024" | "1024x1536" | "1536x1024";
    quality?: "low" | "medium" | "high";
  }
): Promise<string> {
  try {
    const { 
      style = "동화풍", 
      mood = "따뜻하고 부드러운",
      character = "",
      model = "gpt-image-1.5",
      size = "1024x1024",
      quality = "high"
    } = options || {};

    // ✅ 사람 포함 여부 자동 판단
    const personPolicy = detectPersonPolicy(text);

    // ✅ 사람 포함/미포함 지시문
    const peopleDirective = personPolicy.includePeople
      ? `People: INCLUDE. ${personPolicy.peopleHint}`
      : `People: DO NOT INCLUDE ANY PEOPLE. Focus on environment/objects/symbolic scene only.`;

    // ✅ 연령 추론 방지
    const ageNeutralDirective = `
Age policy:
- DO NOT assume elderly people.
- Only depict elderly if explicitly mentioned (할머니/할아버지/시니어/노인).
- Otherwise keep characters age-neutral and general.
`.trim();

    // ✅ 텍스트 방지 (동화책 중요)
    const noTextDirective = `
No text policy:
- No letters, no English, no Korean text
- No watermark, no logo, no signs, no labels
`.trim();

    // ✅ 최종 프롬프트
    const prompt = `
Scene from a children's storybook: ${text.substring(0, 800)}

${character ? `\nMain character description (MUST be consistent): ${character}` : ''}

${peopleDirective}

${ageNeutralDirective}
${noTextDirective}

Mood: ${mood}
Visual storytelling through actions, expressions, and environment only.
Simple, clean composition suitable for children and all ages.
Bright, not too dark. Avoid complex backgrounds.
`.trim();

    console.log("🎨 [동화 이미지 P0] 생성 중:", { 
      model, 
      style, 
      size, 
      quality, 
      personPolicy,
      prompt: prompt.substring(0, 100) + "..." 
    });

    // ✅ generateImageViaCloudflare 재사용
    const imageData = await generateImageViaCloudflare(prompt, style, { model, size, quality });

    console.log("✅ [동화 이미지 P0] 생성 완료");
    return imageData;
  } catch (error) {
    console.error("❌ 동화 이미지 생성 오류:", error);
    throw error;
  }
}

/**
 * 글쓰기 이미지 생성 (Cloudflare Pages Function)
 * 🚀 P0 패키지: "사람 그릴까 말까" + 연령 중립 자동 적용
 * @param text 글 내용
 * @param genre 장르 (일기, 편지, 수필, 시, 소설, 자서전)
 * @param options 추가 옵션 (모델, 크기, 품질)
 * @returns 이미지 URL
 */
export async function generateWritingImage(
  text: string,
  genre?: string,
  options?: {
    model?: SupportedModel;
    size?: "1024x1024" | "1024x1536" | "1536x1024";
    quality?: "low" | "medium" | "high";
  }
): Promise<string> {
  try {
    const {
      model = "gpt-image-1.5",
      size = "1024x1024",
      quality = "high"
    } = options || {};

    const genreStyle = genre ? `${genre} 장르에 어울리는` : "글 내용에 맞는";

    // ✅ 사람 포함 여부 자동 판단
    const personPolicy = detectPersonPolicy(text);

    // ✅ 사람 포함/미포함 지시문
    const peopleDirective = personPolicy.includePeople
      ? `People: INCLUDE. ${personPolicy.peopleHint}`
      : `People: DO NOT INCLUDE ANY PEOPLE. Focus on environment/objects/symbolic scene only.`;

    // ✅ 연령 추론 방지(핵심)
    const ageNeutralDirective = `
Age policy:
- DO NOT assume elderly people.
- Only depict elderly if the user text explicitly mentions 할머니/할아버지/시니어/노인.
- Otherwise keep characters age-neutral and general.
`.trim();

    // ✅ 텍스트/워터마크 방지(강하게)
    const noTextDirective = `
No text policy:
- No letters, no English, no Korean text
- No watermark, no logo, no signs, no labels
- No numbers or symbols that look like writing
`.trim();

    // ✅ 자서전 전용: 구조 금지 규칙
    const isAutobiography = genre === "자서전";
    const compositionDirective = isAutobiography
      ? `
[COMPOSITION - CRITICAL FOR AUTOBIOGRAPHY]
🚫 FORBIDDEN LAYOUTS:
- NO timeline layout (어린 시절 → 청년기 → 현재)
- NO collage or multi-panel composition
- NO split screens or divided sections
- NO before/after comparisons
- NO chronological structure in one image

✅ REQUIRED:
- Draw ONE single scene only
- Single moment in time
- Unified composition
- No visual separation between time periods

한 장면으로만 그려주세요. 콜라주/분할/타임라인 구성은 하지 마세요.
`.trim()
      : `
[COMPOSITION]
- simple, uncluttered
- friendly and school-safe
- single scene, not multi-panel
`.trim();

    // ✅ 최종 프롬프트
    const prompt = `
[STYLE DIRECTIVE]
Rendering: warm, clean illustration, simple composition, bright and readable

[CONTENT]
Create an illustration inspired by the writing below.
${peopleDirective}

${ageNeutralDirective}
${noTextDirective}

[WRITING]
${genreStyle} 분위기와 핵심 감정을 시각적으로 표현.
글 내용(요약/핵심):
${text.substring(0, 900)}

${compositionDirective}
`.trim();

    console.log("🎨 [글쓰기 이미지 P0] 생성 중:", { 
      model, 
      genre, 
      size, 
      quality, 
      personPolicy,
      promptPreview: prompt.substring(0, 200) + "..."
    });

    // ✅ generateImageViaCloudflare 호출 시 size/quality도 전달
    // genre를 style로 보내지 않고, 프롬프트에 이미 포함되어 있으므로 기본값만 전달
    const imageData = await generateImageViaCloudflare(prompt, "기본", {
      model,
      size,
      quality
    });

    console.log("✅ [글쓰기 이미지 P0] 생성 완료 { imageLength:", imageData.length, "}");
    return imageData;
  } catch (error) {
    console.error("❌ 글쓰기 이미지 생성 오류:", error);
    throw error;
  }
}

// Removed: generateImageFallback - no longer needed
// All image generation now uses Firebase Functions proxy with DALL-E 3

/**
 * 이미지 URL을 Blob으로 변환 (Base64 또는 HTTP URL 지원)
 * @param imageUrl Base64 또는 HTTP 이미지 URL
 * @param mimeType MIME 타입 (기본값: image/png)
 * @returns Blob 객체
 */
export async function imageUrlToBlob(imageUrl: string, mimeType: string = "image/png"): Promise<Blob> {
  // HTTP/HTTPS URL인 경우
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
    try {
      // CORS 문제 해결: no-cors 모드로 시도
      const response = await fetch(imageUrl, {
        mode: 'cors',
        cache: 'no-cache',
      });
      
      if (!response.ok) {
        throw new Error(`이미지를 가져올 수 없습니다: ${response.status}`);
      }
      
      return await response.blob();
    } catch (error) {
      console.error("CORS fetch 실패, 이미지를 직접 로드합니다:", error);
      
      // CORS 실패 시: Canvas를 사용한 우회 방법
      return await urlToBlobViaCanvas(imageUrl, mimeType);
    }
  }
  
  // Base64인 경우
  // data:image/png;base64, 접두사 제거
  const base64Data = imageUrl.replace(/^data:image\/\w+;base64,/, "");
  
  // Base64 디코딩
  const byteCharacters = atob(base64Data);
  const byteNumbers = new Array(byteCharacters.length);
  
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }
  
  const byteArray = new Uint8Array(byteNumbers);
  return new Blob([byteArray], { type: mimeType });
}

/**
 * Canvas를 사용하여 URL을 Blob으로 변환 (CORS 우회)
 * @param imageUrl 이미지 URL
 * @param mimeType MIME 타입
 * @returns Blob 객체
 */
async function urlToBlobViaCanvas(imageUrl: string, mimeType: string): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous'; // CORS 활성화
    
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Canvas context를 가져올 수 없습니다.'));
          return;
        }
        
        ctx.drawImage(img, 0, 0);
        
        canvas.toBlob((blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Blob 생성 실패'));
          }
        }, mimeType);
      } catch (err) {
        reject(err);
      }
    };
    
    img.onerror = () => {
      reject(new Error('이미지 로드 실패. CORS 문제일 수 있습니다.'));
    };
    
    img.src = imageUrl;
  });
}

/**
 * Base64 이미지를 Blob으로 변환 (하위 호환성)
 * @deprecated imageUrlToBlob 사용 권장
 */
export function base64ToBlob(base64: string, mimeType: string = "image/png"): Blob {
  const base64Data = base64.replace(/^data:image\/\w+;base64,/, "");
  const byteCharacters = atob(base64Data);
  const byteNumbers = new Array(byteCharacters.length);
  
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }
  
  const byteArray = new Uint8Array(byteNumbers);
  return new Blob([byteArray], { type: mimeType });
}

/**
 * 이미지 다운로드
 * @param imageUrl 이미지 URL 또는 Base64 데이터
 * @param filename 다운로드할 파일명 (기본값: image.png)
 */
export function downloadImage(imageUrl: string, filename: string = "image.png"): void {
  const link = document.createElement("a");
  link.href = imageUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * 이미지를 파일로 저장 (Blob 사용)
 * @param imageUrl Base64 또는 HTTP 이미지 URL
 * @param filename 파일명
 */
export async function saveImageAsFile(imageUrl: string, filename: string = "image.png"): Promise<void> {
  try {
    // HTTP URL인 경우: 직접 다운로드 링크 사용 (CORS 문제 회피)
    if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
      const link = document.createElement("a");
      link.href = imageUrl;
      link.download = filename;
      link.target = "_blank"; // 새 탭에서 열기
      link.rel = "noopener noreferrer";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      return;
    }
    
    // Base64인 경우: Blob으로 변환
    const blob = await imageUrlToBlob(imageUrl);
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // 메모리 해제
    setTimeout(() => URL.revokeObjectURL(url), 100);
  } catch (error) {
    console.error("이미지 저장 오류:", error);
    throw new Error("이미지를 저장할 수 없습니다.");
  }
}

/**
 * Web Share API를 사용한 이미지 공유
 * @param imageUrl Base64 또는 HTTP 이미지 URL
 * @param title 공유 제목
 * @param text 공유 텍스트
 * @returns 공유 성공 여부
 */
export async function shareImage(
  imageUrl: string,
  title: string = "이미지 공유",
  text: string = "AI로 생성한 이미지입니다"
): Promise<boolean> {
  // Web Share API 지원 확인
  if (!navigator.share) {
    console.warn("Web Share API가 지원되지 않습니다.");
    return false;
  }

  try {
    // HTTP URL인 경우
    if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
      // 방법 1: 파일 공유 시도 (모바일에서 더 나은 경험)
      if (navigator.canShare) {
        try {
          const response = await fetch(imageUrl);
          const blob = await response.blob();
          const file = new File([blob], "image.png", { type: blob.type || "image/png" });
          
          // 파일 공유 가능 여부 확인
          if (navigator.canShare({ files: [file] })) {
            await navigator.share({
              title,
              text,
              files: [file],
            });
            return true;
          }
        } catch (fileShareError) {
          console.warn("파일 공유 실패, URL 공유로 폴백:", fileShareError);
        }
      }
      
      // 방법 2: URL만 공유 (폴백)
      await navigator.share({
        title,
        text: `${text}\n\n`,
        url: imageUrl
      });
      return true;
    }
    
    // Base64인 경우: 파일로 변환하여 공유
    const blob = await imageUrlToBlob(imageUrl);
    const file = new File([blob], "image.png", { type: "image/png" });

    // 파일 공유 가능 여부 확인
    if (navigator.canShare && !navigator.canShare({ files: [file] })) {
      console.warn("파일 공유가 지원되지 않습니다.");
      return false;
    }

    await navigator.share({
      title,
      text,
      files: [file],
    });

    return true;
  } catch (error: any) {
    // 사용자가 공유를 취소한 경우 (정상)
    if (error.name === 'AbortError') {
      console.log("사용자가 공유를 취소했습니다.");
      return true; // 취소는 오류가 아님
    }
    
    console.error("이미지 공유 오류:", error);
    return false;
  }
}

/**
 * 이미지를 Canvas에 그리기
 * @param imageUrl 이미지 URL
 * @param canvas Canvas 요소
 * @returns Promise<HTMLImageElement>
 */
export function drawImageOnCanvas(
  imageUrl: string,
  canvas: HTMLCanvasElement
): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    
    img.onload = () => {
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("Canvas context를 가져올 수 없습니다."));
        return;
      }

      // Canvas 크기를 이미지에 맞춤
      canvas.width = img.width;
      canvas.height = img.height;
      
      // 이미지 그리기
      ctx.drawImage(img, 0, 0);
      resolve(img);
    };
    
    img.onerror = () => {
      reject(new Error("이미지를 로드할 수 없습니다."));
    };
    
    img.src = imageUrl;
  });
}

/**
 * 이미지 리사이징
 * @param imageUrl 원본 이미지 URL
 * @param maxWidth 최대 너비
 * @param maxHeight 최대 높이
 * @param quality 품질 (0-1, 기본값: 0.9)
 * @returns 리사이징된 Base64 이미지 URL
 */
export async function resizeImage(
  imageUrl: string,
  maxWidth: number,
  maxHeight: number,
  quality: number = 0.9
): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    
    img.onload = () => {
      const canvas = document.createElement("canvas");
      let width = img.width;
      let height = img.height;

      // 비율 유지하며 리사이징
      if (width > height) {
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }
      } else {
        if (height > maxHeight) {
          width = Math.round((width * maxHeight) / height);
          height = maxHeight;
        }
      }

      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("Canvas context를 가져올 수 없습니다."));
        return;
      }

      ctx.drawImage(img, 0, 0, width, height);
      
      // Base64로 변환
      const resizedImageUrl = canvas.toDataURL("image/png", quality);
      resolve(resizedImageUrl);
    };
    
    img.onerror = () => {
      reject(new Error("이미지를 로드할 수 없습니다."));
    };
    
    img.src = imageUrl;
  });
}

/**
 * 이미지에 워터마크 추가
 * @param imageUrl 원본 이미지 URL
 * @param watermarkText 워터마크 텍스트
 * @param options 워터마크 옵션
 * @returns 워터마크가 추가된 Base64 이미지 URL
 */
export async function addWatermark(
  imageUrl: string,
  watermarkText: string,
  options: {
    position?: "bottom-right" | "bottom-left" | "top-right" | "top-left" | "center";
    fontSize?: number;
    color?: string;
    opacity?: number;
  } = {}
): Promise<string> {
  const {
    position = "bottom-right",
    fontSize = 20,
    color = "white",
    opacity = 0.7,
  } = options;

  return new Promise((resolve, reject) => {
    const img = new Image();
    
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("Canvas context를 가져올 수 없습니다."));
        return;
      }

      // 원본 이미지 그리기
      ctx.drawImage(img, 0, 0);

      // 워터마크 스타일 설정
      ctx.font = `${fontSize}px Pretendard, sans-serif`;
      ctx.fillStyle = color;
      ctx.globalAlpha = opacity;

      // 텍스트 크기 측정
      const textMetrics = ctx.measureText(watermarkText);
      const textWidth = textMetrics.width;
      const textHeight = fontSize;

      // 위치 계산
      let x = 0;
      let y = 0;
      const padding = 10;

      switch (position) {
        case "bottom-right":
          x = canvas.width - textWidth - padding;
          y = canvas.height - padding;
          break;
        case "bottom-left":
          x = padding;
          y = canvas.height - padding;
          break;
        case "top-right":
          x = canvas.width - textWidth - padding;
          y = textHeight + padding;
          break;
        case "top-left":
          x = padding;
          y = textHeight + padding;
          break;
        case "center":
          x = (canvas.width - textWidth) / 2;
          y = canvas.height / 2;
          break;
      }

      // 워터마크 그리기
      ctx.fillText(watermarkText, x, y);

      // Base64로 변환
      const watermarkedImageUrl = canvas.toDataURL("image/png");
      resolve(watermarkedImageUrl);
    };
    
    img.onerror = () => {
      reject(new Error("이미지를 로드할 수 없습니다."));
    };
    
    img.src = imageUrl;
  });
}

/**
 * 이미지를 클립보드에 복사
 * @param imageUrl Base64 또는 HTTP 이미지 URL
 * @returns 복사 성공 여부
 */
export async function copyImageToClipboard(imageUrl: string): Promise<boolean> {
  try {
    // HTTP URL인 경우: URL을 텍스트로 복사
    if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
      await navigator.clipboard.writeText(imageUrl);
      return true;
    }
    
    // Base64인 경우: 이미지를 클립보드에 복사
    const blob = await imageUrlToBlob(imageUrl);
    const item = new ClipboardItem({ "image/png": blob });
    await navigator.clipboard.write([item]);
    return true;
  } catch (error) {
    console.error("클립보드 복사 오류:", error);
    
    // 폴백: URL을 텍스트로 복사 시도
    try {
      await navigator.clipboard.writeText(imageUrl);
      return true;
    } catch (fallbackError) {
      console.error("텍스트 복사도 실패:", fallbackError);
      return false;
    }
  }
}

/**
 * 이미지 URL에서 파일 이름 추출
 * @param imageUrl 이미지 URL
 * @param defaultName 기본 파일명
 * @returns 파일 이름
 */
export function getImageFilename(imageUrl: string, defaultName: string = "image.png"): string {
  try {
    const url = new URL(imageUrl);
    const pathname = url.pathname;
    const filename = pathname.substring(pathname.lastIndexOf("/") + 1);
    return filename || defaultName;
  } catch {
    return defaultName;
  }
}

/**
 * 여러 이미지를 ZIP으로 다운로드 (준비 중)
 * @param images 이미지 URL 배열
 * @param zipFilename ZIP 파일명
 */
export async function downloadImagesAsZip(
  images: string[],
  zipFilename: string = "images.zip"
): Promise<void> {
  // TODO: JSZip 라이브러리 사용하여 구현
  console.log("ZIP 다운로드 기능은 준비 중입니다.", images, zipFilename);
  throw new Error("ZIP 다운로드 기능은 아직 구현되지 않았습니다.");
}

/**
 * 4컷 이야기 이미지 생성 (마스터 이미지 기반 일관성 유지)
 * @param panels 4개 패널의 텍스트 배열
 * @param options 생성 옵션
 * @returns 마스터 이미지 + 4개 패널 이미지 URL 배열
 */
export async function generate4PanelStoryImages(
  panels: [string, string, string, string],
  options?: {
    onMasterProgress?: (imageUrl: string) => void;
    onPanelProgress?: (panelIndex: number, imageUrl: string) => void;
    onProgress?: (status: string, progress: number) => void;
    model?: SupportedModel;
    size?: "1024x1024" | "1024x1536" | "1536x1024";
    quality?: "low" | "medium" | "high";
  }
): Promise<{
  masterImage: string;
  panelImages: [string, string, string, string];
}> {
  const {
    onMasterProgress,
    onPanelProgress,
    onProgress,
    model = "gpt-image-1.5",
    size = "1024x1024",
    quality = "high"
  } = options || {};

  try {
    // ============================================
    // Step 1: 마스터 이미지 생성 (스타일 기준)
    // ============================================
    onProgress?.("마스터 이미지 생성 중...", 10);
    
    const allText = panels.join(" ");
    const masterPrompt = `
[MASTER STYLE REFERENCE FOR 4-PANEL STORY]

Create a consistent art style reference for a 4-panel story.
This image will be used as a style guide for all 4 panels.

Story overview: ${allText.substring(0, 400)}

Requirements:
- Simple, clean illustration style (watercolor or soft digital painting)
- Warm, friendly color palette with soft pastels
- Clear character design with recognizable features
- Consistent lighting and mood throughout
- No text, no letters, no Korean/English words
- Single unified scene showing the main character and setting
- Art style suitable for short-form content (like webtoons or shorts)

Style keywords for consistency:
- Character: consistent face, clothing, proportions
- Colors: warm tones, soft shadows, gentle lighting
- Composition: simple, uncluttered, easy to read
- Mood: friendly, approachable, optimistic
`.trim();

    console.log("🎨 [4컷 이야기] 마스터 이미지 생성 중...");
    const masterImage = await generateImageViaCloudflare(masterPrompt, "기본", {
      model,
      size,
      quality
    });
    
    onMasterProgress?.(masterImage);
    onProgress?.("마스터 이미지 생성 완료!", 25);
    console.log("✅ [4컷 이야기] 마스터 이미지 생성 완료");

    // ============================================
    // Step 2: 각 패널 이미지 생성 (마스터 스타일 참조)
    // ============================================
    const panelImages: string[] = [];
    const panelTitles = ["1컷 (시작)", "2컷 (전개)", "3컷 (반전)", "4컷 (결말)"];

    for (let i = 0; i < 4; i++) {
      const progressPercent = 25 + ((i + 1) * 18);
      onProgress?.(`${panelTitles[i]} 생성 중...`, progressPercent);

      const panelPrompt = `
[PANEL ${i + 1} OF 4-PANEL STORY - MUST MATCH MASTER STYLE]

CRITICAL STYLE CONSISTENCY REQUIREMENTS:
- Use the EXACT same art style as the master reference
- Keep the SAME character design (face, clothing, proportions)
- Use the SAME color palette and lighting
- Maintain the SAME illustration technique (watercolor/soft digital)
- Simple, clean composition like webtoon shorts

Panel content: ${panels[i]}

Panel context:
- This is panel ${i + 1} of 4 in a short story
- Previous context: ${panels.slice(0, i).join(" ")}

No text, no letters, no Korean/English words.
Single clear scene showing this moment in the story.
Consistent with master style reference.
`.trim();

      console.log(`🎨 [4컷 이야기] ${panelTitles[i]} 생성 중...`);
      const panelImage = await generateImageViaCloudflare(panelPrompt, "기본", {
        model,
        size,
        quality
      });

      panelImages.push(panelImage);
      onPanelProgress?.(i, panelImage);
      console.log(`✅ [4컷 이야기] ${panelTitles[i]} 생성 완료`);
    }

    onProgress?.("4컷 이미지 생성 완료!", 100);
    console.log("✅ [4컷 이야기] 모든 이미지 생성 완료");

    return {
      masterImage,
      panelImages: panelImages as [string, string, string, string]
    };
  } catch (error) {
    console.error("❌ [4컷 이야기] 이미지 생성 오류:", error);
    throw error;
  }
}

export default {
  generateStoryImage,
  generateWritingImage,
  generate4PanelStoryImages,
  imageUrlToBlob,
  base64ToBlob,
  downloadImage,
  saveImageAsFile,
  shareImage,
  drawImageOnCanvas,
  resizeImage,
  addWatermark,
  copyImageToClipboard,
  getImageFilename,
  downloadImagesAsZip,
};
