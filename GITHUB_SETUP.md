# 🐙 GitHub 저장소 연결 가이드

## ✅ 현재 상태

Git 저장소가 이미 초기화되어 있습니다:
- ✅ Git 저장소 초기화 완료
- ✅ 모든 변경사항 커밋됨
- ✅ 브랜치: `main`
- ✅ 총 커밋 수: 10+ commits
- ⏳ GitHub 원격 저장소 연결 필요

---

## 🚀 GitHub에 코드 푸시하기

### **1단계: GitHub 저장소 생성**

#### GitHub 웹사이트에서:
1. https://github.com/new 접속
2. 저장소 이름 입력 (예: `hidi-story-maker`)
3. Public 또는 Private 선택
4. **❌ "Initialize this repository with a README" 체크 해제** (이미 로컬에 코드 있음)
5. "Create repository" 클릭

---

### **2단계: 원격 저장소 연결**

GitHub 저장소 생성 후 표시되는 URL을 사용:

```bash
cd /home/user/webapp

# GitHub 저장소 연결
git remote add origin https://github.com/YOUR_USERNAME/hidi-story-maker.git

# 원격 저장소 확인
git remote -v
```

**출력 예시:**
```
origin  https://github.com/YOUR_USERNAME/hidi-story-maker.git (fetch)
origin  https://github.com/YOUR_USERNAME/hidi-story-maker.git (push)
```

---

### **3단계: 코드 푸시**

```bash
cd /home/user/webapp

# main 브랜치로 푸시
git push -u origin main
```

**GitHub 인증 필요 시:**
- Username: GitHub 사용자명
- Password: **Personal Access Token** (비밀번호 아님)

#### Personal Access Token 생성:
1. https://github.com/settings/tokens 접속
2. "Generate new token" → "Generate new token (classic)"
3. Note: `hidi-story-maker-deploy`
4. Expiration: `90 days` 또는 `No expiration`
5. Scopes: `repo` 체크
6. "Generate token" 클릭
7. 토큰 복사 (한 번만 표시됨!)

---

### **4단계: GitHub Actions 자동 배포 설정**

#### Firebase 서비스 계정 JSON 다운로드:
https://console.firebase.google.com/project/story-make-fbbd7/settings/serviceaccounts/adminsdk

→ "새 비공개 키 생성" 클릭 → JSON 다운로드

#### GitHub Secrets 등록:
1. GitHub 저장소 → Settings
2. Secrets and variables → Actions
3. "New repository secret" 클릭

**필수 Secret:**
- Name: `FIREBASE_SERVICE_ACCOUNT`
- Value: JSON 파일의 **전체 내용** 붙여넣기

**선택 Secrets (환경 변수):**
- `VITE_FIREBASE_API_KEY` = `AIzaSyBBsjEVt-WktzSYC1zqZPslIjAie9a-F0`
- `VITE_FIREBASE_AUTH_DOMAIN` = `story-make-fbbd7.firebaseapp.com`
- `VITE_FIREBASE_PROJECT_ID` = `story-make-fbbd7`
- `VITE_FIREBASE_STORAGE_BUCKET` = `story-make-fbbd7.firebasestorage.app`
- `VITE_FIREBASE_MESSAGING_SENDER_ID` = `63291004810`
- `VITE_FIREBASE_APP_ID` = `1:63291004810:web:7a8301e17c4e528768da73`
- `VITE_FIREBASE_MEASUREMENT_ID` = `G-SK12ZCRM26`

---

### **5단계: 자동 배포 테스트**

코드를 수정하고 푸시:
```bash
cd /home/user/webapp

# 코드 수정
echo "# Test" >> README.md

# 커밋 & 푸시
git add README.md
git commit -m "Test auto-deploy"
git push origin main
```

GitHub Actions가 자동으로:
1. ✅ 코드 체크아웃
2. ✅ 의존성 설치
3. ✅ 프로젝트 빌드
4. ✅ Firebase에 배포

**배포 확인:**
- GitHub 저장소 → Actions 탭
- 배포 진행 상황 확인
- 성공 시: https://story-make-fbbd7.web.app

---

## 📂 프로젝트 구조

```
webapp/
├── .git/                    ✅ Git 저장소
├── .github/
│   └── workflows/
│       └── firebase-deploy.yml  ✅ GitHub Actions 워크플로우
├── src/                     ✅ 소스 코드
├── dist/                    ✅ 빌드 출력
├── firebase.json            ✅ Firebase 설정
├── .firebaserc              ✅ Firebase 프로젝트
├── package.json             ✅ 의존성
├── .gitignore               ✅ Git 제외 파일
└── README.md
```

---

## 🔐 .gitignore 확인

다음 파일/폴더가 Git에서 제외되어야 합니다:

```gitignore
# Dependencies
node_modules/

# Build output
dist/

# Environment variables
.env
.env.*
!.env.example

# Firebase
.firebase/
firebase-debug.log

# IDE
.vscode/
.idea/

# OS
.DS_Store
```

---

## 📊 Git 상태 요약

### 현재 커밋 내역:
```bash
422d991 Add firebase-tools to devDependencies for deployment
8023016 Add step-by-step Firebase deployment guide for sandbox
f14954b Add comprehensive deployment ready guide
ea82476 Initialize Firebase Hosting with complete configuration
eeab6cc Add quick deployment guide
328fc8c Add GitHub Actions workflow for automatic Firebase deployment
```

### 브랜치:
- `main` (현재)

### 원격 저장소:
- 아직 연결되지 않음 (설정 필요)

---

## 🎯 즉시 실행 가능한 명령어

### GitHub 저장소 연결 (저장소 생성 후)
```bash
cd /home/user/webapp

# 원격 저장소 연결
git remote add origin https://github.com/YOUR_USERNAME/hidi-story-maker.git

# 코드 푸시
git push -u origin main
```

### 새 코드 푸시
```bash
cd /home/user/webapp

# 변경사항 확인
git status

# 모든 변경사항 추가
git add .

# 커밋
git commit -m "Add new feature"

# 푸시
git push origin main
```

---

## 🌟 GitHub Actions 자동 배포 플로우

```
코드 수정
  ↓
git add & commit
  ↓
git push origin main
  ↓
GitHub Actions 트리거
  ↓
npm ci (의존성 설치)
  ↓
npm run build (빌드)
  ↓
firebase deploy (배포)
  ↓
https://story-make-fbbd7.web.app (배포 완료!)
```

---

## ❓ 자주 묻는 질문

### Q1: GitHub 사용자명/비밀번호를 계속 물어봅니다.
**A:** Personal Access Token을 사용하세요:
1. https://github.com/settings/tokens
2. 새 토큰 생성
3. Username: GitHub 사용자명
4. Password: 생성된 토큰

### Q2: `git push` 시 권한 없음 에러
**A:** 
1. Personal Access Token 권한 확인 (`repo` 체크)
2. 토큰 재생성
3. SSH 키 사용 고려

### Q3: GitHub Actions가 실패합니다.
**A:**
1. `FIREBASE_SERVICE_ACCOUNT` Secret 확인
2. JSON 파일 형식 검증
3. Actions 탭에서 에러 로그 확인

### Q4: 배포는 성공했는데 변경사항이 안 보입니다.
**A:**
1. 브라우저 캐시 삭제 (Ctrl+Shift+R)
2. Firebase Console에서 배포 버전 확인
3. 빌드 로그 확인

---

## 🚨 트러블슈팅

### 문제: "remote origin already exists"
**해결:**
```bash
# 기존 origin 제거
git remote remove origin

# 다시 추가
git remote add origin https://github.com/YOUR_USERNAME/hidi-story-maker.git
```

### 문제: "failed to push some refs"
**해결:**
```bash
# 강제 푸시 (주의: 원격 저장소 덮어씀)
git push -f origin main
```

### 문제: "GitHub Actions permission denied"
**해결:**
1. Settings → Actions → General
2. "Workflow permissions" → "Read and write permissions" 선택
3. "Save" 클릭

---

## 💡 다음 단계

### 1️⃣ GitHub 저장소 생성
https://github.com/new

### 2️⃣ 원격 저장소 연결
```bash
git remote add origin https://github.com/YOUR_USERNAME/hidi-story-maker.git
```

### 3️⃣ 코드 푸시
```bash
git push -u origin main
```

### 4️⃣ GitHub Actions 설정
- Firebase 서비스 계정 JSON
- GitHub Secrets 등록

### 5️⃣ 자동 배포 확인
- Actions 탭에서 배포 상태 확인
- https://story-make-fbbd7.web.app 접속

---

**준비 완료! GitHub 저장소를 생성하고 연결하세요! 🚀**
