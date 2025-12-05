# 🔐 Firebase 로그인 가이드

## ⚠️ 샌드박스 환경 제약사항

현재 **Novita 샌드박스 환경**에서는 대화형 브라우저 로그인이 제한됩니다.

## 🚀 배포 방법 (3가지 옵션)

---

### **옵션 1: Firebase CI 토큰 사용 (추천) ✅**

가장 안전하고 자동화에 적합한 방법입니다.

#### 단계:
1. **로컬 컴퓨터에서** Firebase 로그인:
   ```bash
   firebase login:ci
   ```

2. 생성된 **토큰 복사** (예: `1//0gxxxxx-xxxxxxx`)

3. 샌드박스에서 토큰으로 배포:
   ```bash
   cd /home/user/webapp
   node_modules/.bin/firebase deploy --token "YOUR_TOKEN_HERE" --only hosting
   ```

---

### **옵션 2: 서비스 계정 JSON 사용**

프로덕션 환경에 가장 적합합니다.

#### 단계:
1. **Firebase Console** 접속:
   https://console.firebase.google.com/project/story-make-fbbd7/settings/serviceaccounts/adminsdk

2. **"새 비공개 키 생성"** 클릭

3. JSON 파일 다운로드

4. 샌드박스로 파일 업로드 후:
   ```bash
   cd /home/user/webapp
   export GOOGLE_APPLICATION_CREDENTIALS="./service-account.json"
   node_modules/.bin/firebase deploy --only hosting
   ```

---

### **옵션 3: GitHub Actions 자동 배포 (최고의 방법) 🎯**

코드를 GitHub에 푸시하면 자동으로 배포됩니다.

#### 단계:

**1. GitHub 저장소 생성 및 푸시:**
```bash
cd /home/user/webapp

# GitHub 저장소 생성 후
git remote add origin https://github.com/YOUR_USERNAME/hidi-story-maker.git
git push -u origin main
```

**2. Firebase 서비스 계정 생성:**
- Firebase Console → 프로젝트 설정 → 서비스 계정
- JSON 키 다운로드

**3. GitHub Secrets 등록:**
- GitHub 저장소 → Settings → Secrets and variables → Actions
- `FIREBASE_SERVICE_ACCOUNT` 생성하고 JSON 내용 붙여넣기

**4. GitHub Actions 워크플로우 생성:**

`.github/workflows/firebase-deploy.yml`:
```yaml
name: Deploy to Firebase Hosting

on:
  push:
    branches:
      - main

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Build
        run: npm run build
        env:
          VITE_FIREBASE_API_KEY: ${{ secrets.VITE_FIREBASE_API_KEY }}
          VITE_FIREBASE_AUTH_DOMAIN: ${{ secrets.VITE_FIREBASE_AUTH_DOMAIN }}
          VITE_FIREBASE_PROJECT_ID: ${{ secrets.VITE_FIREBASE_PROJECT_ID }}
          VITE_FIREBASE_STORAGE_BUCKET: ${{ secrets.VITE_FIREBASE_STORAGE_BUCKET }}
          VITE_FIREBASE_MESSAGING_SENDER_ID: ${{ secrets.VITE_FIREBASE_MESSAGING_SENDER_ID }}
          VITE_FIREBASE_APP_ID: ${{ secrets.VITE_FIREBASE_APP_ID }}
          VITE_FIREBASE_MEASUREMENT_ID: ${{ secrets.VITE_FIREBASE_MEASUREMENT_ID }}
          
      - name: Deploy to Firebase
        uses: FirebaseExtended/action-hosting-deploy@v0
        with:
          repoToken: '${{ secrets.GITHUB_TOKEN }}'
          firebaseServiceAccount: '${{ secrets.FIREBASE_SERVICE_ACCOUNT }}'
          channelId: live
          projectId: story-make-fbbd7
```

**5. 환경 변수를 GitHub Secrets에 추가:**
- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_STORAGE_BUCKET`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`
- `VITE_FIREBASE_MEASUREMENT_ID`

**6. 코드 푸시하면 자동 배포:**
```bash
git add .
git commit -m "Add feature"
git push
```

→ GitHub Actions가 자동으로 빌드 및 배포 실행!

---

## 📊 배포 옵션 비교

| 방법 | 난이도 | 보안 | 자동화 | 추천도 |
|------|--------|------|--------|--------|
| CI 토큰 | ⭐⭐ | ⭐⭐⭐ | ⭐⭐ | ✅ 수동 배포 |
| 서비스 계정 | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ✅ 프로덕션 |
| GitHub Actions | ⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | 🌟 최고 추천 |

---

## 🎯 즉시 배포 가능한 방법

### 현재 샌드박스에서 바로 배포하려면:

**1. CI 토큰 발급 (로컬 컴퓨터에서):**
```bash
firebase login:ci
```

**2. 토큰을 복사한 후, 샌드박스에서 실행:**
```bash
cd /home/user/webapp
node_modules/.bin/firebase deploy --token "1//0gxxxxx-xxxxxxx" --only hosting
```

---

## 🌐 배포 후 접속 URL

- **프로덕션**: https://story-make-fbbd7.web.app
- **Firebase App**: https://story-make-fbbd7.firebaseapp.com
- **Firebase Console**: https://console.firebase.google.com/project/story-make-fbbd7/hosting

---

## 💡 추천 워크플로우

### 개발 단계:
1. 샌드박스에서 개발 (`https://3000-xxx.sandbox.novita.ai`)
2. 기능 완성 후 GitHub에 푸시
3. GitHub Actions가 자동으로 Firebase에 배포

### 장점:
- ✅ 샌드박스에서 로그인 불필요
- ✅ 코드 푸시만으로 배포 완료
- ✅ 배포 히스토리 관리
- ✅ 환경 변수 안전하게 관리
- ✅ 롤백 간편

---

## 📝 다음 단계

1. **GitHub Actions 설정** (추천)
2. **또는 CI 토큰으로 수동 배포**
3. **또는 서비스 계정 JSON으로 배포**

어떤 방법으로 진행하시겠어요?
