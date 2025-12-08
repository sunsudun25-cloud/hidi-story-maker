/**
 * Firebase Functions API 클라이언트
 * 
 * OpenAI API를 직접 호출하는 대신 Firebase Functions를 통해 프록시합니다.
 * 이를 통해 API 키를 클라이언트에 노출하지 않고 안전하게 보호합니다.
 */

// Firebase Functions 베이스 URL (프로덕션)
// Cloud Run URLs from Firebase Functions v2
// 자동으로 올바른 리전의 함수를 호출합니다
const FIREBASE_PROJECT_ID = "story-make-fbbd7";
const FIREBASE_REGION = "asia-northeast1";
const GENERATE_IMAGE_URL = `https://${FIREBASE_REGION}-${FIREBASE_PROJECT_ID}.cloudfunctions.net/generateImage`;
const HEALTH_URL = `https://${FIREBASE_REGION}-${FIREBASE_PROJECT_ID}.cloudfunctions.net/health`;

/**
 * Firebase Functions를 통해 DALL-E 3 이미지 생성
 * 
 * @param prompt 이미지 생성 프롬프트
 * @param style 스타일 옵션 (선택)
 * @returns 생성된 이미지 URL (Base64 data URL)
 */
export async function generateImageViaFirebase(
  prompt: string,
  style?: string
): Promise<string> {
  console.log("🚀 [firebaseFunctions] generateImageViaFirebase 호출:", { prompt, style });

  try {
    // Firebase Functions 엔드포인트 (Cloud Run URL)
    const functionUrl = GENERATE_IMAGE_URL;
    
    console.log("📡 [firebaseFunctions] Firebase Functions 호출:", functionUrl);

    const response = await fetch(functionUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        prompt,
        style: style || "기본"
      })
    });

    console.log("📥 [firebaseFunctions] 응답 수신:", {
      status: response.status,
      statusText: response.statusText,
      ok: response.ok
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: response.statusText }));
      console.error("❌ [firebaseFunctions] 오류 응답:", errorData);
      throw new Error(errorData.error || `이미지 생성 실패: ${response.statusText}`);
    }

    const data = await response.json();
    console.log("📦 [firebaseFunctions] 응답 데이터:", {
      success: data.success,
      hasImageData: !!data.imageData,
      imageDataLength: data.imageData?.length
    });

    // imageData 필드에서 이미지 데이터 가져오기
    if (!data.success || !data.imageData) {
      throw new Error(data.error || "이미지 데이터를 받지 못했습니다.");
    }

    console.log("✅ [firebaseFunctions] 이미지 생성 완료");
    return data.imageData;  // data:image/png;base64,... 형식

  } catch (error) {
    console.error("❌ [firebaseFunctions] 오류 발생:", error);
    throw error;
  }
}

/**
 * Firebase Functions 헬스체크
 * 
 * @returns { status: string, timestamp: number, region: string }
 */
export async function checkFirebaseFunctionsHealth(): Promise<{ 
  status: string; 
  timestamp: number;
  region: string;
}> {
  try {
    const response = await fetch(HEALTH_URL);
    const data = await response.json();
    console.log("✅ [firebaseFunctions] 헬스체크 성공:", data);
    return data;
  } catch (error) {
    console.error("❌ [firebaseFunctions] 헬스체크 실패:", error);
    throw error;
  }
}

export default {
  generateImageViaFirebase,
  checkFirebaseFunctionsHealth
};
