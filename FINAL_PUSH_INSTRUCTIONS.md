# 🚀 최종 푸시 안내 - Personal Access Token 필수

## ✅ 완료된 작업

- ✅ Git 저장소 초기화
- ✅ 14개 커밋 준비 완료
- ✅ 원격 저장소 연결: `https://github.com/sunsudun25-cloud/hidi-story-maker.git`
- ✅ 브랜치: `main`
- ⚠️ **인증 필요**: Personal Access Token

---

## ⚠️ 현재 상황

```bash
$ git push -u origin main
fatal: could not read Username for 'https://github.com': No such device or address
```

**샌드박스 환경에서는 Personal Access Token이 필수입니다.**

---

## 🔑 Personal Access Token 생성 (3분)

### 1️⃣ GitHub Token 페이지 접속
**https://github.com/settings/tokens**

### 2️⃣ 새 토큰 생성
1. **"Generate new token"** 클릭
2. **"Generate new token (classic)"** 선택

### 3️⃣ 토큰 설정
- **Note**: `hidi-story-maker-deploy`
- **Expiration**: `90 days` (권장) 또는 `No expiration`
- **Select scopes**:
  - ✅ **`repo`** ← 모든 하위 항목 자동 체크됨
  - ✅ **`workflow`** ← GitHub Actions용

### 4️⃣ 토큰 생성 & 복사
- **"Generate token"** 클릭
- ⚠️ **토큰을 즉시 복사하세요!** (다시 볼 수 없습니다)

**토큰 형식:**
```
ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```
(약 40자)

---

## 🚀 토큰으로 푸시하기

### 방법 1: URL에 토큰 포함 (가장 빠름) ⚡

```bash
cd /home/user/webapp

# 형식
git push https://YOUR_TOKEN@github.com/sunsudun25-cloud/hidi-story-maker.git main

# 실제 명령어 (YOUR_TOKEN 부분을 실제 토큰으로 교체)
git push https://ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx@github.com/sunsudun25-cloud/hidi-story-maker.git main
```

**예시:**
```bash
# 토큰이 ghp_ABC123XYZ789라면
git push https://ghp_ABC123XYZ789@github.com/sunsudun25-cloud/hidi-story-maker.git main
```

---

### 방법 2: Credential Helper (토큰 저장)

```bash
cd /home/user/webapp

# 1. Credential helper 설정
git config --global credential.helper store

# 2. Push 실행
git push -u origin main
```

**프롬프트가 나타납니다:**
```
Username for 'https://github.com': sunsudun25-cloud
Password for 'https://sunsudun25-cloud@github.com': [여기에 토큰 붙여넣기]
```

**토큰이 `~/.git-credentials` 파일에 저장되어 다음부터는 자동으로 인증됩니다.**

---

## ✅ 푸시 성공 메시지

```
Enumerating objects: 80, done.
Counting objects: 100% (80/80), done.
Delta compression using up to 8 threads
Compressing objects: 100% (65/65), done.
Writing objects: 100% (80/80), 35.5 KiB | 3.5 MiB/s, done.
Total 80 (delta 25), reused 0 (delta 0), pack-reused 0
remote: Resolving deltas: 100% (25/25), done.
To https://github.com/sunsudun25-cloud/hidi-story-maker.git
 * [new branch]      main -> main
Branch 'main' set up to track remote branch 'main' from 'origin'.
```

---

## 🎉 푸시 성공 후 확인

### 1️⃣ GitHub 저장소 확인
**https://github.com/sunsudun25-cloud/hidi-story-maker**

**확인 사항:**
- ✅ 14개 커밋이 푸시되었는지
- ✅ `README.md` 파일 표시
- ✅ `.github/workflows/firebase-deploy.yml` 존재
- ✅ `src/`, `public/`, `firebase.json` 등 파일 구조
- ✅ 최근 커밋 메시지들 확인

---

## 🔥 다음 단계: GitHub Actions 자동 배포

### Step 1: Firebase 서비스 계정 JSON 다운로드

**URL:** https://console.firebase.google.com/project/story-make-fbbd7/settings/serviceaccounts/adminsdk

**작업:**
1. **"새 비공개 키 생성"** 버튼 클릭
2. **JSON 파일 자동 다운로드**
3. 파일 이름: `story-make-fbbd7-firebase-adminsdk-xxxxx.json`
4. 파일을 텍스트 에디터로 열기
5. **전체 내용 복사**

**JSON 형식 예시:**
```json
{
  "type": "service_account",
  "project_id": "story-make-fbbd7",
  "private_key_id": "abcd1234...",
  "private_key": "-----BEGIN PRIVATE KEY-----\nMIIE...\n-----END PRIVATE KEY-----\n",
  "client_email": "firebase-adminsdk-xxxxx@story-make-fbbd7.iam.gserviceaccount.com",
  "client_id": "123456789...",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  ...
}
```

---

### Step 2: GitHub Secrets 등록

**URL:** https://github.com/sunsudun25-cloud/hidi-story-maker/settings/secrets/actions

**작업:**
1. **"New repository secret"** 클릭
2. **Name:** `FIREBASE_SERVICE_ACCOUNT` (정확히 입력)
3. **Value:** Firebase JSON 파일의 **전체 내용** 붙여넣기
4. **"Add secret"** 클릭

**추가 Secrets (선택 - 환경 변수):**
각각 "New repository secret"으로 추가:
- `VITE_FIREBASE_API_KEY` = `AIzaSyBBsjEVt-WktzSYC1zqZPslIjAie9a-F0`
- `VITE_FIREBASE_AUTH_DOMAIN` = `story-make-fbbd7.firebaseapp.com`
- `VITE_FIREBASE_PROJECT_ID` = `story-make-fbbd7`
- `VITE_FIREBASE_STORAGE_BUCKET` = `story-make-fbbd7.firebasestorage.app`
- `VITE_FIREBASE_MESSAGING_SENDER_ID` = `63291004810`
- `VITE_FIREBASE_APP_ID` = `1:63291004810:web:7a8301e17c4e528768da73`
- `VITE_FIREBASE_MEASUREMENT_ID` = `G-SK12ZCRM26`

---

### Step 3: GitHub Actions 권한 설정

**URL:** https://github.com/sunsudun25-cloud/hidi-story-maker/settings/actions

**작업:**
1. **"General"** 탭 선택
2. **"Workflow permissions"** 섹션 찾기
3. 현재 설정 확인 (기본값: "Read repository contents and packages permissions")
4. **"Read and write permissions"** 라디오 버튼 선택
5. ✅ **"Allow GitHub Actions to create and approve pull requests"** 체크 (선택)
6. **"Save"** 버튼 클릭

---

### Step 4: 자동 배포 테스트

```bash
cd /home/user/webapp

# 1. 테스트 변경
echo "" >> README.md
echo "## 🚀 GitHub Actions Auto-Deploy Test" >> README.md
echo "" >> README.md
echo "Deployed from GitHub Actions to Firebase Hosting" >> README.md

# 2. 커밋
git add README.md
git commit -m "Test GitHub Actions auto-deploy to Firebase"

# 3. 푸시 (토큰이 저장되어 있으면 자동 인증)
git push origin main
```

---

### Step 5: 배포 진행 확인

**Actions 탭:** https://github.com/sunsudun25-cloud/hidi-story-maker/actions

**확인 사항:**
1. **"Deploy to Firebase Hosting"** 워크플로우 실행 중
2. **진행 단계:**
   - ✅ Checkout code
   - ✅ Setup Node.js
   - ✅ Install dependencies (npm ci)
   - ✅ Build project (npm run build)
   - ✅ Deploy to Firebase Hosting
3. **예상 소요 시간:** 2-3분
4. **성공 메시지:** ✅ 녹색 체크 표시

**실패 시:**
- 빨간색 X 표시
- 로그 확인하여 에러 원인 파악
- `FIREBASE_SERVICE_ACCOUNT` Secret 확인
- Actions 권한 설정 확인

---

### Step 6: 배포 완료 확인

**프로덕션 URL 접속:**
- 🌟 **메인:** https://story-make-fbbd7.web.app
- 🔗 **대체:** https://story-make-fbbd7.firebaseapp.com

**확인 사항:**
- ✅ 로그인 페이지 표시
- ✅ 비회원 로그인 → 홈 페이지 이동
- ✅ Google 로그인 버튼 작동
- ✅ 홈 페이지 4개 카드 표시
- ✅ 글쓰기 페이지 접속

**Firebase Console 확인:**
- 📊 **호스팅:** https://console.firebase.google.com/project/story-make-fbbd7/hosting
- 📈 **사용량:** https://console.firebase.google.com/project/story-make-fbbd7/usage

---

## 🎯 전체 플로우 요약

```
1. Personal Access Token 생성 (3분)
   └─ https://github.com/settings/tokens
   └─ repo + workflow 권한

2. 코드 푸시 (1분)
   └─ git push https://TOKEN@github.com/.../hidi-story-maker.git main
   └─ GitHub 저장소 확인

3. Firebase 서비스 계정 다운로드 (1분)
   └─ JSON 파일 받기

4. GitHub Secrets 등록 (2분)
   └─ FIREBASE_SERVICE_ACCOUNT 추가

5. Actions 권한 설정 (1분)
   └─ Read and write permissions

6. 자동 배포 테스트 (3분)
   └─ git push → Actions 실행

7. 배포 완료 확인 (1분)
   └─ https://story-make-fbbd7.web.app

총 소요 시간: 약 12분
```

---

## 📋 최종 체크리스트

### 코드 푸시 완료:
- [ ] Personal Access Token 생성
- [ ] `git push` 성공
- [ ] GitHub 저장소에 코드 확인
- [ ] 14개 커밋 모두 푸시됨

### 자동 배포 설정 완료:
- [ ] Firebase 서비스 계정 JSON 다운로드
- [ ] `FIREBASE_SERVICE_ACCOUNT` Secret 등록
- [ ] Actions 권한 "Read and write" 설정
- [ ] 테스트 푸시 실행
- [ ] GitHub Actions 빌드 성공
- [ ] Firebase에 배포 완료
- [ ] https://story-make-fbbd7.web.app 접속 확인

---

## 🚀 지금 바로 실행하세요!

### 1️⃣ Token 생성
https://github.com/settings/tokens

### 2️⃣ 푸시 실행
```bash
cd /home/user/webapp
git push https://YOUR_TOKEN@github.com/sunsudun25-cloud/hidi-story-maker.git main
```

### 3️⃣ GitHub Actions 설정
https://github.com/sunsudun25-cloud/hidi-story-maker/settings/secrets/actions

---

**Personal Access Token을 생성하고 위 명령어를 실행하세요! 🎉**

**모든 것이 준비되었습니다. Token만 있으면 바로 배포됩니다!**
