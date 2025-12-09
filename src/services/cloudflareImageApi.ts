/**
 * Cloudflare Pages Functions API 클라이언트
 * 
 * OpenAI API를 직접 호출하는 대신 Cloudflare Pages Functions를 통해 프록시합니다.
 * 이를 통해 API 키를 클라이언트에 노출하지 않고 안전하게 보호합니다.
 */

// Cloudflare Pages Functions 엔드포인트
// 프로덕션: https://story-maker-4l6.pages.dev/api/generate-image
// 개발: http://localhost:3000/api/generate-image
const API_BASE_URL = typeof window !== 'undefined' && window.location.hostname === 'localhost' 
  ? 'http://localhost:3000'
  : 'https://story-maker-4l6.pages.dev';

const GENERATE_IMAGE_URL = `${API_BASE_URL}/api/generate-image`;

/**
 * Cloudflare Pages Function을 통해 DALL-E 3 이미지 생성
 * 
 * @param prompt 이미지 생성 프롬프트
 * @param style 스타일 옵션 (선택)
 * @returns 생성된 이미지 URL (Base64 data URL)
 */
export async function generateImageViaCloudflare(
  prompt: string,
  style?: string
): Promise<string> {
  console.log("🚀 [cloudflareImageApi] generateImageViaCloudflare 호출:", { prompt, style });

  try {
    console.log("📡 [cloudflareImageApi] Cloudflare Pages Function 호출:", GENERATE_IMAGE_URL);

    const response = await fetch(GENERATE_IMAGE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        prompt,
        style: style || "기본"
      })
    });

    console.log("📥 [cloudflareImageApi] 응답 수신:", {
      status: response.status,
      statusText: response.statusText,
      ok: response.ok
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: response.statusText }));
      console.error("❌ [cloudflareImageApi] 오류 응답:", errorData);
      throw new Error(errorData.error || `이미지 생성 실패: ${response.statusText}`);
    }

    const data = await response.json();
    console.log("📦 [cloudflareImageApi] 응답 데이터:", {
      success: data.success,
      hasImageData: !!data.imageData,
      imageDataLength: data.imageData?.length
    });

    // imageData 필드에서 이미지 데이터 가져오기
    if (!data.success || !data.imageData) {
      throw new Error(data.error || "이미지 데이터를 받지 못했습니다.");
    }

    console.log("✅ [cloudflareImageApi] 이미지 생성 완료");
    return data.imageData;  // data:image/png;base64,... 형식

  } catch (error) {
    console.error("❌ [cloudflareImageApi] 오류 발생:", error);
    throw error;
  }
}

export default {
  generateImageViaCloudflare
};
