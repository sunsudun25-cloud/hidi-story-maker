/**
 * Image Service
 * 이미지 다운로드, 변환, 최적화 등 이미지 관련 유틸리티 함수
 */

import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = import.meta.env.VITE_GEMINI_KEY || import.meta.env.VITE_GEMINI_API_KEY;

if (!API_KEY) {
  console.error("⚠️ VITE_GEMINI_KEY 또는 VITE_GEMINI_API_KEY가 설정되지 않았습니다!");
}

const genAI = new GoogleGenerativeAI(API_KEY);

/**
 * Imagen 모델 - 동화 이미지 생성 (텍스트 기반)
 * @param text 페이지 내용 또는 장면 설명
 * @param options 추가 옵션 (스타일, 분위기 등)
 * @returns Base64 인코딩된 이미지 URL
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

    // Imagen 모델 초기화
    const imagenModel = genAI.getGenerativeModel({ model: "imagen-3.0-generate-001" });

    const prompt = `
아래 동화 내용에 맞는 ${mood} 분위기의 그림을 만들어 주세요.
어린이와 시니어가 보기 편한 ${style}로 표현해주세요.
복잡한 배경은 피하고, 화면이 너무 어둡지 않게 구성해주세요.

동화 내용:
${text}
`;

    const result = await imagenModel.generateContent({
      contents: [
        {
          role: "user",
          parts: [{ text: prompt }],
        },
      ],
    });

    // 응답에서 이미지 데이터 추출
    const imageData = result.response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;

    if (!imageData) {
      throw new Error("이미지 데이터를 받지 못했습니다.");
    }

    return `data:image/png;base64,${imageData}`;
  } catch (error) {
    console.error("동화 이미지 생성 오류:", error);
    
    // Fallback: Gemini Pro Vision API 사용
    console.log("Fallback: Gemini Pro Vision API 사용");
    return generateImageFallback(text, options?.style);
  }
}

/**
 * Gemini Pro Vision API - 이미지 생성 (Fallback)
 * @param prompt 이미지 생성 프롬프트
 * @param style 스타일
 * @returns Base64 인코딩된 이미지 URL
 */
async function generateImageFallback(prompt: string, style?: string): Promise<string> {
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
    console.error("Fallback 이미지 생성 오류:", error);
    throw error;
  }
}

/**
 * Base64 이미지를 Blob으로 변환
 * @param base64 Base64 인코딩된 이미지 데이터
 * @param mimeType MIME 타입 (기본값: image/png)
 * @returns Blob 객체
 */
export function base64ToBlob(base64: string, mimeType: string = "image/png"): Blob {
  // data:image/png;base64, 접두사 제거
  const base64Data = base64.replace(/^data:image\/\w+;base64,/, "");
  
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
 * @param imageUrl Base64 이미지 URL
 * @param filename 파일명
 */
export function saveImageAsFile(imageUrl: string, filename: string = "image.png"): void {
  const blob = base64ToBlob(imageUrl);
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  // 메모리 해제
  URL.revokeObjectURL(url);
}

/**
 * Web Share API를 사용한 이미지 공유
 * @param imageUrl Base64 이미지 URL
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
    const blob = base64ToBlob(imageUrl);
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
 * @param imageUrl Base64 이미지 URL
 * @returns 복사 성공 여부
 */
export async function copyImageToClipboard(imageUrl: string): Promise<boolean> {
  try {
    const blob = base64ToBlob(imageUrl);
    const item = new ClipboardItem({ "image/png": blob });
    await navigator.clipboard.write([item]);
    return true;
  } catch (error) {
    console.error("클립보드 복사 오류:", error);
    return false;
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
 * 동화책을 PDF로 생성 및 다운로드
 * @param bookData 동화책 데이터 (제목, 표지, 페이지 배열)
 * @param filename PDF 파일명
 */
export async function generateStorybookPDF(
  bookData: {
    title: string;
    coverImageUrl?: string;
    pages: Array<{
      text: string;
      imageUrl?: string;
    }>;
  },
  filename: string = "storybook.pdf"
): Promise<void> {
  const { jsPDF } = await import("jspdf");
  
  // A4 세로 방향 (210mm x 297mm)
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = 210;
  const pageHeight = 297;
  const margin = 20;
  const contentWidth = pageWidth - 2 * margin;

  let isFirstPage = true;

  // 📕 표지 페이지
  if (bookData.coverImageUrl) {
    try {
      // 제목
      doc.setFontSize(24);
      doc.setFont("helvetica", "bold");
      doc.text(bookData.title, pageWidth / 2, 40, { align: "center" });

      // 표지 이미지
      const coverImg = await loadImageAsDataURL(bookData.coverImageUrl);
      const imgWidth = contentWidth * 0.8;
      const imgHeight = (imgWidth * 3) / 4; // 4:3 비율
      const imgX = (pageWidth - imgWidth) / 2;
      const imgY = 60;
      
      doc.addImage(coverImg, "PNG", imgX, imgY, imgWidth, imgHeight);

      isFirstPage = false;
    } catch (error) {
      console.error("표지 이미지 로드 오류:", error);
    }
  } else {
    // 표지 이미지 없을 때 - 제목만
    doc.setFontSize(28);
    doc.setFont("helvetica", "bold");
    doc.text(bookData.title, pageWidth / 2, pageHeight / 2, { align: "center" });
    
    isFirstPage = false;
  }

  // 📄 내용 페이지들
  for (let i = 0; i < bookData.pages.length; i++) {
    const page = bookData.pages[i];
    
    if (!isFirstPage) {
      doc.addPage();
    }
    isFirstPage = false;

    // 페이지 번호
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.text(`${i + 1}`, pageWidth / 2, margin, { align: "center" });

    let currentY = margin + 10;

    // 페이지 이미지
    if (page.imageUrl) {
      try {
        const pageImg = await loadImageAsDataURL(page.imageUrl);
        const imgWidth = contentWidth * 0.9;
        const imgHeight = (imgWidth * 3) / 4; // 4:3 비율
        const imgX = (pageWidth - imgWidth) / 2;
        
        doc.addImage(pageImg, "PNG", imgX, currentY, imgWidth, imgHeight);
        currentY += imgHeight + 10;
      } catch (error) {
        console.error(`페이지 ${i + 1} 이미지 로드 오류:`, error);
      }
    }

    // 페이지 텍스트
    doc.setFontSize(14);
    doc.setFont("helvetica", "normal");
    
    // 텍스트를 여러 줄로 분할 (한글 지원 제한으로 영어/숫자 기준)
    const lines = doc.splitTextToSize(page.text, contentWidth);
    
    // 페이지를 벗어나지 않도록 체크
    const lineHeight = 7;
    const maxY = pageHeight - margin;
    
    for (const line of lines) {
      if (currentY + lineHeight > maxY) {
        doc.addPage();
        currentY = margin + 10;
      }
      doc.text(line, margin, currentY);
      currentY += lineHeight;
    }
  }

  // PDF 저장
  doc.save(filename);
}

/**
 * 이미지 URL을 Data URL로 로드
 * @param imageUrl 이미지 URL
 * @returns Data URL
 */
async function loadImageAsDataURL(imageUrl: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("Canvas context를 가져올 수 없습니다."));
        return;
      }
      
      ctx.drawImage(img, 0, 0);
      const dataURL = canvas.toDataURL("image/png");
      resolve(dataURL);
    };
    
    img.onerror = () => {
      reject(new Error("이미지를 로드할 수 없습니다."));
    };
    
    img.src = imageUrl;
  });
}

export default {
  generateStoryImage,
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
  generateStorybookPDF,
};
