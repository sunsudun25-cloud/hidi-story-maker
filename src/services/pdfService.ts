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

export default {
  generateStorybookPDF,
  exportStorybookToPDF,
  previewStorybookPDF,
  generateStorybookPDFWithOptions,
};
