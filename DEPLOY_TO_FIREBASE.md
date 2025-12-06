# Firebase Functions 배포 가이드

## ✅ 준비 완료 항목

1. **Firebase Functions 코드** ✅
   - `functions/index.js`
   - OpenAI API 프록시 구현
   - CORS 설정 완료

2. **환경 변수 설정** ✅
   - `functions/.env.production` 파일 생성
   - OpenAI API 키 포함 (Git에서 제외됨)

3. **Blaze 플랜 활성화** ✅
   - Firebase Console에서 확인됨
   - 무료 크레딧 $900 사용 가능

---

## 🚀 배포 방법

### **방법 1: GitHub Actions 자동 배포 (권장)**

GitHub에 푸시하면 **자동으로 배포**됩니다:

```bash
cd /home/user/webapp
git add -A
git commit -m "Feature: Add Firebase Functions with environment variables"
git push origin main
```

**GitHub Actions에서:**
- Firebase Hosting 배포 ✅
- Firebase Functions 배포 ✅ (추가 필요)

### **방법 2: 로컬에서 수동 배포**

**⚠️ 주의: 이 방법은 로컬 Firebase 로그인이 필요합니다**

```bash
# 1. Firebase 로그인
npx firebase login

# 2. 프로젝트 선택
npx firebase use story-make-fbbd7

# 3. Functions만 배포
npx firebase deploy --only functions

# 또는 전체 배포
npx firebase deploy
```

---

## 🔧 GitHub Actions 워크플로우 수정

`.github/workflows/deploy.yml`에 Functions 배포 추가가 필요합니다.

**현재 워크플로우:**
- ✅ Firebase Hosting 배포

**추가 필요:**
- ⬜ Firebase Functions 배포

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

### **2️⃣ 이미지 생성 테스트**

**브라우저에서:**
```
1. https://story-make-fbbd7.web.app 접속
2. F12 → Console 열기
3. 직접 입력 → 이미지 생성
```

**예상 Console 로그:**
```
🚀 [firebaseFunctions] generateImageViaFirebase 호출
📡 [firebaseFunctions] Firebase Functions 호출
📥 [firebaseFunctions] 응답 수신: { status: 200 }
✅ [firebaseFunctions] 이미지 생성 완료
```

---

## 📊 Functions 모니터링

### **Firebase Console에서 확인:**

1. **Functions 대시보드**
   - https://console.firebase.google.com/project/story-make-fbbd7/functions/list

2. **로그 확인**
   - Functions → 로그 탭
   - 실시간 로그 모니터링

3. **사용량 확인**
   - Functions → 사용량 탭
   - 호출 횟수, 네트워크 송신량 등

---

## 🐛 트러블슈팅

### **문제 1: 배포 실패**
```
Error: HTTP Error: 403
```

**해결:**
- Firebase 로그인 확인
- 프로젝트 권한 확인

### **문제 2: API 키 오류**
```
Error: OPENAI_API_KEY 환경 변수가 설정되지 않았습니다
```

**해결:**
- `functions/.env.production` 파일 확인
- API 키 값 확인

### **문제 3: CORS 오류**
```
Access to fetch has been blocked by CORS policy
```

**확인:**
- `functions/index.js`의 CORS 설정 확인
- `Access-Control-Allow-Origin: *` 헤더 설정됨

---

## 💡 중요 사항

1. **`.env.production` 파일은 Git에 커밋되지 않습니다**
   - `.gitignore`에 포함됨
   - 배포 시 Functions에 포함됨

2. **API 키 보안**
   - 클라이언트에 노출되지 않음
   - Functions 서버에서만 사용

3. **비용 모니터링**
   - 무료 크레딧 사용 중
   - 예산 알림 설정 권장

---

## ✅ 배포 체크리스트

- [x] Functions 코드 작성
- [x] 환경 변수 파일 생성 (`.env.production`)
- [x] Blaze 플랜 활성화
- [ ] GitHub에 푸시
- [ ] Functions 배포 확인
- [ ] 헬스체크 테스트
- [ ] 이미지 생성 테스트
- [ ] 로그 확인

---

**다음 단계: GitHub에 푸시하여 자동 배포 트리거!**
