/**
 * Image Service
 * 이미지 다운로드, 변환, 최적화 등 이미지 관련 유틸리티 함수
 */

/**
 * 동화 이미지 생성 (DALL-E 3 via Firebase Functions)
 * @param text 페이지 내용 또는 장면 설명
 * @param options 추가 옵션 (스타일, 분위기 등)
 * @returns 이미지 URL
 */
export async function generateStoryImage(
  text: string,
  options?: {
    style?: string;
    mood?: string;
  }
): Promise<string> {
  try {
    const { style = "동화 스타일", mood = "따뜻하고 부드러운" } = options || {};

    const prompt = `
아래 동화 내용에 맞는 ${mood} 분위기의 그림을 만들어 주세요.
어린이와 시니어가 보기 편한 ${style}로 표현해주세요.
복잡한 배경은 피하고, 화면이 너무 어둡지 않게 구성해주세요.
텍스트나 워터마크는 포함하지 마세요.

동화 내용:
${text}
`;

    console.log("🎨 동화 이미지 생성 중:", prompt.substring(0, 100) + "...");

    // Firebase Functions 프록시를 통해 DALL-E 3 호출
    const response = await fetch("https://us-central1-story-make-fbbd7.cloudfunctions.net/api/generateImage", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt: prompt,
        size: "1024x1024",
        quality: "standard",
        n: 1,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`이미지 생성 실패: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    
    if (!data.imageUrl) {
      throw new Error("이미지 URL을 받지 못했습니다.");
    }

    console.log("✅ 동화 이미지 생성 완료:", data.imageUrl);
    return data.imageUrl;
  } catch (error) {
    console.error("❌ 동화 이미지 생성 오류:", error);
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
    // HTTP URL인 경우: URL만 공유 (파일 없이)
    if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
      await navigator.share({
        title,
        text: `${text}\n${imageUrl}`,
        url: imageUrl
      });
      return true;
    }
    
    // Base64인 경우: 파일로 변환하여 공유
    const blob = await imageUrlToBlob(imageUrl);
    const file = new File([blob], "image.png", { type: "image/png" });

    await navigator.share({
      title,
      text,
      files: [file],
    });

    return true;
  } catch (error) {
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

export default {
  generateStoryImage,
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
