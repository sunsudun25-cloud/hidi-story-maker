# 🧭 HI-DI Story Maker - 네비게이션 흐름

## 📱 사용자 여정 (User Journey)

### 1️⃣ 시작 - Welcome 페이지
```
/ (Welcome)
  ├─ 시작하기 버튼
  └─ → /onboarding
```

**특징**:
- 헤더 없음
- 큰 시작 버튼
- 앱 소개

---

### 2️⃣ 로그인 - Onboarding
```
/onboarding (Login)
  ├─ Google 로그인
  ├─ Kakao 로그인
  ├─ 비회원으로 시작
  └─ → /home
```

**특징**:
- 헤더 없음
- 소셜 로그인 옵션
- 비회원 접근 가능

---

### 3️⃣ 홈 - Main Menu
```
/home (Home)
  ├─ 그림 만들기 → /drawing/practice 또는 /direct-input
  ├─ 동화책 만들기 → /storybook
  ├─ 글쓰기 → /write
  ├─ 내 작품 보기 → /my-works
  └─ 나만의 굿즈 만들기 → /goods
```

**특징**:
- 헤더 없음
- 2x2+1 그리드 레이아웃
- 모든 기능의 진입점

---

## 🎨 그림 만들기 흐름

### A. 연습하기 경로
```
/home
  ↓
/drawing/practice (DrawPractice)
  ├─ 예시 선택
  ├─ 스타일 선택
  ├─ 음성 입력
  ├─ 🎨 그림 만들기 버튼
  └─ LoadingSpinner 표시
  ↓
/result (Result)
  ├─ 💾 저장하기
  ├─ 📤 공유하기
  ├─ 🎨 다시 만들기 → /drawing/practice
  ├─ 🖼️ 내 작품 보러가기 → /my-works
  └─ 🏠 홈으로 돌아가기 → /home
```

### B. 직접 입력 경로
```
/home
  ↓
/direct-input (DirectInput)
  ├─ 텍스트 입력
  ├─ 스타일 선택
  ├─ 🚀 그림 만들기 버튼
  └─ LoadingSpinner 표시
  ↓
/result (Result)
  └─ (동일한 옵션)
```

**공통 특징**:
- 모든 페이지에 🏠 홈 버튼
- LoadingSpinner로 진행 상황 피드백
- 친화적 에러 메시지

---

## 📚 동화책 만들기 흐름

```
/home
  ↓
/storybook (Storybook)
  ├─ 제목 입력
  ├─ 줄거리 입력
  ├─ 스타일 선택
  ├─ 🚀 동화책 만들기 시작
  └─ LoadingSpinner 표시 (표지 생성 중)
  ↓
/storybook-editor (StorybookEditor)
  ├─ 표지 확인
  ├─ 페이지 편집
  ├─ ➕ 페이지 자동생성 (Gemini AI)
  ├─ 이미지 생성 (각 페이지)
  ├─ 📄 PDF 내보내기 옵션
  │   ├─ 세로형 / 가로형
  │   ├─ 이미지-텍스트 배치
  │   └─ 파스텔 배경
  └─ 💾 저장하기 → /my-works
  ↓
/home (🏠 버튼)
```

**특징**:
- 표지 자동 생성 (Gemini Vision API)
- 페이지 자동생성 (Gemini Text API)
- 각 페이지별 이미지 생성
- 다양한 PDF 레이아웃 옵션
- 🏠 홈 버튼으로 언제든 돌아가기

---

## ✍️ 글쓰기 흐름 (준비 중)

```
/home
  ↓
/write (WriteStart)
  ├─ 장르 선택
  ├─ AI 도우미
  └─ 편집기
  ↓
/home
```

---

## 🖼️ 내 작품 보기 흐름

```
/home
  ↓
/my-works (MyWorks)
  ├─ 저장된 그림 목록
  ├─ 저장된 동화책 목록
  ├─ 작품 상세보기
  ├─ 수정/삭제
  └─ PDF 다운로드
  ↓
/home (🏠 버튼)
```

---

## 🎁 굿즈 만들기 흐름 (준비 중)

```
/home
  ↓
/goods (Goods)
  ├─ 작품 선택
  ├─ 굿즈 템플릿 선택
  └─ 주문하기
  ↓
/home
```

---

## 🧭 공통 네비게이션 규칙

### 헤더 구조
모든 페이지 (Welcome, Onboarding, Home 제외):
```html
<header className="page-header">
  <button onClick={() => navigate(-1)}>← 뒤로</button>
  <h1>페이지 제목</h1>
  <button onClick={() => navigate("/home")}>🏠 홈</button>
</header>
```

### 홈 버튼 통일
- **모든 페이지**: `navigate("/home")`
- **일관된 아이콘**: 🏠
- **명확한 레이블**: "홈" 또는 "홈으로 돌아가기"

### LoadingSpinner 적용
- DrawPractice: "AI가 그림을 그리고 있어요... 🎨"
- DirectInput: "AI가 멋진 그림을 그리고 있어요... 🎨"
- Storybook: "동화책 표지를 그리고 있어요... 📚✨"
- StorybookEditor (페이지 생성): "다음 페이지를 만들고 있어요... ✨"

### 에러 처리
모든 AI 생성 페이지:
```typescript
try {
  const result = await generateImage(prompt);
  navigate("/result", { state: { imageUrl: result } });
} catch (error) {
  alert(friendlyErrorMessage(error));
}
```

---

## 📊 페이지 계층 구조

```
┌─────────────────────────────────────┐
│  / (Welcome)                        │
│  - 헤더 없음                         │
│  - 앱 소개                           │
└─────────────────────────────────────┘
              ↓
┌─────────────────────────────────────┐
│  /onboarding (Login)                │
│  - 헤더 없음                         │
│  - 소셜 로그인                       │
└─────────────────────────────────────┘
              ↓
┌─────────────────────────────────────┐
│  /home (Home) ★ 중심 허브            │
│  - 헤더 없음                         │
│  - 2x2+1 그리드                      │
│  - 모든 기능 진입점                   │
└─────────────────────────────────────┘
       ↓      ↓      ↓      ↓      ↓
    그림   동화책   글쓰기  작품   굿즈
     ↓       ↓       ↓      ↓      ↓
  Result  Editor   Editor  List  Config
     ↓       ↓       ↓      ↓      ↓
    🏠      🏠      🏠     🏠     🏠
   Home    Home    Home   Home   Home
```

---

## 🎯 사용자 경험 (UX) 원칙

### 1️⃣ 명확한 진입/퇴출
- 모든 작업은 **Home에서 시작**
- 모든 작업은 **Home으로 종료**
- 언제든 🏠 버튼으로 Home 복귀

### 2️⃣ 진행 상황 피드백
- LoadingSpinner로 대기 시간 안내
- 명확한 상태 메시지
- 예상 소요 시간 표시

### 3️⃣ 에러 복구
- 친화적 에러 메시지
- 재시도 옵션 제공
- Home으로 안전한 복귀

### 4️⃣ 데이터 보존
- 작업 중 데이터 자동 저장
- Context API로 상태 유지
- IndexedDB로 영구 저장

---

## 🔄 상태 관리

### Context 사용
- **StoryContext**: 그림 생성 상태
- **StorybookContext**: 동화책 생성 상태

### 데이터 흐름
```
User Input
  ↓
React State (useState)
  ↓
Context API (useContext)
  ↓
IndexedDB (dbService)
  ↓
Persistent Storage
```

---

## 🚀 다음 개선 사항

### 단기 (1-2주)
- [ ] PDF 내보내기 기능 완성
- [ ] MyWorks 페이지 구현
- [ ] 작품 검색/필터링

### 중기 (1개월)
- [ ] Write 페이지 구현
- [ ] Goods 페이지 구현
- [ ] 클라우드 백업

### 장기 (3개월)
- [ ] 다국어 지원
- [ ] 접근성 개선
- [ ] 고급 편집 기능

---

**Last Updated**: 2025-12-05
**Version**: 1.0.0
