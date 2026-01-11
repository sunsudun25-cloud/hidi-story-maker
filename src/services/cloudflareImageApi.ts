/**
 * Cloudflare Pages Functions API 클라이언트
 * 
 * OpenAI API를 직접 호출하는 대신 Cloudflare Pages Functions를 통해 프록시합니다.
 * 이를 통해 API 키를 클라이언트에 노출하지 않고 안전하게 보호합니다.
 */

// ✅ 지원 모델 타입 정의
export type ImageModel = "dall-e-3" | "gpt-image-1.5" | "gpt-image-1" | "gpt-image-1-mini";

// Cloudflare Pages Functions 엔드포인트
// 프로덕션: https://story-maker-4l6.pages.dev/api/generate-image
// 개발: 현재 origin 사용 (localhost 또는 sandbox)
const API_BASE_URL = typeof window !== 'undefined' 
  ? window.location.origin  // 현재 접속한 도메인 사용
  : 'https://story-maker-4l6.pages.dev';

const GENERATE_IMAGE_URL = `${API_BASE_URL}/api/generate-image`;

/**
 * Cloudflare Pages Function을 통해 이미지 생성 (멀티 모델 지원)
 * 
 * @param prompt 이미지 생성 프롬프트
 * @param style 스타일 옵션 (선택)
 * @param options 추가 옵션 (모델 선택 등)
 * @returns 생성된 이미지 URL (Base64 data URL)
 */
export async function generateImageViaCloudflare(
  prompt: string,
  style?: string,
  options?: { model?: ImageModel }  // ✅ 옵션 추가
): Promise<string> {
  console.log("🚀 [cloudflareImageApi] generateImageViaCloudflare 호출:", { 
    prompt, 
    style,
    model: options?.model || "dall-e-3 (기본값)"
  });

  try {
    console.log("📡 [cloudflareImageApi] Cloudflare Pages Function 호출:", GENERATE_IMAGE_URL);

    const response = await fetch(GENERATE_IMAGE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        prompt,
        style: style || "기본",
        model: options?.model  // ✅ 핵심: model 전달
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
      hasImageUrl: !!data.imageUrl,
      hasImageData: !!data.imageData,
      imageDataLength: (data.imageUrl || data.imageData)?.length,
      meta: data.meta  // ✅ 서버에서 내려주는 메타 정보 (모델, 시간 등)
    });

    // imageUrl 또는 imageData 필드에서 이미지 데이터 가져오기
    if (!data.success) {
      throw new Error(data.error || "이미지 생성 실패");
    }

    // ✅ 서버는 imageUrl/imageData 둘 다 주므로 안전하게 처리
    const imageResult = data.imageUrl || data.imageData;
    
    if (!imageResult) {
      throw new Error("이미지 데이터를 받지 못했습니다.");
    }

    console.log("✅ [cloudflareImageApi] 이미지 생성 완료", {
      modelUsed: data.meta?.requestedModel || "unknown"
    });
    
    return imageResult;  // data:image/png;base64,... 형식

  } catch (error) {
    console.error("❌ [cloudflareImageApi] 오류 발생:", error);
    throw error;
  }
}

export default {
  generateImageViaCloudflare
};
