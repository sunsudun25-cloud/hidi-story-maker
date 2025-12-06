# 🚀 다음 단계: Firebase Functions 배포

## ✅ 완료된 작업

1. **Firebase Functions 구현** ✅
   - `/api/generateImage` 엔드포인트 생성
   - `/api/health` 헬스체크 엔드포인트 생성
   - CORS 설정 완료
   - OpenAI SDK 통합

2. **클라이언트 코드 수정** ✅
   - `firebaseFunctions.ts` 서비스 생성
   - `DrawDirect.tsx` 수정 (Firebase Functions 사용)
   - firebase.json rewrites 설정

3. **GitHub 푸시 및 Hosting 배포** ✅
   - 커밋: `15084b8`
   - Firebase Hosting 배포 완료
   - 프로덕션 URL: https://story-make-fbbd7.web.app

---

## 🔐 필수: OpenAI API 키 설정

### **Firebase Functions에 OpenAI API 키 설정하기**

#### **방법 1: Firebase Console (권장)**

1. **Firebase Console 접속**
   ```
   https://console.firebase.google.com/project/story-make-fbbd7/functions/list
   ```

2. **구성 탭으로 이동**
   - Functions 탭 클릭
   - 구성 (Configuration) 탭 클릭

3. **환경 변수 추가**
   - "변수 추가" 버튼 클릭
   - 키: `openai.key`
   - 값: (`.env` 파일의 `VITE_OPENAI_API_KEY` 값 붙여넣기)
   - 저장

#### **방법 2: Firebase CLI**

```bash
# 1. Firebase 로그인 (아직 안 했다면)
firebase login

# 2. 프로젝트 선택
firebase use story-make-fbbd7

# 3. API 키 확인
cat /home/user/webapp/.env | grep VITE_OPENAI_API_KEY

# 4. API 키 설정
firebase functions:config:set openai.key="<위에서_확인한_API_KEY>"

# 5. 설정 확인
firebase functions:config:get
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

## 📦 Firebase Functions 배포

### **배포 명령어**

```bash
cd /home/user/webapp

# Functions만 배포
firebase deploy --only functions

# 또는 전체 배포 (Hosting + Functions)
firebase deploy
```

**예상 소요 시간:** 2-3분

---

## 🧪 배포 후 테스트

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

### **2️⃣ 이미지 생성 테스트 (프로덕션)**

**브라우저에서 테스트:**
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

## 📊 배포 상태 확인

### **Functions 목록 확인**
```bash
firebase functions:list
```

### **Functions 로그 확인**
```bash
firebase functions:log
```

### **실시간 로그 모니터링**
```bash
firebase functions:log --only generateImage
```

---

## 🎯 예상되는 결과

### **성공 시나리오**
1. ✅ Firebase Functions 배포 완료
2. ✅ `/api/generateImage` 엔드포인트 활성화
3. ✅ 프로덕션 환경에서 이미지 생성 성공
4. ✅ API 키가 클라이언트에 노출되지 않음
5. ✅ CORS 문제 해결
6. ✅ 브라우저 캐시 이슈 회피

### **해결되는 문제들**
- ❌ "API 키 설정이 없어요" 오류 → ✅ 해결
- ❌ 403 Blob URL 오류 → ✅ 해결
- ❌ 브라우저 캐시 문제 → ✅ 해결
- ❌ API 키 노출 보안 문제 → ✅ 해결

---

## 🐛 트러블슈팅

### **문제 1: 배포 권한 오류**
```
Error: HTTP Error: 403, Permission denied
```

**해결:**
```bash
firebase login --reauth
firebase use story-make-fbbd7
```

### **문제 2: API 키 설정 누락**
```
Error: OPENAI_API_KEY 환경 변수가 설정되지 않았습니다!
```

**해결:**
- Firebase Console에서 환경 변수 추가
- 또는 CLI로 `firebase functions:config:set` 실행

### **문제 3: CORS 오류**
```
Access to fetch has been blocked by CORS policy
```

**확인 사항:**
- `functions/index.js`의 CORS 설정 확인
- `Access-Control-Allow-Origin: *` 헤더 설정 확인

---

## 💰 비용 안내

### **Firebase Functions (Blaze 플랜 필요)**
- **무료 할당량:**
  - 호출 200만 회/월
  - GB·초 40만/월
  - CPU·초 20만/월

- **예상 비용:** 대부분 무료 할당량 내

### **OpenAI DALL-E 3**
- **이미지당:** $0.040
- **100회 생성 시:** $4.00

---

## 📝 배포 체크리스트

- [ ] Firebase CLI 설치 및 로그인
- [ ] OpenAI API 키 환경 변수 설정 (중요!)
- [ ] `firebase deploy --only functions` 실행
- [ ] 배포 성공 확인
- [ ] 헬스체크 엔드포인트 테스트
- [ ] 프로덕션 환경에서 이미지 생성 테스트
- [ ] Console 로그 확인

---

## 🎉 배포 후 확인 사항

배포가 성공하면:

1. **프로덕션 URL 접속**
   - https://story-make-fbbd7.web.app

2. **이미지 생성 테스트**
   - 직접 입력 페이지에서 이미지 생성
   - F12 Console에서 로그 확인

3. **문제 없으면 완료!** 🎊
   - API 키가 안전하게 보호됨
   - 이미지 생성이 정상 작동
   - 중복 저장 문제도 해결됨

---

**Firebase Functions 배포를 진행해주세요!**
문제가 발생하면 위 트러블슈팅 가이드를 참고하세요.
