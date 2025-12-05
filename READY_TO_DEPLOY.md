# ✅ Firebase Hosting 배포 준비 완료!

## 🎉 현재 상태

### ✅ 완료된 작업
- [x] Firebase CLI 설치 (v14.27.0)
- [x] Firebase 프로젝트 연결 (`story-make-fbbd7`)
- [x] `firebase.json` 설정 완료
- [x] `.firebaserc` 프로젝트 설정
- [x] `.firebaseignore` 제외 파일 설정
- [x] 프로덕션 빌드 성공 (1.1MB)
- [x] GitHub Actions 워크플로우 준비

---

## 🚀 지금 바로 배포하기

### **방법 1: CI 토큰 배포 (가장 빠름) ⚡**

**5분 내 완료 가능!**

#### 1️⃣ 로컬 컴퓨터에서 토큰 발급
```bash
firebase login:ci
```

**출력 예시:**
```
✔  Success! Use this token to login on a CI server:

1//0gABCDEFGHIJKLMNOPQRSTUVWXYZ...

Example: firebase deploy --token "$FIREBASE_TOKEN"
```

#### 2️⃣ 토큰 복사 후 샌드박스에서 배포
```bash
cd /home/user/webapp

# 토큰으로 배포
node_modules/.bin/firebase deploy --token "YOUR_TOKEN_HERE" --only hosting
```

**배포 진행 과정:**
```
=== Deploying to 'story-make-fbbd7'...

i  deploying hosting
i  hosting[story-make-fbbd7]: beginning deploy...
i  hosting[story-make-fbbd7]: found 10 files in dist
✔  hosting[story-make-fbbd7]: file upload complete
i  hosting[story-make-fbbd7]: finalizing version...
✔  hosting[story-make-fbbd7]: version finalized
i  hosting[story-make-fbbd7]: releasing new version...
✔  hosting[story-make-fbbd7]: release complete

✔  Deploy complete!

Project Console: https://console.firebase.google.com/project/story-make-fbbd7/overview
Hosting URL: https://story-make-fbbd7.web.app
```

---

### **방법 2: GitHub Actions 자동 배포 (추천) 🌟**

**한 번 설정 → 영구 자동 배포**

#### 1️⃣ Firebase 서비스 계정 JSON 다운로드
https://console.firebase.google.com/project/story-make-fbbd7/settings/serviceaccounts/adminsdk

→ "새 비공개 키 생성" 클릭 → JSON 다운로드

#### 2️⃣ GitHub 저장소 생성 & 푸시
```bash
cd /home/user/webapp

# GitHub에서 새 저장소 생성 후
git remote add origin https://github.com/YOUR_USERNAME/hidi-story-maker.git
git branch -M main
git push -u origin main
```

#### 3️⃣ GitHub Secrets 등록
**필수:**
- `FIREBASE_SERVICE_ACCOUNT` (JSON 파일 전체 내용)

**선택 (환경 변수):**
- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_STORAGE_BUCKET`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`
- `VITE_FIREBASE_MEASUREMENT_ID`
- `VITE_GEMINI_API_KEY`

#### 4️⃣ 자동 배포 확인
```bash
# 코드 수정 후
git add .
git commit -m "Add new feature"
git push origin main
```

→ GitHub Actions → 자동 빌드 & 배포!

---

## 📦 빌드 정보

### 현재 빌드 결과
```
dist/index.html                            0.42 kB │ gzip:   0.30 kB
dist/assets/index-cc55cab0.css            50.19 kB │ gzip:   9.79 kB
dist/assets/purify.es-2de9db7f.js         21.98 kB │ gzip:   8.74 kB
dist/assets/index.es-32f85b92.js         150.64 kB │ gzip:  51.54 kB
dist/assets/html2canvas.esm-e0a7d97b.js  201.43 kB │ gzip:  48.04 kB
dist/assets/main-76fd1524.js             268.24 kB │ gzip:  81.98 kB
dist/assets/jspdf.es.min-7754afdd.js     357.70 kB │ gzip: 117.98 kB

Total: ~1.05 MB │ Gzip: ~318 kB
Build Time: 8.23s
```

---

## 🌐 배포 후 접속 URL

### **프로덕션 URL (정식):**
- **메인**: https://story-make-fbbd7.web.app ✨
- **대체**: https://story-make-fbbd7.firebaseapp.com

### **Firebase Console:**
- **호스팅**: https://console.firebase.google.com/project/story-make-fbbd7/hosting
- **사용량**: https://console.firebase.google.com/project/story-make-fbbd7/usage
- **설정**: https://console.firebase.google.com/project/story-make-fbbd7/settings/general

---

## 🔧 Firebase 설정 파일

### `firebase.json`
```json
{
  "hosting": {
    "public": "dist",
    "ignore": ["firebase.json", "**/.*", "**/node_modules/**"],
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ],
    "headers": [...]
  }
}
```

**주요 설정:**
- ✅ SPA 라우팅 지원 (rewrites)
- ✅ 정적 파일 캐싱 (images: 2시간, JS/CSS: 7일)
- ✅ 보안 헤더 (X-Frame-Options, X-XSS-Protection 등)

---

## 🧪 배포 전 로컬 테스트

### 방법 1: Firebase Serve
```bash
cd /home/user/webapp
node_modules/.bin/firebase serve --only hosting
```

### 방법 2: Vite Preview
```bash
cd /home/user/webapp
npm run preview
```

---

## 📋 배포 후 체크리스트

### ✅ 기능 테스트
- [ ] **로그인 페이지** (`/`)
  - [ ] 비회원 로그인
  - [ ] Google 로그인
  - [ ] 카카오 로그인 (준비 중)
  
- [ ] **홈 페이지** (`/home`)
  - [ ] 4개 카드 표시
  - [ ] 각 카드 클릭 동작
  - [ ] 그라데이션 디자인
  
- [ ] **글쓰기 페이지** (`/write`)
  - [ ] 3개 옵션 버튼
  - [ ] 각 버튼 클릭 동작

### ✅ 반응형 확인
- [ ] 모바일 (< 640px)
- [ ] 태블릿 (640px - 1024px)
- [ ] 데스크톱 (> 1024px)

### ✅ 성능 확인
- [ ] 페이지 로딩 속도
- [ ] 이미지 로딩
- [ ] 네트워크 요청

---

## 🔥 배포 명령어 요약

### CI 토큰으로 배포
```bash
cd /home/user/webapp
node_modules/.bin/firebase deploy --token "YOUR_TOKEN" --only hosting
```

### 빌드 + 배포
```bash
cd /home/user/webapp
npm run build
node_modules/.bin/firebase deploy --token "YOUR_TOKEN" --only hosting
```

### 호스팅만 배포
```bash
node_modules/.bin/firebase deploy --only hosting --token "YOUR_TOKEN"
```

---

## 🎯 다음 단계

### 배포 완료 후:
1. **프로덕션 URL 확인**
   - https://story-make-fbbd7.web.app
   
2. **기능 테스트**
   - 모든 페이지 접속 확인
   - 로그인 기능 테스트
   
3. **성능 모니터링**
   - Firebase Console → Analytics
   
4. **추가 기능 개발**
   - Drawing System
   - Gallery System
   - Write 하위 페이지

---

## 💡 유용한 명령어

### 배포 취소
```bash
node_modules/.bin/firebase hosting:disable
```

### 배포 기록 확인
```bash
node_modules/.bin/firebase hosting:channel:list
```

### 로그 확인
```bash
node_modules/.bin/firebase projects:list
```

---

## 🚨 트러블슈팅

### 문제: "Permission denied"
**해결**: Firebase 프로젝트 권한 확인
- https://console.firebase.google.com/project/story-make-fbbd7/settings/iam

### 문제: "404 Not Found" (배포 후)
**해결**: `firebase.json`의 rewrites 확인 (이미 설정됨)

### 문제: 환경 변수 적용 안됨
**해결**: 빌드 전 `.env` 파일 확인
```bash
cat .env
npm run build
```

---

## 🎉 배포 준비 완료!

위 방법 중 하나를 선택하여 지금 바로 배포하세요!

**추천: CI 토큰 방법 (가장 빠름) ⚡**

1. 로컬에서 `firebase login:ci`
2. 토큰 복사
3. 샌드박스에서 배포!

---

**문의사항이 있으시면 언제든지 물어보세요! 🙋‍♂️**
