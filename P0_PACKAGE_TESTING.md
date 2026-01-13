# 🚀 P0 패키지 테스트 가이드

## 📦 P0 패키지란?
**"사람 그릴까 말까" 자동 판단 + 연령 중립 강제 시스템**

### 핵심 기능
1. **사람 포함 여부 자동 감지**: 이름, 대명사, 직업 등 키워드로 판단
2. **연령 추론 방지**: "할머니/할아버지" 명시되지 않으면 노년 금지
3. **프롬프트 자동 생성**: 허술한 입력도 안정적인 결과

---

## 🎯 배포 URL
```
https://a8ab8367.story-maker-4l6.pages.dev
```

---

## 🧪 테스트 케이스

### ✅ 테스트 1: 사람 없음 → 풍경/사물 중심

#### 입력
```
비 오는 날 창가에 놓인 따뜻한 머그컵과 책
```

#### 기대 결과
- `personPolicy.includePeople`: **false**
- **이미지**: 창가, 머그컵, 책 (사람 없음)
- **콘솔 로그**:
  ```javascript
  🎨 [글쓰기 이미지 P0] 생성 중: {
    personPolicy: { includePeople: false },
    promptPreview: "...DO NOT INCLUDE ANY PEOPLE. Focus on environment/objects..."
  }
  ```

#### 테스트 방법
1. **글쓰기 → 일기 선택**
2. **입력**: "비 오는 날 창가에 놓인 따뜻한 머그컵과 책"
3. **이미지 생성**
4. **F12 → Console 확인**

---

### ✅ 테스트 2: 아이 명시 → 어린이 포함 (노년 금지)

#### 입력
```
오늘은 철수와 함께 냇가에서 수영을 했다
```

#### 기대 결과
- `personPolicy.includePeople`: **true**
- `personPolicy.peopleHint`: "children present, cheerful and age-appropriate, friendly faces"
- **이미지**: 어린이/친구 느낌 (할머니/할아버지 ❌)
- **콘솔 로그**:
  ```javascript
  🎨 [글쓰기 이미지 P0] 생성 중: {
    personPolicy: { 
      includePeople: true, 
      peopleHint: "children present, cheerful and age-appropriate..." 
    },
    promptPreview: "...People: INCLUDE. children present..."
  }
  ```

#### 테스트 방법
1. **글쓰기 → 일기 선택**
2. **입력**: "오늘은 철수와 함께 냇가에서 수영을 했다"
3. **이미지 생성**
4. **확인**: 어린이 O, 노년 X

---

### ✅ 테스트 3: 시니어 명시 → 노년 포함 (허용)

#### 입력
```
할머니와 시장에 다녀온 하루
```

#### 기대 결과
- `personPolicy.includePeople`: **true**
- `personPolicy.peopleHint`: "older adults present, warm and dignified, friendly expressions"
- **이미지**: 노년 등장 OK
- **콘솔 로그**:
  ```javascript
  🎨 [글쓰기 이미지 P0] 생성 중: {
    personPolicy: { 
      includePeople: true, 
      peopleHint: "older adults present, warm and dignified..." 
    },
    promptPreview: "...People: INCLUDE. older adults present..."
  }
  ```

---

### ✅ 테스트 4: 대명사만 → 연령 중립 (노년 금지) 🔥

#### 입력
```
나는 오늘 정말 행복했다
```

#### 기대 결과
- `personPolicy.includePeople`: **true**
- `personPolicy.peopleHint`: "adults or children only if clearly implied; otherwise age-neutral adults"
- **이미지**: 사람 포함 가능하지만 **연령 중립** (노년 ❌)
- **콘솔 로그**:
  ```javascript
  🎨 [글쓰기 이미지 P0] 생성 중: {
    personPolicy: { 
      includePeople: true, 
      peopleHint: "adults or children only if clearly implied; otherwise age-neutral adults" 
    },
    promptPreview: "...People: INCLUDE. adults or children only if clearly implied..."
  }
  ```

---

### ✅ 테스트 5: "우리는 물장구" → 연령 중립 (노년 금지) 🔥🔥

#### 입력
```
우리는 냇가에서 물장구를 치며 놀았다. 여름 햇살이 따사로웠다.
```

#### 기대 결과
- `personPolicy.includePeople`: **true** (대명사 "우리" 감지)
- `personPolicy.peopleHint`: "adults or children only if clearly implied; otherwise age-neutral adults"
- **이미지**: 
  - **최선**: 냇가 풍경 (사람 없음) → AI가 "사람 포함" 규칙을 무시하고 풍경만
  - **차선**: 뒷모습/실루엣 (연령 식별 불가)
  - **절대 금지**: 어린이 또는 노년 인물
- **프롬프트 구조**:
  ```
  [CONTENT]
  People: INCLUDE. adults or children only if clearly implied; otherwise age-neutral adults
  
  Age policy:
  - DO NOT assume elderly people.
  - Only depict elderly if explicitly mentioned (할머니/할아버지/시니어/노인).
  - Otherwise keep characters age-neutral.
  ```

#### 테스트 방법
1. **글쓰기 → 일기 선택**
2. **입력**: "우리는 냇가에서 물장구를 치며 놀았다. 여름 햇살이 따사로웠다."
3. **이미지 생성**
4. **F12 → Console 확인**:
   ```javascript
   🎨 [글쓰기 이미지 P0] 생성 중: {
     personPolicy: { 
       includePeople: true, 
       peopleHint: "adults or children only if clearly implied; otherwise age-neutral adults" 
     },
     promptPreview: "...People: INCLUDE. adults or children only if clearly implied..."
   }
   ```
5. **생성된 이미지 확인**:
   - ✅ 냇가 풍경 (물결, 햇빛)
   - ✅ 또는 뒷모습/실루엣
   - ❌ **절대 아닌 것**: 어린이 얼굴 또는 노년 인물

---

## 📊 detectPersonPolicy() 규칙 요약

### 사람 없음 (includePeople: false)
- 명시적 "사람 없음" 키워드
- 사람/대명사 없음

### 사람 포함 (includePeople: true)
| 감지 키워드 | peopleHint |
|------------|------------|
| 아이/어린이/소년/소녀/학생 | "children present, cheerful and age-appropriate" |
| 할머니/할아버지/시니어/노인 | "older adults present, warm and dignified" |
| 나/우리/친구/가족 (연령 미명시) | "adults or children only if clearly implied; otherwise age-neutral adults" 🔥 |

---

## 🎯 성공 기준

### ✅ 성공
1. **콘솔 로그**에 `personPolicy` 정확히 표시
2. **사람 없음** 입력 → 사람 없는 풍경
3. **아이 명시** → 어린이 포함, 노년 ❌
4. **시니어 명시** → 노년 포함 OK
5. **대명사만** → 연령 중립 (노년 ❌)

### ❌ 실패
1. "우리는 물장구" → 노년 인물 그려짐
2. "나는 행복했다" → 할머니/할아버지 그려짐
3. 사람 없음 입력 → 사람 그려짐

---

## 🔍 디버깅 체크리스트

### 1️⃣ 콘솔 로그 확인
```javascript
🎨 [글쓰기 이미지 P0] 생성 중: {
  personPolicy: { includePeople: true/false, peopleHint: "..." },
  promptPreview: "..."
}
```

### 2️⃣ 프롬프트 구조 확인
- `[CONTENT]` 섹션에 `People: INCLUDE` 또는 `People: DO NOT INCLUDE`
- `Age policy:` 섹션 포함 확인

### 3️⃣ 생성된 이미지 확인
- [ ] 사람 포함/미포함이 정책과 일치
- [ ] 연령 추정 불가능 (연령 미명시 경우)
- [ ] 노년 인물 없음 (명시되지 않은 경우)

---

## 📝 서버 정책 확인

### functions/api/generate-image.ts
```typescript
const agePolicyDirective = `
=== AGE POLICY ===
- Do NOT assume elderly people.
- Only depict elderly if explicitly mentioned (할머니/할아버지/시니어/노인).
- Otherwise keep characters age-neutral.
`;

const peoplePolicyDirective = `
=== PEOPLE POLICY ===
- If prompt says "DO NOT INCLUDE ANY PEOPLE" then strictly no people.
- If prompt says "INCLUDE" then follow the specified age/character guidance.
`;
```

---

## 🎉 P0 패키지 적용 파일

### 프론트엔드
- ✅ `src/services/imageService.ts`
  - `detectPersonPolicy()` 함수 추가
  - `generateWritingImage()` 개선
  - `generateStoryImage()` 개선

### 서버
- ✅ `functions/api/generate-image.ts`
  - `agePolicyDirective` 추가
  - `peoplePolicyDirective` 추가
  - `buildServerPrompt()` 개선

---

## 🚀 다음 단계

### P0 (즉시 테스트) 🔥
- [ ] 테스트 1: 사람 없음 → 풍경
- [ ] 테스트 2: 아이 명시 → 어린이 O, 노년 X
- [ ] 테스트 3: 시니어 명시 → 노년 O
- [ ] 테스트 4: 대명사만 → 연령 중립
- [ ] 테스트 5: "우리는 물장구" → 연령 중립 🔥

### P1 (추가 개선)
- [ ] 더 다양한 키워드 추가
- [ ] 정책 미세 조정
- [ ] 결과 품질 모니터링

---

**배포 URL**: https://a8ab8367.story-maker-4l6.pages.dev  
**배포 시각**: 2026-01-13  
**변경사항**: P0 패키지 - 사람 포함 자동 판단 + 연령 중립 강제 🚀
