# 연령 중립 이미지 생성 테스트 케이스

## 🎯 핵심 규칙 (개발자용)

### 3단계 판단 프로세스

#### ✅ 1단계: 등장인물이 있는가?
- 이름, 대명사(친구, 그 사람, 우리), 행동 주체
- **YES** → 2단계로 이동

#### ✅ 2단계: 연령 정보가 명시되어 있는가?
**명시된 경우 (예외 허용)**:
- "어린 철수"
- "초등학생 철수"
- "아버지와 함께"
- "할머니가…"
→ **이 경우에만 연령 반영 가능**

#### ❗ 3단계: 연령이 명시되지 않은 경우 (대부분의 글)
**👉 절대 연령을 추정하지 않는다** ← **이게 핵심**

---

## 🧪 테스트 케이스

### 테스트 1: 연령 미명시 + 등장인물 있음 (가장 중요) 🔥

#### 입력
```json
{
  "text": "우리는 냇가에서 물장구를 치며 놀았다. 여름 햇살이 따사로웠다.",
  "genre": "일기"
}
```

#### ❌ 잘못된 이미지 (현재 문제)
- 어린 남자아이가 물놀이
- 노년의 두 남성이 냇가에 있음
- **어떤 특정 연령대로 추정 금지**

#### ✅ 올바른 이미지 (A안 - 1순위 권장)
**방법 A: 사람을 직접 그리지 않는다**
- 물결, 햇빛, 냇가 풍경
- 물가에 놓인 옷, 튜브, 수건 등
- 프롬프트 예시: "여름 햇살 아래 조용한 냇가, 맑은 물결과 자연 풍경"

#### ✅ 올바른 이미지 (B안 - 2순위)
**방법 B: 사람 포함하되 연령 중립**
- 뒷모습
- 실루엣
- 얼굴 없음
- 나이 추정 불가
- 프롬프트 예시: "두 사람이 냇가에서 물장구를 치며 놀고 있는 뒷모습 실루엣"

#### 예상 콘솔 로그
```javascript
🎨 [글쓰기 이미지] 생성 중: {
  genre: "일기",
  imageStrategy: "silhouette",    // ✅ 실루엣 전략
  ageNeutral: true,                // ✅ 연령 중립 처리
  detectedCharacters: true,        // ✅ 등장인물 감지
  promptPreview: "=== 🚫 ABSOLUTE PROHIBITION - READ THIS FIRST ===\nIf age is NOT explicitly mentioned..."
}
```

---

### 테스트 2: 연령 명시 + 등장인물 있음 (예외 허용)

#### 입력
```json
{
  "text": "어린 시절 할머니와 함께 놀던 기억이 난다. 따뜻한 봄날이었다.",
  "genre": "수필"
}
```

#### ✅ 올바른 이미지
- 어린이와 할머니 포함 가능
- **연령 정보가 명시되었으므로 예외**

#### 예상 콘솔 로그
```javascript
🎨 [글쓰기 이미지] 생성 중: {
  genre: "수필",
  imageStrategy: "with-character",  // ✅ 캐릭터 포함 전략
  ageNeutral: false,                 // ❌ 연령 명시됨
  detectedCharacters: true,
  promptPreview: "People with age context: \"어린\"..."
}
```

---

### 테스트 3: 등장인물 없음 (배경 중심)

#### 입력
```json
{
  "text": "오늘 공원에 갔다. 날씨가 참 좋았다. 벤치에 앉아서 하늘을 보았다.",
  "genre": "일기"
}
```

#### ✅ 올바른 이미지
- 공원 풍경
- 벤치
- 하늘
- **사람 없음**

#### 예상 콘솔 로그
```javascript
🎨 [글쓰기 이미지] 생성 중: {
  genre: "일기",
  imageStrategy: "background",      // ✅ 배경 전략
  ageNeutral: true,                  // ✅ 연령 중립
  detectedCharacters: false,         // ❌ 등장인물 없음
  promptPreview: "Landscape or object-focused illustration. NO people at all..."
}
```

---

## 🧠 개발자에게 전달할 핵심 규칙 (그대로 사용 가능)

```
글에 등장인물이 있더라도,
연령(아이, 성인, 노인)이 명시되지 않은 경우
이미지 생성 시 연령을 절대 추정하지 않는다.

기본값은:
- 연령 비지정 인물
- 또는 사람을 직접 묘사하지 않은 장면 중심
```

---

## 📊 프롬프트 강화 내역

### Before (약한 규칙)
```
If people must be shown: use silhouettes, back views, or faceless figures.
NEVER assume age. Keep all people age-neutral.
```
→ **문제**: "If people must be shown"이 AI에게 선택지를 줌

### After (강력한 규칙) 🔥
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
```

---

## 🎯 브라우저 테스트 방법

### 배포 URL
```
https://2e09df1c.story-maker-4l6.pages.dev
```

### 테스트 절차
1. **글쓰기 → 장르 선택** (예: 일기)
2. **텍스트 입력**:
   ```
   우리는 냇가에서 물장구를 치며 놀았다. 
   여름 햇살이 따사로웠다.
   ```
3. **이미지 생성 버튼 클릭**
4. **F12 → Console 확인**

### 성공 기준 ✅
- `imageStrategy`: "silhouette" 또는 "background"
- `ageNeutral`: true
- **생성된 이미지**: 
  - ✅ 냇가 풍경, 물결, 햇빛
  - ✅ 또는 뒷모습/실루엣
  - ❌ **절대 아닌 것**: 어린이 또는 특정 연령대 사람

### 실패 기준 ❌
- 어린 남자아이가 그려짐
- 노년 남성이 그려짐
- 얼굴이 보이는 사람
- 연령 추정 가능한 인물

---

## 🔍 디버깅 체크리스트

### 1️⃣ 콘솔 로그 확인
```javascript
🎨 [글쓰기 이미지] 생성 중: {
  imageStrategy: "silhouette" or "background",  // ✅ 이것이어야 함
  ageNeutral: true,                              // ✅ 이것이어야 함
  detectedCharacters: true or false,
  promptPreview: "=== 🚫 ABSOLUTE PROHIBITION..."  // ✅ 규칙 먼저 나와야 함
}
```

### 2️⃣ 프롬프트 구조 확인
```
=== 🚫 ABSOLUTE PROHIBITION - READ THIS FIRST === (최우선)
=== ✅ MANDATORY APPROACH ===
=== IMAGE STRATEGY ===
=== GENRE GUIDANCE ===
=== TEXT CONTENT ===
```

### 3️⃣ 생성된 이미지 확인
- [ ] 연령 추정 가능한 인물 없음
- [ ] 얼굴 없음
- [ ] 장면/풍경 중심 또는 뒷모습/실루엣

---

## 📝 추가 테스트 케이스

### 케이스 4: "친구와 카페"
```json
{
  "text": "나는 친구를 만나러 갔다. 우리는 카페에서 이야기를 나누었다.",
  "genre": "일기"
}
```
**기대**: 카페 풍경 (테이블, 커피잔) 또는 뒷모습

---

### 케이스 5: "가족 여행"
```json
{
  "text": "가족과 함께 바다에 갔다. 파도 소리가 좋았다.",
  "genre": "일기"
}
```
**기대**: 바다 풍경 (파도, 하늘) 또는 먼 실루엣

---

### 케이스 6: "할아버지 명시"
```json
{
  "text": "할아버지와 함께 산책을 했다. 단풍이 아름다웠다.",
  "genre": "수필"
}
```
**기대**: 할아버지 포함 가능 (연령 명시)

---

## 🎯 최종 확인사항

### 성공 지표
- [x] 연령 미명시 시 사람 얼굴 없음
- [x] 장면/풍경 중심 우선
- [x] 뒷모습/실루엣 대안
- [x] 콘솔 로그 정확
- [x] `imageStrategy` 정확
- [x] `ageNeutral: true` 확인

### 실패 시 대응
1. 콘솔 로그에서 `promptPreview` 확인
2. `=== 🚫 ABSOLUTE PROHIBITION` 먼저 나오는지 확인
3. 이미지에 연령 추정 가능한 인물이 나온다면 → 프롬프트 재강화 필요

---

**최종 배포**: https://2e09df1c.story-maker-4l6.pages.dev  
**배포 시각**: 2026-01-13  
**변경사항**: 연령 추정 금지 규칙 강화 (CRITICAL)
