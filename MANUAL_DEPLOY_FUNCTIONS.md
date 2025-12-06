# Firebase Functions 수동 배포 가이드

## 🎯 현재 상황

- ✅ Firebase Hosting 배포 완료 (GitHub Actions)
- ⬜ Firebase Functions 배포 필요 (수동)

GitHub Actions는 워크플로우 파일 수정 권한이 없어 Functions 자동 배포가 불가능합니다.
따라서 **사용자가 직접 Firebase CLI로 배포**해야 합니다.

---

## 🚀 배포 절차

### **1단계: 터미널 열기**

**Windows:**
- PowerShell 또는 Command Prompt
- 또는 Git Bash

**Mac/Linux:**
- Terminal

### **2단계: 프로젝트 디렉토리로 이동**

```bash
cd /path/to/your/hidi-story-maker
```

### **3단계: Firebase 로그인**

```bash
npx firebase login
```

**브라우저가 열리면:**
1. Google 계정 선택
2. Firebase 액세스 허용
3. 터미널로 돌아오기

### **4단계: 프로젝트 선택**

```bash
npx firebase use story-make-fbbd7
```

### **5단계: Functions 배포**

```bash
npx firebase deploy --only functions
```

**예상 출력:**
```
=== Deploying to 'story-make-fbbd7'...

i  deploying functions
i  functions: ensuring required API cloudfunctions.googleapis.com is enabled...
i  functions: ensuring required API cloudbuild.googleapis.com is enabled...
✔  functions: required API cloudfunctions.googleapis.com is enabled
✔  functions: required API cloudbuild.googleapis.com is enabled
i  functions: preparing functions directory for uploading...
i  functions: packaged functions (XX.XX KB) for uploading
✔  functions: functions folder uploaded successfully
i  functions: creating Node.js 18 function generateImage(asia-northeast1)...
i  functions: creating Node.js 18 function health(asia-northeast1)...
✔  functions[asia-northeast1-generateImage]: Successful create operation.
✔  functions[asia-northeast1-health]: Successful create operation.

✔  Deploy complete!
```

---

## 🧪 배포 후 테스트

### **1️⃣ 헬스체크**

```bash
curl https://story-make-fbbd7.web.app/api/health
```

**예상 응답:**
```json
{
  "status": "ok",
  "timestamp": 1733456789000,
  "region": "asia-northeast1"
}
```

### **2️⃣ Functions 목록 확인**

```bash
npx firebase functions:list
```

**예상 출력:**
```
┌──────────────────────────────────────────────────────┐
│ Function (asia-northeast1)                            │
├──────────────────────────────────────────────────────┤
│ generateImage(https)                                  │
│ health(https)                                         │
└──────────────────────────────────────────────────────┘
```

### **3️⃣ 프로덕션 환경에서 이미지 생성**

**브라우저에서:**
```
1. https://story-make-fbbd7.web.app 접속
2. F12 → Console 열기
3. 홈 → 그림 그리기 → 직접 입력
4. 이미지 생성:
   - 설명: "귀여운 고양이"
   - 스타일: "동화풍"
   - "🚀 그림 만들기" 클릭
```

**예상 Console 로그:**
```
🚀 [firebaseFunctions] generateImageViaFirebase 호출
📡 [firebaseFunctions] Firebase Functions 호출: /api/generateImage
📥 [firebaseFunctions] 응답 수신: { status: 200, ok: true }
✅ [firebaseFunctions] 이미지 생성 완료 (Base64 길이: 324520)
```

---

## 🐛 트러블슈팅

### **문제 1: Firebase 로그인 실패**
```
Error: Failed to authenticate
```

**해결:**
```bash
# 로그아웃 후 재로그인
npx firebase logout
npx firebase login
```

### **문제 2: 프로젝트를 찾을 수 없음**
```
Error: Project not found
```

**해결:**
```bash
# 프로젝트 목록 확인
npx firebase projects:list

# 프로젝트 선택
npx firebase use story-make-fbbd7
```

### **문제 3: 배포 권한 오류**
```
Error: Permission denied
```

**해결:**
- Firebase Console에서 계정 권한 확인
- 프로젝트 소유자 또는 편집자 권한 필요

### **문제 4: API 키 오류 (배포 후 테스트 시)**
```
Error: OPENAI_API_KEY 환경 변수가 설정되지 않았습니다
```

**해결:**
- `functions/.env.production` 파일 존재 확인
- 파일 내용에 API 키 확인
- 다시 배포: `npx firebase deploy --only functions`

---

## 📊 Firebase Console 확인

### **Functions 대시보드**
```
https://console.firebase.google.com/project/story-make-fbbd7/functions/list
```

**확인 사항:**
- ✅ generateImage 함수 활성화
- ✅ health 함수 활성화
- ✅ 리전: asia-northeast1 (서울)

### **로그 확인**
```
Functions → 로그 탭
```

**정상 로그 예시:**
```
🚀 [generateImage] 함수 호출됨
✅ OpenAI API 키 확인됨
📝 요청 파라미터: { prompt: "귀여운 고양이", style: "동화풍" }
🎨 전체 프롬프트: "귀여운 고양이. fairytale illustration style..."
📡 OpenAI API 호출 시작...
📥 OpenAI API 응답 수신
✅ 이미지 생성 완료 (Base64 길이: 324520)
```

---

## ✅ 배포 완료 체크리스트

- [ ] Firebase CLI 로그인 성공
- [ ] 프로젝트 선택 완료
- [ ] Functions 배포 성공
- [ ] 헬스체크 엔드포인트 응답 정상
- [ ] Functions 목록에서 2개 함수 확인
- [ ] 프로덕션 환경에서 이미지 생성 성공
- [ ] Firebase Console에서 로그 확인
- [ ] Console에 오류 없음

---

## 🎉 배포 성공 시

**축하합니다!** 🎊

이제 다음이 완료되었습니다:
- ✅ Firebase Hosting (정적 파일)
- ✅ Firebase Functions (API 프록시)
- ✅ OpenAI DALL-E 3 통합
- ✅ 보안 강화 (API 키 보호)
- ✅ CORS 문제 해결
- ✅ 브라우저 캐시 이슈 회피

**프로덕션 URL:**
- https://story-make-fbbd7.web.app

**모든 기능이 정상 작동합니다!** ✨
