# HI-DI Edu AI Story Maker

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

## URLs
- **Production**: https://3000-i5dcsscuqxml7neuit43a-de59bda9.sandbox.novita.ai/
- **Local Dev**: http://localhost:3000

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
│   │   └── geminiService.ts       # Gemini API 통합 서비스 (이미지/텍스트 생성, 글쓰기 도우미)
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
2. **표지 생성** - Gemini API로 표지 이미지 자동 생성
3. **StorybookEditor** - 페이지 편집
   - 3개 예시 페이지 제공
   - 페이지별 텍스트 수정 가능
   - **⭐ 페이지 자동생성** - Gemini Pro API로 다음 페이지 자동 생성
   - 이전/다음 페이지 이동
4. **저장하기** - 동화책 데이터 저장 (준비 중)

### 3️⃣ 글쓰기 (준비 중)
- AI 기반 글쓰기 도우미
- 텍스트 생성 및 편집

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
- ✅ 표지 생성 (Gemini API)
- ✅ 페이지 편집 (StorybookEditor)
- ✅ **⭐ 페이지 자동생성** (Gemini Pro API)
- ❌ PDF 출력 (준비 중)

❌ **Write 페이지 구현**
- 텍스트 에디터
- AI 글쓰기 도우미
- 저장 기능

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

## ⭐ 새로 추가된 기능

### **페이지 자동생성 (StorybookEditor)**
```typescript
// src/utils/gemini.ts
export async function generateNextPage(prevPages: string[], style: string) {
  // Gemini Pro API로 이전 페이지를 분석하여 자연스러운 다음 페이지 생성
  // - 초등학생 수준의 쉬운 문장
  // - 3-5문장의 짧은 단락
  // - 스타일 유지 (동화, 모험, 힐링 등)
}
```

**사용 방법:**
1. StorybookEditor에서 "➕ 페이지 자동생성" 버튼 클릭
2. Gemini Pro가 현재 페이지들을 분석
3. 자연스럽게 이어지는 다음 페이지 자동 생성
4. 생성된 페이지로 자동 이동

## 다음 개발 단계 권장사항

1. **MyWorks 페이지 구현** ⭐ 우선순위 높음
   - IndexedDB 기반 작품 저장 시스템
   - 동화책, 그림 작품 목록 표시
   - 작품 카드 레이아웃 (그리드)
   - 상세보기/수정/삭제 기능
   - 작품 검색 및 필터링

2. **페이지별 이미지 생성** (StorybookEditor 고도화)
   - 각 페이지 텍스트 기반 이미지 자동 생성
   - Gemini Pro Vision API 활용
   - 이미지 편집 및 재생성 기능

3. **Write 페이지 구현**
   - 텍스트 에디터 추가 (간단한 textarea)
   - Gemini Pro로 AI 글쓰기 도우미
   - 주제 제안, 문장 완성, 문법 교정

4. **Loading UI 추가**
   - 이미지 생성 중 스피너
   - 진행률 표시
   - 예상 소요 시간 표시

5. **PDF 내보내기** (Storybook 완성)
   - 동화책을 PDF로 변환
   - 인쇄 최적화 레이아웃
   - 다운로드 기능

6. **Backend API Proxy** (보안 강화)
   - Cloudflare Workers로 API 프록시
   - API 키 보안 강화
   - 사용량 제한 및 모니터링

7. **인증 기능 구현**
   - Firebase Auth 또는 Supabase 연동
   - 사용자별 작품 관리
   - 클라우드 백업

## Deployment
- **Platform**: Sandbox Environment (개발)
- **Status**: ✅ Active
- **Production URL**: https://3000-i5dcsscuqxml7neuit43a-de59bda9.sandbox.novita.ai
- **Last Updated**: 2025-12-04

## 프로젝트 진행 상황

### ✅ 완료된 모듈 (100%)
1. **AI 그림 생성** - DrawStart, DrawPractice, DirectInput, Result
2. **동화책 생성** - Storybook, StorybookEditor (페이지 자동생성 포함)

### ⏳ 진행 중 (0%)
3. **글쓰기** - Write 페이지
4. **내 작품** - MyWorks 페이지
5. **굿즈** - Goods 페이지

**전체 진행률**: 40% (2/5 모듈 완료)
