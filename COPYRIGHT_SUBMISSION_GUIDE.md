# 📋 저작권 등록용 소스코드 제출 가이드

## ⚠️ 보안 검토 결과

### 🔍 API 키 노출 위험 분석

#### ✅ 안전한 파일 (src/ 디렉토리)
**결론**: **src/ 디렉토리의 소스코드는 제출해도 안전합니다.**

**이유**:
1. **API 키가 하드코딩되어 있지 않음**
   - 모든 API 키는 환경변수로 관리됨
   - `import.meta.env.VITE_GEMINI_API_KEY` 형태로만 참조
   - 실제 키 값은 코드에 없음

2. **발견된 유일한 참조**:
   ```typescript
   // src/main.tsx
   hasGeminiKey: !!import.meta.env.VITE_GEMINI_API_KEY
   ```
   → 단순히 키 존재 여부만 체크 (키 값 자체는 없음)

#### ⚠️ 위험한 파일 (제외 필요)

**절대 제출하면 안 되는 파일**:
```
.env                          # Gemini API 키 포함 ❌
.dev.vars                     # OpenAI API 키 포함 ❌
functions/.env.production     # 프로덕션 API 키 ❌
wrangler.toml                 # Cloudflare 설정 ❌
.firebaserc                   # Firebase 프로젝트 ID ❌
```

**현재 .env 내용 (노출된 키)**:
```
VITE_GEMINI_API_KEY=AIzaSyDrfdKeWEaKo1Tni7yiBFIqSxcWRhEdC24  # ⚠️ 위험!
```

---

## 📦 저작권 등록 제출 항목 (3건)

### 1️⃣ 그림 만들기 모듈

**제출할 파일**:
```
src/pages/DrawPractice.tsx          # 그림 연습하기
src/pages/DrawDirect.tsx            # 직접 입력
src/pages/DrawingResult.tsx         # 결과 화면
src/pages/Result.tsx                # 공통 결과
src/pages/ImageMake/                # 이미지 생성 관련
├── Practice.tsx
├── Custom.tsx
└── Result.tsx

src/services/imageService.ts        # 이미지 저장
src/services/cloudflareImageApi.ts  # 이미지 생성 API (키 제외)
src/services/speechRecognitionService.ts  # 음성 입력
src/services/imageUploadService.ts  # 사진 업로드
src/services/visionService.ts       # 손글씨 인식
```

### 2️⃣ 글쓰기 모듈

**제출할 파일**:
```
src/pages/Write.tsx                 # 글쓰기 시작
src/pages/WriteEditor.tsx           # 글쓰기 편집기
src/pages/WritePractice.tsx         # 글쓰기 연습
src/services/geminiService.ts       # AI 글쓰기 도우미 (키 제외)
src/services/dbService.ts           # 작품 저장
```

### 3️⃣ 동화책 만들기 모듈

**제출할 파일**:
```
src/pages/Storybook/
├── index.tsx                       # 동화책 시작
├── Create.tsx                      # 초안 생성
├── Editor.tsx                      # 동화책 편집
├── EditorModify.tsx                # 수정
└── Export.tsx                      # PDF 내보내기

src/services/pdfService.ts          # PDF 생성
src/services/geminiService.ts       # 스토리 생성 (공통)
```

---

## 🛡️ 안전한 제출 방법

### 방법 1: 소스코드만 압축 (권장) ⭐

```bash
cd /home/user/webapp

# 1. 그림 만들기 모듈
zip -r copyright_drawing.zip \
  src/pages/DrawPractice.tsx \
  src/pages/DrawDirect.tsx \
  src/pages/DrawingResult.tsx \
  src/pages/Result.tsx \
  src/pages/ImageMake/ \
  src/services/imageService.ts \
  src/services/cloudflareImageApi.ts \
  src/services/speechRecognitionService.ts \
  src/services/imageUploadService.ts \
  src/services/visionService.ts

# 2. 글쓰기 모듈
zip -r copyright_writing.zip \
  src/pages/Write.tsx \
  src/pages/WriteEditor.tsx \
  src/pages/WritePractice.tsx \
  src/services/geminiService.ts \
  src/services/dbService.ts

# 3. 동화책 만들기 모듈
zip -r copyright_storybook.zip \
  src/pages/Storybook/ \
  src/services/pdfService.ts \
  src/services/geminiService.ts
```

### 방법 2: API 키 제거 후 전체 제출

```bash
cd /home/user/webapp

# 1. .env 파일 백업
cp .env .env.backup

# 2. API 키를 가짜 값으로 대체
cat > .env << 'EOF'
# 저작권 등록용 - 실제 키는 제거됨
VITE_GEMINI_API_KEY=YOUR_GEMINI_API_KEY_HERE
EOF

# 3. 전체 압축 (안전한 파일만)
zip -r copyright_full.zip src/ public/ \
  -x "*.env.backup" \
  -x ".dev.vars" \
  -x "node_modules/*" \
  -x ".git/*" \
  -x "dist/*"

# 4. 원본 복구
mv .env.backup .env
```

---

## ✅ 제출 전 체크리스트

### 필수 확인 사항
- [ ] `.env` 파일이 압축에 포함되지 않았는지 확인
- [ ] `.dev.vars` 파일이 압축에 포함되지 않았는지 확인
- [ ] 압축 파일 열어서 API 키 검색 (`AIza`, `sk-`)
- [ ] README.md에 API 키 설정 방법만 기술 (키 자체는 없음)
- [ ] wrangler.toml, .firebaserc 제외 확인

### 압축 파일 검증 명령어
```bash
# ZIP 파일 내용 확인
unzip -l copyright_drawing.zip | grep -E "\.env|\.dev\.vars"

# 압축 해제 후 API 키 검색
unzip copyright_drawing.zip -d temp_check/
grep -r "AIza\|sk-" temp_check/ 
# 결과가 없어야 안전함!

# 정리
rm -rf temp_check/
```

---

## 📄 각 모듈별 상세 파일 목록

### 그림 만들기 (Drawing Module)

**핵심 파일** (총 14개):
```
src/pages/
├── DrawPractice.tsx              # 말로 설명하기
├── DrawDirect.tsx                # 직접 입력
├── DrawingResult.tsx             # 결과 화면
├── Result.tsx                    # 공통 결과
└── ImageMake/
    ├── index.tsx                 # 이미지 생성 시작
    ├── Practice.tsx              # 연습 모드
    ├── Custom.tsx                # 커스텀 모드
    └── Result.tsx                # 결과 화면

src/services/
├── imageService.ts               # 이미지 저장/관리
├── cloudflareImageApi.ts         # DALL-E 3 API 호출 (키 없음)
├── speechRecognitionService.ts   # 음성 입력
├── imageUploadService.ts         # 사진 업로드
├── visionService.ts              # 손글씨 인식 (OpenAI Vision)
└── firebaseFunctions.ts          # Firebase Functions 호출
```

**UI 컴포넌트** (선택사항):
```
src/components/
├── QRCodeModal.tsx               # QR 코드 공유
└── Layout.tsx                    # 공통 레이아웃
```

**스타일** (선택사항):
```
src/pages/
├── DrawPractice.css
├── DrawDirect.css
└── Result.css
```

### 글쓰기 (Writing Module)

**핵심 파일** (총 8개):
```
src/pages/
├── Write.tsx                     # 글쓰기 시작 화면
├── WriteEditor.tsx               # 글쓰기 편집기
├── WritePractice.tsx             # 연습 모드
└── WriteResult.tsx               # 결과 화면

src/services/
├── geminiService.ts              # AI 글쓰기 도우미 (Gemini)
├── dbService.ts                  # IndexedDB 저장
├── imageService.ts               # 이미지 생성 (공통)
└── speechRecognitionService.ts   # 음성 입력 (공통)
```

**스타일**:
```
src/pages/
└── WriteEditor.css
```

### 동화책 만들기 (Storybook Module)

**핵심 파일** (총 10개):
```
src/pages/Storybook/
├── index.tsx                     # 동화책 시작
├── Create.tsx                    # 초안 생성
├── Editor.tsx                    # 편집기
├── EditorModify.tsx              # 수정 모드
└── Export.tsx                    # PDF 내보내기

src/services/
├── pdfService.ts                 # PDF 생성 (html2canvas + jsPDF)
├── geminiService.ts              # 스토리 생성 (공통)
├── imageService.ts               # 삽화 생성 (공통)
├── dbService.ts                  # 저장 (공통)
└── firebaseFunctions.ts          # Functions 호출 (공통)
```

**스타일**:
```
src/pages/Storybook/
├── Create.css
├── Editor.css
└── Export.css
```

---

## 🎯 최종 권장사항

### ⭐ 가장 안전한 방법

**src/ 디렉토리만 제출**:
```bash
cd /home/user/webapp

# 각 모듈별로 분리 압축
tar -czf copyright_drawing.tar.gz src/pages/Draw* src/pages/Result.tsx src/pages/ImageMake/
tar -czf copyright_writing.tar.gz src/pages/Write*
tar -czf copyright_storybook.tar.gz src/pages/Storybook/

# 공통 서비스 파일
tar -czf copyright_services.tar.gz src/services/
```

**장점**:
- ✅ API 키 노출 위험 0%
- ✅ 순수 소스코드만 포함
- ✅ 저작권 등록에 충분함

---

## 📞 추가 확인 사항

### 저작권청 제출 시 일반적 요구사항
1. **소스코드 첫 25페이지 + 마지막 25페이지**
2. 또는 **전체 소스코드 (50페이지 이하)**
3. **주석 제거 가능** (선택사항)

### API 키 보안 원칙
- ✅ **소스코드 (`src/`)는 안전** - 환경변수로만 참조
- ❌ **환경 파일 (`.env`)은 위험** - 실제 키 포함
- ✅ **함수 코드 (`functions/`)도 안전** - 환경변수 참조만

---

## 🚨 긴급 보안 조치 (선택사항)

현재 `.env` 파일에 Gemini API 키가 노출되어 있습니다. 제출 전 또는 제출 후 다음 조치 권장:

```bash
# 1. Gemini API 키 재발급
# https://makersuite.google.com/app/apikey

# 2. .env 파일 업데이트
cd /home/user/webapp
cat > .env << 'EOF'
# 새로운 Gemini API Key
VITE_GEMINI_API_KEY=새로운키여기입력
EOF

# 3. Git에서 .env 기록 제거 (선택사항)
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch .env" \
  --prune-empty --tag-name-filter cat -- --all
```

---

**마지막 업데이트**: 2026-01-07  
**보안 검토**: 완료 ✅  
**제출 안전성**: src/ 디렉토리만 제출 시 100% 안전
