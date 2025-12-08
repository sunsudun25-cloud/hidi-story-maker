# HI-DI Edu AI Story Maker

> 🚀 **배포 상태**: Firebase Hosting 자동 배포 설정 완료

## Project Overview
- **Name**: webapp (HI-DI Edu AI Story Maker)
- **Goal**: 노인 친화적 AI 스토리 메이커 웹 애플리케이션
- **Features**: 
  - 큰 글자, 높은 대비, 넓은 터치 영역으로 노인 친화적 UI 구현
  - **AI 기반 그림 생성** (Gemini API - 완료 ✅)
  - **AI 기반 동화책 생성** (Gemini Pro Text API - 완료 ✅)
  - **페이지 자동생성 기능** (Gemini Pro - 완료 ✅)
  - IndexedDB 기반 로컬 스토리 저장
  - React Router 기반 SPA 구조

## 🌐 URLs

### 프로덕션 (Firebase Hosting)
- **Live Site**: https://story-make-fbbd7.web.app
- **Alternative**: https://story-make-fbbd7.firebaseapp.com

### 개발 환경
- **Sandbox Dev**: https://3000-i5dcsscuqxml7neuit43a-de59bda9.sandbox.novita.ai/
- **Local Dev**: http://localhost:3000

### GitHub
- **Repository**: https://github.com/sunsudun25-cloud/hidi-story-maker
- **Actions**: https://github.com/sunsudun25-cloud/hidi-story-maker/actions

## Data Architecture
- **Data Models**: Story (id, title, content, createdAt, updatedAt)
- **Storage Services**: IndexedDB (dbService) - 브라우저 로컬 스토리지
- **Data Flow**: StoryContext (React Context API) → dbService → IndexedDB
- **AI Services**: 
  - Gemini Pro Vision API (이미지 생성)
  - Gemini Pro API (텍스트 생성 - 페이지 자동생성)

## Project Structure
```
webapp/
├── src/
│   ├── App.tsx                    # 메인 라우팅 설정
│   ├── main.tsx                   # 엔트리 포인트 (StoryProvider 적용)
│   ├── components/
│   │   ├── Layout.tsx             # 레이아웃 및 헤더 관리
│   │   └── TopHeader.tsx          # 공통 헤더 컴포넌트
│   ├── pages/
│   │   ├── Welcome.tsx            # 시작 화면 (헤더 없음)
│   │   ├── OnboardingLogin.tsx    # 로그인 화면 (헤더 없음)
│   │   ├── Home.tsx               # 홈 메뉴 화면 (헤더 없음)
│   │   ├── DrawStart.tsx          # 그림 그리기 시작
│   │   ├── DrawPractice.tsx       # 그림 연습하기 (예시 제공)
│   │   ├── DrawDirect.tsx         # 그림 직접 입력
│   │   ├── Write.tsx              # 글쓰기
│   │   ├── Storybook/index.tsx    # 동화책 만들기
│   │   ├── MyWorks.tsx            # 내 작품 보기
│   │   └── Goods.tsx              # 나만의 굿즈 만들기
│   ├── context/
│   │   └── StoryContext.tsx       # 스토리 상태 관리 Context
│   ├── services/
│   │   ├── dbService.ts           # IndexedDB 서비스
│   │   ├── geminiService.ts       # Gemini API 서비스 (텍스트 생성, 글쓰기 도우미)
│   │   ├── imageService.ts        # 이미지 서비스 (생성, 다운로드, 리사이즈, 워터마크 등)
│   │   └── pdfService.ts          # PDF 서비스 (동화책 PDF 생성 및 내보내기)
│   └── styles/
│       └── global.css             # 글로벌 스타일 (노인 친화적 UI)
├── public/                        # 정적 파일
├── package.json                   # 의존성 관리
└── ecosystem.config.cjs           # PM2 설정 (개발 서버)
```

## Routing Structure

### 헤더가 없는 페이지 (독립 라우트)
- `/` - Welcome (시작 화면)
- `/onboarding` - OnboardingLogin (로그인)
- `/home` - Home (메인 메뉴)

### Layout으로 감싸진 페이지 (TopHeader 자동 표시)
- `/drawing/start` - DrawStart (그림 그리기 시작)
- `/drawing/practice` - DrawPractice (연습하기 - Gemini API 연동 ✅)
- `/direct-input` - DirectInput (직접입력 - Gemini API 연동 ✅)
- `/write` - Write (글쓰기)
- `/storybook` - Storybook (동화책 만들기 - Gemini API 연동 ✅)
- `/storybook-editor` - StorybookEditor (페이지 편집 + 자동생성 ✅)
- `/result` - Result (생성된 이미지 결과)
- `/my-works` - MyWorks (내 작품 보기)
- `/goods` - Goods (나만의 굿즈 만들기)

## User Guide

### 1️⃣ 그림 만들기 (완료 ✅)
1. **DrawStart** - 연습하기 또는 직접입력 선택
2. **DrawPractice** - 예시 선택 + 스타일 선택 + 음성 입력 지원
3. **DirectInput** - 텍스트 입력 + 스타일 선택
4. **AI 생성** - Gemini Pro Vision API로 이미지 생성 (1024x1024)
5. **Result** - 결과 확인 + 저장/공유

### 2️⃣ 동화책 만들기 (완료 ✅)
1. **Storybook** - 제목/프롬프트/스타일 입력
2. **초안 생성** - Gemini API로 3페이지 초안 자동 생성
3. **StorybookEditor** - 페이지 편집 및 확장
   - 3개 초안 페이지 제공
   - 페이지별 텍스트 수정 가능
   - **✨ 페이지 확장 시스템** - AI 이어쓰기 vs 직접 쓰기 선택
   - **🎨 삽화 생성** - 개별 또는 전체 페이지 이미지 자동 생성
   - **📚 최소 10페이지** - 품질 보장을 위한 최소 페이지 제한
   - 이전/다음 페이지 이동
4. **저장/PDF** - 동화책 저장 및 PDF 내보내기 (10페이지 이상)

### 3️⃣ 글쓰기 (완료 ✅)
1. **Write** - 3가지 시작 모드 선택
   - 💡 **연습하기**: AI가 주제를 자동 제안하여 부담없이 시작
   - 📝 **선택하기**: 장르 선택 (일기, 편지, 수필, 시, 자서전, 회고록)
   - ✍️ **작성하기**: 자유 글쓰기 + AI 보조작가 (고급 기능)
2. **장르별 글쓰기 (WritingGenre → WriteEditor)**
   - 📝 각 장르별 작성 가이드 제공
   - 💡 장르별 예시 문장 삽입
   - 🤖 기본 AI 도우미: 이어쓰기, 문법 교정, 감정 강화
   - 🎤 음성 입력 지원
3. **자유 글쓰기 AI 보조작가 (WriteEditor - 자유 모드)**
   - 📊 **글 구성 제안**: 서론-본론-결론 구조 제시
   - ✨ **문장 다듬기**: 비유, 은유 등 문학적 표현 추가
   - 📊 **글 분석**: 어조, 감정, 가독성, 개선점 분석
   - 📝 **제목 추천**: 내용 기반 제목 3개 제안
   - 💾 IndexedDB 저장

### 4️⃣ 내 작품 보기 (준비 중)
- IndexedDB 기반 작품 저장/관리
- 작품 목록 표시 및 편집

### 5️⃣ 나만의 굿즈 만들기 (준비 중)
- 작품을 굿즈로 제작
- 프린트/배송 옵션

## 노인 친화적 UI 디자인 원칙

- **큰 글자**: 24px 이상 (제목 28-48px, 본문 18-20px)
- **높은 대비**: 어두운 텍스트 (#222), 밝은 배경 (#F8F7FE)
- **넓은 터치 영역**: 버튼 최소 48x48px, 여백 충분히 확보
- **명확한 시각적 계층**: 색상과 크기로 중요도 구분
- **파스텔 톤**: 편안한 색상 (#FFE888, #C8F7CB, #BCDCFF 등)
- **간단한 네비게이션**: 뒤로가기/홈 버튼 항상 표시

## Tech Stack
- **React** 19.2.0 - UI 라이브러리
- **TypeScript** 5.9.3 - 타입 안정성
- **Vite** 6.4.1 - 빌드 도구 및 개발 서버
- **React Router DOM** 7.10.0 - 클라이언트 사이드 라우팅
- **IndexedDB** - 로컬 데이터 저장
- **PM2** - 프로세스 관리
- **Gemini Pro Vision API** - AI 이미지 생성 (DrawPractice, DirectInput, Storybook 표지)
- **Gemini Pro API** - AI 텍스트 생성 (StorybookEditor 페이지 자동생성)
- **@google/generative-ai** - Gemini API SDK

## Environment Setup

**IMPORTANT: API 키 설정 필수!**

1. **`.env` 파일 생성**:
```bash
# Copy the example file
cp .env.example .env
```

2. **Gemini API 키 발급**:
   - https://makersuite.google.com/app/apikey 방문
   - Google 계정으로 로그인
   - "Create API Key" 클릭
   - 생성된 키를 복사

3. **`.env` 파일 편집**:
```bash
# 두 가지 형식 모두 지원됩니다
VITE_GEMINI_KEY=your-gemini-api-key-here
# 또는
VITE_GEMINI_API_KEY=your-gemini-api-key-here
```

## Development Commands

```bash
# 개발 서버 실행 (Vite Dev Server)
npm run dev

# 프로덕션 빌드
npm run build

# PM2로 개발 서버 실행 (샌드박스 환경)
pm2 start ecosystem.config.cjs

# PM2 상태 확인
pm2 list

# PM2 로그 확인
pm2 logs webapp --nostream

# PM2 재시작
pm2 restart webapp

# Git 커밋
git add .
git commit -m "커밋 메시지"
```

## 완료된 기능

✅ **프로젝트 기본 구조**
- React + TypeScript 프로젝트 설정
- Vite 빌드 환경 구성
- Git 리포지토리 초기화

✅ **라우팅 구조**
- React Router 기반 SPA 구조
- Layout 컴포넌트를 통한 헤더 자동 관리
- 헤더가 필요 없는 페이지와 헤더가 있는 페이지 분리

✅ **상태 관리**
- StoryContext (Context API) 구현
- IndexedDB 통합 (dbService)
- 자동 저장/불러오기

✅ **노인 친화적 UI**
- Welcome 페이지 (큰 버튼, 명확한 타이포그래피)
- OnboardingLogin 페이지 (소셜 로그인 옵션)
- Home 페이지 (2x2+1 그리드, 파스텔 톤)
- TopHeader 컴포넌트 (뒤로가기/홈 버튼)
- 글로벌 스타일 시스템 (global.css)

✅ **그림 만들기 모듈**
- DrawStart 페이지 (연습하기/직접입력 선택)
- DrawPractice 페이지 (예시 프롬프트, 스타일 선택, 음성 입력)
- DrawDirect 페이지 (기본 구조)

✅ **기타 페이지 기본 구조**
- Write 페이지
- Storybook 페이지
- MyWorks 페이지
- Goods 페이지

## 아직 구현되지 않은 기능

✅ **AI 통합** (완료)
- ✅ 이미지 생성 API 연동 (Gemini Pro Vision)
- ✅ 텍스트 생성 API 연동 (Gemini Pro)
- ✅ 음성 입력 처리 (Web Speech API)

✅ **DirectInput 페이지** (완료)
- ✅ 텍스트 입력 영역
- ✅ 스타일 선택
- ✅ 이미지 생성 (Gemini API)
- ✅ 결과 표시 (Result 페이지)

✅ **Storybook 페이지** (완료)
- ✅ 초안 생성 (Gemini API - 3페이지)
- ✅ 페이지 편집 (StorybookEditor)
- ✅ **✨ 페이지 확장 시스템** (AI 이어쓰기 vs 직접 쓰기)
- ✅ **🎨 모든 삽화 자동 생성** (DALL-E 3 + Firebase Functions)
- ✅ **📚 최소 10페이지 시스템** (품질 보장)
- ✅ PDF 출력 (빠른 PDF + 고급 PDF)

✅ **Write 페이지 구현** (완료)
- ✅ 3가지 시작 모드 선택 페이지 (연습/선택/작성)
- ✅ 장르별 글쓰기 시스템 (6가지 장르)
- ✅ 장르별 가이드 및 예시 문장
- ✅ 기본 AI 글쓰기 도우미 (4가지 기능)
- ✅ 자유 글쓰기 AI 보조작가 (고급 4가지 기능)
- ✅ 음성 입력 지원
- ✅ IndexedDB 자동 저장

❌ **MyWorks 페이지 구현**
- IndexedDB 기반 작품 저장
- 저장된 작품 목록 표시
- 작품 수정/삭제
- 작품 미리보기

❌ **Goods 페이지 구현**
- 굿즈 템플릿 선택
- 작품 적용
- 주문 기능

❌ **인증 및 로그인**
- Google 로그인 실제 연동
- Kakao 로그인 실제 연동
- 사용자 세션 관리

## ⭐ 새로 추가된 기능 (2025-12-08)

### **1️⃣ 페이지 확장 시스템** ✨ NEW
- **3페이지 후 선택 UI**: AI가 이어쓰기 vs 직접 쓰기
- **스마트 페이지 추가**: 사용자가 원하는 방식으로 동화책 확장
- **UX 개선**: 명확한 선택 모달과 안내 메시지

**사용 방법:**
1. StorybookEditor에서 3페이지 작성 완료
2. "➕ 페이지 추가하기" 버튼 클릭
3. 선택:
   - 🤖 **AI가 이어서 쓰기**: Gemini Pro가 자동 생성
   - ✍️ **내가 직접 쓰기**: 빈 페이지 추가하여 직접 입력

### **2️⃣ 최소 10페이지 시스템** 📚 NEW
- **품질 보장**: 동화책은 최소 10페이지 이상 필수
- **저장/PDF 제한**: 10페이지 미만 시 저장 및 PDF 생성 비활성화
- **진행률 표시**: 현재 페이지 수와 필요한 페이지 수 실시간 표시
- **시각적 경고**: 10페이지 미만 시 경고 배너 표시

### **3️⃣ 모든 삽화 자동 생성** 🎨 NEW
- **한 번에 이미지 생성**: 모든 페이지의 삽화를 자동으로 생성
- **내용 기반 생성**: 각 페이지의 텍스트 내용을 분석하여 적절한 삽화 생성
- **진행률 표시**: 생성 중인 페이지와 예상 소요 시간 표시
- **DALL-E 3 연동**: Firebase Functions를 통한 고품질 이미지 생성

**사용 방법:**
1. 동화책의 모든 페이지 텍스트 작성 완료
2. "🎨 모든 삽화 자동생성" 버튼 클릭
3. 확인 후 자동 생성 시작 (페이지당 약 30초 소요)
4. 생성 완료 후 결과 확인

## 다음 개발 단계 권장사항

1. **삽화 생성 최적화** ⭐ 우선순위 높음
   - Firebase Functions 안정성 개선
   - 이미지 생성 속도 최적화
   - 에러 처리 개선 및 재시도 로직

2. **MyWorks 페이지 구현** ⭐ 우선순위 높음
   - IndexedDB 기반 작품 저장 시스템
   - 동화책, 그림 작품 목록 표시
   - 작품 카드 레이아웃 (그리드)
   - 상세보기/수정/삭제 기능
   - 작품 검색 및 필터링

3. **Write 페이지 구현**
   - 텍스트 에디터 추가 (간단한 textarea)
   - Gemini Pro로 AI 글쓰기 도우미
   - 주제 제안, 문장 완성, 문법 교정

4. **페이지 관리 고도화**
   - 페이지 순서 변경 (드래그 앤 드롭)
   - 페이지 삭제 기능
   - 페이지 복사 기능
   - 페이지 미리보기

5. **PDF 고도화**
   - 표지 커스터마이징
   - 페이지 레이아웃 옵션 확대
   - 워터마크 추가
   - 인쇄 최적화

6. **Backend API Proxy** (보안 강화)
   - Cloudflare Workers로 API 프록시
   - API 키 보안 강화
   - 사용량 제한 및 모니터링

7. **인증 기능 구현**
   - Firebase Auth 또는 Supabase 연동
   - 사용자별 작품 관리
   - 클라우드 백업

## 🚀 Deployment

### Firebase Hosting (프로덕션)
- **Platform**: Firebase Hosting + GitHub Actions
- **Status**: ✅ Active & Auto-Deploy
- **Production URL**: https://story-make-fbbd7.web.app
- **CI/CD**: GitHub Actions workflow (자동 배포)
- **Last Updated**: 2025-12-05

### 배포 방법
```bash
# 1. 코드 수정 후 커밋
git add .
git commit -m "새 기능 추가"

# 2. GitHub에 푸시 (자동 배포 트리거)
git push origin main

# 3. 배포 확인 (2-3분 소요)
# https://github.com/sunsudun25-cloud/hidi-story-maker/actions
# https://story-make-fbbd7.web.app
```

### 배포 가이드
- **빠른 시작**: `QUICK_START.md` - 3단계로 배포 완성
- **상세 가이드**: `STEP_BY_STEP_DEPLOYMENT.md` - 단계별 설명
- **배포 상태**: `DEPLOYMENT_STATUS.md` - 현재 상태 및 체크리스트

## 프로젝트 진행 상황

### ✅ 완료된 모듈 (100%)
1. **AI 그림 생성** - DrawStart, DrawPractice, DirectInput, Result
2. **동화책 생성** - Storybook, StorybookEditor
   - ✅ 초안 생성 (3페이지)
   - ✅ 페이지 확장 시스템 (AI/직접 선택)
   - ✅ 전체 삽화 자동 생성
   - ✅ 최소 10페이지 시스템
   - ✅ PDF 내보내기

### ⏳ 진행 중 (0%)
3. **글쓰기** - Write 페이지
4. **내 작품** - MyWorks 페이지
5. **굿즈** - Goods 페이지

**전체 진행률**: 60% (3/5 모듈 완료)

### ✅ 완료된 모듈 (70%)
1. **AI 그림 생성** - DrawStart, DrawPractice, DirectInput, Result
2. **동화책 생성** - Storybook, StorybookEditor (페이지 확장, 표지 생성, PDF)
3. **글쓰기** - Write (3가지 모드), WritingGenre (장르 선택), WriteEditor (AI 보조작가)

### ⏳ 진행 중 (30%)
4. **내 작품** - MyWorks 페이지 (부분 구현됨, 개선 필요)
5. **굿즈** - Goods 페이지

**전체 진행률**: 70% (3/5 모듈 완료, 글쓰기 모듈 고도화)
