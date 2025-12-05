# 🚀 지금 바로 배포하기

## 📋 현재 상태
- ✅ Firebase CLI 설치 완료 (v14.27.0)
- ✅ Firebase 프로젝트 연결 (`story-make-fbbd7`)
- ✅ 설정 파일 준비 완료
- ✅ GitHub Actions 워크플로우 생성
- ✅ 프로덕션 빌드 성공

---

## 🎯 배포 방법 선택

### **방법 A: GitHub Actions 자동 배포 (추천) 🌟**

**한 번 설정하면 자동으로 배포됩니다!**

#### 1️⃣ Firebase 서비스 계정 JSON 다운로드
https://console.firebase.google.com/project/story-make-fbbd7/settings/serviceaccounts/adminsdk

→ "새 비공개 키 생성" 클릭

#### 2️⃣ GitHub 저장소 생성 (아직 없다면)
```bash
# GitHub에서 새 저장소 생성 후
cd /home/user/webapp
git remote add origin https://github.com/YOUR_USERNAME/hidi-story-maker.git
git push -u origin main
```

#### 3️⃣ GitHub Secrets 등록
**필수 Secrets:**
- `FIREBASE_SERVICE_ACCOUNT` - 다운로드한 JSON 파일 전체 내용

**환경 변수 Secrets (선택):**
- `VITE_FIREBASE_API_KEY` = `AIzaSyBBsjEVt-WktzSYC1zqZPslIjAie9a-F0`
- `VITE_FIREBASE_AUTH_DOMAIN` = `story-make-fbbd7.firebaseapp.com`
- `VITE_FIREBASE_PROJECT_ID` = `story-make-fbbd7`
- `VITE_FIREBASE_STORAGE_BUCKET` = `story-make-fbbd7.firebasestorage.app`
- `VITE_FIREBASE_MESSAGING_SENDER_ID` = `63291004810`
- `VITE_FIREBASE_APP_ID` = `1:63291004810:web:7a8301e17c4e528768da73`
- `VITE_FIREBASE_MEASUREMENT_ID` = `G-SK12ZCRM26`
- `VITE_GEMINI_API_KEY` = (추후 추가)

#### 4️⃣ 코드 푸시 → 자동 배포!
```bash
git push origin main
```

→ GitHub Actions가 자동으로:
1. 코드 체크아웃
2. 의존성 설치
3. 프로젝트 빌드
4. Firebase에 배포

---

### **방법 B: CI 토큰으로 수동 배포 ⚡**

**가장 빠른 방법 - 즉시 배포 가능**

#### 1️⃣ 로컬 컴퓨터에서 토큰 발급
```bash
firebase login:ci
```

#### 2️⃣ 토큰 복사 (예: `1//0gxxxxx-xxxxxxx`)

#### 3️⃣ 샌드박스에서 배포
```bash
cd /home/user/webapp
node_modules/.bin/firebase deploy --token "YOUR_TOKEN_HERE" --only hosting
```

---

## 🌐 배포 후 접속 URL

### **프로덕션 URL:**
- **메인**: https://story-make-fbbd7.web.app
- **대체**: https://story-make-fbbd7.firebaseapp.com

### **Firebase Console:**
- **호스팅 대시보드**: https://console.firebase.google.com/project/story-make-fbbd7/hosting
- **사용량 확인**: https://console.firebase.google.com/project/story-make-fbbd7/usage

---

## 📊 배포 후 확인 사항

### ✅ 테스트 체크리스트
1. [ ] 로그인 페이지 접속 (`/`)
2. [ ] 비회원 로그인 → 홈 이동
3. [ ] Google 로그인 테스트
4. [ ] 홈 페이지 4개 카드 확인
5. [ ] 글쓰기 페이지 접속 (`/write`)
6. [ ] 반응형 디자인 확인 (모바일/태블릿/데스크톱)

---

## 🔧 트러블슈팅

### 문제: GitHub Actions 빌드 실패
**원인**: 환경 변수 누락
**해결**: GitHub Secrets에 모든 `VITE_*` 변수 추가

### 문제: 404 에러 (페이지 못 찾음)
**원인**: SPA 라우팅 설정 누락
**해결**: `firebase.json`에 이미 설정됨 (`rewrites` 확인)

### 문제: Firebase 권한 없음
**원인**: 서비스 계정 권한 부족
**해결**: Firebase Console → IAM → 역할 확인

---

## 📈 배포 후 최적화

### 1. 커스텀 도메인 연결
Firebase Console → Hosting → 도메인 추가
- 예: `hidi-story.com`

### 2. 성능 모니터링
Firebase Console → Analytics
- 페이지 로드 시간
- 사용자 행동 분석

### 3. 보안 규칙 설정
Firebase Console → Firestore/Storage → Rules
- 읽기/쓰기 권한 설정

---

## 💡 다음 단계

### 개발 워크플로우
```
1. 샌드박스에서 개발
   ↓
2. GitHub에 푸시
   ↓
3. 자동 빌드 & 배포
   ↓
4. 프로덕션 확인
```

### 추가 기능 구현
1. **Drawing System** - AI 이미지 생성
2. **Gallery System** - 작품 관리
3. **PDF Export** - 작품 다운로드

---

## 🎯 즉시 실행 가능한 명령어

### GitHub Actions 배포 (추천)
```bash
cd /home/user/webapp

# GitHub 저장소 연결 (최초 1회)
git remote add origin https://github.com/YOUR_USERNAME/hidi-story-maker.git

# 코드 푸시 → 자동 배포
git push -u origin main
```

### CI 토큰 배포 (즉시)
```bash
cd /home/user/webapp

# 토큰으로 배포
node_modules/.bin/firebase deploy --token "YOUR_CI_TOKEN" --only hosting
```

---

## 📞 도움이 필요하신가요?

### Firebase 공식 문서
- **Hosting**: https://firebase.google.com/docs/hosting
- **CLI**: https://firebase.google.com/docs/cli

### 프로젝트 문서
- `DEPLOYMENT.md` - 상세 배포 가이드
- `FIREBASE_LOGIN.md` - 로그인 방법
- `README.md` - 프로젝트 개요

---

**배포 준비 완료! 🎉**

위 방법 중 하나를 선택하여 지금 바로 배포하세요!
