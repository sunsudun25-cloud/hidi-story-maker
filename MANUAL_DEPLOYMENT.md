# 🚀 수동 배포 가이드

## Firebase Console을 통한 Functions 배포

### 1️⃣ Firebase Console 접속
1. https://console.firebase.google.com 접속
2. **story-make-fbbd7** 프로젝트 선택

### 2️⃣ Firestore Database 활성화
1. 왼쪽 메뉴: **Build** → **Firestore Database**
2. **Create database** 클릭
3. **Location**: `asia-northeast1` (Seoul) 선택
4. **Start in production mode** 선택
5. **Enable** 클릭

### 3️⃣ Storage 활성화
1. 왼쪽 메뉴: **Build** → **Storage**
2. **Get started** 클릭
3. **Start in production mode** 선택
4. **Next** → **Done**

### 4️⃣ Firestore 보안 규칙 설정
1. Firestore Database → **Rules** 탭
2. 아래 규칙 복사/붙여넣기:

\`\`\`javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Classes: 모든 사용자가 읽기 가능, 생성만 가능
    match /classes/{classCode} {
      allow read: if true;
      allow create: if true;
      allow update, delete: if false;
    }
    
    // Learners: 모든 사용자가 읽기/생성 가능
    match /learners/{learnerId} {
      allow read, create: if true;
      allow update: if request.auth != null || true; // 임시로 모두 허용
      allow delete: if false;
    }
    
    // Artifacts: 모든 사용자가 읽기/쓰기 가능 (임시)
    match /artifacts/{artifactId} {
      allow read, write: if true;
    }
  }
}
\`\`\`

3. **Publish** 클릭

### 5️⃣ Storage 보안 규칙 설정
1. Storage → **Rules** 탭
2. 아래 규칙 복사/붙여넣기:

\`\`\`javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // artifacts/: 모든 사용자가 읽기/쓰기 가능 (임시)
    match /artifacts/{allPaths=**} {
      allow read: if true;
      allow write: if true;
    }
  }
}
\`\`\`

3. **Publish** 클릭

### 6️⃣ Functions 배포 (로컬 터미널에서)

#### Option A: Firebase CLI 로그인 후 배포
\`\`\`bash
# 1. Firebase 로그인
npx firebase-tools login

# 2. Functions 배포
cd /home/user/webapp
npx firebase-tools deploy --only functions

# 3. 배포 확인
npx firebase-tools functions:list
\`\`\`

#### Option B: 수동으로 Functions 코드 복사
Firebase Console에서는 Functions를 직접 편집할 수 없으므로, **반드시 CLI를 통해 배포**해야 합니다.

**로컬 환경에서 배포하는 방법:**
1. 로컬 터미널 열기
2. 프로젝트 디렉토리로 이동
3. Firebase CLI 설치 (없는 경우):
   \`\`\`bash
   npm install -g firebase-tools
   \`\`\`
4. Firebase 로그인:
   \`\`\`bash
   firebase login
   \`\`\`
5. Functions 배포:
   \`\`\`bash
   firebase deploy --only functions
   \`\`\`

---

## 7️⃣ 배포 확인

배포가 완료되면 다음 URL에서 Functions가 작동합니다:

### Base URL
\`\`\`
https://asia-northeast1-story-make-fbbd7.cloudfunctions.net
\`\`\`

### 테스트 엔드포인트
1. **수업 생성**
   \`\`\`bash
   curl -X POST https://asia-northeast1-story-make-fbbd7.cloudfunctions.net/classCreate \
     -H "Content-Type: application/json" \
     -d '{
       "className": "초등 AI 수업",
       "instructorName": "김선생님",
       "instructorPin": "123456"
     }'
   \`\`\`

2. **수업 코드 확인 (Firestore Console)**
   - Firestore Database → **Data** 탭
   - `classes` 컬렉션 확인
   - 생성된 `classCode` 복사 (예: `ABCD1234`)

3. **학생 등록**
   \`\`\`bash
   curl -X POST https://asia-northeast1-story-make-fbbd7.cloudfunctions.net/learnerEnsure \
     -H "Content-Type: application/json" \
     -d '{
       "classCode": "ABCD1234",
       "learnerName": "김철수"
     }'
   \`\`\`

4. **작품 저장**
   \`\`\`bash
   curl -X POST https://asia-northeast1-story-make-fbbd7.cloudfunctions.net/artifactSave \
     -H "Content-Type: application/json" \
     -d '{
       "learnerId": "ABCD1234-0001",
       "type": "storybook",
       "title": "나의 첫 동화책",
       "data": {
         "prompt": "우주를 여행하는 고양이",
         "style": "동화 스타일"
       },
       "files": []
     }'
   \`\`\`

---

## 8️⃣ 테스트 웹 페이지 사용

브라우저에서 테스트하려면:

1. **로컬 개발 서버 시작**
   \`\`\`bash
   cd /home/user/webapp
   npm run build
   pm2 start ecosystem.config.cjs
   \`\`\`

2. **테스트 페이지 열기**
   - 파일 경로: `/home/user/webapp/test-functions.html`
   - 브라우저에서 열거나 개발 서버를 통해 접근

---

## 🎯 배포 체크리스트

- [ ] Firestore Database 활성화 (`asia-northeast1`)
- [ ] Storage 활성화
- [ ] Firestore 보안 규칙 설정
- [ ] Storage 보안 규칙 설정
- [ ] Firebase CLI 로그인 (`firebase login`)
- [ ] Functions 배포 (`firebase deploy --only functions`)
- [ ] 배포 확인 (Functions 목록 확인)
- [ ] 테스트 API 호출 (classCreate, learnerEnsure 등)
- [ ] Firestore Console에서 데이터 확인
- [ ] Storage Console에서 파일 업로드 확인

---

## ❓ 문제 해결

### "Authentication required" 오류
- Firebase CLI 로그인 필요: `firebase login`

### "Permission denied" 오류
- Firestore/Storage 보안 규칙 확인
- 임시로 `allow read, write: if true;` 설정 (개발 중)

### Functions 배포 실패
- Node.js 버전 확인: `node --version` (20.x 권장)
- Functions 디렉토리 확인: `cd functions && npm install`

### CORS 오류
- Functions에 CORS 헤더가 설정되어 있습니다
- 브라우저 콘솔에서 확인

---

## 📞 지원

문제가 발생하면 다음을 확인하세요:
1. Firebase Console의 Functions 로그
2. Firestore/Storage 보안 규칙
3. 네트워크 요청 (브라우저 개발자 도구)
4. `/home/user/webapp/TESTING_GUIDE.md` 참고
