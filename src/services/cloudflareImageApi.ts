/**
 * Cloudflare Pages Functions API 클라이언트
 * 
 * OpenAI API를 직접 호출하는 대신 Cloudflare Pages Functions를 통해 프록시합니다.
 * 이를 통해 API 키를 클라이언트에 노출하지 않고 안전하게 보호합니다.
 */

// ✅ 지원 모델 타입 정의
export type ImageModel = "dall-e-3" | "gpt-image-1.5" | "gpt-image-1" | "gpt-image-1-mini";

// Cloudflare Pages Functions 엔드포인트 결정
// 1순위: 환경 변수 override (VITE_API_BASE_URL)
// 2순위: localhost → 현재 origin 사용
// 3순위: 프로덕션 → Pages 도메인 사용
function getApiBaseUrl(): string {
  // 환경 변수 override (빌드 시 설정 가능)
  const envOverride = import.meta.env.VITE_API_BASE_URL;
  if (envOverride) {
    console.log('🔧 [API] 환경 변수 override 사용:', envOverride);
    return envOverride;
  }

  // 브라우저 환경에서만 window 사용
  if (typeof window === 'undefined') {
    return 'https://story-maker-4l6.pages.dev';
  }

  const hostname = window.location.hostname;
  
  // localhost: 현재 origin 사용 (개발 서버)
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    console.log('🏠 [API] localhost 감지, 현재 origin 사용:', window.location.origin);
    return window.location.origin;
  }
  
  // sandbox 환경: 현재 origin 사용
  if (hostname.includes('sandbox') || hostname.includes('novita.ai')) {
    console.log('🧪 [API] Sandbox 감지, 현재 origin 사용:', window.location.origin);
    return window.location.origin;
  }
  
  // 프로덕션: Pages 도메인 사용 (CORS 회피)
  console.log('🌍 [API] 프로덕션 감지, 현재 origin 사용:', window.location.origin);
  return window.location.origin;
}

const API_BASE_URL = getApiBaseUrl();
const GENERATE_IMAGE_URL = `${API_BASE_URL}/api/generate-image`;

console.log('📍 [API] 최종 API 엔드포인트:', GENERATE_IMAGE_URL);

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
