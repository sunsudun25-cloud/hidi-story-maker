# Gemini API 키 설정 가이드

## ⚠️ 중요: GitHub Actions Workflow 수동 업데이트 필요

GitHub App의 `workflows` 권한 제약으로 인해 `.github/workflows/deploy.yml` 파일을 **GitHub 웹에서 직접 수정**해야 합니다.

---

## 📝 수정 방법

### 1. GitHub에서 파일 열기
https://github.com/sunsudun25-cloud/hidi-story-maker/blob/main/.github/workflows/deploy.yml

### 2. 편집 버튼 클릭
우측 상단의 **연필 아이콘** (Edit this file) 클릭

### 3. `Build project` 섹션 수정

**현재 코드 (26-35번 줄):**
```yaml
      - name: Build project
        run: npm run build
        env:
          VITE_FIREBASE_API_KEY: AIzaSyBBsjEVt-WktzSYC1zqZPslIjAie9a-F0
          VITE_FIREBASE_AUTH_DOMAIN: story-make-fbbd7.firebaseapp.com
          VITE_FIREBASE_PROJECT_ID: story-make-fbbd7
          VITE_FIREBASE_STORAGE_BUCKET: story-make-fbbd7.firebasestorage.app
          VITE_FIREBASE_MESSAGING_SENDER_ID: 63291004810
          VITE_FIREBASE_APP_ID: 1:63291004810:web:7a8301e17c4e528768da73
          VITE_FIREBASE_MEASUREMENT_ID: G-SK12ZCRM26
```

**수정 후 코드:**
```yaml
      - name: Build project
        run: npm run build
        env:
          VITE_GEMINI_API_KEY: AIzaSyDLyiqqcZgzCi09YmEtuPmMWXKS0EQlWos
          VITE_GEMINI_KEY: AIzaSyDLyiqqcZgzCi09YmEtuPmMWXKS0EQlWos
          VITE_GOOGLE_API_KEY: AIzaSyDLyiqqcZgzCi09YmEtuPmMWXKS0EQlWos
          VITE_FIREBASE_API_KEY: AIzaSyBBsjEVt-WktzSYC1zqZPslIjAie9a-F0
          VITE_FIREBASE_AUTH_DOMAIN: story-make-fbbd7.firebaseapp.com
          VITE_FIREBASE_PROJECT_ID: story-make-fbbd7
          VITE_FIREBASE_STORAGE_BUCKET: story-make-fbbd7.firebasestorage.app
          VITE_FIREBASE_MESSAGING_SENDER_ID: 63291004810
          VITE_FIREBASE_APP_ID: 1:63291004810:web:7a8301e17c4e528768da73
          VITE_FIREBASE_MEASUREMENT_ID: G-SK12ZCRM26
```

### 4. Commit 메시지 작성
```
Fix: Add Gemini API key to GitHub Actions workflow
```

### 5. Commit 버튼 클릭
**Commit changes** 버튼 클릭

---

## ✅ 완료 후 확인 사항

1. **자동 배포 시작**: Commit 후 GitHub Actions가 자동 실행됩니다
   - 확인: https://github.com/sunsudun25-cloud/hidi-story-maker/actions

2. **배포 성공 확인** (2-3분 소요):
   - 초록색 체크 표시가 나타나면 성공

3. **Production 사이트 테스트**:
   - https://story-make-fbbd7.web.app
   - **그림 만들기** → AI 이미지 생성 테스트
   - **동화책 만들기** → AI 스토리북 생성 테스트

---

## 🔍 현재 로컬 환경 상태

✅ `.env` 파일 생성 완료 (로컬용, Git에 포함되지 않음)
✅ 로컬 빌드 성공
✅ 로컬 개발 서버 실행 중
   - Sandbox: https://3000-i5dcsscuqxml7neuit43a-de59bda9.sandbox.novita.ai

❌ GitHub Actions workflow 수동 업데이트 필요
   - 위 가이드대로 진행해주세요

---

## 📚 API 키 정보

### Gemini API 키:
```
AIzaSyDLyiqqcZgzCi09YmEtuPmMWXKS0EQlWos
```

### 사용 위치:
1. **로컬 개발**: `.env` 파일 (이미 설정됨)
2. **Production 배포**: GitHub Actions workflow (수동 설정 필요)

---

## ❓ 문제 해결

### Q: Workflow 파일을 푸시할 수 없습니다
A: GitHub App의 권한 제약입니다. **반드시 GitHub 웹에서 직접 수정**해주세요.

### Q: 배포가 실패합니다
A: GitHub Actions 페이지에서 로그를 확인하고, 에러 메시지를 알려주세요.

### Q: API 키가 작동하지 않습니다
A: 
1. https://makersuite.google.com/app/apikey 에서 키 상태 확인
2. API 할당량 확인
3. 키가 활성화되어 있는지 확인

---

수정 완료 후 알려주세요! 🚀
