# 🧪 로컬 테스트 가이드

## Firebase Emulator Suite를 사용한 로컬 테스트

### 1️⃣ Emulator Suite 설치 및 초기화

\`\`\`bash
cd /home/user/webapp

# Firebase Emulator 설치 (이미 설치된 경우 생략)
npm install -g firebase-tools

# Emulator 초기화
npx firebase-tools init emulators
\`\`\`

### 2️⃣ firebase.json에 Emulator 설정 추가

\`\`\`json
{
  "functions": {
    "source": "functions",
    "runtime": "nodejs20"
  },
  "emulators": {
    "functions": {
      "port": 5001
    },
    "firestore": {
      "port": 8080
    },
    "storage": {
      "port": 9199
    },
    "ui": {
      "enabled": true,
      "port": 4000
    }
  }
}
\`\`\`

### 3️⃣ Emulator 실행

\`\`\`bash
cd /home/user/webapp
npx firebase-tools emulators:start
\`\`\`

**실행 후 접속 가능한 URL:**
- **Emulator UI**: http://localhost:4000
- **Functions**: http://localhost:5001/story-make-fbbd7/asia-northeast1/{functionName}
- **Firestore**: http://localhost:8080
- **Storage**: http://localhost:9199

### 4️⃣ 로컬 Functions 테스트

#### 테스트 스크립트 실행
\`\`\`bash
cd /home/user/webapp
chmod +x test-functions.sh
./test-functions.sh http://localhost:5001/story-make-fbbd7/asia-northeast1
\`\`\`

#### 개별 API 테스트

**1. 수업 생성 (classCreate)**
\`\`\`bash
curl -X POST http://localhost:5001/story-make-fbbd7/asia-northeast1/classCreate \
  -H "Content-Type: application/json" \
  -d '{
    "className": "초등 AI 수업",
    "instructorName": "김선생님",
    "instructorPin": "123456"
  }'
\`\`\`

**예상 응답:**
\`\`\`json
{
  "success": true,
  "classCode": "ABCD1234",
  "className": "초등 AI 수업",
  "expiresAt": "2025-07-07T..."
}
\`\`\`

**2. 강사 PIN 확인 (classVerifyPin)**
\`\`\`bash
curl -X POST http://localhost:5001/story-make-fbbd7/asia-northeast1/classVerifyPin \
  -H "Content-Type: application/json" \
  -d '{
    "classCode": "ABCD1234",
    "instructorPin": "123456"
  }'
\`\`\`

**3. 학생 등록 (learnerEnsure)**
\`\`\`bash
curl -X POST http://localhost:5001/story-make-fbbd7/asia-northeast1/learnerEnsure \
  -H "Content-Type: application/json" \
  -d '{
    "classCode": "ABCD1234",
    "learnerName": "김철수"
  }'
\`\`\`

**예상 응답:**
\`\`\`json
{
  "success": true,
  "learnerId": "ABCD1234-0001",
  "learnerCode": "0001",
  "learnerName": "김철수",
  "isNew": true
}
\`\`\`

**4. 작품 저장 (artifactSave)**
\`\`\`bash
curl -X POST http://localhost:5001/story-make-fbbd7/asia-northeast1/artifactSave \
  -H "Content-Type: application/json" \
  -d '{
    "learnerId": "ABCD1234-0001",
    "type": "storybook",
    "title": "나의 첫 동화책",
    "data": {
      "prompt": "우주를 여행하는 고양이",
      "style": "동화 스타일"
    },
    "files": [
      {
        "name": "cover.png",
        "data": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
        "type": "cover"
      }
    ]
  }'
\`\`\`

**5. 작품 목록 조회 (artifactList)**
\`\`\`bash
curl -X GET "http://localhost:5001/story-make-fbbd7/asia-northeast1/artifactList?learnerId=ABCD1234-0001"
\`\`\`

**6. 공유 링크로 작품 조회 (artifactByShare)**
\`\`\`bash
curl -X GET "http://localhost:5001/story-make-fbbd7/asia-northeast1/artifactByShare?shareId=ABC123XYZ"
\`\`\`

**7. 강사용 ZIP 다운로드 (exportClassZip)**
\`\`\`bash
curl -X POST http://localhost:5001/story-make-fbbd7/asia-northeast1/exportClassZip \
  -H "Content-Type: application/json" \
  -d '{
    "classCode": "ABCD1234",
    "instructorPin": "123456"
  }' \
  --output class-export.zip
\`\`\`

### 5️⃣ Emulator UI에서 데이터 확인

1. **Emulator UI 접속**: http://localhost:4000
2. **Firestore 탭**:
   - `classes` 컬렉션 확인
   - `learners` 컬렉션 확인
   - `artifacts` 컬렉션 확인
3. **Storage 탭**:
   - `artifacts/{classCode}/{learnerId}/` 디렉토리 확인
   - 업로드된 이미지/PDF 파일 확인

### 6️⃣ 브라우저에서 테스트

로컬 서버를 실행하고 테스트 페이지를 엽니다:

\`\`\`bash
cd /home/user/webapp
npm run build
pm2 start ecosystem.config.cjs
\`\`\`

**테스트 페이지:**
- `test-functions.html` 파일을 브라우저에서 열기
- Base URL을 로컬 Emulator로 변경:
  \`\`\`javascript
  const BASE_URL = 'http://localhost:5001/story-make-fbbd7/asia-northeast1';
  \`\`\`

---

## 🎯 테스트 시나리오

### 시나리오 1: 수업 생성 및 학생 등록
1. `classCreate`로 수업 생성
2. 생성된 `classCode` 복사
3. `learnerEnsure`로 학생 3명 등록
4. Emulator UI에서 Firestore 데이터 확인

### 시나리오 2: 작품 저장 및 조회
1. `artifactSave`로 동화책 저장 (이미지 포함)
2. `artifactList`로 학생 작품 목록 조회
3. Storage에서 업로드된 파일 확인
4. `artifactByShare`로 공유 링크 테스트

### 시나리오 3: 강사용 ZIP 다운로드
1. 여러 학생의 작품 저장
2. `exportClassZip`으로 ZIP 다운로드
3. ZIP 파일 압축 해제 및 내용 확인

---

## ❓ 문제 해결

### Emulator가 시작되지 않음
\`\`\`bash
# Java Runtime 확인 (Firestore Emulator 필요)
java -version

# Java가 없으면 설치
sudo apt-get update
sudo apt-get install default-jre
\`\`\`

### CORS 오류
- Emulator는 자동으로 CORS를 허용합니다
- 프론트엔드 코드에서 로컬 URL 사용 확인

### Functions 코드 변경 후 반영 안 됨
\`\`\`bash
# Emulator 재시작
npx firebase-tools emulators:start
\`\`\`

---

## 📊 성능 테스트

### 부하 테스트 (Apache Bench 사용)
\`\`\`bash
# 동시 10명, 총 100개 요청
ab -n 100 -c 10 -p learner-data.json -T application/json \
  http://localhost:5001/story-make-fbbd7/asia-northeast1/learnerEnsure
\`\`\`

### 데이터 파일 준비 (learner-data.json)
\`\`\`json
{
  "classCode": "ABCD1234",
  "learnerName": "테스트학생"
}
\`\`\`

---

## 📝 테스트 체크리스트

- [ ] Emulator Suite 설치 완료
- [ ] Emulator 실행 성공 (UI 접속 가능)
- [ ] classCreate 테스트 (수업 생성)
- [ ] learnerEnsure 테스트 (학생 등록)
- [ ] artifactSave 테스트 (작품 저장)
- [ ] artifactList 테스트 (목록 조회)
- [ ] artifactByShare 테스트 (공유 링크)
- [ ] exportClassZip 테스트 (ZIP 다운로드)
- [ ] Firestore Emulator에서 데이터 확인
- [ ] Storage Emulator에서 파일 확인
- [ ] 브라우저 테스트 페이지 동작 확인

---

## 🚀 다음 단계

로컬 테스트가 완료되면:
1. `MANUAL_DEPLOYMENT.md` 참고하여 프로덕션 배포
2. 프론트엔드 UI 구현
3. 실제 사용자 테스트
