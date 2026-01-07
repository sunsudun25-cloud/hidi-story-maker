# 🧪 Firebase Functions 테스트 가이드

## 📋 테스트 방법 3가지

### 1️⃣ 자동 테스트 스크립트 (추천)
### 2️⃣ 브라우저 테스트 페이지
### 3️⃣ 수동 curl 테스트

---

## 🎯 사전 준비

### Firebase 배포 필수!

**테스트하기 전에 Functions를 배포해야 합니다:**

```bash
# Step 1: Functions 디렉토리로 이동
cd /home/user/webapp/functions

# Step 2: Dependencies 설치
npm install

# Step 3: 루트 디렉토리로 복귀
cd ..

# Step 4: Firebase 배포
firebase deploy --only functions

# 또는 특정 함수만 배포 (빠른 테스트용)
firebase deploy --only functions:classCreate,functions:learnerEnsure,functions:artifactSave
```

**배포 확인**:
```bash
firebase functions:list
```

---

## 방법 1️⃣: 자동 테스트 스크립트

### 실행 방법

```bash
cd /home/user/webapp

# 프로덕션 테스트 (기본)
./test-functions.sh

# 또는 명시적으로
./test-functions.sh production
```

### 테스트 항목 (9개)

| # | 테스트 | 설명 |
|---|--------|------|
| 1 | 수업 생성 | classCreate API 테스트 |
| 2 | PIN 검증 (정상) | 올바른 PIN 입력 |
| 3 | PIN 검증 (오류) | 잘못된 PIN 감지 |
| 4 | 학생 등록 (신규) | 새 학생 생성 |
| 5 | 학생 등록 (기존) | 기존 학생 재로그인 |
| 6 | 작품 저장 | 이미지 작품 저장 (Base64) |
| 7 | 작품 목록 조회 | 학생별 작품 리스트 |
| 8 | 공유 작품 조회 | Share ID로 조회 |
| 9 | ZIP 다운로드 | 강사용 ZIP API 확인 |

### 예상 출력

```
🧪 로컬 에뮬레이터 테스트 모드
Base URL: https://asia-northeast1-story-make-fbbd7.cloudfunctions.net

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Test 1: 수업 생성 (classCreate)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Response: {"success":true,"classCode":"ABC12345",...}
✅ 수업 생성 성공!
   수업 코드: ABC12345

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Test 2: 강사 PIN 검증 - 정상 (classVerifyPin)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Response: {"success":true,"valid":true,...}
✅ PIN 검증 성공!

...

🎉 테스트 완료!

생성된 테스트 데이터:
  수업 코드: ABC12345
  학생 ID: ABC12345-0001
  작품 ID: 550e8400-e29b-41d4-a716-446655440000
  공유 ID: Ab3dEf7Gh9Jk

공유 링크:
  https://story-maker-4l6.pages.dev/share/Ab3dEf7Gh9Jk
```

---

## 방법 2️⃣: 브라우저 테스트 페이지

### 실행 방법

1. **로컬 서버 시작**:
   ```bash
   cd /home/user/webapp
   npx serve .
   ```

2. **브라우저에서 열기**:
   ```
   http://localhost:3000/test-functions.html
   ```

3. **테스트 진행**:
   - 1번부터 순서대로 테스트
   - 각 테스트 결과를 확인하고 다음 테스트로 진행
   - 수업 코드, 학생 ID 등이 자동으로 다음 테스트 입력란에 채워짐

### 화면 구성

```
┌─────────────────────────────────────┐
│  🧪 Firebase Functions 테스트        │
│  수업 운영 시스템 API 테스트         │
├─────────────────────────────────────┤
│                                     │
│  1️⃣ 수업 생성 (classCreate)         │
│  ┌───────────────────────────────┐ │
│  │ 수업 이름: [테스트 수업      ] │ │
│  │ 강사 이름: [김선생          ] │ │
│  │ 강사 PIN:  [123456          ] │ │
│  └───────────────────────────────┘ │
│  [수업 생성]                        │
│                                     │
│  📦 결과:                            │
│  {                                  │
│    "success": true,                 │
│    "classCode": "ABC12345"          │
│  }                                  │
├─────────────────────────────────────┤
│  2️⃣ 강사 PIN 검증                   │
│  ...                                │
└─────────────────────────────────────┘
```

---

## 방법 3️⃣: 수동 curl 테스트

### 기본 URL
```bash
BASE_URL="https://asia-northeast1-story-make-fbbd7.cloudfunctions.net"
```

### Test 1: 수업 생성

```bash
curl -X POST $BASE_URL/classCreate \
  -H "Content-Type: application/json" \
  -d '{
    "className": "테스트 수업",
    "instructorName": "김선생",
    "instructorPin": "123456"
  }'
```

**예상 응답**:
```json
{
  "success": true,
  "classCode": "ABC12345",
  "className": "테스트 수업",
  "expiresAt": "2025-07-05T00:00:00.000Z",
  "message": "수업이 생성되었습니다. 수업 코드: ABC12345"
}
```

### Test 2: PIN 검증

```bash
curl -X POST $BASE_URL/classVerifyPin \
  -H "Content-Type: application/json" \
  -d '{
    "classCode": "ABC12345",
    "instructorPin": "123456"
  }'
```

**예상 응답**:
```json
{
  "success": true,
  "valid": true,
  "className": "테스트 수업"
}
```

### Test 3: 학생 로그인

```bash
curl -X POST $BASE_URL/learnerEnsure \
  -H "Content-Type: application/json" \
  -d '{
    "classCode": "ABC12345",
    "learnerCode": "0001",
    "learnerName": "김학생"
  }'
```

**예상 응답**:
```json
{
  "success": true,
  "learnerId": "ABC12345-0001",
  "learnerName": "김학생",
  "isNew": true,
  "message": "새로운 학생으로 등록되었습니다."
}
```

### Test 4: 작품 저장

```bash
# 작은 테스트 이미지 (1x1 빨간색 픽셀)
TEST_IMAGE="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8DwHwAFBQIAX8jx0gAAAABJRU5ErkJggg=="

curl -X POST $BASE_URL/artifactSave \
  -H "Content-Type: application/json" \
  -d "{
    \"learnerId\": \"ABC12345-0001\",
    \"type\": \"image\",
    \"title\": \"테스트 이미지\",
    \"data\": {
      \"prompt\": \"테스트 프롬프트\",
      \"style\": \"테스트 스타일\"
    },
    \"files\": {
      \"image\": \"$TEST_IMAGE\"
    }
  }"
```

**예상 응답**:
```json
{
  "success": true,
  "artifactId": "550e8400-e29b-41d4-a716-446655440000",
  "shareId": "Ab3dEf7Gh9Jk",
  "message": "작품이 저장되었습니다.",
  "shareUrl": "https://story-maker-4l6.pages.dev/share/Ab3dEf7Gh9Jk"
}
```

### Test 5: 작품 목록

```bash
curl -X GET "$BASE_URL/artifactList?learnerId=ABC12345-0001"
```

**예상 응답**:
```json
{
  "success": true,
  "artifacts": [
    {
      "artifactId": "550e8400-e29b-41d4-a716-446655440000",
      "shareId": "Ab3dEf7Gh9Jk",
      "type": "image",
      "title": "테스트 이미지",
      "createdAt": "2025-01-05T12:34:56.789Z",
      "thumbnail": "https://storage.googleapis.com/..."
    }
  ],
  "count": 1
}
```

### Test 6: 공유 작품 조회

```bash
curl -X GET "$BASE_URL/artifactByShare?shareId=Ab3dEf7Gh9Jk"
```

**예상 응답**:
```json
{
  "success": true,
  "artifact": {
    "artifactId": "550e8400-e29b-41d4-a716-446655440000",
    "shareId": "Ab3dEf7Gh9Jk",
    "type": "image",
    "title": "테스트 이미지",
    "data": {
      "prompt": "테스트 프롬프트",
      "style": "테스트 스타일"
    },
    "files": {
      "image": "https://storage.googleapis.com/..."
    },
    "learnerName": "김학생",
    "createdAt": "2025-01-05T12:34:56.789Z"
  }
}
```

### Test 7: ZIP 다운로드

```bash
curl -X POST $BASE_URL/exportClassZip \
  -H "Content-Type: application/json" \
  -d '{
    "classCode": "ABC12345",
    "instructorPin": "123456"
  }' \
  --output class_artifacts.zip
```

**결과**: `class_artifacts.zip` 파일 다운로드

---

## 🔍 트러블슈팅

### 1. Functions가 배포되지 않음

**증상**: `curl` 테스트 시 404 오류

**해결**:
```bash
# Functions 배포 확인
firebase functions:list

# 재배포
firebase deploy --only functions
```

### 2. CORS 오류

**증상**: 브라우저 Console에 CORS 에러

**해결**: Functions 코드에서 CORS 설정 확인
```javascript
const corsOptions = {
  origin: true,
  methods: ['GET', 'POST', 'OPTIONS'],
};
```

### 3. Firestore/Storage 권한 오류

**증상**: "Permission denied" 오류

**해결**:
```bash
# 보안 규칙 배포
firebase deploy --only firestore:rules,storage:rules
```

### 4. Base64 업로드 실패

**증상**: "Invalid base64 format" 오류

**해결**: Base64 문자열이 `data:image/png;base64,` 형식으로 시작하는지 확인

---

## 📊 테스트 체크리스트

### ✅ 기본 테스트

- [ ] 수업 생성 성공
- [ ] 올바른 PIN 검증 성공
- [ ] 잘못된 PIN 검증 실패
- [ ] 신규 학생 등록 성공
- [ ] 기존 학생 재로그인 성공
- [ ] 작품 저장 성공 (Base64 → Storage)
- [ ] 작품 목록 조회 성공
- [ ] 공유 ID로 작품 조회 성공
- [ ] ZIP 다운로드 성공

### ✅ 에지 케이스 테스트

- [ ] 존재하지 않는 수업 코드
- [ ] 존재하지 않는 학생 ID
- [ ] 존재하지 않는 공유 ID
- [ ] 잘못된 형식의 learnerCode (3자리, 5자리 등)
- [ ] 잘못된 형식의 instructorPin (5자리, 7자리 등)
- [ ] Base64가 아닌 파일 데이터
- [ ] 매우 큰 이미지 (5MB+)

### ✅ 성능 테스트

- [ ] 100개 작품 저장 (1명)
- [ ] 30명 학생 동시 로그인
- [ ] 대용량 ZIP 다운로드 (100+ 작품)

---

## 🎯 다음 단계

테스트가 완료되면:

1. **프론트엔드 페이지 구현**
   - 수업 생성 페이지 (강사용)
   - 학생 로그인 페이지
   - 작품 저장 연동
   - 내 작품 목록 연동
   - 공유 링크 페이지

2. **UI/UX 개선**
   - QR 코드 생성 및 표시
   - 공유 링크 복사 버튼
   - 작품 썸네일 표시

3. **데이터 마이그레이션**
   - IndexedDB → Firestore 이전
   - 기존 사용자 데이터 보존

---

## 📞 참고 자료

- [Firebase Functions 문서](https://firebase.google.com/docs/functions)
- [Firestore 문서](https://firebase.google.com/docs/firestore)
- [Firebase Storage 문서](https://firebase.google.com/docs/storage)
- [배포 가이드](./CLASSROOM_DEPLOYMENT_GUIDE.md)

---

**마지막 업데이트**: 2025-01-05  
**작성자**: Claude (AI Assistant)
