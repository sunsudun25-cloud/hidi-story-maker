# webapp

## Project Overview
- **Name**: webapp
- **Goal**: React + TypeScript 기반의 기본 프로젝트
- **Features**: 
  - React 19 + TypeScript
  - Vite 빌드 시스템
  - 모던한 개발 환경 구성

## 프로젝트 구조
```
webapp/
├── src/
│   ├── App.tsx       # 메인 App 컴포넌트
│   ├── App.css       # App 스타일
│   ├── main.tsx      # 엔트리 포인트
│   └── index.css     # 글로벌 스타일
├── public/           # 정적 파일
├── index.html        # HTML 템플릿
├── package.json      # 의존성 관리
├── tsconfig.json     # TypeScript 설정
└── vite.config.ts    # Vite 설정
```

## 시작하기

### 개발 서버 실행
```bash
npm run dev
```

### 프로덕션 빌드
```bash
npm run build
```

### 빌드 미리보기
```bash
npm run preview
```

### 타입 체크
```bash
npm run lint
```

## 기술 스택
- **React** 19.2.0 - UI 라이브러리
- **TypeScript** 5.7.2 - 타입 안정성
- **Vite** 6.3.5 - 빌드 도구 및 개발 서버

## 완료된 기능
- ✅ React + TypeScript 기본 프로젝트 구조
- ✅ Vite 개발 환경 설정
- ✅ 기본 App 컴포넌트 및 스타일링
- ✅ TypeScript 설정 및 타입 체크

## 현재 기능 URI
- **개발 서버**: http://localhost:5173 (npm run dev 실행 시)

## 아직 구현되지 않은 기능
- 라우팅 (React Router)
- 상태 관리 (Redux, Zustand 등)
- API 통신
- 테스트 설정

## 다음 개발 단계 권장사항
1. React Router를 추가하여 페이지 라우팅 구현
2. 상태 관리 라이브러리 도입
3. UI 컴포넌트 라이브러리 추가 (Material-UI, Ant Design 등)
4. API 클라이언트 설정 (axios, fetch)
5. Jest 또는 Vitest를 이용한 테스트 환경 구축

## Last Updated
2025-12-03
