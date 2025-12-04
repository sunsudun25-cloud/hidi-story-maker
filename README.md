# HI-DI Edu AI Story Maker

## Project Overview
- **Name**: webapp (HI-DI Edu AI Story Maker)
- **Goal**: 노인 친화적 AI 스토리 메이커 웹 애플리케이션
- **Features**: 
  - 큰 글자, 높은 대비, 넓은 터치 영역으로 노인 친화적 UI 구현
  - AI 기반 그림/글쓰기/동화책 제작 기능
  - IndexedDB 기반 로컬 스토리 저장
  - React Router 기반 SPA 구조

## URLs
- **Production**: https://3000-i5dcsscuqxml7neuit43a-de59bda9.sandbox.novita.ai/
- **Local Dev**: http://localhost:3000

## Data Architecture
- **Data Models**: Story (id, title, content, createdAt, updatedAt)
- **Storage Services**: IndexedDB (dbService) - 브라우저 로컬 스토리지
- **Data Flow**: StoryContext (React Context API) → dbService → IndexedDB

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
│   │   └── dbService.ts           # IndexedDB 서비스
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
- `/drawing/practice` - DrawPractice (연습하기)
- `/drawing/direct` - DrawDirect (직접입력)
- `/write` - Write (글쓰기)
- `/storybook` - Storybook (동화책 만들기)
- `/my-works` - MyWorks (내 작품 보기)
- `/goods` - Goods (나만의 굿즈 만들기)

## User Guide

1. **시작하기**: Welcome 화면에서 '시작하기' 버튼 클릭
2. **로그인**: 비회원으로 시작 또는 소셜 로그인 선택
3. **메뉴 선택**: 홈 화면에서 5가지 기능 중 선택
   - 🌈 그림 만들기
   - ✍️ 글쓰기
   - 📚 동화책 만들기
   - 🏆 내 작품 보기
   - 🎁 나만의 굿즈 만들기
4. **작품 제작**: 각 기능에서 AI 도움을 받아 작품 제작
5. **작품 저장**: 작품은 자동으로 브라우저에 저장

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
- **Gemini API** - AI 이미지 생성

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

❌ **AI 통합**
- 이미지 생성 API 연동
- 텍스트 생성 API 연동
- 음성 입력 처리 (Web Speech API 구현됨, 백엔드 연동 필요)

❌ **DrawDirect 페이지 완성**
- 텍스트 입력 영역
- 스타일 선택
- 이미지 생성 버튼
- 결과 표시

❌ **Write 페이지 구현**
- 텍스트 에디터
- AI 글쓰기 도우미
- 저장 기능

❌ **Storybook 페이지 구현**
- 스토리 생성 워크플로우
- 그림+글 조합
- PDF 출력

❌ **MyWorks 페이지 구현**
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

## 다음 개발 단계 권장사항

1. **DrawDirect 페이지 완성**
   - 텍스트 입력, 스타일 선택, 이미지 생성 버튼 추가
   - DrawPractice와 비슷한 UI 적용

2. **AI API 연동**
   - 이미지 생성 API (예: DALL-E, Stable Diffusion) 연동
   - 프롬프트 최적화 로직 추가

3. **MyWorks 페이지 구현**
   - dbService의 getAllStories() 활용
   - 작품 카드 레이아웃 (그리드)
   - 상세보기/수정/삭제 기능

4. **Write 페이지 구현**
   - 텍스트 에디터 추가 (간단한 textarea 또는 React Quill)
   - AI 글쓰기 도우미 (주제 제안, 문장 완성)

5. **Storybook 페이지 구현**
   - 스토리 페이지 추가/편집 UI
   - 그림+글 조합 미리보기
   - PDF 생성 및 다운로드

6. **인증 기능 구현**
   - Firebase Auth 또는 Supabase 연동
   - 사용자별 작품 관리

## Deployment
- **Platform**: Sandbox Environment (개발)
- **Status**: ✅ Active
- **Last Updated**: 2025-12-03
