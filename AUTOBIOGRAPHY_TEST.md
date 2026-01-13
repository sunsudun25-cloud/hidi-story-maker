# 자서전 이미지 생성 테스트 (P0 패키지 적용 후)

## 🎯 문제 상황
**스크린샷**: 생성된 이미지 미리보기 (17개)에서 **노년 인물들이 많이 나타남**

## ✅ P0 패키지 적용 완료
- **파일**: `src/pages/WriteEditor.tsx`
- **함수**: `generateWritingImage()` 사용 ✅
- **적용 날짜**: 2026-01-13
- **배포 URL**: https://6407b32a.story-maker-4l6.pages.dev

---

## 🧪 새로운 테스트 (P0 적용 후)

### 배포 URL
```
https://6407b32a.story-maker-4l6.pages.dev
```

### 테스트 절차
1. **홈 → 글쓰기 → 장르 선택 → 자서전**
2. **제목 입력**: "나의 하루"
3. **내용 입력** (5가지 테스트 케이스):

---

### ✅ 테스트 1: 사람 없음 → 풍경만

**입력**:
```
오늘은 날씨가 참 좋았다. 
창밖으로 보이는 하늘이 맑고 푸르렀다.
```

**기대 결과**:
- `personPolicy.includePeople`: **false**
- **이미지**: 하늘, 창문, 풍경 (사람 없음)

---

### ✅ 테스트 2: 대명사만 → 연령 중립 🔥

**입력**:
```
나는 오늘 공원을 산책했다.
벤치에 앉아서 잠시 쉬었다.
```

**기대 결과**:
- `personPolicy.includePeople`: **true**
- `personPolicy.peopleHint`: "adults or children only if clearly implied; otherwise age-neutral adults"
- **이미지**: 
  - ✅ 공원 풍경 (사람 없음) 또는
  - ✅ 뒷모습/실루엣 (연령 식별 불가)
  - ❌ **절대 아닌 것**: 노년 인물

---

### ✅ 테스트 3: "할머니" 명시 → 노년 허용

**입력**:
```
어릴 적 할머니와 함께 지낸 날들이 생각난다.
```

**기대 결과**:
- `personPolicy.includePeople`: **true**
- `personPolicy.peopleHint`: "older adults present, warm and dignified, friendly expressions"
- **이미지**: 노년 인물 포함 OK

---

### ✅ 테스트 4: "친구와 함께" → 연령 중립 🔥

**입력**:
```
친구와 함께 여행을 다녀왔다.
즐거운 시간이었다.
```

**기대 결과**:
- `personPolicy.includePeople`: **true**
- `personPolicy.peopleHint`: "age-neutral adults"
- **이미지**: 연령 중립 (노년 ❌)

---

### ✅ 테스트 5: "우리 가족" → 연령 중립 🔥

**입력**:
```
우리 가족과 식사를 했다.
맛있는 음식을 먹으며 이야기를 나누었다.
```

**기대 결과**:
- `personPolicy.includePeople`: **true**
- `personPolicy.peopleHint`: "age-neutral adults"
- **이미지**: 가족 (연령 명시 안 됨) → 연령 중립 (노년 ❌)

---

## 🔍 콘솔 로그 확인

### F12 → Console에서 확인
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
  promptPreview: "[STYLE DIRECTIVE]\nRendering: warm, clean illustration...\n[CONTENT]\nCreate an illustration inspired by the writing below.\nPeople: INCLUDE. adults or children only if clearly implied; otherwise age-neutral adults\n\nAge policy:\n- DO NOT assume elderly people.\n- Only depict elderly if the user text explicitly mentions 할머니/할아버지/시니어/노인.\n- Otherwise keep characters age-neutral..."
}
```

---

## ✅ 성공 기준

### 콘솔 로그
- [x] `personPolicy` 객체 표시
- [x] `promptPreview`에 `People: INCLUDE` 또는 `People: DO NOT INCLUDE`
- [x] `Age policy:` 섹션 포함

### 생성된 이미지
- [x] **사람 없음** 입력 → 사람 없는 풍경
- [x] **대명사만** ("나는", "우리") → 연령 중립 (노년 X) 🔥
- [x] **"할머니" 명시** → 노년 OK
- [x] **"친구"/"가족"** (연령 미명시) → 연령 중립 (노년 X) 🔥

---

## 🚨 중요: 기존 이미지 vs 새 이미지

### 기존 이미지 (스크린샷)
- ❌ P0 패키지 적용 **전**에 생성됨
- ❌ 노년 인물 많음
- ❌ 연령 추론 발생

### 새 이미지 (P0 적용 후)
- ✅ P0 패키지 적용 **후** 생성
- ✅ 연령 중립 규칙 적용
- ✅ "할머니" 등 명시되지 않으면 노년 금지

---

## 📝 테스트 체크리스트

### 테스트 순서
1. [ ] 브라우저에서 https://6407b32a.story-maker-4l6.pages.dev 접속
2. [ ] 홈 → 글쓰기 → 장르 선택 → 자서전
3. [ ] F12 → Console 열기
4. [ ] 테스트 케이스 1~5 각각 실행
5. [ ] 콘솔 로그에서 `personPolicy` 확인
6. [ ] 생성된 이미지 확인
7. [ ] 노년 인물이 나타나는지 확인

### 결과 기록
- **테스트 1**: 사람 없음 → [ ] 성공 / [ ] 실패
- **테스트 2**: 대명사만 → [ ] 성공 / [ ] 실패
- **테스트 3**: "할머니" 명시 → [ ] 성공 / [ ] 실패
- **테스트 4**: "친구와" → [ ] 성공 / [ ] 실패
- **테스트 5**: "가족" → [ ] 성공 / [ ] 실패

---

## 🔧 문제 발생 시

### 여전히 노년 인물이 나타나면
1. **콘솔 로그 복사** → `personPolicy`와 `promptPreview` 전체
2. **생성된 이미지 스크린샷**
3. **입력한 텍스트** 공유

### 가능한 원인
1. **브라우저 캐시**: Ctrl+Shift+R로 강력 새로고침
2. **배포 지연**: 최신 배포가 반영되지 않음
3. **프롬프트 강도 부족**: 서버 정책 추가 강화 필요

---

**배포 URL**: https://6407b32a.story-maker-4l6.pages.dev  
**테스트 날짜**: 2026-01-13  
**P0 패키지**: 적용 완료 ✅
