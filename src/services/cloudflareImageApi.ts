/**
 * Cloudflare Pages Functions API 클라이언트
 * 
 * OpenAI API를 직접 호출하는 대신 Cloudflare Pages Functions를 통해 프록시합니다.
 * 이를 통해 API 키를 클라이언트에 노출하지 않고 안전하게 보호합니다.
 */

// Cloudflare Pages Functions 엔드포인트
// ✅ 현재 접속한 도메인 사용 (CORS 문제 방지)
function getApiBaseUrl(): string {
  if (typeof window === 'undefined') return '';
  
  const { protocol, hostname, port } = window.location;
  
  // localhost: http://localhost:3000
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return `${protocol}//${hostname}:${port || 3000}`;
  }
  
  // ✅ 현재 접속한 도메인 그대로 사용 (CORS 방지)
  // www.story-maker.io, story-maker-4l6.pages.dev 등 모두 동일하게 작동
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
    promptLength: prompt.length,
    promptPreview: prompt.substring(0, 200) + "...",
    style,
    model: options?.model,
    size: options?.size,
    quality: options?.quality
  });

  try {
    // ✅ 모델에 따라 엔드포인트 선택
    const model = options?.model || "dall-e-3";
    const isGptImage = model.startsWith("gpt-image");
    const apiUrl = isGptImage 
      ? `${API_BASE_URL}/api/generate-image-realistic`  // GPT Image 전용
      : GENERATE_IMAGE_URL;  // DALL-E 3 전용
    
    console.log("📡 [cloudflareImageApi] Cloudflare Pages Function 호출:", apiUrl);
    console.log("🎨 [cloudflareImageApi] 모델 선택:", { model, isGptImage, endpoint: isGptImage ? 'realistic' : 'dalle3' });

    const requestBody = {
      // ✅ 프롬프트에 스타일이 포함되어 있으면 prompt로 보내서 서버 스타일 매핑 건너뛰기
      // userText가 아닌 prompt로 보내면 서버가 스타일 매핑을 적용하지 않음
      prompt: prompt,  // 완성된 프롬프트를 그대로 전달
      model: model,
      size: options?.size || "1024x1024",
      quality: options?.quality || (isGptImage ? "high" : "hd")
    };

    console.log("📤 [STEP 3 - 서버 전송 직전] Request Body:", JSON.stringify(requestBody, null, 2));
    console.log("📤 [STEP 3 - FULL PROMPT]", prompt);

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
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
    
    // ✅ 더미 이미지 감지
    const responseImageData = data.imageUrl || data.imageData;
    const imageSize = responseImageData?.length || 0;
    const isDummy = data.isDummy || data.usePlaceholder || imageSize < 10000;
    
    // ⭐ 전체 프롬프트 로그 출력
    if (data.debug?.finalPromptFull) {
      console.log("📝 [FULL_PROMPT]", data.debug.finalPromptFull);
    }
    
    // ✅ 표준 응답 로그
    console.log("[GEN_RESPONSE]", {
      success: data.success,
      fallback: data.fallback || false,
      isDummy: isDummy,
      usePlaceholder: data.usePlaceholder || false,
      request_id: data.request_id,
      model_used: data.model_used,
      size_used: data.size_used,
      quality_used: data.quality_used,
      imageSize: imageSize,
      imageLength: imageSize
    });
    
    console.log("📦 [cloudflareImageApi] 응답 데이터:", {
      success: data.success,
      fallback: data.fallback,
      isDummy: isDummy,
      usePlaceholder: data.usePlaceholder,
      hasImageUrl: !!data.imageUrl,
      hasImageData: !!data.imageData,
      imageSize: imageSize,
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
    
    // ✅ 더미 이미지 경고
    if (isDummy) {
      console.error("🚨 [cloudflareImageApi] 더미 이미지 감지!", {
        isDummy: data.isDummy,
        usePlaceholder: data.usePlaceholder,
        imageSize: imageSize,
        reason: imageSize < 10000 ? "이미지 크기 너무 작음 (< 10KB)" : "서버에서 더미 플래그"
      });
      alert(`⚠️ 더미 이미지가 생성되었습니다!\n\n이미지 크기: ${imageSize} bytes\n확인: Preview 환경이거나 OpenAI API 키가 없습니다.`);
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
