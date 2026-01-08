# ⚡ Firebase Functions 빠른 배포 가이드 (5분)

## 🎯 가장 빠른 방법: 로컬 컴퓨터에서 배포

### 📋 준비물
- 로컬 컴퓨터 (Windows/Mac/Linux)
- Node.js 설치되어 있음
- Firebase 프로젝트 소유자 계정

---

## 🚀 5단계로 배포하기

### 1️⃣ 터미널 열기
- **Windows:** `Win + R` → `cmd` 입력
- **Mac:** `Command + Space` → `terminal` 입력
- **Linux:** `Ctrl + Alt + T`

---

### 2️⃣ 저장소 클론
```bash
cd Desktop
git clone https://github.com/sunsudun25-cloud/hidi-story-maker.git
cd hidi-story-maker
```

---

### 3️⃣ Firebase CLI 설치 및 로그인
```bash
# Firebase CLI 설치 (처음 한 번만)
npm install -g firebase-tools

# Firebase 로그인 (브라우저가 열립니다)
firebase login
```

→ 브라우저에서 Google 계정으로 로그인  
→ "Firebase CLI wants to access your Google Account" → **허용** 클릭  
→ 터미널로 돌아오면 "✔ Success!" 메시지 확인

---

### 4️⃣ Functions 의존성 설치
```bash
cd functions
npm install
cd ..
```

약 30초 소요...

---

### 5️⃣ Functions 배포!
```bash
firebase deploy --only functions --project story-make-fbbd7
```

약 2-3분 소요...

배포 성공 메시지:
```
✔  Deploy complete!

Functions:
  classCreate: https://asia-northeast1-story-make-fbbd7.cloudfunctions.net/classCreate
  classVerifyPin: https://asia-northeast1-story-make-fbbd7.cloudfunctions.net/classVerifyPin
  learnerEnsure: https://asia-northeast1-story-make-fbbd7.cloudfunctions.net/learnerEnsure
  artifactSave: https://asia-northeast1-story-make-fbbd7.cloudfunctions.net/artifactSave
  artifactList: https://asia-northeast1-story-make-fbbd7.cloudfunctions.net/artifactList
  artifactByShare: https://asia-northeast1-story-make-fbbd7.cloudfunctions.net/artifactByShare
  exportClassZip: https://asia-northeast1-story-make-fbbd7.cloudfunctions.net/exportClassZip
```

---

## ✅ 배포 완료! 이제 테스트하기

### 테스트 1: 브라우저에서 확인
```
https://asia-northeast1-story-make-fbbd7.cloudfunctions.net/classCreate
```
→ "Cannot GET /classCreate" 또는 404 → 정상 (POST 요청이 필요함)

### 테스트 2: 앱에서 로그인 테스트

**1. 앱 접속:**
```
https://3000-i5dcsscuqxml7neuit43a-de59bda9.sandbox.novita.ai
```

**2. "🎓 수업 코드로 시작하기" 클릭**

**3. 수업 코드 생성 (터미널에서):**

샌드박스 환경에서:
```bash
cd /home/user/webapp
./test-classroom-login.sh
```

출력 예시:
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎯 앱에서 사용하세요:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🔑 수업 코드: ABCD1234
👤 학생 번호: 0001
📝 이름: 테스트학생1
```

**4. 앱에 입력:**
- 수업 코드: `ABCD1234`
- 학생 번호: `0001`
- 이름: `테스트학생1`

**5. "✓ 입장하기" 클릭**

→ 홈 화면으로 이동하면 성공! 🎉

---

## 🔥 자주 발생하는 문제

### ❌ "Permission denied" 오류
**원인:** Firebase 프로젝트 권한이 없음

**해결:**
1. Firebase Console 열기: https://console.firebase.google.com/project/story-make-fbbd7
2. 좌측 메뉴 → ⚙️ 프로젝트 설정 → 사용자 및 권한
3. 로그인한 계정이 "소유자" 또는 "편집자" 역할인지 확인

---

### ❌ "Billing account not configured" 오류
**원인:** Firebase 프로젝트에 결제 계정이 설정되지 않음

**해결:**
1. Firebase Console: https://console.firebase.google.com/project/story-make-fbbd7
2. 좌측 하단 → "업그레이드" 클릭
3. Blaze (종량제) 요금제 선택
4. 신용카드 등록 (무료 할당량 내에서는 과금 안 됨)

💡 **안심하세요:**
- 무료 할당량: 함수 호출 200만 회/월
- 현재 사용량으로는 무료 범위 내 사용 가능
- 과금 알림 설정 가능

---

### ❌ "Node.js version not supported" 오류
**원인:** Node.js 버전이 20이 아님

**해결:**
```bash
# Node.js 버전 확인
node --version

# 20.x.x가 아니면 Node.js 20 설치:
# https://nodejs.org/en/download/
```

---

## 📱 프로덕션 배포 (선택사항)

현재는 개발 서버에서만 작동합니다. 프로덕션(Cloudflare Pages)에도 배포하려면:

```bash
cd /home/user/webapp
npm run build
npx wrangler pages deploy dist --project-name story-maker
```

---

## 🎯 요약

**배포 명령어 (핵심만):**
```bash
git clone https://github.com/sunsudun25-cloud/hidi-story-maker.git
cd hidi-story-maker
npm install -g firebase-tools
firebase login
cd functions && npm install && cd ..
firebase deploy --only functions --project story-make-fbbd7
```

**테스트:**
```bash
./test-classroom-login.sh
```

**앱에서 로그인:**
- https://3000-i5dcsscuqxml7neuit43a-de59bda9.sandbox.novita.ai
- 🎓 수업 코드로 시작하기

---

**소요 시간:** 약 5분  
**난이도:** ⭐⭐☆☆☆ (쉬움)  
**작성일:** 2026-01-08
