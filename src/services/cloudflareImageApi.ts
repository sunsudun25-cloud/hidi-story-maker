/**
 * Cloudflare Pages Functions API 클라이언트
 * 
 * OpenAI API를 직접 호출하는 대신 Cloudflare Pages Functions를 통해 프록시합니다.
 * 이를 통해 API 키를 클라이언트에 노출하지 않고 안전하게 보호합니다.
 */

// Cloudflare Pages Functions 엔드포인트
// 항상 현재 origin 사용 (Preview, Production 모두 자체 Functions 보유)
function getApiBaseUrl(): string {
  if (typeof window === 'undefined') return '';
  
  const { protocol, hostname, port } = window.location;
  
  // localhost: http://localhost:3000
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return `${protocol}//${hostname}:${port || 3000}`;
  }
  
  // Preview/Production: 현재 origin 사용
  return `${protocol}//${hostname}`;
}

const API_BASE_URL = getApiBaseUrl();
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
  style?: string,
  options?: {
    model?: string;
    size?: string;
    quality?: string;
  }
): Promise<string> {
  console.log("🚀 [cloudflareImageApi] generateImageViaCloudflare 호출:", { 
    prompt, 
    style,
    model: options?.model,
    size: options?.size,
    quality: options?.quality
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
        model: options?.model || "dall-e-3",
        size: options?.size || "1024x1024",
        quality: options?.quality || "standard"
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
      fallback: data.fallback,
      hasImageUrl: !!data.imageUrl,
      hasImageData: !!data.imageData,
      imageDataLength: (data.imageUrl || data.imageData)?.length,
      request_id: data.request_id,
      model_used: data.model_used,
      size_used: data.size_used,
      quality_used: data.quality_used,
      timestamp: data.timestamp
    });

    // fallback 이미지 여부 확인
    if (data.fallback) {
      console.warn("⚠️ [cloudflareImageApi] Fallback 이미지 반환됨");
    }

    // imageUrl 또는 imageData 필드에서 이미지 데이터 가져오기
    const imageData = data.imageUrl || data.imageData;
    
    if (!data.success || !imageData) {
      const errorMsg = data.error || "이미지 데이터를 받지 못했습니다.";
      console.error("❌ [cloudflareImageApi] 오류:", {
        error: errorMsg,
        request_id: data.request_id,
        model_used: data.model_used
      });
      throw new Error(errorMsg);
    }

    console.log("✅ [cloudflareImageApi] 이미지 생성 완료", {
      request_id: data.request_id,
      model_used: data.model_used,
      fallback: data.fallback || false
    });
    
    return imageData;  // data:image/png;base64,... 형식

  } catch (error) {
    console.error("❌ [cloudflareImageApi] 오류 발생:", error);
    throw error;
  }
}

export default {
  generateImageViaCloudflare
};
