# 🚀 Firebase 배포 설정 가이드

## 현재 상태
✅ GitHub 저장소 생성 완료: https://github.com/sunsudun25-cloud/hidi-story-maker
✅ 코드 푸시 완료
⏳ Firebase 자동 배포 설정 필요

---

## 📋 3단계로 완료하는 Firebase 배포

### 1단계: Firebase Service Account 다운로드 (3분)

#### 1️⃣ Firebase Console 접속
🔗 **링크**: https://console.firebase.google.com/project/story-make-fbbd7/settings/serviceaccounts/adminsdk

#### 2️⃣ 새 비공개 키 생성
- 페이지에서 **"새 비공개 키 생성"** 버튼 클릭
- 확인 대화상자에서 **"키 생성"** 클릭
- JSON 파일 자동 다운로드 (예: `story-make-fbbd7-firebase-adminsdk-xxxxx.json`)

#### 3️⃣ JSON 파일 내용 복사
- 다운로드한 JSON 파일을 텍스트 에디터로 열기 (메모장, VS Code 등)
- **전체 내용** 복사 (Ctrl+A → Ctrl+C)

```json
{
  "type": "service_account",
  "project_id": "story-make-fbbd7",
  "private_key_id": "...",
  "private_key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n",
  "client_email": "firebase-adminsdk-xxxxx@story-make-fbbd7.iam.gserviceaccount.com",
  "client_id": "...",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "..."
}
```

---

### 2단계: GitHub Secrets 등록 (5분)

#### 1️⃣ GitHub Secrets 페이지 이동
🔗 **링크**: https://github.com/sunsudun25-cloud/hidi-story-maker/settings/secrets/actions

#### 2️⃣ FIREBASE_SERVICE_ACCOUNT 등록
1. **"New repository secret"** 버튼 클릭
2. **Name**: `FIREBASE_SERVICE_ACCOUNT` (정확히 입력)
3. **Secret**: 1단계에서 복사한 JSON 전체 내용 붙여넣기
4. **"Add secret"** 클릭

#### 3️⃣ Firebase 환경 변수 등록 (선택사항)
동일한 방식으로 다음 Secrets를 추가하세요:

| Name | Value |
|------|-------|
| `VITE_FIREBASE_API_KEY` | `AIzaSyBBsjEVt-WktzSYC1zqZPslIjAie9a-F0` |
| `VITE_FIREBASE_AUTH_DOMAIN` | `story-make-fbbd7.firebaseapp.com` |
| `VITE_FIREBASE_PROJECT_ID` | `story-make-fbbd7` |
| `VITE_FIREBASE_STORAGE_BUCKET` | `story-make-fbbd7.firebasestorage.app` |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | `63291004810` |
| `VITE_FIREBASE_APP_ID` | `1:63291004810:web:7a8301e17c4e528768da73` |
| `VITE_FIREBASE_MEASUREMENT_ID` | `G-SK12ZCRM26` |

> 💡 **참고**: 이 변수들은 이미 코드에 포함되어 있으므로 선택사항입니다.

---

### 3단계: GitHub Actions 워크플로우 추가 (3분)

#### 1️⃣ 새 파일 생성
🔗 **링크**: https://github.com/sunsudun25-cloud/hidi-story-maker

1. 저장소 메인 페이지에서 **"Add file"** 클릭
2. **"Create new file"** 선택

#### 2️⃣ 파일 경로 및 이름 입력
파일 이름 입력란에:
```
.github/workflows/firebase-deploy.yml
```

> 💡 **팁**: `/`를 입력하면 자동으로 폴더가 생성됩니다.

#### 3️⃣ 워크플로우 코드 붙여넣기
다음 내용을 복사하여 붙여넣으세요:

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

#### 4️⃣ 커밋
- **Commit message**: `Add GitHub Actions workflow for Firebase deployment`
- **"Commit changes"** 버튼 클릭

---

## ✅ 배포 확인 (2-3분 소요)

### 1️⃣ GitHub Actions 실행 확인
🔗 **링크**: https://github.com/sunsudun25-cloud/hidi-story-maker/actions

- 워크플로우가 자동으로 실행됩니다
- 초록색 ✅ 표시가 나타나면 성공!
- 빨간색 ❌ 표시가 나타나면 로그 확인

### 2️⃣ 배포된 사이트 확인
🔗 **프로덕션 URL**:
- https://story-make-fbbd7.web.app
- https://story-make-fbbd7.firebaseapp.com

### 3️⃣ 로그인 테스트
1. 프로덕션 사이트 방문
2. Google 로그인 시도
3. 그림 만들기 테스트
4. 동화책 만들기 테스트

---

## 🔄 이후 배포 방법

이제부터는 **코드를 수정하고 GitHub에 푸시**하면 자동으로 배포됩니다!

```bash
# 1. 코드 수정
vim src/pages/Home.tsx

# 2. 커밋
git add .
git commit -m "홈 화면 UI 개선"

# 3. 푸시 (자동 배포 트리거!)
git push origin main

# 4. 2-3분 후 프로덕션 사이트 확인
# https://story-make-fbbd7.web.app
```

---

## 🐛 문제 해결

### ❌ Actions가 실행되지 않는 경우
1. **Actions 권한 확인**: https://github.com/sunsudun25-cloud/hidi-story-maker/settings/actions
2. **Workflow permissions** → **"Read and write permissions"** 선택
3. **"Allow GitHub Actions to create and approve pull requests"** 체크
4. **Save** 클릭

### ❌ 빌드가 실패하는 경우
1. GitHub Actions 로그 확인: https://github.com/sunsudun25-cloud/hidi-story-maker/actions
2. 에러 메시지 확인
3. 주로 발생하는 원인:
   - `FIREBASE_SERVICE_ACCOUNT` Secret이 잘못 등록됨
   - JSON 형식 오류 (복사 시 일부 누락)
   - npm 의존성 문제

### ❌ 배포는 성공했지만 사이트가 작동하지 않는 경우
1. Firebase Console 확인: https://console.firebase.google.com/project/story-make-fbbd7/hosting
2. 배포 기록 확인
3. 브라우저 캐시 삭제 (Ctrl+Shift+R)
4. 개발자 도구 콘솔 확인 (F12)

---

## 📊 배포 상태 대시보드

### GitHub
- **Repository**: https://github.com/sunsudun25-cloud/hidi-story-maker
- **Actions**: https://github.com/sunsudun25-cloud/hidi-story-maker/actions
- **Commits**: https://github.com/sunsudun25-cloud/hidi-story-maker/commits/main

### Firebase
- **Console**: https://console.firebase.google.com/project/story-make-fbbd7
- **Hosting**: https://console.firebase.google.com/project/story-make-fbbd7/hosting
- **Analytics**: https://console.firebase.google.com/project/story-make-fbbd7/analytics

### Production URLs
- **Primary**: https://story-make-fbbd7.web.app
- **Alternative**: https://story-make-fbbd7.firebaseapp.com

### Development
- **Sandbox**: https://3000-i5dcsscuqxml7neuit43a-de59bda9.sandbox.novita.ai
- **Local**: http://localhost:3000

---

## 🎯 다음 단계

배포 설정이 완료되면:

1. ✅ **기능 개발 계속하기**
   - MyWorks 페이지 구현
   - PDF 내보내기 기능
   - 작품 관리 시스템

2. ✅ **성능 최적화**
   - 이미지 로딩 최적화
   - 번들 사이즈 축소
   - 캐싱 전략 개선

3. ✅ **사용자 피드백 수집**
   - 노인 사용자 테스트
   - UI/UX 개선
   - 접근성 향상

---

**모든 설정이 완료되면 이 문서를 체크리스트로 사용하세요!** ✅
