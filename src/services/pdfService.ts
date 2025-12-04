/**
 * PDF Service
 * PDF 생성, 내보내기 등 PDF 관련 기능
 */

/**
 * 동화책 페이지 데이터 타입
 */
export interface StorybookPage {
  text: string;
  imageUrl?: string;
}

/**
 * 동화책 데이터 타입
 */
export interface StorybookData {
  title: string;
  coverImageUrl?: string;
  pages: StorybookPage[];
}

/**
 * 동화책을 PDF로 생성 및 다운로드
 * @param bookData 동화책 데이터 (제목, 표지, 페이지 배열)
 * @param filename PDF 파일명
 */
export async function generateStorybookPDF(
  bookData: StorybookData,
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
    
    // 텍스트를 여러 줄로 분할
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

/**
 * 스토리북을 PDF로 생성 (간단 버전)
 * @param pages [{ text: string, image: base64 string }]
 * @param filename PDF 파일명
 */
export async function exportStorybookToPDF(
  pages: Array<{ text: string; image?: string | null }>,
  filename: string = "storybook.pdf"
): Promise<void> {
  const jsPDF = (await import("jspdf")).default;
  
  const doc = new jsPDF({
    unit: "pt",
    format: "a4",
  });

  pages.forEach((page, index) => {
    if (index !== 0) doc.addPage();

    // 페이지 제목
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(20);
    doc.text(`페이지 ${index + 1}`, 40, 50);

    // 이미지가 있다면 삽입
    if (page.image) {
      try {
        doc.addImage(page.image, "PNG", 40, 80, 350, 260); // 자동 크기 조정
      } catch (e) {
        console.warn("이미지 삽입 실패:", e);
      }
    }

    // 텍스트 삽입 (여백 넓게)
    doc.setFont("Helvetica", "normal");
    doc.setFontSize(14);

    const textY = page.image ? 360 : 100;

    const splitText = doc.splitTextToSize(page.text, 500);
    doc.text(splitText, 40, textY);
  });

  // 파일 다운로드
  doc.save(filename);
}

/**
 * PDF 미리보기 (준비 중)
 * @param bookData 동화책 데이터
 * @returns PDF Blob
 */
export async function previewStorybookPDF(bookData: StorybookData): Promise<Blob> {
  // TODO: PDF를 Blob으로 반환하여 미리보기 구현
  throw new Error("PDF 미리보기 기능은 준비 중입니다.");
}

/**
 * PDF 설정 옵션
 */
export interface PDFOptions {
  pageSize?: "a4" | "letter" | "legal";
  orientation?: "portrait" | "landscape";
  margin?: number;
  fontSize?: {
    title?: number;
    content?: number;
  };
  includePageNumbers?: boolean;
  watermark?: string;
}

/**
 * 고급 PDF 생성 옵션
 */
export interface EnhancedPDFOptions {
  pages: { text: string; image?: string | null }[];
  title: string;
  author: string;
  layout: "vertical" | "horizontal";
  usePastelBackground: boolean;
  textImageLayout: "image-right" | "image-top";
  coverImage?: string | null;
}

/**
 * 고급 설정으로 PDF 생성 (준비 중)
 * @param bookData 동화책 데이터
 * @param options PDF 설정 옵션
 * @param filename 파일명
 */
export async function generateStorybookPDFWithOptions(
  bookData: StorybookData,
  options: PDFOptions,
  filename: string = "storybook.pdf"
): Promise<void> {
  // TODO: 고급 옵션 지원
  throw new Error("고급 PDF 생성 기능은 준비 중입니다.");
}

/**
 * 강화된 PDF 생성기
 * 파스텔 배경, 커버 이미지, 다양한 레이아웃 지원
 * @param options 고급 PDF 생성 옵션
 */
export async function exportEnhancedPDF(options: EnhancedPDFOptions): Promise<void> {
  const jsPDF = (await import("jspdf")).default;

  const {
    pages,
    title,
    author,
    layout,
    usePastelBackground,
    textImageLayout,
    coverImage,
  } = options;

  // === 1. PDF 설정 ===
  const doc = new jsPDF({
    orientation: layout === "horizontal" ? "landscape" : "portrait",
    unit: "pt",
    format: "a4",
  });

  const width = doc.internal.pageSize.getWidth();
  const height = doc.internal.pageSize.getHeight();

  // ⭐ 파스텔톤 색상 목록
  const pastelColors = [
    "#FBE4E6", // 은은한 핑크
    "#E8F0FE", // 파스텔 블루
    "#EAF8E6", // 연녹색
    "#FFF4CC", // 크림
    "#F9EBFF", // 연보라
  ];

  // ======================================================
  // ===== 2. 표지 페이지 생성 =================================
  // ======================================================

  // 배경 색 적용
  if (usePastelBackground) {
    doc.setFillColor("#E8F0FE");
    doc.rect(0, 0, width, height, "F");
  }

  // 표지 이미지
  if (coverImage) {
    try {
      doc.addImage(coverImage, "PNG", 100, 80, width - 200, height / 2);
    } catch (e) {
      console.warn("표지 이미지 로드 실패");
    }
  }

  // 제목
  doc.setFont("Helvetica", "bold");
  doc.setFontSize(32);
  doc.text(title, width / 2, height - 200, { align: "center" });

  // 저자명
  doc.setFont("Helvetica", "normal");
  doc.setFontSize(18);
  doc.text(`Written by ${author}`, width / 2, height - 160, { align: "center" });

  // ======================================================
  // ===== 3. 본문 페이지 생성 =================================
  // ======================================================

  pages.forEach((page, index) => {
    doc.addPage();

    // 배경 넣기
    if (usePastelBackground) {
      const bg = pastelColors[index % pastelColors.length];
      doc.setFillColor(bg);
      doc.rect(0, 0, width, height, "F");
    }

    // 제목: 페이지 번호
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(18);
    doc.text(`Page ${index + 1}`, 40, 50);

    // ===== 상세 레이아웃 =====

    if (textImageLayout === "image-top" && page.image) {
      // 이미지 상단 + 텍스트 하단
      try {
        doc.addImage(page.image, "PNG", 40, 80, width - 80, 240);
      } catch (e) {
        console.warn(`페이지 ${index + 1} 이미지 추가 실패:`, e);
      }

      doc.setFont("Helvetica", "normal");
      doc.setFontSize(14);

      const contentY = 350;
      const lines = doc.splitTextToSize(page.text, width - 80);
      doc.text(lines, 40, contentY);
    } else if (textImageLayout === "image-right" && page.image) {
      // 텍스트 왼쪽 + 이미지 오른쪽
      const half = width / 2 - 60;

      // 텍스트
      doc.setFont("Helvetica", "normal");
      doc.setFontSize(14);
      const lines = doc.splitTextToSize(page.text, half);
      doc.text(lines, 40, 80);

      // 이미지
      try {
        doc.addImage(page.image, "PNG", width / 2 + 20, 80, half, half);
      } catch (e) {
        console.warn(`페이지 ${index + 1} 이미지 추가 실패:`, e);
      }
    } else {
      // 텍스트만 있는 페이지
      doc.setFont("Helvetica", "normal");
      doc.setFontSize(14);
      const lines = doc.splitTextToSize(page.text, width - 80);
      doc.text(lines, 40, 100);
    }
  });

  // ======================================================
  // ===== 4. 파일 저장 =====================================
  // ======================================================

  doc.save(`${title}.pdf`);
}

/**
 * 간단한 PDF 생성 함수
 * @param items 작품 배열 (title, image, description)
 */
export async function makePDF(items: Array<{
  title?: string;
  image?: string;
  description?: string;
}>): Promise<void> {
  const { default: jsPDF } = await import("jspdf");
  
  const pdf = new jsPDF({
    unit: "pt",
    format: "a4",
  });

  items.forEach((item, index) => {
    if (index !== 0) pdf.addPage();

    // 제목
    pdf.setFontSize(20);
    pdf.text(item.title || "작품 제목 없음", 40, 60);

    // 이미지
    if (item.image) {
      try {
        pdf.addImage(item.image, "JPEG", 40, 100, 500, 500);
      } catch (error) {
        console.error(`이미지 ${index + 1} 추가 오류:`, error);
      }
    }

    // 설명
    pdf.setFontSize(14);
    const lines = pdf.splitTextToSize(item.description || "", 500);
    pdf.text(lines, 40, 630);
  });

  pdf.save("my_storybook.pdf");
}

/**
 * Story 타입 (html2canvas 기반 PDF용)
 */
export interface Story {
  id: string;
  title: string;
  image?: string;
  description?: string;
  content?: string;
}

/**
 * PDF 옵션 인터페이스
 */
export interface StoryPDFOptions {
  margin?: "small" | "normal" | "large";
  fontSize?: "small" | "medium" | "large";
}

/**
 * jsPDF를 활용한 Story PDF 생성
 * 표지 페이지 + 텍스트 본문 렌더링
 * @param story Story 데이터
 * @param options PDF 생성 옵션
 */
export async function generateStoryPDF(
  story: Story,
  options: StoryPDFOptions = {}
): Promise<void> {
  const { default: jsPDF } = await import("jspdf");

  const pdf = new jsPDF({
    format: "a4",
    unit: "px",
  });

  // ----- 옵션 반영 -----
  const marginMap = {
    small: 20,
    normal: 40,
    large: 70,
  };

  const fontMap = {
    small: 12,
    medium: 16,
    large: 20,
  };

  const margin = marginMap[options.margin || "normal"];
  const fontSize = fontMap[options.fontSize || "medium"];

  // ----- 📌 표지 생성 -----
  pdf.setFillColor("#F4F4F4");
  pdf.rect(0, 0, 595, 842, "F");

  pdf.setFontSize(28);
  pdf.setTextColor("#333");
  pdf.text(story.title, 297, 200, { align: "center" });

  if (story.image) {
    try {
      const img = await loadImageForPDF(story.image);
      const imgWidth = 350;
      const imgHeight = (img.height / img.width) * imgWidth;

      pdf.addImage(img, "JPEG", 123, 260, imgWidth, imgHeight);
    } catch (error) {
      console.error("표지 이미지 로드 오류:", error);
    }
  }

  pdf.setFontSize(12);
  pdf.setTextColor("#777");
  pdf.text("AI Story Maker · Cover", 297, 780, { align: "center" });

  // ----- 📌 본문 페이지 -----
  pdf.addPage();

  const pageWidth = pdf.internal.pageSize.getWidth();
  const usableWidth = pageWidth - margin * 2;

  pdf.setFontSize(fontSize);
  pdf.setTextColor("#000");

  // 텍스트 내용 (description 또는 content 사용)
  const textContent = story.description || story.content || "";
  
  if (textContent) {
    const lines = pdf.splitTextToSize(textContent, usableWidth);
    pdf.text(lines, margin, margin);
  }

  // ----- 📌 파일 저장 -----
  const filename = `Story_${story.title}_${new Date().toISOString().slice(0, 10)}.pdf`;
  pdf.save(filename);
}

/**
 * 이미지 로드 헬퍼 함수 (Promise 기반)
 * @param src 이미지 소스 URL
 * @returns Image 객체
 */
function loadImageForPDF(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("이미지 로드 실패"));
    img.src = src;
  });
}

export default {
  generateStorybookPDF,
  exportStorybookToPDF,
  exportEnhancedPDF,
  previewStorybookPDF,
  generateStorybookPDFWithOptions,
  makePDF,
  generateStoryPDF,
};
