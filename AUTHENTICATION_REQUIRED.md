# 🔐 GitHub 인증 필요

## ⚠️ 현재 상황

```bash
$ git push -u origin main
fatal: could not read Username for 'https://github.com': No such device or address
```

**원인:** 샌드박스 환경에서는 대화형 GitHub 인증이 제한됩니다.

---

## ✅ 준비 완료

- ✅ **Git 저장소**: 초기화 완료
- ✅ **커밋**: 12개 커밋 준비됨
- ✅ **브랜치**: main
- ✅ **원격 저장소**: `https://github.com/sunsudun25-cloud/hidi-story-maker.git`
- ⏳ **인증**: 필요

**푸시 대기 중인 커밋:**
```
e3f5fc7 Add GitHub push guide with authentication methods
f21887e Add comprehensive GitHub setup and deployment guide
422d991 Add firebase-tools to devDependencies for deployment
8023016 Add step-by-step Firebase deployment guide for sandbox
f14954b Add comprehensive deployment ready guide
ea82476 Initialize Firebase Hosting with complete configuration
eeab6cc Add quick deployment guide
328fc8c Add GitHub Actions workflow for automatic Firebase deployment
79cd260 Add Firebase login guide for sandbox deployment
44d1594 Update Tailwind config with unified green color palette
... (총 12개)
```

---

## 🚀 해결 방법: Personal Access Token

**가장 빠르고 확실한 방법입니다!**

### 1️⃣ Personal Access Token 생성 (2분)

#### GitHub 설정 페이지 접속:
https://github.com/settings/tokens

#### 새 토큰 생성:
1. **"Generate new token"** 클릭
2. **"Generate new token (classic)"** 선택
3. **Note**: `hidi-story-maker-deploy`
4. **Expiration**: `90 days` 또는 `No expiration` 선택
5. **Select scopes**:
   - ✅ **`repo`** (전체 체크) - 저장소 전체 액세스
   - ✅ **`workflow`** - GitHub Actions
6. **"Generate token"** 클릭
7. **토큰 복사** (⚠️ 한 번만 표시됨!)

**생성되는 토큰 형식:**
```
ghp_ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmn1234567890
```

---

### 2️⃣ 토큰으로 푸시 (1분)

#### 방법 A: URL에 토큰 포함 (가장 빠름)
```bash
cd /home/user/webapp

# 토큰을 URL에 직접 포함
git push https://YOUR_TOKEN@github.com/sunsudun25-cloud/hidi-story-maker.git main
```

**실제 명령어 예시:**
```bash
git push https://ghp_ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefgh@github.com/sunsudun25-cloud/hidi-story-maker.git main
```

#### 방법 B: Credential Helper 사용 (토큰 저장)
```bash
cd /home/user/webapp

# Git에 credential helper 설정
git config --global credential.helper store

# 일반 push 명령어 실행
git push -u origin main
```

**프롬프트가 나타나면:**
- **Username**: `sunsudun25-cloud`
- **Password**: `ghp_YOUR_TOKEN` (생성한 토큰 붙여넣기)

토큰이 저장되어 다음 push부터는 자동으로 인증됩니다.

---

### 3️⃣ 푸시 성공 확인

**성공 메시지:**
```
Enumerating objects: 50, done.
Counting objects: 100% (50/50), done.
Delta compression using up to 8 threads
Compressing objects: 100% (40/40), done.
Writing objects: 100% (50/50), 20.5 KiB | 2.5 MiB/s, done.
Total 50 (delta 10), reused 0 (delta 0), pack-reused 0
remote: Resolving deltas: 100% (10/10), done.
To https://github.com/sunsudun25-cloud/hidi-story-maker.git
 * [new branch]      main -> main
Branch 'main' set up to track remote branch 'main' from 'origin'.
```

**GitHub 저장소 확인:**
https://github.com/sunsudun25-cloud/hidi-story-maker

---

## 📊 푸시 후 다음 단계

### 1️⃣ GitHub 저장소 확인 ✅
**URL:** https://github.com/sunsudun25-cloud/hidi-story-maker

**확인 사항:**
- [ ] 12+ 커밋이 푸시되었는지
- [ ] README.md 파일이 표시되는지
- [ ] `.github/workflows/firebase-deploy.yml` 존재
- [ ] 파일 구조 확인

---

### 2️⃣ Firebase 서비스 계정 설정 🔥
**URL:** https://console.firebase.google.com/project/story-make-fbbd7/settings/serviceaccounts/adminsdk

**작업:**
1. **"새 비공개 키 생성"** 클릭
2. **JSON 파일 다운로드**
3. 파일 내용 전체 복사

---

### 3️⃣ GitHub Secrets 등록 🔐
**URL:** https://github.com/sunsudun25-cloud/hidi-story-maker/settings/secrets/actions

**필수 Secret 추가:**
1. **"New repository secret"** 클릭
2. **Name**: `FIREBASE_SERVICE_ACCOUNT`
3. **Value**: Firebase JSON 파일의 **전체 내용** 붙여넣기
4. **"Add secret"** 클릭

**선택 Secrets (환경 변수):**
- `VITE_FIREBASE_API_KEY` = `AIzaSyBBsjEVt-WktzSYC1zqZPslIjAie9a-F0`
- `VITE_FIREBASE_AUTH_DOMAIN` = `story-make-fbbd7.firebaseapp.com`
- `VITE_FIREBASE_PROJECT_ID` = `story-make-fbbd7`
- `VITE_FIREBASE_STORAGE_BUCKET` = `story-make-fbbd7.firebasestorage.app`
- `VITE_FIREBASE_MESSAGING_SENDER_ID` = `63291004810`
- `VITE_FIREBASE_APP_ID` = `1:63291004810:web:7a8301e17c4e528768da73`
- `VITE_FIREBASE_MEASUREMENT_ID` = `G-SK12ZCRM26`

---

### 4️⃣ GitHub Actions 권한 설정 ⚙️
**URL:** https://github.com/sunsudun25-cloud/hidi-story-maker/settings/actions

**설정:**
1. **"General"** 탭 선택
2. **"Workflow permissions"** 섹션 찾기
3. **"Read and write permissions"** 선택
4. **"Allow GitHub Actions to create and approve pull requests"** 체크 (선택)
5. **"Save"** 클릭

---

### 5️⃣ 자동 배포 테스트 🚀
```bash
cd /home/user/webapp

# 테스트 변경
echo "# Auto-deploy test" >> README.md

# 커밋
git add README.md
git commit -m "Test GitHub Actions auto-deploy"

# 푸시 (이제 토큰이 저장되어 있음)
git push origin main
```

**배포 확인:**
1. **GitHub Actions**: https://github.com/sunsudun25-cloud/hidi-story-maker/actions
2. **빌드 로그 확인**
3. **배포 완료 후 접속**: https://story-make-fbbd7.web.app

---

## 🎯 전체 워크플로우 요약

```
1. Personal Access Token 생성 (2분)
   └─ https://github.com/settings/tokens
   └─ repo, workflow 권한 체크

2. 코드 푸시 (1분)
   └─ git push https://TOKEN@github.com/.../hidi-story-maker.git main
   └─ 또는 credential helper로 토큰 저장

3. GitHub 확인 (30초)
   └─ https://github.com/sunsudun25-cloud/hidi-story-maker
   └─ 커밋, 파일 구조 확인

4. Firebase 서비스 계정 다운로드 (1분)
   └─ https://console.firebase.google.com/.../serviceaccounts/adminsdk
   └─ JSON 파일 다운로드

5. GitHub Secrets 등록 (2분)
   └─ https://github.com/.../settings/secrets/actions
   └─ FIREBASE_SERVICE_ACCOUNT 추가

6. Actions 권한 설정 (30초)
   └─ https://github.com/.../settings/actions
   └─ Read and write permissions

7. 자동 배포 테스트 (1분)
   └─ git push origin main
   └─ Actions 탭에서 진행 상황 확인

8. 배포 완료! (2-3분)
   └─ https://story-make-fbbd7.web.app
   └─ 프로덕션 앱 접속 확인

총 소요 시간: 약 10분
```

---

## 🔥 즉시 실행 명령어

### Personal Access Token으로 푸시
```bash
cd /home/user/webapp

# 방법 1: URL에 토큰 포함 (빠름)
git push https://YOUR_TOKEN@github.com/sunsudun25-cloud/hidi-story-maker.git main

# 방법 2: Credential helper (토큰 저장)
git config --global credential.helper store
git push -u origin main
# Username: sunsudun25-cloud
# Password: YOUR_TOKEN
```

---

## ❓ 자주 묻는 질문

### Q1: Personal Access Token은 어떻게 생성하나요?
**A:** https://github.com/settings/tokens → "Generate new token (classic)" → `repo` 체크

### Q2: 토큰은 어디에 입력하나요?
**A:** 
- 방법 1: URL에 직접 `https://TOKEN@github.com/...`
- 방법 2: Username/Password 프롬프트에서 Password로 입력

### Q3: 토큰을 잃어버렸어요.
**A:** 새로운 토큰을 생성하세요. 기존 토큰은 재확인 불가능합니다.

### Q4: `credential.helper store`는 안전한가요?
**A:** 토큰이 평문으로 저장됩니다. 샌드박스 환경에서는 괜찮지만, 로컬 컴퓨터에서는 `credential.helper cache` 사용을 권장합니다.

### Q5: GitHub Actions가 실패합니다.
**A:** 
1. `FIREBASE_SERVICE_ACCOUNT` Secret 확인
2. JSON 형식 검증
3. Actions 권한 설정 확인
4. Actions 탭에서 에러 로그 확인

---

## 🚨 트러블슈팅

### 문제: "Authentication failed"
**원인:** 잘못된 토큰 또는 권한 부족  
**해결:**
1. 토큰 재생성
2. `repo` 권한 체크 확인
3. 토큰 만료 확인

### 문제: "remote: Permission to ... denied"
**원인:** 저장소 접근 권한 없음  
**해결:**
1. 토큰의 `repo` 권한 확인
2. 저장소 소유자 확인
3. 토큰 재생성

### 문제: 푸시는 성공했는데 Actions가 안 실행됩니다.
**원인:** Actions 권한 설정 문제  
**해결:**
1. Settings → Actions → General
2. "Read and write permissions" 선택
3. Save

---

## 💡 다음 단계

**지금 바로:**

1. **Personal Access Token 생성** (2분)
   - https://github.com/settings/tokens
   - `repo` 권한 체크
   - 토큰 복사

2. **코드 푸시** (1분)
   ```bash
   cd /home/user/webapp
   git push https://YOUR_TOKEN@github.com/sunsudun25-cloud/hidi-story-maker.git main
   ```

3. **GitHub Actions 설정** (3분)
   - Firebase 서비스 계정 다운로드
   - GitHub Secrets 등록
   - Actions 권한 설정

4. **배포 확인** (2분)
   - https://github.com/sunsudun25-cloud/hidi-story-maker/actions
   - https://story-make-fbbd7.web.app

---

**Personal Access Token을 생성하고 푸시하세요! 🚀**

**Token 생성 링크:** https://github.com/settings/tokens
