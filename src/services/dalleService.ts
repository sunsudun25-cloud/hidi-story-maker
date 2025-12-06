/**
 * DALL-E 3 Image Generation Service
 * OpenAI의 DALL-E 3 모델을 사용하여 이미지를 생성합니다.
 */

/**
 * DALL-E 3 이미지 생성 (HTTP URL 반환)
 * @param prompt 이미지 생성 프롬프트
 * @param style 스타일 옵션 (선택)
 * @returns 생성된 이미지의 HTTP URL
 */
export async function generateDalleImage(
  prompt: string,
  style?: string
): Promise<string> {
  console.log("🎯 [dalleService] generateDalleImage 함수 시작:", { prompt, style });
  
  const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;

  if (!OPENAI_API_KEY) {
    console.error("❌ [dalleService] OPENAI_API_KEY가 없습니다!");
    throw new Error("⚠️ VITE_OPENAI_API_KEY가 설정되지 않았습니다!");
  }

  console.log("✅ [dalleService] OPENAI_API_KEY 확인됨:", OPENAI_API_KEY.substring(0, 20) + "...");

  // 스타일에 따른 프롬프트 변환
  const styleMap: Record<string, string> = {
    "수채화": "watercolor painting style",
    "watercolor": "watercolor painting style",
    "동화풍": "fairytale illustration style",
    "fairytale": "fairytale illustration style",
    "파스텔톤": "soft pastel colors style",
    "pastel": "soft pastel colors style",
    "따뜻한 스타일": "warm and cozy atmosphere",
    "warm": "warm and cozy atmosphere",
    "애니메이션": "anime illustration style",
    "연필스케치": "pencil sketch style",
    "기본": "illustration style",
    "기본 스타일": "illustration style"
  };

  const stylePrompt = styleMap[style || "기본"] || "illustration style";
  const fullPrompt = `${prompt}. ${stylePrompt}. High quality, detailed, no text or watermarks. Professional artwork.`;

  console.log("🎨 [dalleService] DALL-E 3 이미지 생성 중:", fullPrompt);

  try {
    console.log("📡 [dalleService] OpenAI API 호출...");
    
    const response = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "dall-e-3",
        prompt: fullPrompt,
        n: 1,
        size: "1024x1024",
        quality: "standard"
      })
    });

    console.log("📥 [dalleService] API 응답:", { 
      status: response.status, 
      statusText: response.statusText,
      ok: response.ok 
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("❌ [dalleService] OpenAI API 오류:", errorData);
      throw new Error(`이미지 생성 실패: ${errorData.error?.message || response.statusText}`);
    }

    const data = await response.json();
    console.log("📦 [dalleService] API 응답 데이터:", data);
    
    const imageUrl = data.data[0].url;

    if (!imageUrl) {
      console.error("❌ [dalleService] 이미지 URL이 비어있습니다!");
      throw new Error("이미지 URL을 받지 못했습니다.");
    }

    console.log("✅ [dalleService] 이미지 생성 완료 (HTTP URL):", imageUrl);
    return imageUrl;
  } catch (error) {
    console.error("❌ [dalleService] 이미지 생성 오류:", error);
    throw error;
  }
}

/**
 * DALL-E 3 이미지 생성 (Base64 반환)
 * @param prompt 이미지 생성 프롬프트
 * @param style 스타일 옵션 (선택)
 * @returns 생성된 이미지의 Base64 Data URL
 */
export async function generateDalleImageBase64(
  prompt: string,
  style?: string
): Promise<string> {
  console.log("🎯 [dalleService] generateDalleImageBase64 함수 시작:", { prompt, style });
  
  const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;

  if (!OPENAI_API_KEY) {
    console.error("❌ [dalleService] OPENAI_API_KEY가 없습니다!");
    throw new Error("⚠️ VITE_OPENAI_API_KEY가 설정되지 않았습니다!");
  }

  console.log("✅ [dalleService] OPENAI_API_KEY 확인됨:", OPENAI_API_KEY.substring(0, 20) + "...");

  // 스타일에 따른 프롬프트 변환
  const styleMap: Record<string, string> = {
    "수채화": "watercolor painting style",
    "watercolor": "watercolor painting style",
    "동화풍": "fairytale illustration style",
    "fairytale": "fairytale illustration style",
    "파스텔톤": "soft pastel colors style",
    "pastel": "soft pastel colors style",
    "따뜻한 스타일": "warm and cozy atmosphere",
    "warm": "warm and cozy atmosphere",
    "애니메이션": "anime illustration style",
    "연필스케치": "pencil sketch style",
    "기본": "illustration style",
    "기본 스타일": "illustration style"
  };

  const stylePrompt = styleMap[style || "기본"] || "illustration style";
  const fullPrompt = `${prompt}. ${stylePrompt}. High quality, detailed, no text or watermarks. Professional artwork.`;

  console.log("🎨 [dalleService] DALL-E 3 이미지 생성 중 (Base64):", fullPrompt);

  try {
    console.log("📡 [dalleService] OpenAI API 호출 (Base64 요청)...");
    
    const response = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "dall-e-3",
        prompt: fullPrompt,
        n: 1,
        size: "1024x1024",
        quality: "standard",
        response_format: "b64_json"  // Base64 요청
      })
    });

    console.log("📥 [dalleService] API 응답:", { 
      status: response.status, 
      statusText: response.statusText,
      ok: response.ok 
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("❌ [dalleService] OpenAI API 오류:", errorData);
      throw new Error(`이미지 생성 실패: ${errorData.error?.message || response.statusText}`);
    }

    const data = await response.json();
    console.log("📦 [dalleService] API 응답 데이터 (Base64 포함)");
    
    const base64Data = data.data[0].b64_json;

    if (!base64Data) {
      console.error("❌ [dalleService] Base64 데이터가 비어있습니다!");
      throw new Error("Base64 이미지 데이터를 받지 못했습니다.");
    }

    const dataUrl = `data:image/png;base64,${base64Data}`;
    console.log("✅ [dalleService] 이미지 생성 완료 (Base64, 길이:", base64Data.length, ")");
    
    return dataUrl;
  } catch (error) {
    console.error("❌ [dalleService] 이미지 생성 오류:", error);
    throw error;
  }
}

export default {
  generateDalleImage,
  generateDalleImageBase64
};
