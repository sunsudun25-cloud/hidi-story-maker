# 🚀 테스트 시작 가이드

## 📋 개요

Firebase Functions 기반 수업 관리 시스템이 준비되었습니다!  
이제 **테스트**를 진행하여 모든 기능이 정상 작동하는지 확인해야 합니다.

---

## 🎯 테스트 방법 선택

상황에 따라 적절한 테스트 방법을 선택하세요:

### ✅ 방법 1: Quick Test (가장 간단)
**Firebase에 이미 배포되어 있는 경우**

프로덕션 Functions를 바로 테스트합니다.

\`\`\`bash
cd /home/user/webapp
./quick-test.sh
\`\`\`

**결과:**
- 7개 Functions가 순차적으로 테스트됩니다
- 수업 코드, 학생 ID, 작품 ID가 자동 생성됩니다
- ZIP 파일이 다운로드됩니다

**필수 조건:**
- Functions가 이미 배포되어 있어야 함
- 인터넷 연결 필요

---

### ✅ 방법 2: 로컬 Emulator Test (권장)
**배포 전에 로컬에서 테스트하고 싶은 경우**

Firebase Emulator Suite를 사용하여 로컬에서 Functions를 실행합니다.

\`\`\`bash
# 1. Emulator 시작
cd /home/user/webapp
npx firebase-tools emulators:start

# 2. 새 터미널에서 테스트 실행
./test-functions.sh http://localhost:5001/story-make-fbbd7/asia-northeast1
\`\`\`

**결과:**
- 로컬에서 Firestore, Storage, Functions가 실행됩니다
- http://localhost:4000 에서 Emulator UI 확인 가능
- 배포 없이 빠르게 테스트 가능

**장점:**
- 배포 전 안전한 테스트
- 빠른 개발 사이클
- 무료 (Firebase 할당량 소비 없음)

**문서:** `LOCAL_TESTING.md` 참고

---

### ✅ 방법 3: 수동 배포 후 테스트
**Firebase Console에서 직접 배포하는 경우**

#### Step 1: Firebase 설정
1. Firebase Console 접속: https://console.firebase.google.com
2. 프로젝트 선택: **story-make-fbbd7**
3. Firestore Database 활성화
4. Storage 활성화
5. 보안 규칙 설정

#### Step 2: Functions 배포
\`\`\`bash
# Firebase 로그인
npx firebase-tools login

# Functions 배포
cd /home/user/webapp
npx firebase-tools deploy --only functions
\`\`\`

#### Step 3: 테스트 실행
\`\`\`bash
./quick-test.sh
\`\`\`

**문서:** `MANUAL_DEPLOYMENT.md` 참고

---

### ✅ 방법 4: 브라우저 테스트
**UI로 테스트하고 싶은 경우**

브라우저에서 테스트 페이지를 엽니다.

\`\`\`bash
# 1. 개발 서버 시작
cd /home/user/webapp
npm run build
pm2 start ecosystem.config.cjs

# 2. 브라우저에서 test-functions.html 열기
# 또는 http://localhost:3000/test-functions.html 접속
\`\`\`

**기능:**
- 시각적 UI로 각 API 테스트
- 실시간 응답 확인
- Base URL 변경 가능 (로컬/프로덕션)

---

## 📊 테스트 체크리스트

### 필수 테스트
- [ ] **classCreate**: 수업 생성 (8자리 코드 생성)
- [ ] **learnerEnsure**: 학생 등록 (4자리 코드 생성)
- [ ] **artifactSave**: 작품 저장 (이미지 업로드)
- [ ] **artifactList**: 작품 목록 조회
- [ ] **artifactByShare**: 공유 링크로 조회
- [ ] **classVerifyPin**: 강사 PIN 확인
- [ ] **exportClassZip**: ZIP 다운로드

### 데이터 확인
- [ ] Firestore에 `classes` 컬렉션 생성됨
- [ ] Firestore에 `learners` 컬렉션 생성됨
- [ ] Firestore에 `artifacts` 컬렉션 생성됨
- [ ] Storage에 이미지 파일 업로드됨
- [ ] ZIP 파일 다운로드 및 압축 해제 가능

### 시나리오 테스트
- [ ] **시나리오 1**: 수업 생성 → 학생 3명 등록 → 각각 작품 저장
- [ ] **시나리오 2**: 작품 저장 → 공유 링크 생성 → 다른 기기에서 열기
- [ ] **시나리오 3**: 강사 PIN으로 전체 학생 작품 ZIP 다운로드

---

## 🔍 문제 해결

### "Authentication required" 오류
\`\`\`bash
npx firebase-tools login
\`\`\`

### "CORS error" 오류
- Functions에 CORS가 설정되어 있습니다
- 브라우저 캐시 삭제 후 재시도

### "Permission denied" 오류
- Firebase Console에서 Firestore/Storage 보안 규칙 확인
- 개발 중에는 임시로 `allow read, write: if true;` 설정

### Functions 배포 실패
- Node.js 버전 확인: `node --version` (20.x 권장)
- Functions 디렉토리 확인: `cd functions && npm install`

---

## 📚 관련 문서

| 문서 | 설명 |
|------|------|
| `TESTING_GUIDE.md` | 전체 테스트 가이드 |
| `LOCAL_TESTING.md` | 로컬 Emulator 사용법 |
| `MANUAL_DEPLOYMENT.md` | 수동 배포 가이드 |
| `CLASSROOM_DEPLOYMENT_GUIDE.md` | 수업 시스템 배포 가이드 |
| `DATA_STORAGE_ANALYSIS.md` | 데이터 저장 구조 분석 |
| `PRODUCTION_CHECKLIST.md` | 상용화 체크리스트 |

---

## 🎯 다음 단계

테스트가 완료되면:

1. **프론트엔드 UI 구현**
   - 수업 생성 페이지
   - 학생 로그인 페이지
   - 작품 저장 페이지
   - 내 작품 보기 페이지
   - 공유하기 페이지

2. **사용자 테스트**
   - 실제 선생님과 학생으로 테스트
   - 피드백 수집 및 개선

3. **상용화 준비**
   - 보안 강화 (Rate Limiting, API 키 관리)
   - 성능 최적화
   - 모니터링 설정 (Sentry, Firebase Analytics)

---

## ❓ 질문이 있나요?

다음 중 하나를 선택하세요:

1. **"로컬에서 테스트하고 싶어요"** → `LOCAL_TESTING.md` 참고
2. **"바로 배포하고 싶어요"** → `MANUAL_DEPLOYMENT.md` 참고
3. **"빠르게 테스트만 하고 싶어요"** → `./quick-test.sh` 실행
4. **"브라우저에서 테스트하고 싶어요"** → `test-functions.html` 열기

---

## 🚀 빠른 시작

가장 간단한 방법:

\`\`\`bash
cd /home/user/webapp

# 1. Firebase 로그인
npx firebase-tools login

# 2. Functions 배포
npx firebase-tools deploy --only functions

# 3. 테스트 실행
./quick-test.sh
\`\`\`

완료!
