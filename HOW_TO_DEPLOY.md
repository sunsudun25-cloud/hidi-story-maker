# 🚀 Firebase 배포 방법 - 샌드박스 환경

## ⚠️ 현재 상황

**샌드박스 환경에서는 대화형 Firebase 로그인이 불가능합니다.**

```bash
$ firebase deploy
Error: Failed to authenticate, have you run firebase login?
```

---

## ✅ 해결 방법 (3가지)

### **방법 1: CI 토큰 사용 (추천) ⚡**

가장 빠르고 간단한 방법입니다.

#### 📝 단계별 가이드:

**1️⃣ 로컬 컴퓨터에서 토큰 발급**

터미널을 열고 다음 명령어 실행:
```bash
firebase login:ci
```

**2️⃣ 브라우저 로그인**
- 브라우저가 자동으로 열립니다
- Google 계정으로 로그인
- Firebase 권한 승인

**3️⃣ 토큰 복사**

터미널에 다음과 같이 토큰이 표시됩니다:
```
✔  Success! Use this token to login on a CI server:

1//0gABCDEFGHIJKLMNOPQRSTUVWXYZ-abcdefghijklmnopqrstuvwxyz1234567890

Example: firebase deploy --token "$FIREBASE_TOKEN"
```

**토큰 예시:**
```
1//0gABCDEFGHIJKLMNOPQRSTUVWXYZ...
```

**4️⃣ 샌드박스에서 배포**

토큰을 복사한 후 샌드박스에서 실행:
```bash
cd /home/user/webapp
node_modules/.bin/firebase deploy --token "YOUR_TOKEN_HERE" --only hosting
```

**실제 명령어 예시:**
```bash
node_modules/.bin/firebase deploy --token "1//0gABCDEFGHIJ..." --only hosting
```

**5️⃣ 배포 진행 확인**

성공하면 다음과 같이 표시됩니다:
```
=== Deploying to 'story-make-fbbd7'...

i  deploying hosting
i  hosting[story-make-fbbd7]: beginning deploy...
i  hosting[story-make-fbbd7]: found 8 files in dist
✔  hosting[story-make-fbbd7]: file upload complete
i  hosting[story-make-fbbd7]: finalizing version...
✔  hosting[story-make-fbbd7]: version finalized
i  hosting[story-make-fbbd7]: releasing new version...
✔  hosting[story-make-fbbd7]: release complete

✔  Deploy complete!

Project Console: https://console.firebase.google.com/project/story-make-fbbd7/overview
Hosting URL: https://story-make-fbbd7.web.app
```

**6️⃣ 접속 확인**

배포 완료 후 다음 URL로 접속:
- https://story-make-fbbd7.web.app
- https://story-make-fbbd7.firebaseapp.com

---

### **방법 2: GitHub Actions 자동 배포 (최고 추천) 🌟**

한 번만 설정하면 코드 푸시만으로 자동 배포됩니다!

#### 📝 설정 단계:

**1️⃣ Firebase 서비스 계정 JSON 생성**

다음 URL 접속:
https://console.firebase.google.com/project/story-make-fbbd7/settings/serviceaccounts/adminsdk

1. "새 비공개 키 생성" 클릭
2. JSON 파일 다운로드
3. 안전한 곳에 보관

**2️⃣ GitHub 저장소 생성**

GitHub에서 새 저장소 생성:
1. https://github.com/new 접속
2. 저장소 이름: `hidi-story-maker` (또는 원하는 이름)
3. Public 또는 Private 선택
4. Create repository

**3️⃣ 코드 푸시**

샌드박스에서 실행:
```bash
cd /home/user/webapp

# GitHub 저장소 연결
git remote add origin https://github.com/YOUR_USERNAME/hidi-story-maker.git

# main 브랜치로 푸시
git branch -M main
git push -u origin main
```

**4️⃣ GitHub Secrets 등록**

GitHub 저장소에서:
1. Settings → Secrets and variables → Actions
2. "New repository secret" 클릭
3. Name: `FIREBASE_SERVICE_ACCOUNT`
4. Value: 다운로드한 JSON 파일의 **전체 내용** 붙여넣기
5. "Add secret" 클릭

**추가 Secrets (선택):**
- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_STORAGE_BUCKET`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`
- `VITE_FIREBASE_MEASUREMENT_ID`
- `VITE_GEMINI_API_KEY` (나중에 추가)

**5️⃣ 자동 배포 시작**

이제 코드를 푸시하면 자동으로 배포됩니다:
```bash
cd /home/user/webapp

# 코드 수정
git add .
git commit -m "Update feature"
git push origin main
```

GitHub Actions가 자동으로:
1. ✅ 코드 체크아웃
2. ✅ 의존성 설치
3. ✅ 프로젝트 빌드
4. ✅ Firebase에 배포

**6️⃣ 배포 확인**

GitHub 저장소:
- Actions 탭에서 배포 진행 상황 확인
- 성공하면 https://story-make-fbbd7.web.app 접속

---

### **방법 3: 로컬 컴퓨터에서 직접 배포**

가장 간단하지만, 로컬 컴퓨터에 코드가 있어야 합니다.

**1️⃣ 프로젝트 클론**
```bash
# GitHub에서 클론 (방법 2 완료 후)
git clone https://github.com/YOUR_USERNAME/hidi-story-maker.git
cd hidi-story-maker
```

**2️⃣ 의존성 설치**
```bash
npm install
```

**3️⃣ Firebase 로그인**
```bash
firebase login
```

**4️⃣ 빌드 & 배포**
```bash
npm run build
firebase deploy --only hosting
```

---

## 🎯 추천 워크플로우

### **개발 단계:**
```
샌드박스에서 개발
  ↓
GitHub에 푸시
  ↓
GitHub Actions 자동 빌드 & 배포
  ↓
https://story-make-fbbd7.web.app 배포 완료!
```

### **장점:**
- ✅ 샌드박스에서 Firebase 로그인 불필요
- ✅ 코드 푸시만으로 자동 배포
- ✅ 배포 히스토리 관리 용이
- ✅ 환경 변수 안전하게 관리
- ✅ 롤백 간편

---

## 📊 배포 비교

| 방법 | 난이도 | 속도 | 자동화 | 추천도 |
|------|--------|------|--------|--------|
| CI 토큰 | ⭐⭐ | ⚡⚡⚡ | ❌ | ✅ 빠른 배포 |
| GitHub Actions | ⭐⭐⭐ | ⚡⚡ | ✅ | 🌟 최고 추천 |
| 로컬 배포 | ⭐ | ⚡⚡⚡ | ❌ | ✅ 개발 테스트 |

---

## 🔥 즉시 실행 가능한 명령어

### CI 토큰 배포 (지금 바로)
```bash
# 1. 로컬 컴퓨터에서
firebase login:ci

# 2. 토큰 복사 후 샌드박스에서
cd /home/user/webapp
node_modules/.bin/firebase deploy --token "YOUR_TOKEN" --only hosting
```

### GitHub Actions 배포 (자동화)
```bash
# 1. 코드 푸시
cd /home/user/webapp
git push origin main

# 2. GitHub Actions 자동 실행
# (별도 명령어 불필요)
```

---

## 🌐 배포 후 확인 URL

### **프로덕션 URL:**
- 🌟 https://story-make-fbbd7.web.app
- 🔗 https://story-make-fbbd7.firebaseapp.com

### **Firebase Console:**
- 📊 호스팅: https://console.firebase.google.com/project/story-make-fbbd7/hosting
- 📈 사용량: https://console.firebase.google.com/project/story-make-fbbd7/usage

---

## ❓ 자주 묻는 질문

### Q1: CI 토큰은 어디서 확인하나요?
**A:** 로컬 컴퓨터에서 `firebase login:ci` 실행 후 터미널에 표시됩니다.

### Q2: 토큰이 유효하지 않다고 나옵니다.
**A:** 토큰을 다시 발급받으세요. `firebase login:ci` 재실행

### Q3: GitHub Actions가 실패합니다.
**A:** GitHub Secrets에 `FIREBASE_SERVICE_ACCOUNT`가 올바르게 등록되었는지 확인하세요.

### Q4: 배포 후 404 에러가 납니다.
**A:** `firebase.json`의 rewrites 설정 확인 (이미 설정됨)

### Q5: 배포는 성공했는데 이전 버전이 보입니다.
**A:** 브라우저 캐시를 삭제하고 새로고침 (Ctrl+Shift+R)

---

## 🚨 트러블슈팅

### 문제: "Permission denied"
**원인:** Firebase 프로젝트 권한 부족  
**해결:** 
1. https://console.firebase.google.com/project/story-make-fbbd7/settings/iam
2. 계정에 "소유자" 또는 "편집자" 권한 부여

### 문제: "Project not found"
**원인:** `.firebaserc` 설정 오류  
**해결:**
```bash
cat .firebaserc  # 프로젝트 ID 확인
# story-make-fbbd7이 맞는지 확인
```

### 문제: 빌드 파일을 찾을 수 없음
**원인:** dist/ 폴더 없음  
**해결:**
```bash
npm run build  # 먼저 빌드
firebase deploy --token "TOKEN" --only hosting
```

---

## 💡 다음 단계

배포 방법을 선택하세요:

1. **⚡ CI 토큰 (즉시)**: 5분 내 배포 완료
2. **🌟 GitHub Actions (추천)**: 영구 자동 배포
3. **🎨 기능 추가 먼저**: Drawing, Gallery 완성 후 배포

---

**도움이 필요하시면 언제든지 물어보세요! 🙋‍♂️**
