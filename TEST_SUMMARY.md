# 🎯 테스트 방법 요약

## 📋 빠른 선택 가이드

### 상황별 최적의 테스트 방법

| 상황 | 추천 방법 | 명령어 | 소요 시간 |
|------|----------|--------|----------|
| **이미 배포되어 있음** | Quick Test | `./quick-test.sh` | 1분 |
| **배포 전 로컬 테스트** | Emulator | `npx firebase-tools emulators:start` | 5분 |
| **처음 배포하는 경우** | 수동 배포 | `npx firebase-tools deploy` | 10분 |
| **브라우저로 테스트** | 테스트 페이지 | `test-functions.html` 열기 | 즉시 |

---

## 🚀 방법 1: Quick Test (가장 간단) ⭐️

**언제 사용하나요?**
- Functions가 이미 배포되어 있을 때
- 프로덕션 환경을 빠르게 테스트하고 싶을 때

**실행 방법:**
```bash
cd /home/user/webapp
./quick-test.sh
```

**결과:**
- ✅ 7개 Functions 자동 테스트
- ✅ 수업 코드/학생 ID 자동 생성
- ✅ ZIP 파일 다운로드
- ✅ 전체 1분 이내 완료

**확인 항목:**
- [x] 수업 생성 (classCreate)
- [x] 강사 PIN 확인 (classVerifyPin)
- [x] 학생 등록 (learnerEnsure)
- [x] 작품 저장 (artifactSave)
- [x] 작품 목록 조회 (artifactList)
- [x] 공유 링크 조회 (artifactByShare)
- [x] ZIP 다운로드 (exportClassZip)

---

## 🧪 방법 2: 로컬 Emulator (권장) ⭐️

**언제 사용하나요?**
- 배포 전에 로컬에서 안전하게 테스트하고 싶을 때
- 개발 중에 빠르게 반복 테스트하고 싶을 때
- Firebase 할당량을 소비하고 싶지 않을 때

**실행 방법:**
```bash
# 1. Emulator 시작
cd /home/user/webapp
npx firebase-tools emulators:start

# 2. 새 터미널에서 테스트 실행
./test-functions.sh http://localhost:5001/story-make-fbbd7/asia-northeast1
```

**Emulator UI 접속:**
- **UI**: http://localhost:4000
- **Functions**: http://localhost:5001
- **Firestore**: http://localhost:8080
- **Storage**: http://localhost:9199

**장점:**
- ✅ 배포 없이 테스트
- ✅ Firestore/Storage 데이터 실시간 확인
- ✅ 무료 (할당량 소비 없음)
- ✅ 빠른 개발 사이클

**상세 가이드:** `LOCAL_TESTING.md` 참고

---

## 📦 방법 3: 수동 배포 후 테스트

**언제 사용하나요?**
- Functions를 처음 배포하는 경우
- Firebase Console에서 수동으로 설정하고 싶을 때

**단계별 실행:**

### Step 1: Firebase Console 설정
1. https://console.firebase.google.com 접속
2. 프로젝트 선택: **story-make-fbbd7**
3. Firestore Database 활성화 (`asia-northeast1`)
4. Storage 활성화
5. 보안 규칙 설정 (아래 참고)

### Step 2: Functions 배포
```bash
# Firebase 로그인
npx firebase-tools login

# Functions 배포
cd /home/user/webapp
npx firebase-tools deploy --only functions

# 배포 확인
npx firebase-tools functions:list
```

### Step 3: 테스트 실행
```bash
./quick-test.sh
```

**상세 가이드:** `MANUAL_DEPLOYMENT.md` 참고

---

## 🌐 방법 4: 브라우저 테스트

**언제 사용하나요?**
- UI로 테스트하고 싶을 때
- 각 API를 수동으로 테스트하고 싶을 때

**실행 방법:**
```bash
# 1. 개발 서버 시작 (선택사항)
cd /home/user/webapp
npm run build
pm2 start ecosystem.config.cjs

# 2. 브라우저에서 열기
# file:///home/user/webapp/test-functions.html
# 또는 http://localhost:3000/test-functions.html
```

**기능:**
- ✅ 시각적 UI
- ✅ 실시간 응답 확인
- ✅ Base URL 변경 가능 (로컬/프로덕션)
- ✅ 개별 API 테스트

---

## 📊 테스트 체크리스트

### 필수 테스트 항목
- [ ] **classCreate**: 수업 생성 성공 → `classCode` 발급
- [ ] **classVerifyPin**: 강사 PIN 확인 성공 → `valid: true`
- [ ] **learnerEnsure**: 학생 등록 성공 → `learnerId` 발급
- [ ] **artifactSave**: 작품 저장 성공 → `artifactId`, `shareId` 발급
- [ ] **artifactList**: 작품 목록 조회 성공 → 작품 배열 반환
- [ ] **artifactByShare**: 공유 링크 조회 성공 → 작품 데이터 반환
- [ ] **exportClassZip**: ZIP 다운로드 성공 → ZIP 파일 생성

### 데이터 확인 (Firebase Console)
- [ ] Firestore → `classes` 컬렉션에 수업 문서 생성됨
- [ ] Firestore → `learners` 컬렉션에 학생 문서 생성됨
- [ ] Firestore → `artifacts` 컬렉션에 작품 문서 생성됨
- [ ] Storage → `artifacts/{classCode}/{learnerId}/` 디렉토리 생성됨
- [ ] Storage → 이미지 파일 업로드됨 (cover.png, page_*.png)

### 시나리오 테스트
- [ ] **시나리오 1**: 수업 생성 → 학생 3명 등록 → 각각 작품 저장
- [ ] **시나리오 2**: 작품 저장 → 공유 링크 생성 → 다른 기기에서 열기
- [ ] **시나리오 3**: 강사 PIN으로 전체 학생 작품 ZIP 다운로드

---

## 🔍 문제 해결

### "Authentication required" 오류
**원인**: Firebase CLI 로그인 필요

**해결:**
```bash
npx firebase-tools login
```

---

### "CORS error" 오류
**원인**: 브라우저 CORS 정책

**해결:**
- Functions에 CORS 헤더가 설정되어 있습니다
- 브라우저 캐시 삭제 후 재시도
- 개발자 도구 → Network 탭에서 요청 확인

---

### "Permission denied" 오류
**원인**: Firestore/Storage 보안 규칙

**해결:**
1. Firebase Console → Firestore → Rules
2. 임시로 다음 규칙 설정 (개발 중):
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

---

### Functions 배포 실패
**원인**: Node.js 버전 또는 의존성 문제

**해결:**
```bash
# Node.js 버전 확인 (20.x 권장)
node --version

# Functions 디렉토리 의존성 재설치
cd /home/user/webapp/functions
npm install

# 다시 배포
cd /home/user/webapp
npx firebase-tools deploy --only functions
```

---

## 📚 관련 문서

| 문서 | 설명 |
|------|------|
| **START_HERE.md** | 테스트 시작 가이드 (가장 먼저 읽기) |
| **TESTING_GUIDE.md** | 전체 테스트 가이드 |
| **LOCAL_TESTING.md** | 로컬 Emulator 사용법 |
| **MANUAL_DEPLOYMENT.md** | 수동 배포 가이드 |
| **CLASSROOM_DEPLOYMENT_GUIDE.md** | 수업 시스템 상세 가이드 |
| **quick-test.sh** | 빠른 테스트 스크립트 |
| **test-functions.sh** | 상세 테스트 스크립트 |
| **test-functions.html** | 브라우저 테스트 페이지 |

---

## 🎯 다음 단계

테스트가 완료되면:

1. **프론트엔드 UI 구현**
   - 수업 생성 페이지
   - 학생 로그인 페이지
   - 작품 저장 페이지 (기존 기능 연동)
   - 공유하기 페이지 (QR 코드)
   - 강사 관리 페이지 (ZIP 다운로드)

2. **사용자 테스트**
   - 실제 선생님과 학생으로 테스트
   - 피드백 수집 및 개선

3. **상용화 준비**
   - 보안 강화 (Rate Limiting)
   - 성능 최적화
   - 모니터링 설정

---

## ❓ 어떤 방법을 선택해야 하나요?

### 초보자 → **Quick Test**
- 가장 간단하고 빠름
- 1분 이내 완료
- 명령어 하나로 끝

### 개발자 → **Emulator**
- 안전한 로컬 테스트
- 빠른 개발 사이클
- Firestore/Storage 실시간 확인

### 운영자 → **수동 배포**
- Firebase Console 전체 제어
- 프로덕션 환경 설정
- 보안 규칙 세밀 조정

### 디자이너 → **브라우저 테스트**
- 시각적 UI
- 클릭만으로 테스트
- 응답 결과 보기 쉬움

---

## 🚀 지금 바로 시작하기

가장 빠른 방법:

```bash
cd /home/user/webapp
./quick-test.sh
```

이게 안 되면:

```bash
# 1. Firebase 로그인
npx firebase-tools login

# 2. Functions 배포
npx firebase-tools deploy --only functions

# 3. 다시 테스트
./quick-test.sh
```

완료!
