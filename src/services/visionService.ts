/**
 * OpenAI Vision API를 사용한 이미지 분석 서비스
 * 손글씨 인식, 이미지 설명 등
 */

export interface VisionAnalyzeResult {
  success: boolean;
  text?: string;
  error?: string;
}

/**
 * 손글씨 이미지를 분석하여 텍스트 추출
 * 
 * @param imageBase64 - Base64 인코딩된 이미지 (data:image/... 형식)
 * @returns 추출된 텍스트
 */
export async function analyzeHandwriting(imageBase64: string): Promise<string> {
  try {
    console.log('📸 [Vision] 손글씨 분석 시작');

    const response = await fetch('/api/analyze-image', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        imageBase64,
        type: 'handwriting',
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || '이미지 분석 실패');
    }

    const result: VisionAnalyzeResult = await response.json();

    if (!result.success || !result.text) {
      throw new Error(result.error || '텍스트를 추출할 수 없습니다');
    }

    console.log('✅ [Vision] 손글씨 분석 완료:', result.text.substring(0, 50));
    return result.text;
  } catch (error) {
    console.error('❌ [Vision] 손글씨 분석 오류:', error);
    throw error;
  }
}

/**
 * 이미지의 내용을 설명
 * 
 * @param imageBase64 - Base64 인코딩된 이미지 (data:image/... 형식)
 * @returns 이미지 설명
 */
export async function describeImage(imageBase64: string): Promise<string> {
  try {
    console.log('📸 [Vision] 이미지 설명 생성 시작');

    const response = await fetch('/api/analyze-image', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        imageBase64,
        type: 'general',
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || '이미지 분석 실패');
    }

    const result: VisionAnalyzeResult = await response.json();

    if (!result.success || !result.text) {
      throw new Error(result.error || '이미지를 설명할 수 없습니다');
    }

    console.log('✅ [Vision] 이미지 설명 완료:', result.text.substring(0, 50));
    return result.text;
  } catch (error) {
    console.error('❌ [Vision] 이미지 설명 오류:', error);
    throw error;
  }
}
