# 🔐 GitHub 인증 필수 - 단계별 가이드

## ⚠️ 현재 상황

```bash
$ git push -u origin main
fatal: could not read Username for 'https://github.com': No such device or address
```

**문제:** 샌드박스 환경에서 GitHub 인증이 설정되지 않았습니다.

---

## 🎯 해결 방법 2가지

---

## **방법 1: Novita Sandbox GitHub 연결 (추천) ⭐**

### 샌드박스 UI에서 GitHub 연결:

**단계:**
1. **샌드박스 인터페이스 상단 메뉴 확인**
   - `#github` 탭 또는 
   - `Deploy` 섹션 찾기

2. **"GitHub 연결" 또는 "Authorize GitHub" 버튼 클릭**

3. **GitHub 로그인 페이지로 이동**
   - GitHub 계정으로 로그인
   - Novita/Sandbox 앱 권한 승인

4. **연결 완료 후 다시 푸시 시도:**
   ```bash
   cd /home/user/webapp
   git push -u origin main
   ```

---

## **방법 2: Personal Access Token (확실함) ⚡**

### A. Token 생성 (2분)

**1️⃣ GitHub Token 페이지 접속:**
https://github.com/settings/tokens

**2️⃣ 새 토큰 생성:**
- **"Generate new token"** 클릭
- **"Generate new token (classic)"** 선택

**3️⃣ 토큰 설정:**
- **Note**: `hidi-story-maker-novita-deploy`
- **Expiration**: `90 days` (또는 원하는 기간)
- **Select scopes**:
  - ✅ **`repo`** (전체 체크) ← 필수!
  - ✅ **`workflow`** ← GitHub Actions용

**4️⃣ 토큰 생성 & 복사:**
- **"Generate token"** 클릭
- ⚠️ **토큰을 즉시 복사** (한 번만 표시됨!)

**토큰 형식 예시:**
```
ghp_1a2b3c4d5e6f7g8h9i0jklmnopqrstuvwxyzABCD
```

---

### B. Token으로 푸시 (1분)

#### 방법 2-A: URL에 토큰 직접 포함 (빠름)
```bash
cd /home/user/webapp

# 형식: git push https://TOKEN@github.com/USERNAME/REPO.git BRANCH
git push https://ghp_YOUR_TOKEN_HERE@github.com/sunsudun25-cloud/hidi-story-maker.git main
```

**실제 명령어 예시:**
```bash
git push https://ghp_1a2b3c4d5e6f7g8h9i0jklmnopqrstuvwxyzABCD@github.com/sunsudun25-cloud/hidi-story-maker.git main
```

#### 방법 2-B: Credential Helper로 토큰 저장
```bash
cd /home/user/webapp

# Git credential helper 설정
git config --global credential.helper store

# 일반 push 명령어 실행
git push -u origin main
```

**프롬프트가 나타나면:**
```
Username for 'https://github.com': sunsudun25-cloud
Password for 'https://sunsudun25-cloud@github.com': ghp_YOUR_TOKEN_HERE
```

**토큰이 `~/.git-credentials` 파일에 저장되어 다음부터는 자동 인증됩니다.**

---

## ✅ 푸시 성공 메시지

```
Enumerating objects: 70, done.
Counting objects: 100% (70/70), done.
Delta compression using up to 8 threads
Compressing objects: 100% (55/55), done.
Writing objects: 100% (70/70), 30.2 KiB | 3.0 MiB/s, done.
Total 70 (delta 20), reused 0 (delta 0), pack-reused 0
remote: Resolving deltas: 100% (20/20), done.
To https://github.com/sunsudun25-cloud/hidi-story-maker.git
 * [new branch]      main -> main
Branch 'main' set up to track remote branch 'main' from 'origin'.
```

**GitHub 저장소 확인:**
https://github.com/sunsudun25-cloud/hidi-story-maker

---

## 📊 푸시 후 확인 사항

### 1️⃣ GitHub 저장소
**URL:** https://github.com/sunsudun25-cloud/hidi-story-maker

**확인:**
- ✅ 13+ 커밋이 푸시되었는지
- ✅ `README.md` 파일 표시
- ✅ `.github/workflows/firebase-deploy.yml` 존재
- ✅ `src/`, `public/`, `firebase.json` 등 파일 구조

### 2️⃣ 커밋 히스토리
**URL:** https://github.com/sunsudun25-cloud/hidi-story-maker/commits/main

**최근 커밋:**
- `fad4b74` Add GitHub authentication required guide
- `e3f5fc7` Add GitHub push guide with authentication methods
- `f21887e` Add comprehensive GitHub setup and deployment guide
- 등 13+ 커밋

---

## 🔥 다음 단계: GitHub Actions 자동 배포

### 1️⃣ Firebase 서비스 계정 JSON 다운로드

**URL:** https://console.firebase.google.com/project/story-make-fbbd7/settings/serviceaccounts/adminsdk

**작업:**
1. **"새 비공개 키 생성"** 클릭
2. **JSON 파일 다운로드**
3. 파일을 열어서 **전체 내용 복사**

---

### 2️⃣ GitHub Secrets 등록

**URL:** https://github.com/sunsudun25-cloud/hidi-story-maker/settings/secrets/actions

**필수 Secret 추가:**
1. **"New repository secret"** 클릭
2. **Name:** `FIREBASE_SERVICE_ACCOUNT`
3. **Value:** Firebase JSON 파일의 **전체 내용** 붙여넣기
   ```json
   {
     "type": "service_account",
     "project_id": "story-make-fbbd7",
     "private_key_id": "...",
     "private_key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n",
     ...
   }
   ```
4. **"Add secret"** 클릭

**선택 Secrets (환경 변수 - 나중에 추가 가능):**
- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_STORAGE_BUCKET`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`
- `VITE_FIREBASE_MEASUREMENT_ID`

---

### 3️⃣ GitHub Actions 권한 설정

**URL:** https://github.com/sunsudun25-cloud/hidi-story-maker/settings/actions

**작업:**
1. **"General"** 탭 선택
2. **"Workflow permissions"** 섹션 찾기
3. **"Read and write permissions"** 선택 (기본값은 "Read repository contents and packages permissions")
4. ✅ **"Allow GitHub Actions to create and approve pull requests"** 체크 (선택)
5. **"Save"** 클릭

---

### 4️⃣ 자동 배포 테스트

```bash
cd /home/user/webapp

# 테스트 파일 수정
echo "" >> README.md
echo "## 🚀 Auto-deploy test" >> README.md

# 커밋
git add README.md
git commit -m "Test GitHub Actions auto-deploy"

# 푸시 (이제 토큰이 저장되어 있음)
git push origin main
```

**배포 진행 확인:**
1. **Actions 탭:** https://github.com/sunsudun25-cloud/hidi-story-maker/actions
2. **"Deploy to Firebase Hosting"** 워크플로우 실행 확인
3. **빌드 로그 확인:**
   - npm ci
   - npm run build
   - firebase deploy
4. **배포 완료 시간:** 약 2-3분

**배포 완료 후 접속:**
- 🌟 https://story-make-fbbd7.web.app
- 🔗 https://story-make-fbbd7.firebaseapp.com

---

## 🎯 전체 워크플로우 요약

```
1. GitHub Token 생성 (2분)
   └─ https://github.com/settings/tokens
   └─ repo + workflow 권한

2. 코드 푸시 (1분)
   └─ git push https://TOKEN@github.com/.../hidi-story-maker.git main
   └─ 성공 확인

3. GitHub 저장소 확인 (30초)
   └─ https://github.com/sunsudun25-cloud/hidi-story-maker
   └─ 커밋, 파일 확인

4. Firebase 서비스 계정 다운로드 (1분)
   └─ JSON 파일 받기

5. GitHub Secrets 등록 (2분)
   └─ FIREBASE_SERVICE_ACCOUNT 추가

6. Actions 권한 설정 (30초)
   └─ Read and write permissions

7. 자동 배포 테스트 (3분)
   └─ git push → Actions 실행 → Firebase 배포

8. 배포 완료 확인
   └─ https://story-make-fbbd7.web.app ✨

총 소요 시간: 약 10분
```

---

## 🚀 즉시 실행 가능한 명령어

### Personal Access Token으로 푸시
```bash
cd /home/user/webapp

# 방법 1: URL에 토큰 포함 (가장 빠름)
git push https://YOUR_TOKEN@github.com/sunsudun25-cloud/hidi-story-maker.git main

# 방법 2: Credential helper 사용 (토큰 저장)
git config --global credential.helper store
git push -u origin main
# Username: sunsudun25-cloud
# Password: YOUR_TOKEN
```

---

## ❓ 자주 묻는 질문

### Q1: Token 생성 시 어떤 권한을 선택하나요?
**A:** `repo` (전체 체크)와 `workflow` 필수

### Q2: Token은 어디에 저장되나요?
**A:** `git config credential.helper store` 사용 시 `~/.git-credentials` 파일에 평문 저장

### Q3: Token을 잃어버렸어요.
**A:** 새로운 토큰을 생성하세요. 기존 토큰은 재확인 불가능

### Q4: 푸시는 성공했는데 Actions가 실행 안됩니다.
**A:** 
- `FIREBASE_SERVICE_ACCOUNT` Secret 확인
- Actions 권한 설정 확인 (Read and write)
- `.github/workflows/firebase-deploy.yml` 파일 존재 확인

### Q5: Firebase 배포가 실패합니다.
**A:**
- Actions 로그 확인
- Firebase 서비스 계정 JSON 형식 확인
- Firebase 프로젝트 권한 확인

---

## 🚨 트러블슈팅

### 문제: "Authentication failed"
**해결:**
1. Token 재생성
2. `repo` 권한 확인
3. Token 만료 여부 확인

### 문제: "Permission denied"
**해결:**
1. Token의 scope 확인 (repo 필요)
2. 저장소 접근 권한 확인
3. Token 재발급

### 문제: Actions "Permission denied to github-actions[bot]"
**해결:**
1. Settings → Actions → General
2. "Read and write permissions" 선택
3. Save

---

## 💡 최종 체크리스트

**코드 푸시:**
- [ ] Personal Access Token 생성
- [ ] `git push` 성공
- [ ] GitHub 저장소 확인

**자동 배포 설정:**
- [ ] Firebase 서비스 계정 JSON 다운로드
- [ ] `FIREBASE_SERVICE_ACCOUNT` Secret 등록
- [ ] Actions 권한 설정 (Read and write)
- [ ] 테스트 푸시 → Actions 실행 확인
- [ ] https://story-make-fbbd7.web.app 접속 확인

---

**지금 바로 Personal Access Token을 생성하고 푸시하세요! 🚀**

**Token 생성:** https://github.com/settings/tokens

**저장소:** https://github.com/sunsudun25-cloud/hidi-story-maker
