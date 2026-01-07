# 🚀 스토리 메이커 상용화 체크리스트

## 📅 작성일: 2025-01-05
## 🎯 목표: Production-Ready 서비스 만들기

---

## 🔴 **CRITICAL (필수) - 즉시 해야 할 것들**

### 1. 🔐 보안 (Security)

#### ⚠️ **API 키 보안 강화** (최우선!)
- [ ] **Gemini API 키를 서버 사이드로 이동**
  - 현재: `VITE_GEMINI_API_KEY`로 브라우저에 노출됨 ⚠️
  - 해결: Cloudflare Functions로 프록시 API 생성
  ```bash
  # Cloudflare Secret으로 관리
  npx wrangler pages secret put GEMINI_API_KEY --project-name story-maker
  ```

- [ ] **OpenAI API 키 확인**
  ```bash
  npx wrangler secret list --project-name story-maker
  ```
  - 확인 필요: OPENAI_API_KEY가 Secret으로 설정되어 있는지

- [ ] **환경변수 점검**
  - `.env` 파일이 GitHub에 업로드되지 않았는지 확인
  - `VITE_` 접두사가 있는 민감 정보 제거

#### 👤 **사용자 인증 시스템**
- [ ] 로그인/회원가입 기능 추가
  - 추천 서비스:
    - **Cloudflare Access** (무료, 간단)
    - **Clerk** (무료 플랜, 쉬운 통합)
    - **Auth0** (엔터프라이즈급)
    - **Firebase Auth** (Google 계정 연동)

- [ ] 사용자별 작품 관리
  - 현재: IndexedDB (로컬 저장소)
  - 개선: User ID 기반 클라우드 저장

---

### 2. 💾 데이터베이스 및 저장소

#### ☁️ **클라우드 데이터베이스 도입**
- [ ] **Cloudflare D1 데이터베이스 설정**
  ```bash
  # D1 데이터베이스 생성
  npx wrangler d1 create story-maker-production
  
  # 마이그레이션 파일 생성
  mkdir migrations
  ```

- [ ] **사용자 데이터 스키마 설계**
  ```sql
  -- migrations/0001_initial_schema.sql
  CREATE TABLE users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    name TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE artworks (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    type TEXT NOT NULL, -- 'image', 'story', 'book'
    title TEXT,
    content TEXT,
    image_url TEXT,
    metadata JSON,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
  );

  CREATE INDEX idx_artworks_user_id ON artworks(user_id);
  CREATE INDEX idx_artworks_created_at ON artworks(created_at);
  ```

#### 🗄️ **이미지 저장소**
- [ ] **Cloudflare R2 설정** (S3 호환)
  ```bash
  # R2 버킷 생성
  npx wrangler r2 bucket create story-maker-images
  ```

- [ ] **이미지 업로드 API 구현**
  - Base64 → R2 업로드
  - 공개 URL 반환
  - 용량 제한: 5MB/이미지

---

### 3. 💰 비용 관리 및 사용량 제한

#### 📊 **Rate Limiting 구현**
- [ ] **사용량 제한 시스템**
  - 비로그인: 1일 3회
  - 로그인: 1일 10회
  - 프리미엄: 무제한

- [ ] **Cloudflare KV로 사용량 추적**
  ```typescript
  // functions/api/rate-limit.ts
  interface RateLimit {
    count: number;
    resetAt: number;
  }
  
  async function checkRateLimit(userId: string, env: any): Promise<boolean> {
    const key = `rate_limit:${userId}:${new Date().toDateString()}`;
    const limit = await env.KV.get(key);
    
    if (!limit) {
      await env.KV.put(key, JSON.stringify({ count: 1 }), { expirationTtl: 86400 });
      return true;
    }
    
    const { count } = JSON.parse(limit);
    if (count >= 10) return false;
    
    await env.KV.put(key, JSON.stringify({ count: count + 1 }), { expirationTtl: 86400 });
    return true;
  }
  ```

#### 💵 **비용 모니터링**
- [ ] **OpenAI API 사용량 추적**
  - Dashboard: https://platform.openai.com/usage
  - 일일 예산 설정: $50/day (예시)
  - 알림 설정: 80% 도달 시 이메일

- [ ] **Cloudflare Pages 사용량 확인**
  - 무료 플랜: 500 빌드/월, 100,000 요청/일
  - 유료 플랜: $20/월 (필요시)

---

### 4. 📈 모니터링 및 에러 추적

#### 🐛 **에러 모니터링 도구**
- [ ] **Sentry 통합** (추천)
  ```bash
  npm install @sentry/react @sentry/vite-plugin
  ```
  ```typescript
  // src/main.tsx
  import * as Sentry from "@sentry/react";
  
  Sentry.init({
    dsn: "YOUR_SENTRY_DSN",
    environment: "production",
    tracesSampleRate: 1.0,
  });
  ```

- [ ] **Cloudflare Analytics 활성화**
  - Dashboard → Analytics
  - Web Analytics 코드 추가

#### 📊 **사용 통계**
- [ ] **Google Analytics 4 추가** (선택사항)
  ```html
  <!-- public/index.html -->
  <script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
  ```

---

## 🟡 **HIGH (중요) - 빠른 시일 내 해야 할 것들**

### 5. ⚡ 성능 최적화

- [ ] **이미지 최적화**
  - WebP 포맷 사용
  - Lazy Loading 적용
  - 썸네일 생성 (작품 목록용)

- [ ] **코드 스플리팅**
  - 현재 main bundle: 366.79 kB (gzip: 113.19 kB)
  - 목표: 페이지별 청크 분리

- [ ] **CDN 캐싱 설정**
  ```toml
  # _headers 파일
  /assets/*
    Cache-Control: public, max-age=31536000, immutable
  
  /api/*
    Cache-Control: no-cache
  ```

- [ ] **Service Worker 구현** (PWA)
  - 오프라인 지원
  - 푸시 알림 (선택)

---

### 6. 🧪 테스트 및 품질 관리

- [ ] **자동화 테스트**
  ```bash
  npm install -D vitest @testing-library/react @testing-library/jest-dom
  ```
  - 주요 기능 유닛 테스트
  - E2E 테스트 (Playwright)

- [ ] **TypeScript 엄격 모드**
  ```json
  // tsconfig.json
  {
    "compilerOptions": {
      "strict": true,
      "noUnusedLocals": true,
      "noUnusedParameters": true
    }
  }
  ```

- [ ] **ESLint + Prettier 설정**
  ```bash
  npm install -D eslint prettier eslint-config-prettier
  ```

---

### 7. 📱 UX 개선

- [ ] **로딩 상태 개선**
  - Skeleton UI
  - 프로그레스 바
  - 예상 완료 시간 표시

- [ ] **에러 메시지 개선**
  - 현재: 기본 alert
  - 개선: Toast 알림 (react-hot-toast)

- [ ] **접근성 (A11y)**
  - ARIA 라벨 추가
  - 키보드 네비게이션
  - 스크린 리더 지원

- [ ] **다국어 지원** (선택)
  - i18next 통합
  - 한국어/영어

---

## 🟢 **MEDIUM (보통) - 장기적으로 개선할 것들**

### 8. 📄 법적 문서

- [ ] **이용약관 (Terms of Service)**
- [ ] **개인정보 처리방침 (Privacy Policy)**
- [ ] **쿠키 정책**
- [ ] **저작권 고지**

### 9. 🎨 디자인 개선

- [ ] **다크 모드 지원**
- [ ] **반응형 디자인 개선** (태블릿)
- [ ] **브랜드 아이덴티티 강화**

### 10. 🚀 마케팅 및 SEO

- [ ] **SEO 최적화**
  ```html
  <meta name="description" content="AI와 함께 만드는 특별한 이야기">
  <meta property="og:title" content="스토리 메이커">
  <meta property="og:image" content="/og-image.png">
  ```

- [ ] **사이트맵 생성**
- [ ] **robots.txt 설정**
- [ ] **Google Search Console 등록**

---

## 📋 **즉시 실행 가능한 우선순위 Top 5**

### 1️⃣ **API 키 보안 (최우선!)**
```bash
# Step 1: Gemini API를 서버사이드로 이동
cd /home/user/webapp
mkdir -p functions/api
# functions/api/gemini-proxy.ts 생성

# Step 2: Secret 설정
npx wrangler pages secret put GEMINI_API_KEY --project-name story-maker
# 입력: AIzaSyDrfdKeWEaKo1Tni7yiBFIqSxcWRhEdC24

# Step 3: .env에서 제거
# VITE_GEMINI_API_KEY 삭제
```

### 2️⃣ **Rate Limiting 구현**
- 일일 사용량 제한으로 비용 폭탄 방지
- Cloudflare KV 사용

### 3️⃣ **에러 모니터링 (Sentry)**
- 프로덕션 에러 실시간 추적
- 무료 플랜: 5,000 이벤트/월

### 4️⃣ **데이터베이스 마이그레이션**
- IndexedDB → Cloudflare D1
- 사용자 작품을 클라우드에 저장

### 5️⃣ **이용약관 및 개인정보 처리방침**
- 법적 리스크 최소화
- AI 생성물 저작권 명시

---

## 💡 권장 개발 순서

```
Phase 1: 보안 강화 (1주)
├── API 키 서버사이드 이동
├── Rate Limiting 구현
└── Secret 관리 점검

Phase 2: 데이터베이스 (1-2주)
├── Cloudflare D1 설정
├── R2 이미지 저장소
└── 마이그레이션 도구

Phase 3: 모니터링 (1주)
├── Sentry 통합
├── Analytics 설정
└── 대시보드 구축

Phase 4: UX 개선 (2주)
├── 로딩 상태 개선
├── 에러 처리 개선
└── 접근성 개선

Phase 5: 법적/마케팅 (1주)
├── 이용약관 작성
├── SEO 최적화
└── 홍보 준비
```

---

## 🎯 출시 전 최종 체크리스트

- [ ] 모든 API 키가 Secret으로 관리되는가?
- [ ] Rate Limiting이 작동하는가?
- [ ] 에러 모니터링이 설정되었는가?
- [ ] 데이터 백업 시스템이 있는가?
- [ ] 이용약관/개인정보 처리방침이 있는가?
- [ ] 프로덕션 환경에서 충분히 테스트했는가?
- [ ] 비용 예산이 설정되어 있는가?
- [ ] 고객 지원 채널이 준비되어 있는가?

---

## 📞 참고 자료

- [Cloudflare Pages Docs](https://developers.cloudflare.com/pages/)
- [Cloudflare D1 Docs](https://developers.cloudflare.com/d1/)
- [Cloudflare R2 Docs](https://developers.cloudflare.com/r2/)
- [OpenAI Rate Limits](https://platform.openai.com/docs/guides/rate-limits)
- [Sentry React](https://docs.sentry.io/platforms/javascript/guides/react/)

---

## 🚨 긴급 연락처

- OpenAI Support: https://help.openai.com/
- Cloudflare Support: https://support.cloudflare.com/
- GitHub Issues: https://github.com/sunsudun25-cloud/hidi-story-maker/issues

---

**마지막 업데이트**: 2025-01-05  
**작성자**: Claude (AI Assistant)  
**프로젝트**: 스토리 메이커 (HI-DI Edu)
