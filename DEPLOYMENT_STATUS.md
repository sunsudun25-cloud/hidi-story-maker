# 🚀 HI-DI Story Maker 배포 상태

## ✅ 완료된 작업

### 1. GitHub 저장소 푸시 완료
- **저장소**: https://github.com/sunsudun25-cloud/hidi-story-maker
- **브랜치**: main
- **상태**: ✅ 코드 푸시 완료

### 2. 현재 개발 환경
- **Dev URL**: https://3000-i5dcsscuqxml7neuit43a-de59bda9.sandbox.novita.ai
- **상태**: ✅ 정상 작동 중

## 🔄 다음 단계: Firebase 자동 배포 설정

### Step 1: Firebase Service Account 설정 (필수)

#### 1-1. Service Account JSON 다운로드
1. 다음 링크 접속:
   ```
   https://console.firebase.google.com/project/story-make-fbbd7/settings/serviceaccounts/adminsdk
   ```

2. **"새 비공개 키 생성"** 버튼 클릭

3. JSON 파일 다운로드 (예: `story-make-fbbd7-firebase-adminsdk-xxxxx.json`)

#### 1-2. GitHub Secrets에 등록
1. GitHub Settings 접속:
   ```
   https://github.com/sunsudun25-cloud/hidi-story-maker/settings/secrets/actions
   ```

2. **"New repository secret"** 클릭

3. Secret 추가:
   - **Name**: `FIREBASE_SERVICE_ACCOUNT`
   - **Value**: 다운로드한 JSON 파일의 **전체 내용** 복사 & 붙여넣기
   
   JSON 파일은 다음과 같은 형식입니다:
   ```json
   {
     "type": "service_account",
     "project_id": "story-make-fbbd7",
     "private_key_id": "...",
     "private_key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n",
     "client_email": "firebase-adminsdk-...@story-make-fbbd7.iam.gserviceaccount.com",
     ...
   }
   ```

4. **"Add secret"** 클릭

### Step 2: Firebase 환경 변수 등록 (선택사항, 권장)

같은 페이지에서 다음 Secrets도 추가:

1. `VITE_FIREBASE_API_KEY`
   - Value: `AIzaSyBBsjEVt-WktzSYC1zqZPslIjAie9a-F0`

2. `VITE_FIREBASE_AUTH_DOMAIN`
   - Value: `story-make-fbbd7.firebaseapp.com`

3. `VITE_FIREBASE_PROJECT_ID`
   - Value: `story-make-fbbd7`

4. `VITE_FIREBASE_STORAGE_BUCKET`
   - Value: `story-make-fbbd7.firebasestorage.app`

5. `VITE_FIREBASE_MESSAGING_SENDER_ID`
   - Value: `63291004810`

6. `VITE_FIREBASE_APP_ID`
   - Value: `1:63291004810:web:7a8301e17c4e528768da73`

7. `VITE_FIREBASE_MEASUREMENT_ID`
   - Value: `G-SK12ZCRM26`

### Step 3: GitHub Actions Workflow 추가

1. GitHub 저장소 접속:
   ```
   https://github.com/sunsudun25-cloud/hidi-story-maker
   ```

2. **"Add file"** → **"Create new file"** 클릭

3. 파일 경로 입력:
   ```
   .github/workflows/firebase-deploy.yml
   ```

4. 아래 내용 복사 & 붙여넣기:

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

5. **"Commit changes"** 클릭

### Step 4: 자동 배포 확인

1. **GitHub Actions 확인**:
   ```
   https://github.com/sunsudun25-cloud/hidi-story-maker/actions
   ```
   - Workflow가 자동으로 실행됩니다
   - 빌드 & 배포 진행 상황 확인 가능

2. **배포된 사이트 확인**:
   ```
   https://story-make-fbbd7.web.app
   또는
   https://story-make-fbbd7.firebaseapp.com
   ```

3. **배포 성공 확인 항목**:
   - ✅ 로그인 페이지 로드
   - ✅ Google 로그인 작동
   - ✅ 비회원 로그인 → /home 이동
   - ✅ "글쓰기 시작" 버튼 → /write 이동

## 🎯 배포 후 테스트 체크리스트

### 기본 기능
- [ ] 로그인 페이지 로드
- [ ] Google 로그인 작동
- [ ] 비회원 로그인 작동
- [ ] /home 페이지 접근
- [ ] /write 페이지 접근
- [ ] /gallery 페이지 접근

### Firebase 연동
- [ ] Firebase Authentication 작동
- [ ] 사용자 정보 저장
- [ ] 로그아웃 기능

## 📚 참고 문서

- Firebase Console: https://console.firebase.google.com/project/story-make-fbbd7
- GitHub Repository: https://github.com/sunsudun25-cloud/hidi-story-maker
- 현재 Dev Server: https://3000-i5dcsscuqxml7neuit43a-de59bda9.sandbox.novita.ai

## 🔍 트러블슈팅

### Workflow 실행 안 됨
- GitHub Settings → Actions → General
- "Allow all actions and reusable workflows" 선택

### 배포 실패
- GitHub Actions 로그 확인
- `FIREBASE_SERVICE_ACCOUNT` Secret 확인
- Firebase 프로젝트 권한 확인

### 사이트 접속 안 됨
- Firebase Hosting 활성화 확인
- 도메인 설정 확인
- 빌드 오류 확인

## 🎉 완료 후

모든 설정이 완료되면:
1. 코드 수정 후 `git push`만 하면 자동 배포
2. 실시간으로 https://story-make-fbbd7.web.app 업데이트
3. 안정적인 프로덕션 환경 제공

---

**문의사항이 있으시면 언제든 알려주세요!** 🚀
