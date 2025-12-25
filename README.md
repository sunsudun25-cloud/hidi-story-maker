# Story Maker - AI 동화책 제작 플랫폼

> 🚀 **배포 상태**: Cloudflare Pages 자동 배포 완료

## 📌 Project Overview
- **Name**: Story Maker (시니어 친화형 AI 스토리 메이커)
- **Goal**: 노인 친화적 AI 기반 동화책 및 스토리 제작 웹 애플리케이션
- **Platform**: Cloudflare Pages + Workers

## 🌐 URLs

### 프로덕션
- **Live Site**: https://story-maker-4l6.pages.dev
- **Latest Deploy**: https://9f5c6bee.story-maker-4l6.pages.dev

### GitHub
- **Repository**: https://github.com/sunsudun25-cloud/hidi-story-maker

## ✨ 주요 기능

### 1️⃣ 그림 만들기 ✅
- **말로 설명하기**: Web Speech API 음성 인식 (한국어 지원)
- **직접 입력**: 텍스트 입력 + 손글씨 인식 (OpenAI Vision API)
- **사진 업로드**: 참고 이미지 업로드 기능
- **AI 이미지 생성**: DALL-E 3를 통한 고품질 일러스트 생성
- **다양한 스타일**: 수채화, 동화풍, 파스텔톤 등

### 2️⃣ 글쓰기 ✅
- **3가지 시작 모드**:
  - 💡 연습하기 (주제 추천)
  - 📝 장르 선택 (일기, 편지, 수필, 시, 소설, 자서전)
  - ✍️ 자유롭게 쓰기 (AI 보조작가)
- **AI 글쓰기 도우미**:
  - 이어쓰기, 문법교정, 감정강화
  - 구성제안, 문장다듬기, 텍스트분석, 제목추천
- **손글씨 입력**: OpenAI Vision을 통한 손글씨 인식
- **음성 입력**: Web Speech API 지원
- **이미지 생성**: 글 내용 기반 AI 이미지 자동 생성

### 3️⃣ 동화책 만들기 ✅
- **초안 생성**: Gemini API로 3페이지 자동 생성
- **페이지 편집**: 최대 10페이지까지 확장
- **AI 이어쓰기**: Gemini Pro를 통한 스토리 자동 생성
- **손글씨 입력**: 페이지별 손글씨 인식 지원
- **삽화 생성**: DALL-E 3로 페이지별 일러스트 생성
- **텍스트 제거 강화**: 동화책 삽화에 텍스트 없는 순수 일러스트
- **PDF 내보내기**: 
  - 세로 방향: 위에 그림, 아래에 글
  - 가로 방향: 왼쪽에 그림, 오른쪽에 글
  - html2canvas를 통한 완벽한 한글 지원

### 4️⃣ 내 작품 관리 ✅
- **작품 저장**: IndexedDB 기반 로컬 저장
- **작품 목록**: 그림, 글, 동화책 분류 표시
- **작품 상세**: 다운로드, 공유, 수정, 삭제 기능
- **버튼 레이아웃 통일**: 일관된 UI/UX

## 🎨 최근 주요 업데이트 (2024-12-25)

### ✅ 완료된 개선사항

**1. 음성 입력 기능 (Web Speech API)**
- 그림 만들기, 글쓰기, 동화책 만들기 전체 지원
- 한국어 음성 인식 (`ko-KR`)
- 브라우저 호환성 체크 및 오류 처리

**2. 사진 업로드 기능**
- 그림 만들기에서 참고 이미지 업로드
- 파일 형식/크기 검증 (JPEG, PNG, GIF, WebP, 최대 10MB)
- 자동 압축 (1024x1024px)
- Base64 변환 및 미리보기

**3. 손글씨 인식 기능 (OpenAI Vision API)**
- 그림 만들기, 글쓰기, 동화책 만들기 전체 지원
- GPT-4o-mini Vision 모델 사용
- 한국어/영어 손글씨 인식
- 10-15초 평균 인식 시간

**4. 동화책 이미지 텍스트 제거 강화**
- DALL-E 3 프롬프트 최적화
- "NO TEXT" 규칙을 최우선 배치
- 간결하고 강력한 지시사항으로 개선
- 백엔드/프론트엔드 일관성 유지

**5. PDF 한글 지원 완전 개선**
- html2canvas를 사용한 텍스트 이미지 렌더링
- Noto Sans KR 폰트 의존성 제거
- 브라우저 네이티브 폰트 사용
- 한글, 이모지, 특수문자 완벽 표시

**6. PDF 레이아웃 원칙 정립**
- **세로 방향**: 위에 그림, 아래에 글
- **가로 방향**: 왼쪽에 그림, 오른쪽에 글
- 방향 선택 시 자동 레이아웃 적용
- 그림 없는 페이지는 여백 유지 (수동 이미지 삽입 가능)

**7. 입력 필드 개선**
- IME 활성화로 한글 입력 명확화
- autoComplete, inputMode 속성 추가
- 저자명 입력 필드 초기값 수정

**8. 버튼 레이아웃 통일**
- 그림, 글쓰기, 동화책 상세 페이지 일관성
- 2열 그리드 + 12px 간격
- 명확한 색상 구분 (다운로드: 녹색, 공유: 파란색, 수정: 파란색, 삭제: 빨간색)

## 📐 PDF 동화책 레이아웃 원칙

### 세로 방향 (Vertical)
```
┌─────────────┐
│             │
│   📸 그림   │
│             │
├─────────────┤
│             │
│   📝 글     │
│             │
└─────────────┘
```
- A4 세로 (210mm × 297mm)
- 그림 없는 페이지: 위쪽 여백 유지, 아래에 글

### 가로 방향 (Horizontal)
```
┌─────────┬─────────┐
│         │         │
│ 📸 그림 │ 📝 글   │
│         │         │
└─────────┴─────────┘
```
- A4 가로 (297mm × 210mm)
- 그림 없는 페이지: 왼쪽 여백 유지, 오른쪽에 글

**여백 유지 이유**: 사용자가 프린트 후 직접 그림을 그리거나 붙일 수 있도록

## 🛠️ Tech Stack

### Frontend
- **React** 19.2.0 + **TypeScript** 5.9.3
- **Vite** 6.4.1 (빌드 도구)
- **React Router DOM** 7.10.0 (라우팅)
- **Tailwind CSS** (CDN)
- **html2canvas** (PDF 렌더링)
- **jsPDF** (PDF 생성)

### Backend & APIs
- **Cloudflare Pages/Workers** (호스팅)
- **Cloudflare D1** (SQLite 데이터베이스)
- **OpenAI API**:
  - DALL-E 3 (이미지 생성)
  - GPT-4o-mini Vision (손글씨 인식)
- **Gemini API** (텍스트 생성)
- **Web Speech API** (음성 인식)

### Storage
- **IndexedDB** (로컬 저장)
- **Cloudflare D1** (서버 저장)

## 📁 Project Structure

```
webapp/
├── src/
│   ├── App.tsx                      # 메인 라우팅
│   ├── main.tsx                     # 엔트리 포인트
│   ├── components/                  # 재사용 컴포넌트
│   ├── pages/
│   │   ├── DrawPractice.tsx        # 그림 연습하기
│   │   ├── DrawDirect.tsx          # 그림 직접입력
│   │   ├── WriteEditor.tsx         # 글쓰기 편집기
│   │   ├── StorybookEditor.tsx     # 동화책 편집기
│   │   ├── StorybookExport.tsx     # PDF 내보내기
│   │   └── MyWorks*.tsx            # 작품 관리
│   ├── services/
│   │   ├── speechRecognitionService.ts  # 음성 인식
│   │   ├── imageUploadService.ts        # 이미지 업로드
│   │   ├── visionService.ts             # 손글씨 인식
│   │   ├── pdfService.ts                # PDF 생성
│   │   ├── cloudflareImageApi.ts        # DALL-E 3 연동
│   │   └── geminiService.ts             # Gemini 연동
│   └── context/
│       └── StoryContext.tsx         # 상태 관리
├── functions/api/
│   ├── generate-image.ts            # DALL-E 3 프록시
│   └── analyze-image.ts             # Vision API 프록시
├── public/                          # 정적 파일
└── dist/                            # 빌드 결과
```

## 🚀 Development

### 환경 설정

1. **의존성 설치**:
```bash
npm install
```

2. **환경 변수 설정** (`.dev.vars`):
```bash
OPENAI_API_KEY=your-openai-api-key
GEMINI_API_KEY=your-gemini-api-key
```

3. **개발 서버 실행**:
```bash
# 빌드
npm run build

# PM2로 실행
pm2 start ecosystem.config.cjs

# 서비스 확인
curl http://localhost:3000
```

### 배포

```bash
# 1. 빌드
npm run build

# 2. Cloudflare Pages 배포
npx wrangler pages deploy dist --project-name story-maker

# 3. GitHub 푸시
git add .
git commit -m "feat: 새 기능 추가"
git push origin main
```

## 🎨 디자인 시스템

### 색상 팔레트
- **Primary**: `#10b981` (emerald-500, 다운로드)
- **Secondary**: `#3b82f6` (blue-500, 공유/수정)
- **Warning**: `#f59e0b` (amber-500)
- **Danger**: `#dc2626` (red-600, 삭제)
- **Purple**: `#9333ea` (purple-600, 다시만들기)
- **Background**: `#FFF9F0` (크림 베이지)

### 타이포그래피
- **Font**: "Noto Sans KR", "Malgun Gothic", sans-serif
- **본문**: 14-18px
- **제목**: 20-32px
- **최소 크기**: 12px (시니어 고려)

### 노인 친화적 UI 원칙
- ✅ 큰 글자 (최소 14px)
- ✅ 높은 대비
- ✅ 넓은 터치 영역 (최소 48x48px)
- ✅ 명확한 버튼 레이블
- ✅ 일관된 레이아웃

## 📊 완료 현황

- ✅ 그림 만들기 (100%)
- ✅ 글쓰기 (100%)
- ✅ 동화책 만들기 (100%)
- ✅ 내 작품 관리 (90%)
- ⏳ 굿즈 만들기 (0%)

**전체 진행률**: 약 80%

## 🔜 다음 개발 계획

1. **굿즈 만들기 모듈**
   - 머그컵, 티셔츠, 스티커 등
   - 작품을 굿즈에 적용
   - 주문 및 배송 연동

2. **사용자 인증**
   - Cloudflare Access
   - 사용자별 작품 관리
   - 클라우드 동기화

3. **공유 기능 강화**
   - 소셜 미디어 연동
   - 작품 갤러리
   - QR 코드 생성

4. **성능 최적화**
   - 이미지 압축
   - 레이지 로딩
   - 캐싱 전략

## 📝 License
MIT

## 👥 Contributors
- Project Lead: sunsudun25-cloud

---

**Last Updated**: 2024-12-25
