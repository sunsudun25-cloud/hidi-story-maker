/**
 * Cloudflare Pages Functions API 클라이언트
 * 
 * OpenAI API를 직접 호출하는 대신 Cloudflare Pages Functions를 통해 프록시합니다.
 * 이를 통해 API 키를 클라이언트에 노출하지 않고 안전하게 보호합니다.
 */

// ✅ 지원 모델 타입 정의
export type ImageModel = "dall-e-3" | "gpt-image-1.5" | "gpt-image-1" | "gpt-image-1-mini";

// Cloudflare Pages Functions 엔드포인트 결정
// ✅ VITE_IMAGE_API_BASE_URL 환경 변수 사용 (절대 경로만 허용)
// Preview 환경에서 상대 경로 /api 호출 방지
function getApiBaseUrl(): string {
  // ✅ 환경 변수 우선 사용 (절대 경로만)
  const envOverride = import.meta.env.VITE_IMAGE_API_BASE_URL;
  if (envOverride) {
    // 절대 경로 검증 (http:// 또는 https://로 시작해야 함)
    if (!envOverride.startsWith('http://') && !envOverride.startsWith('https://')) {
      console.error('❌ [API] VITE_IMAGE_API_BASE_URL은 절대 경로여야 합니다:', envOverride);
      throw new Error('VITE_IMAGE_API_BASE_URL must be an absolute URL (http:// or https://)');
    }
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
  
  // AI Developer 환경: 메인 프로덕션 도메인 사용
  // (로컬에는 Functions가 없으므로 메인 도메인으로 직접 호출)
  if (hostname.includes('genspark') || 
      hostname.includes('e2b.dev') || 
      hostname.includes('sandbox.genspark')) {
    console.log('🧪 [API] AI Developer 감지, 메인 프로덕션 API 사용');
    return 'https://story-maker-4l6.pages.dev';
  }
  
  // Cloudflare Pages Preview 배포: 현재 origin 사용
  // (Preview 배포도 자체 Functions를 가지고 있음)
  if (hostname.includes('story-maker-4l6.pages.dev') && hostname !== 'story-maker-4l6.pages.dev') {
    console.log('🔀 [API] Cloudflare Preview 배포 감지, 현재 origin 사용:', window.location.origin);
    return window.location.origin;
  }
  
  // sandbox 환경: 프로덕션 API 사용
  if (hostname.includes('sandbox') || hostname.includes('novita.ai')) {
    console.log('🧪 [API] Sandbox 감지, 프로덕션 API 사용');
    return 'https://story-maker-4l6.pages.dev';
  }
  
  // 프로덕션: 현재 origin 사용 (CORS 회피)
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

  // ⚠️ AI Developer 환경에서는 더미 이미지 반환 (API 호출 불가)
  if (typeof window !== 'undefined' && 
      (window.location.hostname.includes('genspark') || 
       window.location.hostname.includes('e2b.dev'))) {
    console.warn("⚠️ [cloudflareImageApi] AI Developer 환경 감지, 더미 이미지 반환");
    
    // 프롬프트 기반 해시로 고유한 색상 생성
    const hashCode = (str: string) => {
      let hash = 0;
      for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
      }
      return hash;
    };
    
    const hash = hashCode(prompt + (style || ''));
    const hue = Math.abs(hash % 360);
    const saturation = 60 + (Math.abs(hash % 20));
    const lightness = 75 + (Math.abs(hash % 15));
    const backgroundColor = `hsl(${hue}, ${saturation}%, ${lightness}%)`;
    const textColor = `hsl(${hue}, ${saturation}%, 30%)`;
    
    // 타임스탬프로 고유성 보장
    const timestamp = new Date().getTime();
    const randomId = Math.random().toString(36).substring(7);
    
    // 간단한 SVG 더미 이미지 생성 (프롬프트마다 다른 색상)
    const dummyImageSvg = `
      <svg width="512" height="512" xmlns="http://www.w3.org/2000/svg">
        <rect width="512" height="512" fill="${backgroundColor}"/>
        <circle cx="256" cy="200" r="80" fill="${textColor}" opacity="0.3"/>
        <text x="50%" y="35%" text-anchor="middle" font-size="20" fill="${textColor}" font-family="Arial" font-weight="bold">
          🎨 AI Developer 미리보기
        </text>
        <text x="50%" y="50%" text-anchor="middle" font-size="15" fill="${textColor}" font-family="Arial">
          ${prompt.substring(0, 25)}${prompt.length > 25 ? '...' : ''}
        </text>
        <text x="50%" y="60%" text-anchor="middle" font-size="13" fill="${textColor}" font-family="Arial">
          스타일: ${style || '기본'}
        </text>
        <text x="50%" y="75%" text-anchor="middle" font-size="11" fill="${textColor}" font-family="Arial" opacity="0.7">
          프로덕션에서 실제 이미지 생성됩니다
        </text>
        <text x="50%" y="85%" text-anchor="middle" font-size="9" fill="${textColor}" font-family="Arial" opacity="0.5">
          ID: ${randomId} | ${new Date(timestamp).toLocaleTimeString()}
        </text>
      </svg>
    `;
    
    const base64 = btoa(unescape(encodeURIComponent(dummyImageSvg)));
    return `data:image/svg+xml;base64,${base64}`;
  }

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

    // ✅ imageData 우선 사용 (CORS 문제 회피)
    // imageData가 Data URL이면 외부 URL보다 안전함
    let imageResult = data.imageData || data.imageUrl;
    
    if (!imageResult) {
      throw new Error("이미지 데이터를 받지 못했습니다.");
    }

    // 🔄 HTTP URL인 경우 프록시를 통해 Data URL로 변환
    if (imageResult.startsWith('https://')) {
      console.log("🔄 [cloudflareImageApi] HTTP URL 감지, Data URL로 변환 중...");
      
      try {
        const proxyResponse = await fetch(`${API_BASE_URL}/api/proxy-image`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            imageUrl: imageResult
          })
        });

        if (proxyResponse.ok) {
          const proxyData = await proxyResponse.json();
          if (proxyData.success && proxyData.dataUrl) {
            console.log("✅ [cloudflareImageApi] Data URL 변환 성공");
            imageResult = proxyData.dataUrl;
          } else {
            console.warn("⚠️ [cloudflareImageApi] 프록시 실패, 원본 URL 사용");
          }
        } else {
          console.warn("⚠️ [cloudflareImageApi] 프록시 응답 실패, 원본 URL 사용");
        }
      } catch (proxyError) {
        console.warn("⚠️ [cloudflareImageApi] 프록시 에러, 원본 URL 사용:", proxyError);
        // 프록시 실패 시 원본 URL을 그대로 사용 (fallback)
      }
    }

    console.log("✅ [cloudflareImageApi] 이미지 생성 완료", {
      modelUsed: data.meta?.requestedModel || "unknown",
      imageType: imageResult.startsWith('data:') ? 'Data URL (CORS-safe)' : 'External URL'
    });
    
    return imageResult;  // data:image/png;base64,... 또는 https://... 형식

  } catch (error) {
    console.error("❌ [cloudflareImageApi] 오류 발생:", error);
    throw error;
  }
}

export default {
  generateImageViaCloudflare
};
