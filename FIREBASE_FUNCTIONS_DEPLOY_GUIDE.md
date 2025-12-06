# Firebase Functions 배포 가이드

## 🎯 개요

OpenAI API 키를 클라이언트에 노출하지 않고 안전하게 보호하기 위해 Firebase Functions를 프록시로 사용합니다.

---

## 📋 배포 전 준비사항

### **1️⃣ Firebase CLI 설치 확인**
```bash
firebase --version
```

설치되지 않았다면:
```bash
npm install -g firebase-tools
```

### **2️⃣ Firebase 로그인**
```bash
firebase login
```

### **3️⃣ Firebase 프로젝트 확인**
```bash
firebase projects:list
```

현재 프로젝트: `story-make-fbbd7`

---

## 🔐 OpenAI API 키 설정

### **방법 1: Firebase Console에서 설정 (권장)**

1. **Firebase Console 접속**
   ```
   https://console.firebase.google.com/project/story-make-fbbd7/settings/serviceaccounts/adminsdk
   ```

2. **Functions 탭 → 구성 탭**
   - "서비스 구성" 섹션
   - "변수 추가" 클릭

3. **환경 변수 추가**
   ```
   키: openai.key
   값: <YOUR_OPENAI_API_KEY>
   ```
   
   **참고**: OpenAI API 키는 `.env` 파일의 `VITE_OPENAI_API_KEY` 값을 사용하세요.

### **방법 2: Firebase CLI로 설정**

```bash
cd /home/user/webapp

# OpenAI API 키 설정
firebase functions:config:set openai.key="<YOUR_OPENAI_API_KEY>"

# 설정 확인
firebase functions:config:get
```

**API 키 가져오기:**
```bash
# .env 파일에서 API 키 확인
cat .env | grep VITE_OPENAI_API_KEY
```

**예상 출력:**
```json
{
  "openai": {
    "key": "sk-proj-..."
  }
}
```

---

## 🚀 배포 절차

### **1단계: 프로젝트 빌드**
```bash
cd /home/user/webapp
npm run build
```

### **2단계: Firebase Functions 배포**
```bash
# Functions만 배포
firebase deploy --only functions

# 또는 Hosting과 함께 배포
firebase deploy
```

### **3단계: 배포 확인**
```bash
# Functions 목록 확인
firebase functions:list

# 로그 확인
firebase functions:log
```

**예상 출력:**
```
✔ functions[asia-northeast1-generateImage]: Successful update operation.
✔ functions[asia-northeast1-health]: Successful update operation.
```

---

## 🧪 테스트

### **1️⃣ 헬스체크 테스트**

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

```bash
curl -X POST https://story-make-fbbd7.web.app/api/generateImage \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "귀여운 고양이",
    "style": "동화풍"
  }'
```

**예상 응답:**
```json
{
  "success": true,
  "imageData": "data:image/png;base64,iVBORw0KGg...",
  "prompt": "귀여운 고양이. fairytale illustration style...",
  "style": "동화풍"
}
```

---

## 📊 Firebase Functions 엔드포인트

| 엔드포인트 | 메서드 | 설명 | 리전 |
|----------|--------|------|------|
| `/api/generateImage` | POST | DALL-E 3 이미지 생성 | asia-northeast1 (서울) |
| `/api/health` | GET | 헬스체크 | asia-northeast1 (서울) |

---

## 🔍 트러블슈팅

### **문제 1: 배포 실패**
```
Error: HTTP Error: 403, Permission 'cloudfunctions.functions.create' denied
```

**해결:**
```bash
# Firebase 프로젝트 다시 선택
firebase use story-make-fbbd7

# 권한 확인
firebase projects:list
```

### **문제 2: 환경 변수 없음**
```
Error: OPENAI_API_KEY 환경 변수가 설정되지 않았습니다!
```

**해결:**
```bash
# 환경 변수 설정 확인
firebase functions:config:get

# 없다면 다시 설정
firebase functions:config:set openai.key="YOUR_API_KEY"

# 재배포
firebase deploy --only functions
```

### **문제 3: CORS 오류**
```
Access to fetch at '...' has been blocked by CORS policy
```

**해결:**
- `functions/index.js`에서 CORS 설정 확인
- `Access-Control-Allow-Origin: *` 헤더 추가됨

### **문제 4: 타임아웃**
```
Error: Function execution took too long
```

**해결:**
- `timeoutSeconds: 300` 설정 확인 (5분)
- DALL-E 3 생성 시간: 약 10-15초

---

## 💰 비용 정보

### **Firebase Functions 요금 (Blaze 플랜)**
- **무료 할당량:**
  - 호출 200만 회/월
  - GB·초 40만/월
  - CPU·초 20만/월
  - 네트워크 송신 5GB/월

- **초과 요금:**
  - 호출: $0.40/백만 회
  - GB·초: $0.0000025
  - CPU·초: $0.00001

### **OpenAI DALL-E 3 요금**
- Standard (1024x1024): **$0.040/이미지**
- HD (1024x1024): $0.080/이미지

**예상 비용 (100회 이미지 생성 기준):**
- Firebase Functions: 무료 (무료 할당량 내)
- OpenAI API: $4.00 (100 × $0.040)
- **총합: $4.00**

---

## 📝 참고 자료

- Firebase Functions 문서: https://firebase.google.com/docs/functions
- OpenAI API 문서: https://platform.openai.com/docs/api-reference
- Firebase Console: https://console.firebase.google.com/project/story-make-fbbd7

---

## ✅ 배포 체크리스트

- [ ] Firebase CLI 설치 및 로그인
- [ ] OpenAI API 키 환경 변수 설정
- [ ] `npm run build` 성공
- [ ] `firebase deploy --only functions` 성공
- [ ] 헬스체크 엔드포인트 테스트 성공
- [ ] 이미지 생성 엔드포인트 테스트 성공
- [ ] 프로덕션 환경에서 실제 이미지 생성 테스트
- [ ] GitHub에 코드 푸시
