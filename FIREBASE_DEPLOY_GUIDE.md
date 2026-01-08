# 🔥 Firebase Functions 배포 가이드

## 📋 배포 전 체크리스트

### ✅ 이미 준비된 것
- [x] Firebase 프로젝트: `story-make-fbbd7`
- [x] Functions 코드: `/home/user/webapp/functions/`
- [x] 7개 Functions 구현 완료:
  - classCreate
  - classVerifyPin
  - learnerEnsure
  - artifactSave
  - artifactList
  - artifactByShare
  - exportClassZip
- [x] 수업 코드 로그인 UI (OnboardingLogin.tsx)
- [x] classroomService.ts API 클라이언트

### ⚠️ 필요한 것
- [ ] Firebase 인증 토큰
- [ ] Functions 배포 실행

---

## 🚀 배포 방법 (3가지 옵션)

### 방법 1: 로컬 컴퓨터에서 배포 (권장 ⭐)

**1. 이 저장소를 로컬에 클론:**
```bash
git clone https://github.com/sunsudun25-cloud/hidi-story-maker.git
cd hidi-story-maker
```

**2. Firebase CLI 설치 (처음 한 번만):**
```bash
npm install -g firebase-tools
```

**3. Firebase 로그인:**
```bash
firebase login
```
→ 브라우저가 열리면 Google 계정으로 로그인

**4. Firebase 프로젝트 확인:**
```bash
firebase projects:list
```
→ `story-make-fbbd7`가 보이는지 확인

**5. Functions 배포:**
```bash
cd functions
npm install
cd ..
firebase deploy --only functions
```

**6. 배포 완료 확인:**
```bash
# Base URL이 나오면 성공!
# https://asia-northeast1-story-make-fbbd7.cloudfunctions.net
```

---

### 방법 2: Firebase Console에서 직접 배포

**1. Firebase Console 접속:**
- https://console.firebase.google.com/project/story-make-fbbd7/functions

**2. Cloud Shell 열기:**
- 우측 상단 "Cloud Shell" 아이콘 클릭

**3. 저장소 클론 및 배포:**
```bash
git clone https://github.com/sunsudun25-cloud/hidi-story-maker.git
cd hidi-story-maker/functions
npm install
cd ..
firebase deploy --only functions --project story-make-fbbd7
```

---

### 방법 3: CI/CD 토큰 사용 (고급)

**1. Firebase 토큰 생성 (로컬 컴퓨터에서):**
```bash
firebase login:ci
```
→ 토큰이 출력되면 복사

**2. 토큰을 환경변수로 설정 (샌드박스에서):**
```bash
export FIREBASE_TOKEN="여기에_토큰_붙여넣기"
```

**3. 배포:**
```bash
cd /home/user/webapp
firebase deploy --only functions --token "$FIREBASE_TOKEN"
```

---

## 📝 배포 중 발생 가능한 문제

### 문제 1: "Error: HTTP Error: 403, Permission denied"
**원인:** Firebase 프로젝트 권한 부족  
**해결:** Firebase Console에서 권한 확인
- https://console.firebase.google.com/project/story-make-fbbd7/settings/iam
- 계정에 "Editor" 또는 "Owner" 역할 필요

### 문제 2: "Error: Failed to configure trigger"
**원인:** Firestore/Storage가 활성화되지 않음  
**해결:** Firebase Console에서 활성화
- Firestore: https://console.firebase.google.com/project/story-make-fbbd7/firestore
- Storage: https://console.firebase.google.com/project/story-make-fbbd7/storage

### 문제 3: "Error: Node.js version not supported"
**원인:** Node.js 버전 불일치  
**해결:** functions/package.json 확인
```json
{
  "engines": {
    "node": "20"
  }
}
```

---

## ✅ 배포 완료 후 테스트

### 1. Functions URL 확인
```bash
curl https://asia-northeast1-story-make-fbbd7.cloudfunctions.net/classCreate
```

### 2. 테스트 수업 생성
```bash
cd /home/user/webapp
./test-classroom-login.sh
```

### 3. 앱에서 로그인 테스트
- URL: https://3000-i5dcsscuqxml7neuit43a-de59bda9.sandbox.novita.ai
- "🎓 수업 코드로 시작하기" 클릭
- 생성된 수업 코드 입력

---

## 🎯 배포 후 결과

배포가 성공하면 다음 URL들이 활성화됩니다:

```
Base URL: https://asia-northeast1-story-make-fbbd7.cloudfunctions.net

Endpoints:
- POST /classCreate        (수업 생성)
- POST /classVerifyPin     (강사 PIN 확인)
- POST /learnerEnsure      (학생 로그인)
- POST /artifactSave       (작품 저장)
- GET  /artifactList       (작품 목록)
- GET  /artifactByShare    (작품 조회)
- POST /exportClassZip     (수업 내보내기)
```

---

## 📞 도움이 필요하면

1. **Firebase Console 확인:**
   - https://console.firebase.google.com/project/story-make-fbbd7

2. **Functions 로그 확인:**
   - https://console.firebase.google.com/project/story-make-fbbd7/functions/logs

3. **Firestore 데이터 확인:**
   - https://console.firebase.google.com/project/story-make-fbbd7/firestore

---

## 💡 참고: 배포 비용

Firebase Functions는 다음과 같이 무료 할당량이 있습니다:

- **함수 호출:** 200만 회/월 (무료)
- **실행 시간:** 40만 GB-초/월 (무료)
- **네트워크:** 5GB/월 (무료)

현재 수업 관리 시스템은 이 범위 내에서 충분히 운영 가능합니다.

---

**작성일:** 2026-01-08  
**프로젝트:** Story Maker  
**Firebase 프로젝트:** story-make-fbbd7  
**GitHub:** https://github.com/sunsudun25-cloud/hidi-story-maker
