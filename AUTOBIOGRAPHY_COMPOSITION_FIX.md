# 자서전 이미지 구성 규칙 수정 (타임라인/콜라주 금지)

## 🎯 문제 해결

### 문제점
자서전 이미지 생성 시 **타임라인 구성**이 자동으로 생성됨:
- ❌ "어린 시절 → 청년기 → 현재" 3컷 구성
- ❌ 콜라주/분할 화면
- ❌ 멀티패널 레이아웃

### 해결 방법
**자서전 장르에만** 특별한 구성 금지 규칙 추가

---

## ✅ 적용된 규칙

### 1️⃣ 글쓰기 프롬프트 (텍스트 생성)
**변경 없음** ✅
- 어린 시절 / 청년기 / 현재 구조 유지
- 시간 순서대로 텍스트 생성

### 2️⃣ 이미지 생성 프롬프트 (이미지 생성)
**구조 지시문 제거** ✅
- 타임라인 금지
- 콜라주 금지
- **한 장면만** 생성

---

## 📝 새로운 프롬프트 구조

### 자서전 전용 COMPOSITION 규칙

```
[COMPOSITION - CRITICAL FOR AUTOBIOGRAPHY]
🚫 FORBIDDEN LAYOUTS:
- NO timeline layout (어린 시절 → 청년기 → 현재)
- NO collage or multi-panel composition
- NO split screens or divided sections
- NO before/after comparisons
- NO chronological structure in one image

✅ REQUIRED:
- Draw ONE single scene only
- Single moment in time
- Unified composition
- No visual separation between time periods

한 장면으로만 그려주세요. 콜라주/분할/타임라인 구성은 하지 마세요.
```

---

## 🔍 코드 구현

### imageService.ts

```typescript
// ✅ 자서전 전용: 구조 금지 규칙
const isAutobiography = genre === "자서전";
const compositionDirective = isAutobiography
  ? `
[COMPOSITION - CRITICAL FOR AUTOBIOGRAPHY]
🚫 FORBIDDEN LAYOUTS:
- NO timeline layout (어린 시절 → 청년기 → 현재)
- NO collage or multi-panel composition
- NO split screens or divided sections
- NO before/after comparisons
- NO chronological structure in one image

✅ REQUIRED:
- Draw ONE single scene only
- Single moment in time
- Unified composition
- No visual separation between time periods

한 장면으로만 그려주세요. 콜라주/분할/타임라인 구성은 하지 마세요.
`.trim()
  : `
[COMPOSITION]
- simple, uncluttered
- friendly and school-safe
- single scene, not multi-panel
`.trim();
```

---

## 🧪 테스트 방법

### 배포 URL
```
https://8b14b1d7.story-maker-4l6.pages.dev
```

### 테스트 절차
1. **홈 → 글쓰기 → 장르 선택 → 자서전**
2. **F12 → Console 열기**
3. **입력**:
   ```
   제목: 나의 인생
   내용: 나는 1950년 경상남도에서 태어났다. 
         어린 시절, 우린 집은 가난했지만 행복했다. 
         20대 청년이 되어 서울로 상경했을 때가 기억난다.
   ```
4. **이미지 생성 클릭**
5. **콘솔 확인**

---

## ✅ 예상 콘솔 로그

```javascript
🎨 [글쓰기 이미지 P0] 생성 중: {
  model: "dall-e-3",
  genre: "자서전",
  size: "1024x1024",
  quality: "standard",
  personPolicy: { 
    includePeople: true, 
    peopleHint: "adults or children only if clearly implied; otherwise age-neutral adults" 
  },
  promptPreview: "[STYLE DIRECTIVE]
Rendering: warm, clean illustration, simple composition, bright and readable

[CONTENT]
Create an illustration inspired by the writing below.
People: INCLUDE. adults or children only if clearly implied; otherwise age-neutral adults

Age policy:
- DO NOT assume elderly people.
- Only depict elderly if the user text explicitly mentions 할머니/할아버지/시니어/노인.
- Otherwise keep characters age-neutral and general.

No text policy:
- No letters, no English, no Korean text
- No watermark, no logo, no signs, no labels
- No numbers or symbols that look like writing

[WRITING]
자서전 장르에 어울리는 분위기와 핵심 감정을 시각적으로 표현.
글 내용(요약/핵심):
나는 1950년 경상남도에서 태어났다. 어린 시절, 우린 집은 가난했지만 행복했다. 20대 청년이 되어 서울로 상경했을 때가 기억난다.

[COMPOSITION - CRITICAL FOR AUTOBIOGRAPHY]
🚫 FORBIDDEN LAYOUTS:
- NO timeline layout (어린 시절 → 청년기 → 현재)
- NO collage or multi-panel composition
- NO split screens or divided sections
- NO before/after comparisons
- NO chronological structure in one image

✅ REQUIRED:
- Draw ONE single scene only
- Single moment in time
- Unified composition
- No visual separation between time periods

한 장면으로만 그려주세요. 콜라주/분할/타임라인 구성은 하지 마세요."
}
```

---

## 🎯 기대 결과

### ✅ 올바른 이미지
1. **한 장면만**:
   - 1950년대 마을 풍경
   - 작은 집
   - 시골 배경
   - **단일 시점**

2. **통일된 구성**:
   - 분할 없음
   - 콜라주 없음
   - 타임라인 없음

3. **연령 중립**:
   - 사람 없음 또는 실루엣
   - 노년 인물 ❌

---

### ❌ 금지된 이미지
1. **타임라인 구성**:
   - ❌ 어린 시절 | 청년기 | 현재 (3컷)
   - ❌ 과거와 현재 비교

2. **멀티패널**:
   - ❌ 분할 화면
   - ❌ 콜라주 레이아웃

3. **연대기 구조**:
   - ❌ 시간 순서로 여러 장면

---

## 📊 다른 장르와 비교

| 장르 | 구성 규칙 | 타임라인 | 콜라주 |
|------|----------|----------|--------|
| 일기 | 단순 구성 | ❌ 금지 | ❌ 금지 |
| 편지 | 단순 구성 | ❌ 금지 | ❌ 금지 |
| 수필 | 단순 구성 | ❌ 금지 | ❌ 금지 |
| **자서전** | **강화 금지** 🔥 | **🚫 명시적 금지** | **🚫 명시적 금지** |
| 동화 | 단순 구성 | ❌ 금지 | ❌ 금지 |

---

## 🔍 디버깅 체크리스트

### 콘솔 로그 확인
- [ ] `genre: "자서전"` 표시
- [ ] `promptPreview`에 `[COMPOSITION - CRITICAL FOR AUTOBIOGRAPHY]` 포함
- [ ] `NO timeline layout` 문구 포함
- [ ] `Draw ONE single scene only` 문구 포함

### 생성된 이미지 확인
- [ ] 단일 장면인가?
- [ ] 분할/콜라주 없는가?
- [ ] 타임라인 구조 없는가?
- [ ] 노년 인물 없는가? (연령 미명시 경우)

---

## 🚀 다음 단계

### 즉시 테스트
1. **배포 URL**: https://8b14b1d7.story-maker-4l6.pages.dev
2. **자서전 장르 선택**
3. **과거 회상 텍스트 입력**
4. **생성된 이미지 확인**:
   - ✅ 단일 장면
   - ❌ 타임라인 구성

### 결과 공유
- **성공**: 단일 장면만 생성됨 ✅
- **실패**: 여전히 타임라인 나타남 ❌
  - 콘솔 로그 전체 복사
  - 이미지 스크린샷

---

## 📝 요약

### 변경 사항
1. ✅ **자서전 전용 COMPOSITION 규칙 추가**
2. ✅ **타임라인/콜라주 명시적 금지**
3. ✅ **한 장면만 생성 강제**
4. ✅ **다른 장르는 영향 없음**

### 적용 파일
- `src/services/imageService.ts`
  - `generateWritingImage()` 함수
  - `compositionDirective` 조건부 생성

---

**배포 URL**: https://8b14b1d7.story-maker-4l6.pages.dev  
**배포 시각**: 2026-01-13  
**변경사항**: 자서전 타임라인/콜라주 구성 금지 🚫
