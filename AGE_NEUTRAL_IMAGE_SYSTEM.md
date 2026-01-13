# 연령 중립 이미지 생성 시스템 (Age-Neutral Image Generation)

## 🎯 문제점
**"고령 친화 앱인데 이미지에 할아버지 할머니가 너무 많이 나와요"**

### 원인 분석
1. **장르 오해**: AI가 "일기", "수필" 장르를 노년 감성으로 자동 추론
2. **키워드 오해**: "시니어 분들이 보시기 편한" → AI가 할머니/할아버지 그림
3. **연령 추정**: 등장인물이 있으면 연령 정보 없이도 특정 나이로 추론

---

## ✅ 해결 방법

### 1️⃣ 새로운 프롬프트 빌더 생성
**파일**: `src/utils/writingImagePromptBuilder.ts`

### 2️⃣ 핵심 설계 원칙

#### A) 장르는 문체 가이드일 뿐
```typescript
// ❌ 이전 방식
"일기 장르에 어울리는" → AI가 노년 추론

// ✅ 새로운 방식
"일기": "Today's scene: sky, room, path, daily objects. Focus on places and moments, not people's faces."
```

#### B) 등장인물 처리 규칙
```typescript
if (!hasCharacters) {
  // A) 등장인물 없음 → 배경 중심
  imageStrategy = "background";
  characterGuidance = "Landscape or object-focused illustration. No people.";
  
} else if (detectedAge) {
  // B) 등장인물 + 연령 명시 → 연령 반영 가능
  imageStrategy = "with-character";
  characterGuidance = `Include people reflecting the mentioned age context: "${detectedAge}"`;
  
} else {
  // C) 등장인물 + 연령 미명시 → 실루엣/뒷모습
  imageStrategy = "silhouette";
  characterGuidance = "Use silhouettes, back views, or faceless figures. NEVER assume age.";
}
```

#### C) 연령 키워드 감지
```typescript
const ageKeywords = [
  "어린", "아이", "아기", "유아", "어린이", "청소년", "학생",
  "할머니", "할아버지", "노인", "어르신", "중년", "장년"
];
```

---

## 📊 테스트 시나리오

### 테스트 1: 등장인물 없음 → 배경 중심
**입력**:
```json
{
  "text": "오늘 공원에 갔다. 날씨가 참 좋았다. 벤치에 앉아서 하늘을 보았다.",
  "genre": "일기"
}
```

**예상 결과**:
- `imageStrategy`: "background"
- `detectedCharacters`: false
- `ageNeutral`: true
- **이미지**: 공원 풍경, 벤치, 하늘 (사람 없음)

---

### 테스트 2: 연령 명시 → 연령 반영 가능
**입력**:
```json
{
  "text": "어린 시절 할머니와 함께 놀던 기억이 난다. 따뜻한 봄날이었다.",
  "genre": "수필"
}
```

**예상 결과**:
- `imageStrategy`: "with-character"
- `detectedCharacters`: true
- `ageNeutral`: false (연령 명시됨)
- **이미지**: 어린이와 할머니 포함 가능

---

### 테스트 3: 등장인물 + 연령 미명시 → 실루엣/뒷모습
**입력**:
```json
{
  "text": "나는 친구를 만나러 갔다. 우리는 카페에서 이야기를 나누었다.",
  "genre": "일기"
}
```

**예상 결과**:
- `imageStrategy`: "silhouette"
- `detectedCharacters`: true
- `ageNeutral`: true
- **이미지**: 실루엣, 뒷모습, 또는 얼굴 없는 인물

---

## 🔧 장르별 이미지 가이드

| 장르 | 권장 이미지 방향 | 연령 추정 |
|------|-----------------|----------|
| **일기** | 오늘의 장면 (하늘, 방, 길, 일상 소품) | ❌ 금지 |
| **편지** | 따뜻한 풍경, 빛, 편지 실루엣 | ❌ 금지 |
| **수필** | 자연, 계절, 감정 분위기 | ❌ 금지 |
| **동화** | 동화풍 스타일 (어린이 이미지 아님) | ❌ 금지 |
| **자유글** | 중립적 선택 | ❌ 금지 |

---

## 🎨 프롬프트 구조

### 최종 프롬프트 예시
```
[IMAGE STRATEGY]
If people must be shown: use silhouettes, back views, or faceless figures. 
NEVER assume age. Keep all people age-neutral.

[GENRE GUIDANCE]
Today's scene: sky, room, path, daily objects. Focus on places and moments, not people's faces.

[EMOTIONAL TONE]
Soft, warm lighting with gentle colors.

[TEXT CONTENT - First 500 chars]
나는 친구를 만나러 갔다. 우리는 카페에서 이야기를 나누었다.

=== CRITICAL RULES ===
1. Genre does NOT imply age. "일기" does NOT mean elderly. "동화" does NOT mean children.
2. If no age is mentioned in text: DO NOT draw faces or detailed people. Use silhouettes, back views, or landscapes only.
3. No text, no watermark, no logo in the image.
4. Focus on SCENES and ATMOSPHERE, not story interpretation.

=== STYLE ===
Warm, gentle watercolor illustration suitable for all ages.
Clean composition, high quality, age-neutral.
```

---

## 🚀 브라우저 테스트 방법

### 배포 URL
```
https://7772606d.story-maker-4l6.pages.dev
```

### 테스트 절차
1. **글쓰기 → 장르 선택** (예: 일기)
2. **에디터에 텍스트 입력**:
   - 테스트 1: "오늘 공원에 갔다. 날씨가 참 좋았다."
   - 테스트 2: "어린 시절 할머니와 함께 놀던 기억"
   - 테스트 3: "나는 친구를 만나러 갔다."
3. **이미지 생성 버튼 클릭**
4. **F12 → Console 확인**

### 예상 콘솔 로그
```javascript
🎨 [글쓰기 이미지] 생성 중: {
  model: "dall-e-3",
  size: "1024x1024",
  quality: "standard",
  genre: "일기",
  imageStrategy: "silhouette",     // 또는 "background", "with-character"
  ageNeutral: true,                 // 또는 false
  detectedCharacters: true,         // 또는 false
  promptPreview: "[IMAGE STRATEGY]\nIf people must be shown: use silhouettes..."
}
```

---

## ✅ 해결 완료 체크리스트

- [x] ❌ 제거: "시니어 분들이 보시기 편한" 키워드
- [x] ❌ 제거: 장르에서 연령 추론
- [x] ✅ 추가: 등장인물 감지 로직
- [x] ✅ 추가: 연령 키워드 감지
- [x] ✅ 추가: 이미지 전략 (배경/실루엣/캐릭터)
- [x] ✅ 추가: 연령 중립 규칙 명시
- [x] ✅ 추가: 장르별 가이드 (연령 무관)
- [x] ✅ 추가: CRITICAL RULES in prompt

---

## 📌 최종 요약 (개발자용)

### 파일 변경
```
신규:  src/utils/writingImagePromptBuilder.ts
수정:  src/services/imageService.ts
```

### 핵심 규칙
1. **장르는 스타일 가이드** → 연령 추론 금지
2. **연령 정보 없으면** → 실루엣/배경으로
3. **"시니어" 키워드** → 완전 제거
4. **글 해석 금지** → 장면만 시각화

### 결과
- ✅ 일기 장르 = 할머니 이미지 ❌ (이제 풍경/실루엣)
- ✅ 수필 장르 = 노년 감성 ❌ (이제 계절/자연)
- ✅ 동화 장르 = 어린이 ❌ (이제 동화풍 스타일일 뿐)
- ✅ 연령 명시 시에만 연령 반영 가능

---

## 🎯 다음 단계

### P0 (즉시 테스트)
- [ ] 일기 장르로 이미지 생성 → 할머니 없는지 확인
- [ ] 연령 미명시 텍스트 → 실루엣/배경인지 확인
- [ ] 콘솔 로그 확인 (`imageStrategy`, `ageNeutral`)

### P1 (추가 개선)
- [ ] 더 다양한 연령 키워드 추가
- [ ] 감정 톤 감지 정교화
- [ ] 이미지 결과 품질 모니터링

### P2 (장기)
- [ ] 사용자 피드백 수집
- [ ] 연령 중립 비율 메트릭 추적
- [ ] A/B 테스트 (이전 vs 새 시스템)

---

**최종 배포**: https://7772606d.story-maker-4l6.pages.dev  
**배포 시각**: 2026-01-13
