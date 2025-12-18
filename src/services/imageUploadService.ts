/**
 * 이미지 업로드 및 처리 서비스
 * 
 * 기능:
 * - 이미지 파일 선택 및 검증
 * - 이미지를 Base64로 변환
 * - 이미지 크기 제한 및 압축
 * - 이미지 미리보기
 */

export interface ImageUploadResult {
  base64: string;
  fileName: string;
  fileSize: number;
  width: number;
  height: number;
}

/**
 * 이미지 파일 유효성 검사
 */
export function validateImageFile(file: File): string | null {
  // 파일 타입 확인
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  if (!validTypes.includes(file.type)) {
    return '지원되는 이미지 형식이 아닙니다.\n\nJPEG, PNG, GIF, WebP 파일만 업로드 가능합니다.';
  }

  // 파일 크기 확인 (10MB 제한)
  const maxSize = 10 * 1024 * 1024; // 10MB
  if (file.size > maxSize) {
    return '파일 크기가 너무 큽니다.\n\n최대 10MB까지 업로드 가능합니다.';
  }

  return null; // 유효함
}

/**
 * 이미지 파일을 Base64로 변환
 */
export function convertImageToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      const result = reader.result as string;
      resolve(result);
    };

    reader.onerror = () => {
      reject(new Error('이미지 파일을 읽는 중 오류가 발생했습니다.'));
    };

    reader.readAsDataURL(file);
  });
}

/**
 * 이미지 크기 가져오기
 */
export function getImageDimensions(base64: string): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();

    img.onload = () => {
      resolve({
        width: img.width,
        height: img.height,
      });
    };

    img.onerror = () => {
      reject(new Error('이미지 크기를 확인할 수 없습니다.'));
    };

    img.src = base64;
  });
}

/**
 * 이미지 압축 (필요 시)
 * 
 * @param base64 - Base64 인코딩된 이미지
 * @param maxWidth - 최대 너비 (기본: 1024px)
 * @param maxHeight - 최대 높이 (기본: 1024px)
 * @param quality - 압축 품질 (0.0 ~ 1.0, 기본: 0.8)
 */
export function compressImage(
  base64: string,
  maxWidth: number = 1024,
  maxHeight: number = 1024,
  quality: number = 0.8
): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();

    img.onload = () => {
      let { width, height } = img;

      // 비율 유지하면서 크기 조정
      if (width > maxWidth || height > maxHeight) {
        const ratio = Math.min(maxWidth / width, maxHeight / height);
        width = width * ratio;
        height = height * ratio;
      }

      // Canvas에 그리기
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Canvas를 생성할 수 없습니다.'));
        return;
      }

      ctx.drawImage(img, 0, 0, width, height);

      // Base64로 변환
      const compressedBase64 = canvas.toDataURL('image/jpeg', quality);
      resolve(compressedBase64);
    };

    img.onerror = () => {
      reject(new Error('이미지 압축 중 오류가 발생했습니다.'));
    };

    img.src = base64;
  });
}

/**
 * 이미지 파일 업로드 처리
 * 
 * @param file - 업로드할 이미지 파일
 * @param compress - 이미지 압축 여부 (기본: true)
 * @returns 업로드 결과
 */
export async function processImageUpload(
  file: File,
  compress: boolean = true
): Promise<ImageUploadResult> {
  // 1. 파일 검증
  const validationError = validateImageFile(file);
  if (validationError) {
    throw new Error(validationError);
  }

  // 2. Base64 변환
  let base64 = await convertImageToBase64(file);

  // 3. 이미지 압축 (선택)
  if (compress) {
    console.log('🔄 이미지 압축 중...');
    base64 = await compressImage(base64);
  }

  // 4. 이미지 크기 확인
  const dimensions = await getImageDimensions(base64);

  return {
    base64,
    fileName: file.name,
    fileSize: file.size,
    width: dimensions.width,
    height: dimensions.height,
  };
}

/**
 * 파일 선택 다이얼로그 열기
 * 
 * @param onSelect - 파일 선택 시 콜백
 * @param accept - 허용할 파일 타입 (기본: image/*)
 */
export function openFileSelector(
  onSelect: (file: File) => void,
  accept: string = 'image/*'
): void {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = accept;

  input.onchange = (event) => {
    const target = event.target as HTMLInputElement;
    const file = target.files?.[0];

    if (file) {
      onSelect(file);
    }
  };

  input.click();
}

/**
 * 간편한 이미지 업로드 함수
 * 
 * @example
 * ```typescript
 * const result = await uploadImage();
 * console.log('업로드된 이미지:', result.base64);
 * ```
 */
export function uploadImage(compress: boolean = true): Promise<ImageUploadResult> {
  return new Promise((resolve, reject) => {
    openFileSelector(async (file) => {
      try {
        const result = await processImageUpload(file, compress);
        resolve(result);
      } catch (error) {
        reject(error);
      }
    });
  });
}
