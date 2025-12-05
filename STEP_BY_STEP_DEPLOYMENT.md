# 📖 단계별 Firebase 배포 가이드

## 🎯 목표
GitHub에 코드를 푸시하면 자동으로 Firebase Hosting에 배포되도록 설정

---

## 📋 Step 1: Firebase Service Account 생성 (5분)

### 1-1. Firebase Console 접속
🔗 **링크**: https://console.firebase.google.com/project/story-make-fbbd7/settings/serviceaccounts/adminsdk

### 1-2. 새 비공개 키 생성
1. 페이지 중간에 있는 **"새 비공개 키 생성"** 버튼 클릭
2. 확인 팝업에서 **"키 생성"** 클릭
3. JSON 파일이 자동으로 다운로드됩니다
   - 파일명 예시: `story-make-fbbd7-firebase-adminsdk-xxxxx-xxxxxxxxxx.json`

### 1-3. JSON 파일 내용 확인
다운로드한 JSON 파일을 텍스트 에디터로 열어보면 다음과 같은 형식입니다:

```json
{
  "type": "service_account",
  "project_id": "story-make-fbbd7",
  "private_key_id": "1234567890abcdef...",
  "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkq...\n-----END PRIVATE KEY-----\n",
  "client_email": "firebase-adminsdk-xxxxx@story-make-fbbd7.iam.gserviceaccount.com",
  "client_id": "123456789012345678901",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-xxxxx%40story-make-fbbd7.iam.gserviceaccount.com"
}
```

⚠️ **중요**: 이 파일은 전체 내용을 복사해야 합니다!

---

## 📋 Step 2: GitHub Secrets 설정 (10분)

### 2-1. GitHub Settings 접속
🔗 **링크**: https://github.com/sunsudun25-cloud/hidi-story-maker/settings/secrets/actions

### 2-2. FIREBASE_SERVICE_ACCOUNT Secret 추가

1. **"New repository secret"** 버튼 클릭 (우측 상단 초록색 버튼)

2. **Name** 입력:
   ```
   FIREBASE_SERVICE_ACCOUNT
   ```

3. **Secret** 입력:
   - 다운로드한 JSON 파일을 텍스트 에디터로 열기
   - **전체 내용** 복사 (첫 `{`부터 마지막 `}`까지)
   - GitHub Secret의 Value 필드에 붙여넣기

4. **"Add secret"** 버튼 클릭

✅ 완료되면 `FIREBASE_SERVICE_ACCOUNT` Secret이 목록에 표시됩니다

### 2-3. Firebase 환경 변수 추가 (선택사항, 권장)

같은 방식으로 다음 Secrets를 추가합니다:

#### Secret 1: VITE_FIREBASE_API_KEY
- **Name**: `VITE_FIREBASE_API_KEY`
- **Value**: `AIzaSyBBsjEVt-WktzSYC1zqZPslIjAie9a-F0`

#### Secret 2: VITE_FIREBASE_AUTH_DOMAIN
- **Name**: `VITE_FIREBASE_AUTH_DOMAIN`
- **Value**: `story-make-fbbd7.firebaseapp.com`

#### Secret 3: VITE_FIREBASE_PROJECT_ID
- **Name**: `VITE_FIREBASE_PROJECT_ID`
- **Value**: `story-make-fbbd7`

#### Secret 4: VITE_FIREBASE_STORAGE_BUCKET
- **Name**: `VITE_FIREBASE_STORAGE_BUCKET`
- **Value**: `story-make-fbbd7.firebasestorage.app`

#### Secret 5: VITE_FIREBASE_MESSAGING_SENDER_ID
- **Name**: `VITE_FIREBASE_MESSAGING_SENDER_ID`
- **Value**: `63291004810`

#### Secret 6: VITE_FIREBASE_APP_ID
- **Name**: `VITE_FIREBASE_APP_ID`
- **Value**: `1:63291004810:web:7a8301e17c4e528768da73`

#### Secret 7: VITE_FIREBASE_MEASUREMENT_ID
- **Name**: `VITE_FIREBASE_MEASUREMENT_ID`
- **Value**: `G-SK12ZCRM26`

✅ 총 8개의 Secrets가 등록되어야 합니다

---

## 📋 Step 3: GitHub Actions Workflow 생성 (5분)

### 3-1. GitHub 저장소 접속
🔗 **링크**: https://github.com/sunsudun25-cloud/hidi-story-maker

### 3-2. 새 파일 생성
1. **"Add file"** 버튼 클릭 (코드 탭 우측 상단)
2. **"Create new file"** 선택

### 3-3. 파일 경로 입력
파일명 입력란에 다음을 입력:
```
.github/workflows/firebase-deploy.yml
```

💡 **팁**: `/`를 입력하면 자동으로 폴더가 생성됩니다

### 3-4. Workflow 코드 붙여넣기

아래 전체 코드를 복사하여 붙여넣으세요:

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

### 3-5. 커밋
1. 페이지 하단의 **"Commit changes"** 버튼 클릭
2. 커밋 메시지는 기본값 사용 (또는 원하는 메시지 입력)
3. **"Commit changes"** 확인

✅ Workflow 파일이 생성되고 **즉시 자동 배포가 시작됩니다!**

---

## 📋 Step 4: 배포 확인 (2-3분)

### 4-1. GitHub Actions 진행 상황 확인
🔗 **링크**: https://github.com/sunsudun25-cloud/hidi-story-maker/actions

1. 페이지 상단에 노란색 점이 있는 Workflow가 실행 중입니다
2. Workflow 이름을 클릭하여 상세 로그 확인
3. 각 Step의 진행 상황 모니터링:
   - ✅ Checkout code
   - ✅ Setup Node.js
   - ✅ Install dependencies (약 30초)
   - ✅ Build project (약 10초)
   - ✅ Deploy to Firebase Hosting (약 10초)

### 4-2. 배포 완료 확인
전체 Workflow가 완료되면 (약 2-3분):
- ✅ 초록색 체크 마크 표시
- 배포 URL이 로그에 표시됩니다

### 4-3. 배포된 사이트 접속
🔗 **프로덕션 URL**:
- https://story-make-fbbd7.web.app
- https://story-make-fbbd7.firebaseapp.com

### 4-4. 기능 테스트
- [ ] 로그인 페이지 로드 확인
- [ ] Google 로그인 테스트
- [ ] 비회원 로그인 테스트
- [ ] /home 페이지 접근
- [ ] /write 페이지 접근
- [ ] /gallery 페이지 접근

---

## 🎉 완료!

이제 다음과 같이 작동합니다:

1. **코드 수정**
   ```bash
   git add .
   git commit -m "Update feature"
   git push origin main
   ```

2. **자동 배포**
   - GitHub Actions가 자동으로 실행
   - 빌드 & 배포 (약 2-3분)
   - https://story-make-fbbd7.web.app 자동 업데이트

3. **즉시 확인**
   - 배포 URL에서 변경사항 확인
   - 실시간 프로덕션 환경

---

## 🔍 트러블슈팅

### ❌ Workflow가 실행되지 않음
**해결방법**:
1. GitHub Settings → Actions → General
2. "Workflow permissions" 섹션에서
3. "Read and write permissions" 선택
4. **"Save"** 클릭

### ❌ 배포 실패 (FIREBASE_SERVICE_ACCOUNT 오류)
**해결방법**:
1. GitHub Secrets 확인
2. `FIREBASE_SERVICE_ACCOUNT`의 값이 완전한 JSON인지 확인
3. 첫 `{`부터 마지막 `}`까지 포함되었는지 확인

### ❌ 빌드 실패 (환경 변수 오류)
**해결방법**:
1. GitHub Secrets에 모든 `VITE_FIREBASE_*` 변수 확인
2. 오타가 없는지 확인
3. 값이 정확한지 확인

### ❌ 사이트 접속 안 됨
**해결방법**:
1. Firebase Console 확인: https://console.firebase.google.com/project/story-make-fbbd7/hosting
2. Hosting이 활성화되어 있는지 확인
3. 도메인 설정 확인

---

## 📚 참고 자료

- **GitHub Repository**: https://github.com/sunsudun25-cloud/hidi-story-maker
- **Firebase Console**: https://console.firebase.google.com/project/story-make-fbbd7
- **현재 Dev Server**: https://3000-i5dcsscuqxml7neuit43a-de59bda9.sandbox.novita.ai
- **프로덕션 URL**: https://story-make-fbbd7.web.app

---

## ❓ 질문이나 문제가 있으신가요?

언제든 알려주세요! 🚀
