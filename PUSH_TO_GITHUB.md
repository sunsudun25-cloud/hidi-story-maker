# 🚀 GitHub에 코드 푸시하기

## ✅ 현재 상태

**원격 저장소 연결 완료:**
```
origin  https://github.com/sunsudun25-cloud/hidi-story-maker.git (fetch)
origin  https://github.com/sunsudun25-cloud/hidi-story-maker.git (push)
```

**푸시할 커밋:**
- f21887e Add comprehensive GitHub setup and deployment guide
- 422d991 Add firebase-tools to devDependencies for deployment
- 8023016 Add step-by-step Firebase deployment guide for sandbox
- f14954b Add comprehensive deployment ready guide
- ea82476 Initialize Firebase Hosting with complete configuration

---

## ⚠️ GitHub 인증 필요

샌드박스 환경에서 GitHub에 푸시하려면 인증이 필요합니다.

```bash
$ git push -u origin main
fatal: could not read Username for 'https://github.com': No such device or address
```

---

## 🔐 해결 방법 (3가지)

### **방법 1: Novita Sandbox GitHub 인증 (추천) ⭐**

**샌드박스 UI에서 GitHub 권한 설정:**

1. **#github 탭 또는 Deploy 섹션 접속**
2. **"GitHub 연결" 또는 "Authorize GitHub" 클릭**
3. **GitHub 로그인 & 권한 승인**
4. **인증 완료 후 다시 푸시 시도:**
   ```bash
   cd /home/user/webapp
   git push -u origin main
   ```

---

### **방법 2: Personal Access Token 사용 🔑**

**GitHub Token으로 인증:**

#### 1️⃣ Personal Access Token 생성
https://github.com/settings/tokens 접속

1. "Generate new token" → "Generate new token (classic)"
2. Note: `hidi-story-maker-deploy`
3. Expiration: `90 days` 또는 `No expiration`
4. Scopes: 
   - ✅ `repo` (전체 체크)
   - ✅ `workflow` (GitHub Actions)
5. "Generate token" 클릭
6. **토큰 복사** (한 번만 표시됨!)

#### 2️⃣ 토큰으로 푸시
```bash
cd /home/user/webapp

# URL에 토큰 포함하여 푸시
git push https://YOUR_TOKEN@github.com/sunsudun25-cloud/hidi-story-maker.git main
```

**실제 명령어 예시:**
```bash
git push https://ghp_ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefgh@github.com/sunsudun25-cloud/hidi-story-maker.git main
```

#### 3️⃣ 토큰 저장 (선택)
```bash
# Git credential helper 설정
git config --global credential.helper store

# 다음 푸시 시 토큰 입력
# Username: sunsudun25-cloud
# Password: ghp_YOUR_TOKEN
git push -u origin main
```

---

### **방법 3: SSH 키 사용 🔐**

**SSH로 인증 (고급):**

#### 1️⃣ SSH 키 생성
```bash
ssh-keygen -t ed25519 -C "your_email@example.com"
```

#### 2️⃣ SSH 키를 GitHub에 추가
```bash
# 공개 키 복사
cat ~/.ssh/id_ed25519.pub
```

https://github.com/settings/keys 에서 "New SSH key" 추가

#### 3️⃣ 원격 저장소 URL 변경
```bash
cd /home/user/webapp

# HTTPS → SSH 변경
git remote set-url origin git@github.com:sunsudun25-cloud/hidi-story-maker.git

# 푸시
git push -u origin main
```

---

## 🚀 즉시 실행 가능한 명령어

### Personal Access Token 사용 (가장 빠름)
```bash
cd /home/user/webapp

# 토큰으로 직접 푸시
git push https://YOUR_TOKEN@github.com/sunsudun25-cloud/hidi-story-maker.git main

# 또는 credential helper 설정 후 푸시
git config --global credential.helper store
git push -u origin main
# Username: sunsudun25-cloud
# Password: YOUR_TOKEN
```

---

## 📊 푸시 후 확인 사항

### ✅ GitHub 저장소 확인
https://github.com/sunsudun25-cloud/hidi-story-maker

**확인할 내용:**
- [ ] 11+ 커밋이 푸시되었는지
- [ ] README.md가 표시되는지
- [ ] `.github/workflows/firebase-deploy.yml` 파일 존재
- [ ] 파일 구조가 올바른지

### ✅ GitHub Actions 확인
https://github.com/sunsudun25-cloud/hidi-story-maker/actions

**확인할 내용:**
- [ ] "Deploy to Firebase Hosting" 워크플로우 존재
- [ ] 첫 푸시 시 자동 실행 여부
- [ ] 빌드 성공/실패 상태

---

## 🔥 GitHub Actions 자동 배포 설정

푸시 성공 후 자동 배포를 위해:

### 1️⃣ Firebase 서비스 계정 JSON 다운로드
https://console.firebase.google.com/project/story-make-fbbd7/settings/serviceaccounts/adminsdk

→ "새 비공개 키 생성" 클릭

### 2️⃣ GitHub Secrets 등록
https://github.com/sunsudun25-cloud/hidi-story-maker/settings/secrets/actions

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

### 3️⃣ GitHub Actions Permissions 설정
https://github.com/sunsudun25-cloud/hidi-story-maker/settings/actions

1. "General" 탭
2. "Workflow permissions"
3. **"Read and write permissions"** 선택
4. "Save" 클릭

### 4️⃣ 자동 배포 테스트
```bash
cd /home/user/webapp

# 테스트 변경
echo "# Auto-deploy test" >> README.md

# 커밋 & 푸시
git add README.md
git commit -m "Test auto-deploy"
git push origin main
```

**Actions 탭에서 확인:**
https://github.com/sunsudun25-cloud/hidi-story-maker/actions

**배포 완료 확인:**
https://story-make-fbbd7.web.app

---

## 🎯 전체 워크플로우

```
1. GitHub 인증 설정
   └─ Personal Access Token 생성

2. 코드 푸시
   └─ git push -u origin main

3. GitHub 확인
   └─ https://github.com/sunsudun25-cloud/hidi-story-maker

4. Firebase 서비스 계정 설정
   └─ JSON 다운로드

5. GitHub Secrets 등록
   └─ FIREBASE_SERVICE_ACCOUNT 추가

6. Actions 권한 설정
   └─ Read and write permissions

7. 자동 배포 테스트
   └─ git push → Actions 실행

8. 배포 완료
   └─ https://story-make-fbbd7.web.app 접속!
```

---

## ❓ 자주 묻는 질문

### Q1: Personal Access Token은 어디서 만드나요?
**A:** https://github.com/settings/tokens → "Generate new token (classic)"

### Q2: 토큰 권한은 무엇을 선택해야 하나요?
**A:** `repo` 전체 체크 (모든 저장소 권한)

### Q3: 토큰은 어디에 입력하나요?
**A:** 
- 방법 1: URL에 직접 포함 `git push https://TOKEN@github.com/...`
- 방법 2: Username/Password 프롬프트에서 입력

### Q4: 토큰을 잃어버렸어요.
**A:** 새로운 토큰을 생성하세요. 기존 토큰은 재확인 불가능합니다.

### Q5: GitHub Actions가 실패합니다.
**A:** 
1. `FIREBASE_SERVICE_ACCOUNT` Secret 확인
2. Actions 권한 설정 확인
3. Actions 탭에서 에러 로그 확인

---

## 🚨 트러블슈팅

### 문제: "Authentication failed"
**원인:** 잘못된 토큰 또는 권한 부족  
**해결:** 
1. 토큰 재생성
2. `repo` 권한 체크 확인
3. 토큰 만료 확인

### 문제: "Permission denied (publickey)"
**원인:** SSH 키 문제  
**해결:** Personal Access Token 사용 또는 SSH 키 재설정

### 문제: 푸시는 성공했는데 Actions가 안 실행됩니다.
**원인:** Actions 권한 문제  
**해결:**
1. Settings → Actions → General
2. "Read and write permissions" 선택

---

## 💡 다음 단계

### 1️⃣ Personal Access Token 생성
https://github.com/settings/tokens

### 2️⃣ 코드 푸시
```bash
cd /home/user/webapp
git push https://YOUR_TOKEN@github.com/sunsudun25-cloud/hidi-story-maker.git main
```

### 3️⃣ Firebase 서비스 계정 설정
https://console.firebase.google.com/project/story-make-fbbd7/settings/serviceaccounts/adminsdk

### 4️⃣ GitHub Secrets 등록
https://github.com/sunsudun25-cloud/hidi-story-maker/settings/secrets/actions

### 5️⃣ 자동 배포 확인
https://github.com/sunsudun25-cloud/hidi-story-maker/actions

---

**준비 완료! Personal Access Token을 생성하고 코드를 푸시하세요! 🚀**
