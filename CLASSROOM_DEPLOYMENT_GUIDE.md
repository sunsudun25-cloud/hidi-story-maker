# 🎓 수업 운영 시스템 배포 가이드

## 📋 개요

이 가이드는 **로그인 없이 수업코드 + 학생코드로 6개월 클라우드 저장**하는 시스템을 Firebase에 배포하는 방법을 설명합니다.

---

## 🎯 시스템 특징

### ✅ 핵심 기능
- 🔑 **로그인 불필요**: 수업 코드(8자리) + 학생 코드(4자리)만으로 접근
- ☁️ **클라우드 저장**: Firestore + Storage로 6개월 데이터 보관
- 🖼️ **파일 최적화**: Base64 → Storage 업로드로 용량 절감
- 📱 **기기 변경 지원**: Share ID/QR로 다른 기기에서 작품 열람
- 📦 **강사용 ZIP**: 전체 학생 작품을 한 번에 다운로드
- 📄 **PDF + JSON**: PDF 파일 + 재편집용 data.json 함께 저장

### 📊 데이터 모델
```
Firestore:
├── classes/{classCode}           # 수업 정보
├── learners/{learnerId}          # 학생 정보
└── artifacts/{artifactId}        # 작품 정보 (메타데이터)

Storage:
└── artifacts/{classCode}/{learnerId}/{artifactId}/
    ├── cover.png                 # 표지 이미지
    ├── page_1.png                # 페이지 이미지
    ├── book.pdf                  # PDF 파일
    └── data.json                 # 재편집용 데이터
```

---

## 🚀 Step 1: Firebase 프로젝트 설정

### 1.1 Firebase Console 설정

1. **Firestore 활성화**
   ```
   Firebase Console → Firestore Database → 데이터베이스 만들기
   → 프로덕션 모드로 시작 → 리전: asia-northeast1
   ```

2. **Storage 활성화**
   ```
   Firebase Console → Storage → 시작하기
   → 프로덕션 모드로 시작 → 리전: asia-northeast1
   ```

3. **Functions 설정 확인**
   ```
   Firebase Console → Functions → 설정
   → Node.js 20 확인
   → 리전: asia-northeast1
   ```

---

## 📦 Step 2: Functions 배포

### 2.1 Dependencies 설치

```bash
cd /home/user/webapp/functions
npm install
```

**설치되는 패키지**:
- `firebase-admin@^12.0.0` - Firebase Admin SDK
- `firebase-functions@^5.0.0` - Firebase Functions v2
- `archiver@^7.0.0` - ZIP 파일 생성
- `uuid@^10.0.0` - 고유 ID 생성

### 2.2 Functions 배포

```bash
# Firebase CLI로 Functions 배포
firebase deploy --only functions

# 특정 함수만 배포 (테스트용)
firebase deploy --only functions:artifactSave
firebase deploy --only functions:learnerEnsure
```

**배포 결과 확인**:
```
✔  functions[classCreate(asia-northeast1)]
✔  functions[classVerifyPin(asia-northeast1)]
✔  functions[learnerEnsure(asia-northeast1)]
✔  functions[artifactSave(asia-northeast1)]
✔  functions[artifactList(asia-northeast1)]
✔  functions[artifactByShare(asia-northeast1)]
✔  functions[exportClassZip(asia-northeast1)]

🎉 배포 완료!
```

---

## 🔒 Step 3: 보안 규칙 배포

### 3.1 Firestore 보안 규칙

```bash
firebase deploy --only firestore:rules
```

**규칙 내용** (`firestore.rules`):
- ✅ 읽기: 누구나 (수업 코드/공유 링크 알면)
- ❌ 쓰기: Functions만 (보안)

### 3.2 Storage 보안 규칙

```bash
firebase deploy --only storage:rules
```

**규칙 내용** (`storage.rules`):
- ✅ 읽기: 누구나 (공유 링크용)
- ❌ 쓰기: Functions만 (보안)

---

## 🧪 Step 4: API 테스트

### 4.1 수업 생성 테스트

```bash
curl -X POST https://asia-northeast1-story-make-fbbd7.cloudfunctions.net/classCreate \
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
  "classCode": "ABCD1234",
  "className": "테스트 수업",
  "expiresAt": "2025-07-05T00:00:00.000Z",
  "message": "수업이 생성되었습니다. 수업 코드: ABCD1234"
}
```

### 4.2 학생 로그인 테스트

```bash
curl -X POST https://asia-northeast1-story-make-fbbd7.cloudfunctions.net/learnerEnsure \
  -H "Content-Type: application/json" \
  -d '{
    "classCode": "ABCD1234",
    "learnerCode": "0001",
    "learnerName": "김학생"
  }'
```

**예상 응답**:
```json
{
  "success": true,
  "learnerId": "ABCD1234-0001",
  "learnerName": "김학생",
  "isNew": true,
  "message": "새로운 학생으로 등록되었습니다."
}
```

### 4.3 작품 저장 테스트

```bash
curl -X POST https://asia-northeast1-story-make-fbbd7.cloudfunctions.net/artifactSave \
  -H "Content-Type: application/json" \
  -d '{
    "learnerId": "ABCD1234-0001",
    "type": "story",
    "title": "나의 첫 작품",
    "data": {
      "content": "오늘은 좋은 날이다."
    },
    "files": {
      "thumbnail": "data:image/png;base64,iVBORw0KG..."
    }
  }'
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

---

## 🔄 Step 5: 프론트엔드 연동

### 5.1 ClassroomService 사용 예시

#### 📝 수업 생성 (강사용 페이지)

```typescript
import { createClass } from '../services/classroomService';

async function handleCreateClass() {
  try {
    const result = await createClass(
      '스토리텔링 수업',
      '김선생',
      '123456'
    );
    
    alert(`수업이 생성되었습니다!\n수업 코드: ${result.classCode}`);
    console.log('만료일:', result.expiresAt);
  } catch (error) {
    alert('수업 생성 실패: ' + error.message);
  }
}
```

#### 👤 학생 로그인

```typescript
import { ensureLearner, getCurrentLearner } from '../services/classroomService';

async function handleStudentLogin(classCode: string, learnerCode: string) {
  try {
    const learner = await ensureLearner(classCode, learnerCode, '김학생');
    
    if (learner.isNew) {
      alert('환영합니다! 새로운 학생으로 등록되었습니다.');
    } else {
      alert(`다시 오신 것을 환영합니다, ${learner.learnerName}님!`);
    }
    
    // 이후 getCurrentLearner()로 현재 학생 정보 조회 가능
    const current = getCurrentLearner();
    console.log('현재 학생:', current);
  } catch (error) {
    alert('로그인 실패: ' + error.message);
  }
}
```

#### 💾 작품 저장

```typescript
import { saveArtifact, getCurrentLearner } from '../services/classroomService';

async function handleSaveStorybook(title: string, pages: any[], coverImage: string) {
  try {
    const learner = getCurrentLearner();
    if (!learner) {
      alert('먼저 로그인해주세요!');
      return;
    }
    
    // 파일 준비 (Base64 이미지들)
    const files: { [key: string]: string } = {
      cover: coverImage, // Base64
    };
    
    // 페이지별 이미지 추가
    pages.forEach((page, index) => {
      if (page.imageUrl) {
        files[`page_${index + 1}`] = page.imageUrl;
      }
    });
    
    // 작품 저장
    const result = await saveArtifact({
      learnerId: learner.learnerId,
      type: 'storybook',
      title,
      data: {
        pages: pages.map(p => ({ text: p.text })),
        style: 'fairytale',
      },
      files,
    });
    
    alert(`작품이 저장되었습니다!\n공유 링크: ${result.shareUrl}`);
    
    // QR 코드 표시 (기기 변경용)
    showQRCode(result.shareId);
  } catch (error) {
    alert('저장 실패: ' + error.message);
  }
}
```

#### 📚 내 작품 목록

```typescript
import { listArtifacts, getCurrentLearner } from '../services/classroomService';

async function loadMyArtifacts() {
  try {
    const learner = getCurrentLearner();
    if (!learner) {
      alert('먼저 로그인해주세요!');
      return;
    }
    
    const artifacts = await listArtifacts(learner.learnerId);
    
    console.log(`총 ${artifacts.length}개의 작품`);
    artifacts.forEach(art => {
      console.log(`- ${art.title} (${art.type})`);
    });
    
    return artifacts;
  } catch (error) {
    console.error('작품 목록 조회 실패:', error);
    return [];
  }
}
```

#### 🔗 공유 링크로 작품 열기

```typescript
import { getArtifactByShare } from '../services/classroomService';

async function openSharedArtifact(shareId: string) {
  try {
    const artifact = await getArtifactByShare(shareId);
    
    console.log('작품 제목:', artifact.title);
    console.log('작성자:', artifact.learnerName);
    console.log('데이터:', artifact.data);
    console.log('파일:', artifact.files);
    
    // 작품 렌더링
    renderArtifact(artifact);
  } catch (error) {
    alert('작품을 찾을 수 없습니다: ' + error.message);
  }
}

// URL에서 shareId 추출
const urlParams = new URLSearchParams(window.location.search);
const shareId = urlParams.get('share');
if (shareId) {
  openSharedArtifact(shareId);
}
```

#### 📦 강사용 ZIP 다운로드

```typescript
import { exportClassZip, verifyInstructorPin, downloadZipFile } from '../services/classroomService';

async function handleExportZip(classCode: string, instructorPin: string) {
  try {
    // PIN 검증
    const isValid = await verifyInstructorPin(classCode, instructorPin);
    if (!isValid) {
      alert('잘못된 강사 PIN입니다.');
      return;
    }
    
    // ZIP 다운로드
    alert('작품을 다운로드하는 중입니다... 잠시만 기다려주세요.');
    
    const zipBlob = await exportClassZip(classCode, instructorPin);
    const filename = `${classCode}_작품모음_${new Date().toISOString().split('T')[0]}.zip`;
    
    downloadZipFile(zipBlob, filename);
    
    alert('다운로드가 완료되었습니다!');
  } catch (error) {
    alert('다운로드 실패: ' + error.message);
  }
}
```

---

## 📊 Step 6: 데이터 마이그레이션

### 6.1 IndexedDB → Firestore 마이그레이션

기존 로컬 데이터를 클라우드로 마이그레이션하는 스크립트:

```typescript
import { getAllStories, getAllImages, getAllStorybooks } from './dbService';
import { saveArtifact, getCurrentLearner } from './classroomService';

export async function migrateLocalDataToCloud(): Promise<void> {
  const learner = getCurrentLearner();
  if (!learner) {
    throw new Error('먼저 로그인해주세요!');
  }
  
  console.log('🔄 마이그레이션 시작...');
  
  // 1. 글쓰기 마이그레이션
  const stories = await getAllStories();
  for (const story of stories) {
    await saveArtifact({
      learnerId: learner.learnerId,
      type: 'story',
      title: story.title,
      data: {
        content: story.content,
        genre: story.genre,
      },
      files: story.image ? { thumbnail: story.image } : undefined,
    });
  }
  console.log(`✅ 글쓰기 ${stories.length}개 마이그레이션 완료`);
  
  // 2. 이미지 마이그레이션
  const images = await getAllImages();
  for (const image of images) {
    await saveArtifact({
      learnerId: learner.learnerId,
      type: 'image',
      title: image.prompt || '이미지',
      data: {
        prompt: image.prompt,
        style: image.style,
      },
      files: { image: image.image },
    });
  }
  console.log(`✅ 이미지 ${images.length}개 마이그레이션 완료`);
  
  // 3. 동화책 마이그레이션
  const storybooks = await getAllStorybooks();
  for (const book of storybooks) {
    const files: { [key: string]: string } = {};
    
    if (book.coverImageUrl) {
      files.cover = book.coverImageUrl;
    }
    
    book.pages.forEach((page, index) => {
      if (page.imageUrl) {
        files[`page_${index + 1}`] = page.imageUrl;
      }
    });
    
    await saveArtifact({
      learnerId: learner.learnerId,
      type: 'storybook',
      title: book.title,
      data: {
        pages: book.pages.map(p => ({ text: p.text })),
        style: book.style,
      },
      files,
    });
  }
  console.log(`✅ 동화책 ${storybooks.length}개 마이그레이션 완료`);
  
  console.log('🎉 마이그레이션 완료!');
}
```

---

## 💰 비용 예측

### Firestore
- **무료 플랜**: 1GB 저장소, 50K 읽기/일, 20K 쓰기/일
- **유료 플랜**: $0.18/GB/월, $0.06/100K 읽기, $0.18/100K 쓰기

**예상 사용량** (수업 30명, 각 10개 작품):
- 저장소: ~100MB (메타데이터만)
- 읽기: ~1K/일
- 쓰기: ~100/일
- **예상 비용**: **무료**

### Storage
- **무료 플랜**: 5GB 저장소, 1GB/일 다운로드
- **유료 플랜**: $0.026/GB/월, $0.12/GB 다운로드

**예상 사용량** (수업 30명, 각 10개 작품):
- 저장소: ~3GB (이미지+PDF)
- 다운로드: ~100MB/일
- **예상 비용**: **무료**

### Functions
- **무료 플랜**: 2M 호출/월, 400K GB-sec, 200K CPU-sec
- **유료 플랜**: $0.40/M 호출, $0.0000025/GB-sec, $0.0000100/CPU-sec

**예상 사용량** (수업 30명):
- 호출: ~1K/일 = 30K/월
- **예상 비용**: **무료**

### 총 예상 비용
- **소규모 (1-3개 수업)**: **$0/월** (무료 플랜 내)
- **중규모 (10개 수업)**: **$5~10/월**
- **대규모 (30개 수업)**: **$20~30/월**

---

## 🔧 트러블슈팅

### 1. Functions 배포 실패

**증상**: `firebase deploy --only functions` 실패

**해결**:
```bash
# 1. firebase-tools 업데이트
npm install -g firebase-tools

# 2. 로그인 재시도
firebase login --reauth

# 3. 프로젝트 확인
firebase use --add
```

### 2. CORS 오류

**증상**: 브라우저 Console에 CORS 에러

**해결**: Functions 코드에서 CORS 설정 확인
```javascript
const corsOptions = {
  origin: true, // 모든 origin 허용
  methods: ['GET', 'POST', 'OPTIONS'],
};
```

### 3. Storage 업로드 실패

**증상**: "Permission denied" 오류

**해결**:
```bash
# Storage 보안 규칙 배포
firebase deploy --only storage:rules

# Storage 규칙 확인
firebase deploy --only storage:rules --debug
```

---

## 📞 참고 자료

- [Firebase Functions v2 Docs](https://firebase.google.com/docs/functions/http-events)
- [Firestore Security Rules](https://firebase.google.com/docs/firestore/security/get-started)
- [Firebase Storage](https://firebase.google.com/docs/storage)
- [Archiver.js (ZIP)](https://www.archiverjs.com/)

---

**마지막 업데이트**: 2025-01-05  
**작성자**: Claude (AI Assistant)  
**프로젝트**: 스토리 메이커 - 수업 운영 시스템
