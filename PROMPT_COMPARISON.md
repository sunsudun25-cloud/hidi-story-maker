# 프롬프트 구조 비교: Before vs After

## 🚨 문제 상황

**입력 텍스트**:
```
우리는 냇가에서 물장구를 치며 놀았다. 여름 햇살이 따사로웠다.
```

**생성된 이미지 (문제)**:
- ❌ 어린 남자아이가 물놀이
- ❌ 노년의 두 남성이 냇가에 있음
- ❌ AI가 연령을 임의로 추정함

---

## ❌ Before: 약한 프롬프트 (문제 버전)

```
[IMAGE STRATEGY]
If people must be shown: use silhouettes, back views, or faceless figures. 
NEVER assume age. Keep all people age-neutral.

[GENRE GUIDANCE]
Today's scene: sky, room, path, daily objects. 
Focus on places and moments, not people's faces.

[EMOTIONAL TONE]
Soft, warm lighting with gentle colors.

[TEXT CONTENT - First 500 chars]
우리는 냇가에서 물장구를 치며 놀았다. 여름 햇살이 따사로웠다.

=== CRITICAL RULES ===
1. Genre does NOT imply age. "일기" does NOT mean elderly. "동화" does NOT mean children.
2. If no age is mentioned in text: DO NOT draw faces or detailed people. Use silhouettes, back views, or landscapes only.
3. No text, no watermark, no logo in the image.
4. Focus on SCENES and ATMOSPHERE, not story interpretation.

=== STYLE ===
Warm, gentle watercolor illustration suitable for all ages.
Clean composition, high quality, age-neutral.
```

### 문제점 분석
1. **"If people must be shown"** → AI가 "사람을 그릴 수도 있다"고 해석
2. **CRITICAL RULES가 뒤에 있음** → AI가 먼저 본 내용으로 판단
3. **"use silhouettes, back views"** → 선택지로 인식, 강제성 부족
4. **규칙이 약함** → 금지 사항이 명확하지 않음

---

## ✅ After: 강력한 프롬프트 (개선 버전) 🔥

```
=== 🚫 ABSOLUTE PROHIBITION - READ THIS FIRST ===
If age is NOT explicitly mentioned in the text:
❌ DO NOT assume or guess age (NO children, NO adults, NO elderly)
❌ DO NOT draw recognizable faces or age-identifiable body features
❌ DO NOT interpret story context to estimate age

=== ✅ MANDATORY APPROACH ===
When text mentions people but NO age specified:
1️⃣ FIRST CHOICE (PREFERRED): Draw the SCENE without people
   - Focus on: places, objects, atmosphere, environment
   - Example: "우리는 물장구치며 놀았다" 
     → ✅ Draw: stream, water ripples, sunlight, nature
     → ❌ NEVER: children or people playing

2️⃣ SECOND CHOICE (if people are absolutely necessary):
   - Back views only (뒷모습)
   - Distant silhouettes (먼 실루엣)
   - Shadowy figures with NO age indicators

=== IMAGE STRATEGY ===
🚫 CRITICAL: NO AGE ESTIMATION ALLOWED
- DO NOT draw children
- DO NOT draw adults
- DO NOT draw elderly people
- DO NOT show faces, body details, or age indicators

✅ ONLY ALLOWED:
- Back views (뒷모습)
- Distant silhouettes
- Shadowy figures
- Focus on SCENE, not people

If text says "we played in the stream":
❌ WRONG: Draw children playing
✅ RIGHT: Draw the stream with water ripples, sunlight, and distant shadows

Default approach: PREFER SCENES OVER PEOPLE.

=== GENRE GUIDANCE (Genre ≠ Age) ===
Today's scene: sky, room, path, daily objects. 
Focus on places and moments, not people's faces.
Note: "일기" ≠ elderly, "동화" ≠ children

=== EMOTIONAL TONE ===
Soft, warm lighting with gentle colors.

=== TEXT CONTENT - First 500 chars ===
우리는 냇가에서 물장구를 치며 놀았다. 여름 햇살이 따사로웠다.

=== STYLE ===
Warm, gentle watercolor illustration.
Age-neutral, scene-focused, high quality.
No text, watermark, or logo.
```

### 개선 사항 ✅
1. **🚫 ABSOLUTE PROHIBITION 최우선** → AI가 가장 먼저 읽음
2. **명확한 금지 사항** → "NO children, NO adults, NO elderly"
3. **구체적인 예시** → "우리는 물장구치며 놀았다" → ✅ 냇가 풍경, ❌ 어린이
4. **우선순위 명시** → "FIRST CHOICE: Draw the SCENE without people"
5. **이모지 사용** → 시각적으로 강조
6. **MANDATORY (필수)** → 선택이 아닌 강제

---

## 📊 핵심 차이점 요약

| 항목 | Before (약함) | After (강함) |
|------|--------------|--------------|
| **규칙 위치** | 프롬프트 중간-하단 | 프롬프트 최상단 🔥 |
| **금지 명시** | "NEVER assume age" | "❌ NO children, NO adults, NO elderly" |
| **접근법** | "If people must be shown" (선택) | "1️⃣ FIRST CHOICE: SCENE without people" (우선순위) |
| **예시** | 없음 | 구체적 예시 포함 ✅ |
| **강제성** | "use silhouettes" (권장) | "MANDATORY APPROACH" (필수) |
| **시각 강조** | 없음 | 이모지 사용 🚫 ✅ |

---

## 🎯 기대 결과

### 입력
```
우리는 냇가에서 물장구를 치며 놀았다. 여름 햇살이 따사로웠다.
```

### Before (문제)
- ❌ 어린이 그려짐
- ❌ 또는 노년 남성 그려짐

### After (기대) ✅
**1순위 (SCENE without people)**:
- ✅ 냇가 풍경
- ✅ 물결
- ✅ 햇빛
- ✅ 자연

**2순위 (if absolutely necessary)**:
- ✅ 먼 뒷모습
- ✅ 실루엣
- ✅ 얼굴/연령 식별 불가

---

## 🧪 검증 방법

### 1️⃣ 콘솔 로그 확인
```javascript
🎨 [글쓰기 이미지] 생성 중: {
  promptPreview: "=== 🚫 ABSOLUTE PROHIBITION - READ THIS FIRST ===\nIf age is NOT..."
  // ✅ PROHIBITION이 가장 먼저 나와야 함
}
```

### 2️⃣ 생성된 이미지 확인
- [ ] 연령 추정 가능한 인물 없음
- [ ] 장면/풍경 중심
- [ ] 또는 뒷모습/실루엣만

### 3️⃣ 실패 시
- 콘솔에서 전체 프롬프트 복사
- `promptPreview` 순서 확인
- 규칙이 최상단에 있는지 확인

---

## 📝 결론

**Before**: "사람을 그려도 되지만 연령을 추정하지 마세요" (약함)  
**After**: "사람을 그리지 마세요. 장면만 그리세요. 꼭 필요하면 뒷모습만" (강함) 🔥

**핵심 변화**:
- ❌ 제거: 선택지 제공
- ✅ 추가: 명확한 우선순위
- ✅ 추가: 구체적 금지 사항
- ✅ 추가: 예시 포함

---

**배포**: https://2e09df1c.story-maker-4l6.pages.dev  
**날짜**: 2026-01-13
