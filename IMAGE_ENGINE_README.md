# 🎨 이미지 생성 엔진 분리 구조

## 📋 개요

스토리메이커의 이미지 생성 기능을 독립 모듈로 분리했습니다.  
이제 **입력 UI**와 **이미지 생성 로직**이 완전히 분리되어 스타일 일관성과 디버깅이 쉬워졌습니다.

---

## 🏗️ 구조

```
메인 앱 (FourcutInterviewSetup.tsx)
  │
  ├─ 시니어 입력 UI
  ├─ 인터뷰 상황 선택
  └─ 결과 확인
      │
      ▼
이미지 생성 엔진 (독립 모듈)
  │
  ├─ stylePresets.ts          ← 스타일 프리셋 관리
  ├─ masterImageManager.ts    ← 마스터 이미지 저장/조회
  └─ imageGenerationEngine.ts ← 프롬프트 조합 & API 호출
```

---

## 📦 모듈 구성

### 1. `stylePresets.ts` - 스타일 프리셋

**역할**: 각 스타일의 완전 독립적인 설정 관리

**프리셋 구조**:
```typescript
{
  key: "realistic",
  label: "실사 (📸)",
  model: "gpt-image-1",
  size: "1536x1024",
  quality: "high",
  
  scenePrefix: "A real news interview photo.",
  styleSuffix: "Photojournalism style...",
  compositionGuide: "Medium shot, eye-level angle...",
  negativePrompt: "NO illustration, NO cartoon..."
}
```

**지원 스타일**:
- **실사 (📸)**: GPT Image, 포토저널리즘
- **3D 렌더링 (🎮)**: DALL-E 3, Blender 스타일
- **일러스트 (✏️)**: DALL-E 3, 동화책 스타일
- **애니메이션 (🎬)**: DALL-E 3, 생동감 있는 스타일

**주요 함수**:
- `getStylePreset(styleKey)`: 스타일 키로 프리셋 조회
- `validateStylePreset(preset)`: 프리셋 유효성 검증

---

### 2. `masterImageManager.ts` - 마스터 이미지 관리

**역할**: 마스터 이미지 생성, 저장, 조회 (4컷 일관성 기준)

**마스터 이미지 정보**:
```typescript
{
  id: "uuid",
  imageUrl: "https://...",
  
  // 장면 정보
  location: "편의점 앞",
  interviewer: "male",
  interviewee: "youngman",
  
  // 스타일 정보
  styleKey: "realistic",
  model: "gpt-image-1",
  
  // 프롬프트 정보 (디버깅용)
  scenePrompt: "Interview scene...",
  stylePrompt: "Photojournalism...",
  finalPrompt: "...",
  
  // 캐릭터 DNA (일관성 유지)
  characterDNA: {
    interviewer: {
      gender: "male",
      age: "30대",
      appearance: "검은 단발머리",
      clothing: "정장, 넥타이"
    },
    interviewee: { ... }
  }
}
```

**주요 함수**:
- `createMasterImageInfo()`: 마스터 이미지 정보 생성
- `saveMasterImage(info)`: 저장
- `getMasterImage(id)`: 조회
- `hasMasterImage(id)`: 존재 확인

---

### 3. `imageGenerationEngine.ts` - 이미지 생성 엔진

**역할**: 프롬프트 조합, API 호출, 디버깅 로그

**API 구조**:
```typescript
// 마스터 이미지 생성 요청
const request: ImageGenerationRequest = {
  type: "master",
  masterRequest: {
    location: "편의점 앞",
    interviewer: "male",
    interviewee: "youngman",
    styleKey: "realistic",
    customAppearance: "밝은 표정",
    customClothing: "청바지",
    customFeatures: "안경 착용"
  },
  customPrompt: "더 밝게" // 추가 요구사항 (옵션)
};

// 이미지 생성
const response = await generateImage(request);

// 응답
{
  success: true,
  imageUrl: "https://...",
  masterId: "uuid",
  
  // 디버깅 정보
  debug: {
    scenePrompt: "Interview scene...",
    stylePrompt: "Photojournalism...",
    compositionPrompt: "Medium shot...",
    negativePrompt: "NO illustration...",
    finalPrompt: "...",
    model: "gpt-image-1",
    size: "1536x1024",
    quality: "high",
    requestBody: { ... }
  }
}
```

**주요 함수**:
- `generateImage(request)`: 메인 함수
- `generateMasterImage(request)`: 마스터 이미지 생성
- `generateVariantImage(request)`: 4컷 파생 생성 (TODO)

---

## 🔧 사용 방법

### 기본 사용

```typescript
import { generateImage } from '../services/imageGenerationEngine';

// 마스터 이미지 생성
const response = await generateImage({
  type: "master",
  masterRequest: {
    location: "편의점 앞",
    interviewer: "male",
    interviewee: "youngman",
    styleKey: "realistic"
  }
});

if (response.success) {
  console.log("생성 완료:", response.imageUrl);
  console.log("마스터 ID:", response.masterId);
}
```

### 커스텀 프롬프트 추가

```typescript
const response = await generateImage({
  type: "master",
  masterRequest: { ... },
  customPrompt: "더 밝게, 표정을 부드럽게"
});
```

### 디버깅 정보 확인

```typescript
if (response.debug) {
  console.log("최종 프롬프트:", response.debug.finalPrompt);
  console.log("모델:", response.debug.model);
  console.log("요청 본문:", response.debug.requestBody);
}
```

---

## ✨ 장점

### 1. **스타일 혼용 방지**
- 각 스타일이 완전히 독립적인 프롬프트 사용
- 실사에 3D 프롬프트가 섞이는 문제 해결

### 2. **마스터 이미지 일관성**
- 마스터 이미지를 기준으로 4컷 생성 (TODO)
- 캐릭터 DNA 저장으로 인물 일관성 보장

### 3. **디버깅 용이**
- 모든 프롬프트 단계별 로그 제공
- API 요청/응답 추적 가능
- 문제 원인 즉시 파악

### 4. **유지보수 편리**
- 스타일 추가/수정이 `stylePresets.ts`만 수정하면 됨
- 이미지 생성 로직이 한 곳에 집중
- 테스트 및 검증이 쉬움

### 5. **확장 가능**
- 4컷 파생 생성 기능 추가 예정
- 이미지 편집 기능 추가 가능
- 외부 API로 분리 가능

---

## 🛠️ 개발 로드맵

### ✅ 완료
- [x] 스타일 프리셋 분리
- [x] 마스터 이미지 관리자
- [x] 이미지 생성 엔진
- [x] 디버깅 로그
- [x] 기존 코드 교체

### 🚧 진행 중
- [ ] 4컷 파생 생성 구현
- [ ] 마스터 이미지 기반 일관성 유지
- [ ] 수정 요청 처리 고도화

### 📅 계획
- [ ] 이미지 편집 기능
- [ ] 외부 API로 완전 분리
- [ ] 실시간 프리뷰
- [ ] 배치 생성 지원

---

## 🐛 문제 해결

### 스타일이 섞이는 경우
1. `stylePresets.ts`에서 해당 스타일의 `styleSuffix` 확인
2. `negativePrompt`가 다른 스타일을 명시적으로 금지하는지 확인
3. 디버깅 로그에서 `finalPrompt` 확인

### 마스터 이미지가 재생성 시 인물이 바뀌는 경우
1. `masterImageManager.ts`의 `characterDNA` 확인
2. 4컷 파생 생성 기능 구현 필요 (TODO)

### 디버깅 정보가 필요한 경우
```typescript
const response = await generateImage(request);
console.log("[IMAGE ENGINE DEBUG]", JSON.stringify(response.debug, null, 2));
```

---

## 📚 참고

- 테스트 URL: https://318e1db5.story-maker-4l6-01i.pages.dev
- GitHub: /home/user/webapp
- 관련 파일:
  - `src/services/stylePresets.ts`
  - `src/services/masterImageManager.ts`
  - `src/services/imageGenerationEngine.ts`
  - `src/pages/FourcutInterviewSetup.tsx`

---

## 🎯 다음 단계

제안하신 구조가 완벽히 구현되었습니다!

이제 테스트해보시고:
1. **스타일 일관성** 개선 여부
2. **디버깅 로그** 유용성
3. **추가 필요 기능** (4컷 파생 생성 등)

피드백 주시면 바로 개선하겠습니다! 🚀
