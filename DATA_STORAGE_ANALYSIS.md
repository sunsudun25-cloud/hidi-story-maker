# 📊 스토리 메이커 - 데이터 저장 구조 분석

**분석일**: 2025-01-05  
**분석자**: Claude (AI Assistant)  
**목적**: 상용화 전 데이터 저장 구조 파악

---

## 📋 저장 위치 요약표

| 항목 | 저장 위치 | 저장 트리거 (언제) | 재접속 시 복원 | 비고 |
|------|----------|-------------------|---------------|------|
| **1. 동화책 텍스트** | IndexedDB (`storybooks`) | 저장 버튼 클릭 시 | ✅ 복원됨 | 로컬 브라우저에만 저장 |
| **2. 동화책 이미지** | IndexedDB (`storybooks.pages[].imageUrl`) | 각 페이지 이미지 생성 시 자동 포함 | ✅ 복원됨 | Base64로 저장 (용량 큼) |
| **3. PDF** | ❌ 저장 안 됨 | PDF 내보내기 시 **즉시 다운로드만** | ❌ 복원 안 됨 | 파일 시스템에 다운로드 |
| **4. 단일 이미지 (캐릭터/삽화)** | IndexedDB (`images`) | 이미지 생성 완료 시 자동 저장 | ✅ 복원됨 | Base64로 저장 |
| **5. 글쓰기 결과 (텍스트)** | IndexedDB (`stories`) | 저장 버튼 클릭 시 | ✅ 복원됨 | 제목, 내용, 장르, 이미지 포함 |
| **6. 드로잉 결과 (캔버스)** | IndexedDB (`images`) | 드로잉 완료 시 자동 저장 | ✅ 복원됨 | Base64로 저장 |

---

## 🔍 상세 분석

### 📚 IndexedDB 구조

**데이터베이스 이름**: `AIStoryMakerDB`  
**버전**: 3  
**Object Stores**: 3개

#### 1️⃣ `stories` (글쓰기 결과)
```typescript
interface Story {
  id: string;              // UUID
  title: string;           // 글 제목
  content: string;         // 본문
  genre?: string;          // 장르 (일기, 편지 등)
  image?: string;          // Base64 이미지 (단일)
  images?: StoryImage[];   // Base64 이미지 (여러 개)
  description?: string;    // 설명
  createdAt: string;       // 생성일
  updatedAt?: string;      // 수정일
}
```

**저장 트리거**:
- `WriteEditor.tsx`: 저장 버튼 클릭 → `saveStory()` 호출
- 조건: 제목과 내용이 모두 입력되어야 함

**저장 시점**:
```typescript
// src/pages/WriteEditor.tsx line 160
await saveStory({
  title: title.trim(),
  content: content.trim(),
  genre: genre || undefined,
  images: storyImages.length > 0 ? storyImages : undefined,
  createdAt: new Date().toISOString(),
});
```

---

#### 2️⃣ `images` (단일 이미지 및 드로잉)
```typescript
interface SavedImage {
  id?: string;          // UUID
  image: string;        // Base64 data URL
  prompt: string;       // 프롬프트
  style?: string;       // 스타일
  createdAt: string;    // 생성일
}
```

**저장 트리거**:

1. **Result.tsx** (그림 연습 결과)
   - 페이지 진입 시 **자동 저장** (useEffect)
   ```typescript
   // src/pages/Result.tsx line 30
   saveImage({
     image: imageUrl,
     prompt: prompt,
     style: style
   })
   ```

2. **DrawingResult.tsx** (직접 그리기 결과)
   - 페이지 진입 시 **자동 저장** (useEffect)
   ```typescript
   // src/pages/DrawingResult.tsx line 40
   saveImage({
     image: imageData,
     prompt: prompt,
     style: style || "기본"
   })
   ```

3. **ImageMake/Result.tsx**
   - 이미지 생성 완료 시 **자동 저장**
   ```typescript
   // src/pages/ImageMake/Result.tsx line 51
   await saveImage({
     image: image,
     prompt: prompt,
     style: style
   })
   ```

---

#### 3️⃣ `storybooks` (동화책)
```typescript
interface Storybook {
  id?: string;              // UUID
  title: string;            // 동화책 제목
  prompt?: string;          // 초기 프롬프트
  style?: string;           // 스타일
  coverImageUrl?: string;   // 표지 이미지 (Base64)
  pages: StorybookPage[];   // 페이지 배열
  createdAt: string;        // 생성일
}

interface StorybookPage {
  text: string;         // 페이지 텍스트
  imageUrl?: string;    // 페이지 이미지 (Base64)
}
```

**저장 트리거**:

1. **StorybookEditor.tsx** (동화책 편집기)
   - 저장 버튼 클릭
   - 조건: 최소 1페이지 이상
   ```typescript
   // src/pages/StorybookEditor.tsx line 409
   await saveStorybook({
     title,
     prompt: originalPrompt,
     style: styleMode,
     coverImageUrl: coverImage,
     pages: storyPages.map(p => ({
       text: p.text,
       imageUrl: p.imageUrl
     }))
   })
   ```

2. **StorybookEditorModify.tsx** (동화책 수정)
   - 저장 버튼 클릭
   ```typescript
   // src/pages/StorybookEditorModify.tsx line 255
   await saveStorybook({
     title,
     pages: storyPages.map(p => ({
       text: p.text,
       imageUrl: p.imageUrl
     }))
   })
   ```

---

### 📄 PDF 생성 및 다운로드

**위치**: `src/services/pdfService.ts`

**함수들**:
- `generateStorybookPDF()` - 기본 PDF 생성
- `exportEnhancedPDF()` - 향상된 PDF 생성 (다양한 레이아웃)

**저장 방식**: ❌ **저장 안 됨**
- PDF는 생성 즉시 **브라우저 다운로드**만 실행됨
- IndexedDB, Firestore, Firebase Storage에 저장되지 않음

**다운로드 코드**:
```typescript
// src/services/pdfService.ts
doc.save(filename);  // jsPDF.save() - 즉시 다운로드
```

**트리거**:
- `StorybookExport.tsx`: "PDF로 내보내기" 버튼 클릭

---

### ❌ 사용되지 않는 저장소

#### 1️⃣ Firestore
- **상태**: ❌ **사용 안 함**
- **확인 방법**: 
  - 코드 검색 결과: `firestore`, `collection`, `doc()` 관련 코드 없음
  - Firebase SDK import 없음

#### 2️⃣ Firebase Storage
- **상태**: ❌ **사용 안 함**
- **확인 방법**:
  - 코드 검색 결과: `getStorage`, `uploadBytes`, `ref()` 관련 코드 없음
  - 모든 이미지가 Base64로 IndexedDB에 저장됨

#### 3️⃣ Firebase Realtime Database
- **상태**: ❌ **사용 안 함**

---

## 🔄 데이터 복원 (재접속 시)

### ✅ 복원되는 항목
1. **동화책**: `getAllStorybooks()` → IndexedDB에서 복원
2. **글쓰기**: `getAllStories()` → IndexedDB에서 복원
3. **이미지**: `getAllImages()` → IndexedDB에서 복원

### ❌ 복원되지 않는 항목
1. **PDF**: 로컬 다운로드만 되고 저장 안 됨
2. **임시 데이터**: 페이지 새로고침 시 React state 초기화

---

## ⚠️ 현재 구조의 문제점

### 1️⃣ **브라우저 의존성**
- ❌ 모든 데이터가 브라우저 로컬에만 저장
- ❌ 기기 변경 시 데이터 손실
- ❌ 브라우저 캐시 삭제 시 데이터 손실

### 2️⃣ **Base64 이미지 저장**
- ❌ Base64는 원본 대비 약 33% 용량 증가
- ❌ IndexedDB 용량 제한 (브라우저마다 다름, 보통 50MB~수GB)
- ❌ 이미지가 많아지면 성능 저하

**예시**:
```
원본 이미지: 100KB
Base64 저장: 133KB (33% 증가)
동화책 10권 × 10페이지 × 평균 200KB = 약 26.6MB
```

### 3️⃣ **PDF 영구 저장 불가**
- ❌ PDF는 다운로드만 되고 재생성 불가
- ❌ 설정 변경 시 다시 내보내기 필요

### 4️⃣ **멀티 디바이스 미지원**
- ❌ PC에서 작업 → 모바일에서 조회 불가
- ❌ 가족/친구와 공유 불가

### 5️⃣ **백업 불가**
- ❌ 자동 백업 없음
- ❌ 수동 내보내기만 가능 (PDF)

---

## 💡 개선 방안 (상용화를 위한)

### Phase 1: 클라우드 저장소 추가 (필수)

#### ✅ Firestore 도입
```typescript
// 사용자별 데이터 구조
/users/{userId}/
  ├── stories/
  │   └── {storyId}
  ├── images/
  │   └── {imageId}
  └── storybooks/
      └── {storybookId}
```

**장점**:
- ✅ 멀티 디바이스 동기화
- ✅ 실시간 업데이트
- ✅ 자동 백업
- ✅ 쿼리 및 검색 가능

**비용**: 
- 무료 플랜: 1GB 저장소, 50K 읽기/일, 20K 쓰기/일
- 유료: $0.18/GB/월, $0.06/100K 읽기, $0.18/100K 쓰기

#### ✅ Firebase Storage 도입 (이미지 전용)
```typescript
/users/{userId}/
  ├── images/{imageId}.png
  ├── storybooks/{storybookId}/
  │   ├── cover.png
  │   └── page_{n}.png
  └── pdfs/{pdfId}.pdf
```

**장점**:
- ✅ Base64 대비 33% 용량 절감
- ✅ CDN을 통한 빠른 로딩
- ✅ 대용량 파일 지원 (5GB/파일)

**비용**:
- 무료 플랜: 5GB 저장소, 1GB/일 다운로드
- 유료: $0.026/GB/월, $0.12/GB 다운로드

---

### Phase 2: 하이브리드 저장 전략

```typescript
// 저장 우선순위
1. IndexedDB (오프라인 캐시, 빠른 접근)
2. Firestore (메타데이터, 텍스트)
3. Firebase Storage (이미지, PDF)

// 읽기 순서
1. IndexedDB에서 읽기 (캐시)
2. 없으면 Firestore/Storage에서 읽기
3. IndexedDB에 캐시
```

**장점**:
- ✅ 오프라인 지원
- ✅ 빠른 로딩 속도
- ✅ 데이터 영구 보존

---

### Phase 3: PDF 저장 추가

```typescript
// PDF 생성 후 Firebase Storage에 저장
export async function savePDFToCloud(
  pdfBlob: Blob, 
  storybookId: string
): Promise<string> {
  const storageRef = ref(storage, `users/${userId}/pdfs/${storybookId}.pdf`);
  await uploadBytes(storageRef, pdfBlob);
  return await getDownloadURL(storageRef);
}
```

**장점**:
- ✅ PDF 재다운로드 가능
- ✅ 공유 링크 생성 가능

---

## 📊 저장 용량 예측

### 현재 (IndexedDB만 사용)
| 항목 | 개수 | 평균 크기 | 총 용량 |
|------|------|----------|---------|
| 동화책 (10페이지) | 10권 | 2MB | 20MB |
| 단일 이미지 | 100개 | 200KB | 20MB |
| 글쓰기 (텍스트+이미지) | 50개 | 300KB | 15MB |
| **총계** | | | **55MB** |

**IndexedDB 한계**: 브라우저마다 다름 (50MB~수GB)

### 개선 후 (Firestore + Storage)
| 항목 | Firestore | Storage | 총 비용 |
|------|-----------|---------|---------|
| 동화책 텍스트 | 100KB | - | 무료 |
| 이미지 (100개) | 50KB (메타) | 15MB | ~$0.50/월 |
| PDF (10개) | 10KB (메타) | 20MB | ~$0.60/월 |
| **월 비용** | | | **~$1~2/월** |

---

## ✅ 액션 아이템

### 즉시 실행 (현재 구조 유지)
- [x] 데이터 저장 구조 문서화 완료
- [ ] IndexedDB 용량 모니터링 추가
- [ ] 데이터 내보내기 기능 (JSON)

### 단기 (1-2주)
- [ ] Firestore 초기 설정
- [ ] Firebase Storage 초기 설정
- [ ] 사용자 인증 추가 (Firebase Auth)

### 중기 (3-4주)
- [ ] 데이터 마이그레이션 도구 개발
- [ ] 하이브리드 저장 전략 구현
- [ ] PDF 클라우드 저장 추가

### 장기 (1-2개월)
- [ ] 멀티 디바이스 동기화
- [ ] 공유 기능 추가
- [ ] 자동 백업 시스템

---

## 📞 참고 자료

- [IndexedDB API](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API)
- [Firebase Firestore](https://firebase.google.com/docs/firestore)
- [Firebase Storage](https://firebase.google.com/docs/storage)
- [jsPDF Documentation](https://github.com/parallax/jsPDF)

---

**마지막 업데이트**: 2025-01-05  
**작성자**: Claude (AI Assistant)  
**프로젝트**: 스토리 메이커 (HI-DI Edu)
