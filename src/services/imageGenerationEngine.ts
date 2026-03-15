/**
 * 이미지 생성 엔진
 * - 스타일별 이미지 생성 전담
 * - 마스터 이미지 생성
 * - 4컷 파생 생성
 * - 프롬프트 구성 및 API 호출
 * - 디버깅 로그 관리
 */

import { getStylePreset, type StylePreset } from './stylePresets';
import { 
  createMasterImageInfo, 
  saveMasterImage, 
  getMasterImage,
  type MasterImageInfo,
  type MasterImageRequest 
} from './masterImageManager';

/**
 * 이미지 생성 요청
 */
export interface ImageGenerationRequest {
  // 마스터 이미지 생성
  type: "master" | "variant";
  
  // 마스터 이미지 생성 시 필요
  masterRequest?: MasterImageRequest;
  
  // 파생 이미지 생성 시 필요
  masterId?: string;
  cutNumber?: number;
  cutTitle?: string;
  question?: string;
  answer?: string;
  
  // 공통
  customPrompt?: string;
}

/**
 * 이미지 생성 응답
 */
export interface ImageGenerationResponse {
  success: boolean;
  imageUrl?: string;
  masterId?: string;
  error?: string;
  
  // 디버깅 정보
  debug?: {
    scenePrompt: string;
    stylePrompt: string;
    compositionPrompt: string;
    negativePrompt: string;
    finalPrompt: string;
    model: string;
    size: string;
    quality: string;
    requestBody: any;
  };
}

/**
 * 장소 이름 영어 변환 (한글 텍스트 방지)
 */
const LOCATION_MAP: Record<string, string> = {
  "편의점 앞": "in front of convenience store",
  "고속도로 휴게소": "at highway rest area",
  "기차역 플랫폼": "at train station platform",
  "공원 벤치": "at park bench",
  "버스 정류장": "at bus stop",
  "카페 테라스": "at cafe terrace",
  "도서관 입구": "at library entrance",
  "아파트 단지": "at apartment complex",
  "학교 운동장": "at school playground",
  "병원 로비": "at hospital lobby"
};

/**
 * 장면 프롬프트 생성
 */
function buildScenePrompt(request: MasterImageRequest): string {
  const locationEn = LOCATION_MAP[request.location] || request.location;
  
  const interviewer = request.interviewer === "male"
    ? "Korean male reporter age 30, short black hair, business suit with tie, ONLY ONE microphone in left hand, right hand at side, both hands completely visible, NEVER hands in pockets"
    : "Korean female reporter age 30, neat short hair, business suit, ONLY ONE microphone in left hand, right hand at side, both hands completely visible, NEVER hands in pockets";
  
  const intervieweeMap: Record<string, string> = {
    grandmother: "Korean grandmother age 70, white hair, warm expression, comfortable clothing, both hands clasped together in front, NO microphone, hands completely visible, ABSOLUTELY NO hands in pockets",
    grandfather: "Korean grandfather age 70, white hair, gentle expression, comfortable clothing, both hands clasped together in front, NO microphone, hands completely visible, ABSOLUTELY NO hands in pockets",
    youngman: "Korean young man age 20, black hair, bright expression, casual clothing, both hands at sides naturally, NO microphone, hands completely visible outside, ABSOLUTELY NO hands in pockets or behind back",
    youngwoman: "Korean young woman age 20, black hair, bright expression, casual clothing, both hands at sides naturally, NO microphone, hands completely visible outside, ABSOLUTELY NO hands in pockets or behind back",
    children: "Korean elementary school boy student, MUST look exactly 8 years old (ABSOLUTELY NOT 12+, NOT teenager, NOT young adult), extremely short child height (120cm tall, much shorter than adult), very round chubby innocent child face, baby face features, short messy black hair, very big round innocent eyes, wide cheerful child smile showing baby teeth, wearing colorful children's t-shirt with cartoon character and denim shorts, visibly small child body with short arms and legs, child proportions (head larger relative to body), NO microphone, both hands and arms completely visible outside at sides, small child hands, NEVER EVER hands in pockets or behind back",
    boyChild: "Korean young elementary school boy (lower grades, 7-8 years old), student appearance, short black hair, cheerful youthful expression, wearing casual children's t-shirt and shorts, NO microphone, both hands completely visible at sides, arms relaxed at sides, ABSOLUTELY NO hands in pockets or behind back",
    girlChild: "Korean young elementary school girl (lower grades, 7-8 years old), student appearance, short black hair with hair clips, cheerful youthful expression, wearing casual children's dress or t-shirt, NO microphone, both hands completely visible at sides, arms relaxed at sides, ABSOLUTELY NO hands in pockets or behind back",
    dog: "Golden Retriever dog, bright brown fur, sitting calmly",
    cat: "Gray cat, sitting quietly"
  };
  
  const interviewee = intervieweeMap[request.interviewee] || intervieweeMap.youngman;
  
  // 커스텀 외모/의상 추가 (한글 필터링)
  let customParts = [];
  if (request.customAppearance) {
    // 한글이 포함되어 있으면 제외
    const cleaned = request.customAppearance.replace(/[\uAC00-\uD7A3]+/g, '').trim();
    if (cleaned.length > 0) customParts.push(cleaned);
  }
  if (request.customClothing) {
    const cleaned = request.customClothing.replace(/[\uAC00-\uD7A3]+/g, '').trim();
    if (cleaned.length > 0) customParts.push(cleaned);
  }
  if (request.customFeatures) {
    const cleaned = request.customFeatures.replace(/[\uAC00-\uD7A3]+/g, '').trim();
    if (cleaned.length > 0) customParts.push(cleaned);
  }
  
  const customText = customParts.length > 0 ? `, ${customParts.join(', ')}` : '';
  
  return `Interview scene ${locationEn}. On left: ${interviewer}. On right: ${interviewee}${customText}. They face each other.`;
}

/**
 * 최종 프롬프트 조합
 */
function buildFinalPrompt(
  scenePrompt: string,
  preset: StylePreset,
  customPrompt?: string
): {
  scenePrompt: string;
  stylePrompt: string;
  compositionPrompt: string;
  negativePrompt: string;
  finalPrompt: string;
} {
  const parts = [
    preset.scenePrefix,
    scenePrompt,
    preset.styleSuffix,
    preset.compositionGuide,
    customPrompt || "",
    preset.negativePrompt
  ].filter(p => p.trim().length > 0);
  
  return {
    scenePrompt,
    stylePrompt: preset.styleSuffix,
    compositionPrompt: preset.compositionGuide,
    negativePrompt: preset.negativePrompt,
    finalPrompt: parts.join(" ").replace(/\s+/g, " ").trim()
  };
}

/**
 * Cloudflare API 호출
 */
async function callImageAPI(
  prompt: string,
  model: string,
  size: string,
  quality: string
): Promise<string> {
  // ⏱️ [T0] 요청 시작
  const t0 = Date.now();
  console.log("⏱️ [T0] Request start", {
    timestamp: t0,
    model,
    size,
    quality
  });
  
  // 🆕 실사 스타일은 GPT Image 1.5 전용 엔드포인트 사용
  const isRealistic = model.startsWith("gpt-image");
  const API_URL = isRealistic 
    ? "/api/generate-image-realistic"  // 🆕 실사 전용 (GPT Image 1.5)
    : "/api/generate-image";           // 기존 (DALL-E 3)
  
  const requestBody: any = {
    prompt,
    model,
    n: 1
  };
  
  // GPT Image 모델
  if (model.startsWith("gpt-image")) {
    requestBody.size = size;
    requestBody.quality = quality;
    // response_format과 style은 포함하지 않음 (GPT Image에서 지원 안 함)
  }
  // DALL-E 3 모델
  else if (model === "dall-e-3") {
    requestBody.size = size;
    requestBody.quality = quality;
    requestBody.response_format = "b64_json";
  }
  
  console.log("🔍 [IMAGE ENGINE] API Request:", {
    url: API_URL,
    model,
    size,
    quality,
    promptLength: prompt.length,
    isRealistic,  // 🆕 실사 여부 로그
    requestBody
  });
  
  // ⏱️ [T1] Cloudflare Function 호출 직전
  const t1 = Date.now();
  console.log("⏱️ [T1] Before Cloudflare Function call", {
    timestamp: t1,
    elapsed_setup: t1 - t0,
    message: "브라우저 → Cloudflare 준비 시간"
  });
  
  const response = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(requestBody)
  });
  
  // ⏱️ [T2] Cloudflare Function 응답 (OpenAI 포함)
  const t2 = Date.now();
  console.log("⏱️ [T2] After Cloudflare Function response", {
    timestamp: t2,
    elapsed_cloudflare_total: t2 - t1,
    message: "Cloudflare → OpenAI → 응답 총 시간 (OpenAI 생성 시간 포함)"
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    console.error("❌ [IMAGE ENGINE] API Error:", errorText);
    throw new Error(`API Error ${response.status}: ${errorText}`);
  }
  
  const data = await response.json();
  
  // ⏱️ [T3] JSON 파싱 완료
  const t3 = Date.now();
  console.log("⏱️ [T3] After JSON parsing", {
    timestamp: t3,
    elapsed_parsing: t3 - t2,
    message: "응답 JSON 파싱 시간"
  });
  
  console.log("✅ [IMAGE ENGINE] API Response:", {
    hasImageUrl: !!data.imageUrl,
    hasImageData: !!data.imageData,
    model: data.model,
    size: data.size,
    isRealistic  // 🆕 실사 여부 로그
  });
  
  // ⏱️ [T4] 이미지 URL 반환 준비
  const imageUrl = data.imageUrl || data.imageData;
  const t4 = Date.now();
  
  console.log("⏱️ [T4] Image URL ready", {
    timestamp: t4,
    elapsed_url_prep: t4 - t3,
    total_time: t4 - t0,
    message: "이미지 URL 준비 완료"
  });
  
  console.log("📊 [TIME BREAKDOWN]", {
    "1_Setup": `${t1 - t0}ms`,
    "2_Cloudflare+OpenAI": `${t2 - t1}ms ⬅️ 가장 중요!`,
    "3_JSON_Parsing": `${t3 - t2}ms`,
    "4_URL_Prep": `${t4 - t3}ms`,
    "TOTAL": `${t4 - t0}ms`
  });
  
  return imageUrl;
}

/**
 * 마스터 이미지 생성
 */
export async function generateMasterImage(
  request: ImageGenerationRequest
): Promise<ImageGenerationResponse> {
  // ⏱️ [M0] 마스터 이미지 생성 전체 시작
  const m0 = Date.now();
  console.log("⏱️ [M0] Master image generation start", {
    timestamp: m0
  });
  
  console.log("🎬 [IMAGE ENGINE] Starting master image generation...");
  
  if (!request.masterRequest) {
    return {
      success: false,
      error: "Master request is required"
    };
  }
  
  try {
    // 스타일 프리셋 로드
    const preset = getStylePreset(request.masterRequest.styleKey);
    console.log(`🎨 [IMAGE ENGINE] Style preset: ${preset.label} (${preset.key})`);
    
    // 장면 프롬프트 생성
    const scenePrompt = buildScenePrompt(request.masterRequest);
    console.log(`📝 [IMAGE ENGINE] Scene prompt: ${scenePrompt}`);
    
    // 최종 프롬프트 조합
    const prompts = buildFinalPrompt(scenePrompt, preset, request.customPrompt);
    console.log(`📋 [IMAGE ENGINE] Final prompt length: ${prompts.finalPrompt.length}`);
    
    // ⏱️ [M1] API 호출 직전
    const m1 = Date.now();
    console.log("⏱️ [M1] Before API call", {
      timestamp: m1,
      elapsed_preparation: m1 - m0,
      message: "프롬프트 준비 시간"
    });
    
    // API 호출
    const imageUrl = await callImageAPI(
      prompts.finalPrompt,
      preset.model,
      preset.size,
      preset.quality
    );
    
    // ⏱️ [M2] API 호출 완료 (이미지 URL 받음)
    const m2 = Date.now();
    console.log("⏱️ [M2] After API call (image URL received)", {
      timestamp: m2,
      elapsed_api_total: m2 - m1,
      message: "API 호출 총 시간 (callImageAPI 내부 타이밍 참조)"
    });
    
    // 마스터 이미지 정보 생성 및 저장
    const masterInfo = createMasterImageInfo(
      request.masterRequest,
      imageUrl,
      prompts,
      {
        model: preset.model,
        size: preset.size,
        quality: preset.quality
      }
    );
    
    // ⏱️ [M3] masterInfo 생성 완료, 저장 직전
    const m3 = Date.now();
    console.log("⏱️ [M3] Before saveMasterImage (IndexedDB)", {
      timestamp: m3,
      elapsed_info_creation: m3 - m2,
      message: "마스터 정보 객체 생성 시간"
    });
    
    saveMasterImage(masterInfo);
    
    // ⏱️ [M4] IndexedDB 저장 완료
    const m4 = Date.now();
    console.log("⏱️ [M4] After saveMasterImage (IndexedDB saved)", {
      timestamp: m4,
      elapsed_indexeddb: m4 - m3,
      total_time: m4 - m0,
      message: "IndexedDB 저장 시간"
    });
    
    console.log("✅ [IMAGE ENGINE] Master image generated:", masterInfo.id);
    
    console.log("📊 [MASTER IMAGE TIME BREAKDOWN]", {
      "1_Preparation": `${m1 - m0}ms`,
      "2_API_Call_Total": `${m2 - m1}ms ⬅️ 가장 오래 걸림 (내부 타이밍 참조)`,
      "3_Info_Creation": `${m3 - m2}ms`,
      "4_IndexedDB_Save": `${m4 - m3}ms`,
      "TOTAL": `${m4 - m0}ms`
    });
    
    return {
      success: true,
      imageUrl,
      masterId: masterInfo.id,
      debug: {
        scenePrompt: prompts.scenePrompt,
        stylePrompt: prompts.stylePrompt,
        compositionPrompt: prompts.compositionPrompt,
        negativePrompt: prompts.negativePrompt,
        finalPrompt: prompts.finalPrompt,
        model: preset.model,
        size: preset.size,
        quality: preset.quality,
        requestBody: {
          model: preset.model,
          size: preset.size,
          quality: preset.quality,
          prompt: prompts.finalPrompt.substring(0, 100) + "..."
        }
      }
    };
    
  } catch (error: any) {
    console.error("❌ [IMAGE ENGINE] Generation failed:", error);
    return {
      success: false,
      error: error.message || "Unknown error"
    };
  }
}

/**
 * 4컷 파생 이미지 생성
 * TODO: 마스터 이미지 기반 일관성 유지 로직 구현
 */
export async function generateVariantImage(
  request: ImageGenerationRequest
): Promise<ImageGenerationResponse> {
  console.log("🎬 [IMAGE ENGINE] Starting variant image generation...");
  
  if (!request.masterId) {
    return {
      success: false,
      error: "Master ID is required for variant generation"
    };
  }
  
  // 마스터 이미지 정보 조회
  const masterInfo = getMasterImage(request.masterId);
  if (!masterInfo) {
    return {
      success: false,
      error: `Master image not found: ${request.masterId}`
    };
  }
  
  console.log(`📌 [IMAGE ENGINE] Using master: ${masterInfo.id}`);
  console.log(`📌 [IMAGE ENGINE] Cut ${request.cutNumber}: ${request.cutTitle}`);
  
  // TODO: 마스터 이미지와 동일한 스타일/인물로 파생 생성
  // 현재는 마스터 이미지를 그대로 반환 (임시)
  
  return {
    success: true,
    imageUrl: masterInfo.imageUrl,
    masterId: masterInfo.id,
    debug: {
      scenePrompt: masterInfo.scenePrompt,
      stylePrompt: masterInfo.stylePrompt,
      compositionPrompt: masterInfo.compositionPrompt,
      negativePrompt: masterInfo.negativePrompt,
      finalPrompt: masterInfo.finalPrompt,
      model: masterInfo.model,
      size: masterInfo.size,
      quality: masterInfo.quality,
      requestBody: {}
    }
  };
}

/**
 * 이미지 생성 엔진 메인 함수
 */
export async function generateImage(
  request: ImageGenerationRequest
): Promise<ImageGenerationResponse> {
  if (request.type === "master") {
    return generateMasterImage(request);
  } else {
    return generateVariantImage(request);
  }
}
