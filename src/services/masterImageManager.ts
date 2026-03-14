/**
 * 마스터 이미지 관리자
 * - 마스터 이미지 생성 및 저장
 * - 4컷 파생을 위한 기준 정보 관리
 * - 인물/장소/스타일 고정 보장
 */

export interface MasterImageInfo {
  id: string;
  imageUrl: string;
  
  // 장면 정보
  location: string;
  interviewer: string;
  interviewee: string;
  
  // 스타일 정보
  styleKey: string;
  model: string;
  size: string;
  quality: string;
  
  // 프롬프트 정보 (디버깅용)
  scenePrompt: string;
  stylePrompt: string;
  compositionPrompt: string;
  negativePrompt: string;
  finalPrompt: string;
  
  // 캐릭터 DNA (일관성 유지)
  characterDNA: {
    interviewer: {
      gender: string;      // male, female
      age: string;         // 30대
      appearance: string;  // 검은 단발머리
      clothing: string;    // 정장, 넥타이
      accessory: string;   // 마이크
    };
    interviewee: {
      type: string;        // youngman, grandmother, etc.
      age: string;
      appearance: string;
      clothing: string;
    };
  };
  
  createdAt: string;
}

/**
 * 마스터 이미지 생성 요청 정보
 */
export interface MasterImageRequest {
  // 필수 정보
  location: string;
  interviewer: "male" | "female";
  interviewee: "grandmother" | "grandfather" | "youngman" | "youngwoman" | "children" | "boyChild" | "girlChild" | "dog" | "cat";
  styleKey: string;
  
  // 추가 요청 (옵션)
  customAppearance?: string;
  customClothing?: string;
  customFeatures?: string;
  customPrompt?: string;
}

/**
 * 인터뷰어 DNA 생성
 */
function buildInterviewerDNA(gender: "male" | "female"): MasterImageInfo["characterDNA"]["interviewer"] {
  if (gender === "male") {
    return {
      gender: "male",
      age: "30대",
      appearance: "검은 단발머리, 한국인 남성",
      clothing: "정장, 넥타이",
      accessory: "마이크 착용"
    };
  } else {
    return {
      gender: "female",
      age: "30대",
      appearance: "단정한 단발머리, 한국인 여성",
      clothing: "정장",
      accessory: "마이크 착용"
    };
  }
}

/**
 * 인터뷰이 DNA 생성
 */
function buildIntervieweeDNA(
  type: string,
  customAppearance?: string,
  customClothing?: string
): MasterImageInfo["characterDNA"]["interviewee"] {
  const baseInfo: Record<string, any> = {
    grandmother: {
      type: "grandmother",
      age: "70대",
      appearance: "흰 머리, 따뜻한 표정, 한국인 할머니",
      clothing: "편안한 옷차림"
    },
    grandfather: {
      type: "grandfather",
      age: "70대",
      appearance: "흰 머리, 온화한 표정, 한국인 할아버지",
      clothing: "편안한 옷차림"
    },
    youngman: {
      type: "youngman",
      age: "20대",
      appearance: "검은 머리, 밝은 표정, 한국인 젊은 남자",
      clothing: "캐주얼"
    },
    youngwoman: {
      type: "youngwoman",
      age: "20대",
      appearance: "검은 머리, 밝은 표정, 한국인 젊은 여자",
      clothing: "캐주얼"
    },
    children: {
      type: "children",
      age: "7-10세",
      appearance: "검은 머리, 밝은 표정, 한국 어린이",
      clothing: "편안한 옷"
    },
    boyChild: {
      type: "boyChild",
      age: "8세",
      appearance: "짧은 검은 머리, 밝은 미소, 한국 남자 어린이",
      clothing: "만화 캐릭터 티셔츠, 반바지"
    },
    girlChild: {
      type: "girlChild",
      age: "8세",
      appearance: "짧은 검은 머리 또는 단발머리, 밝은 미소, 한국 여자 어린이",
      clothing: "예쁜 원피스 또는 티셔츠"
    },
    dog: {
      type: "dog",
      age: "성견",
      appearance: "골든 리트리버, 밝은 갈색 털",
      clothing: "없음"
    },
    cat: {
      type: "cat",
      age: "성묘",
      appearance: "회색 고양이, 조용히 앉아 있는 모습",
      clothing: "없음"
    }
  };
  
  const base = baseInfo[type] || baseInfo.youngman;
  
  return {
    type,
    age: base.age,
    appearance: customAppearance || base.appearance,
    clothing: customClothing || base.clothing
  };
}

/**
 * 마스터 이미지 정보 생성
 */
export function createMasterImageInfo(
  request: MasterImageRequest,
  imageUrl: string,
  prompts: {
    scenePrompt: string;
    stylePrompt: string;
    compositionPrompt: string;
    negativePrompt: string;
    finalPrompt: string;
  },
  generationParams: {
    model: string;
    size: string;
    quality: string;
  }
): MasterImageInfo {
  return {
    id: crypto.randomUUID(),
    imageUrl,
    
    location: request.location,
    interviewer: request.interviewer,
    interviewee: request.interviewee,
    
    styleKey: request.styleKey,
    model: generationParams.model,
    size: generationParams.size,
    quality: generationParams.quality,
    
    scenePrompt: prompts.scenePrompt,
    stylePrompt: prompts.stylePrompt,
    compositionPrompt: prompts.compositionPrompt,
    negativePrompt: prompts.negativePrompt,
    finalPrompt: prompts.finalPrompt,
    
    characterDNA: {
      interviewer: buildInterviewerDNA(request.interviewer),
      interviewee: buildIntervieweeDNA(
        request.interviewee,
        request.customAppearance,
        request.customClothing
      )
    },
    
    createdAt: new Date().toISOString()
  };
}

/**
 * 마스터 이미지 저장소 (메모리)
 * 실제로는 IndexedDB나 서버에 저장 가능
 */
const masterImageStore = new Map<string, MasterImageInfo>();

/**
 * 마스터 이미지 저장
 */
export function saveMasterImage(info: MasterImageInfo): void {
  masterImageStore.set(info.id, info);
  console.log(`✅ Master image saved: ${info.id}`);
}

/**
 * 마스터 이미지 조회
 */
export function getMasterImage(id: string): MasterImageInfo | null {
  return masterImageStore.get(id) || null;
}

/**
 * 마스터 이미지 존재 확인
 */
export function hasMasterImage(id: string): boolean {
  return masterImageStore.has(id);
}

/**
 * 마스터 이미지 삭제
 */
export function deleteMasterImage(id: string): void {
  masterImageStore.delete(id);
  console.log(`🗑️ Master image deleted: ${id}`);
}

/**
 * 모든 마스터 이미지 조회
 */
export function getAllMasterImages(): MasterImageInfo[] {
  return Array.from(masterImageStore.values());
}
