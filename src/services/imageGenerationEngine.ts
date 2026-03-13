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
    ? "Korean male reporter age 30, short black hair, business suit with tie, holding microphone, other hand natural, NOT in pockets"
    : "Korean female reporter age 30, neat short hair, business suit, holding microphone, other hand natural, NOT in pockets";
  
  const intervieweeMap: Record<string, string> = {
    grandmother: "Korean grandmother age 70, white hair, warm expression, comfortable clothing, both hands forward, NOT in pockets",
    grandfather: "Korean grandfather age 70, white hair, gentle expression, comfortable clothing, both hands forward, NOT in pockets",
    youngman: "Korean young man age 20, black hair, bright expression, casual clothing, both hands at sides, NOT in pockets",
    youngwoman: "Korean young woman age 20, black hair, bright expression, casual clothing, both hands at sides, NOT in pockets",
    children: "Korean child age 7-10, black hair, bright expression, comfortable clothing, both hands natural, NOT in pockets",
    dog: "Golden Retriever dog, bright brown fur, sitting calmly",
    cat: "Gray cat, sitting quietly"
  };
  
  const interviewee = intervieweeMap[request.interviewee] || intervieweeMap.youngman;
  
  // 커스텀 외모/의상 추가
  let customParts = [];
  if (request.customAppearance) customParts.push(request.customAppearance);
  if (request.customClothing) customParts.push(request.customClothing);
  if (request.customFeatures) customParts.push(request.customFeatures);
  
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
  const API_URL = "/api/generate-image";
  
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
    requestBody
  });
  
  const response = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(requestBody)
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    console.error("❌ [IMAGE ENGINE] API Error:", errorText);
    throw new Error(`API Error ${response.status}: ${errorText}`);
  }
  
  const data = await response.json();
  
  console.log("✅ [IMAGE ENGINE] API Response:", {
    hasImageUrl: !!data.imageUrl,
    hasImageData: !!data.imageData,
    model: data.model,
    size: data.size
  });
  
  return data.imageUrl || data.imageData;
}

/**
 * 마스터 이미지 생성
 */
export async function generateMasterImage(
  request: ImageGenerationRequest
): Promise<ImageGenerationResponse> {
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
    
    // API 호출
    const imageUrl = await callImageAPI(
      prompts.finalPrompt,
      preset.model,
      preset.size,
      preset.quality
    );
    
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
    
    saveMasterImage(masterInfo);
    
    console.log("✅ [IMAGE ENGINE] Master image generated:", masterInfo.id);
    
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
