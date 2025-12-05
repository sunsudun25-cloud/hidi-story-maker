# ⚡ 빠른 시작 가이드

## 🎯 3단계로 Firebase 자동 배포 완성하기

---

## ✅ Step 1: Firebase Service Account (5분)

### 링크 접속
👉 https://console.firebase.google.com/project/story-make-fbbd7/settings/serviceaccounts/adminsdk

### 실행
1. **"새 비공개 키 생성"** 클릭
2. JSON 파일 다운로드
3. 파일을 텍스트 에디터로 열기
4. **전체 내용 복사** (Ctrl+A → Ctrl+C)

---

## ✅ Step 2: GitHub Secrets 등록 (10분)

### 링크 접속
👉 https://github.com/sunsudun25-cloud/hidi-story-maker/settings/secrets/actions

### Secret 1 (필수): FIREBASE_SERVICE_ACCOUNT
1. **"New repository secret"** 클릭
2. **Name**: `FIREBASE_SERVICE_ACCOUNT`
3. **Value**: 위에서 복사한 JSON 전체 붙여넣기
4. **"Add secret"** 클릭

### Secret 2-8 (권장): Firebase 환경 변수

같은 방식으로 다음 7개를 추가:

| Name | Value |
|------|-------|
| `VITE_FIREBASE_API_KEY` | `AIzaSyBBsjEVt-WktzSYC1zqZPslIjAie9a-F0` |
| `VITE_FIREBASE_AUTH_DOMAIN` | `story-make-fbbd7.firebaseapp.com` |
| `VITE_FIREBASE_PROJECT_ID` | `story-make-fbbd7` |
| `VITE_FIREBASE_STORAGE_BUCKET` | `story-make-fbbd7.firebasestorage.app` |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | `63291004810` |
| `VITE_FIREBASE_APP_ID` | `1:63291004810:web:7a8301e17c4e528768da73` |
| `VITE_FIREBASE_MEASUREMENT_ID` | `G-SK12ZCRM26` |

---

## ✅ Step 3: GitHub Actions Workflow 추가 (5분)

### 링크 접속
👉 https://github.com/sunsudun25-cloud/hidi-story-maker

### 실행
1. **"Add file"** → **"Create new file"** 클릭

2. 파일명 입력:
   ```
   .github/workflows/firebase-deploy.yml
   ```

3. 아래 코드 **전체 복사** 후 붙여넣기:

```yaml
name: Deploy to Firebase Hosting

on:
  push:
    branches:
      - main
  workflow_dispatch:

jobs:
  build_and_deploy:
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Build project
        run: npm run build
        env:
          VITE_FIREBASE_API_KEY: ${{ secrets.VITE_FIREBASE_API_KEY }}
          VITE_FIREBASE_AUTH_DOMAIN: ${{ secrets.VITE_FIREBASE_AUTH_DOMAIN }}
          VITE_FIREBASE_PROJECT_ID: ${{ secrets.VITE_FIREBASE_PROJECT_ID }}
          VITE_FIREBASE_STORAGE_BUCKET: ${{ secrets.VITE_FIREBASE_STORAGE_BUCKET }}
          VITE_FIREBASE_MESSAGING_SENDER_ID: ${{ secrets.VITE_FIREBASE_MESSAGING_SENDER_ID }}
          VITE_FIREBASE_APP_ID: ${{ secrets.VITE_FIREBASE_APP_ID }}
          VITE_FIREBASE_MEASUREMENT_ID: ${{ secrets.VITE_FIREBASE_MEASUREMENT_ID }}
          VITE_GOOGLE_API_KEY: ${{ secrets.VITE_GOOGLE_API_KEY }}
      
      - name: Deploy to Firebase Hosting
        uses: FirebaseExtended/action-hosting-deploy@v0
        with:
          repoToken: ${{ secrets.GITHUB_TOKEN }}
          firebaseServiceAccount: ${{ secrets.FIREBASE_SERVICE_ACCOUNT }}
          channelId: live
          projectId: story-make-fbbd7
```

4. **"Commit changes"** 클릭

---

## 🎉 완료! 자동 배포 시작됨

### 배포 진행 확인
👉 https://github.com/sunsudun25-cloud/hidi-story-maker/actions

- 노란색 점: 진행 중 (약 2-3분)
- 초록색 체크: 완료!

### 배포된 사이트 확인
👉 https://story-make-fbbd7.web.app
👉 https://story-make-fbbd7.firebaseapp.com

---

## 🚀 이제부터는?

코드를 수정하고 푸시만 하면 자동으로 배포됩니다:

```bash
git add .
git commit -m "새 기능 추가"
git push origin main
```

**2-3분 후 → 자동으로 https://story-make-fbbd7.web.app 업데이트!** 🎊

---

## 📚 더 자세한 가이드

- 상세 가이드: `STEP_BY_STEP_DEPLOYMENT.md`
- 배포 상태: `DEPLOYMENT_STATUS.md`
- Firebase Console: https://console.firebase.google.com/project/story-make-fbbd7

---

## ❓ 문제 발생 시

1. **Workflow 실행 안 됨**
   - Settings → Actions → General
   - "Read and write permissions" 선택

2. **배포 실패**
   - GitHub Actions 로그 확인
   - Secrets 값 재확인

3. **사이트 접속 안 됨**
   - Firebase Hosting 활성화 확인
   - 5-10분 기다린 후 재시도

---

**준비되셨나요? 위 3단계를 따라해보세요!** 🚀
