# OpenAI DALL-E 3 이미지 생성 설정 가이드

## ✅ 로컬 환경 설정 완료!

로컬 개발 환경에는 이미 OpenAI API Key가 설정되어 있습니다.
- `.env` 파일에 `VITE_OPENAI_API_KEY` 추가 완료
- `geminiService.ts`에 DALL-E 3 통합 완료

---

## 🚀 Production 배포를 위한 설정

### 1단계: GitHub Secret 등록 (필수!)

**⚠️ 이 단계를 먼저 완료해야 합니다!**

1. **GitHub Secrets 페이지 열기:**
   https://github.com/sunsudun25-cloud/hidi-story-maker/settings/secrets/actions

2. **"New repository secret" 클릭**

3. **Secret 정보 입력:**
   - **Name**: `VITE_OPENAI_API_KEY` (정확히 입력!)
   - **Value**: 앞서 제공받은 OpenAI API 키 붙여넣기
     ```
     sk-proj-Ytzbi6XAr1ORsuUa39EU... (전체 키 입력)
     ```

4. **"Add secret" 버튼 클릭**

---

### 2단계: GitHub Workflow 파일 수정

**GitHub Secret을 등록한 후** workflow 파일을 수정하세요!

1. **Workflow 파일 열기:**
   https://github.com/sunsudun25-cloud/hidi-story-maker/blob/main/.github/workflows/deploy.yml

2. **편집 버튼 클릭** (우측 상단 연필 아이콘)

3. **26-35번 줄을 찾아서 아래 코드로 교체:**

```yaml
      - name: Build project
        run: npm run build
        env:
          VITE_OPENAI_API_KEY: ${{ secrets.VITE_OPENAI_API_KEY }}
          VITE_GEMINI_API_KEY: AIzaSyDLyiqqcZgzCi09YmEtuPmMWXKS0EQlWos
          VITE_GEMINI_KEY: AIzaSyDLyiqqcZgzCi09YmEtuPmMWXKS0EQlWos
          VITE_GOOGLE_API_KEY: AIzaSyDLyiqqcZgzCi09YmEtuPmMWXKS0EQlWos
          VITE_FIREBASE_API_KEY: AIzaSyBBsjEVt-WktzSYC1zqZPslIjAie9a-F0
          VITE_FIREBASE_AUTH_DOMAIN: story-make-fbbd7.firebaseapp.com
          VITE_FIREBASE_PROJECT_ID: story-make-fbbd7
          VITE_FIREBASE_STORAGE_BUCKET: story-make-fbbd7.firebasestorage.app
          VITE_FIREBASE_MESSAGING_SENDER_ID: 63291004810
          VITE_FIREBASE_APP_ID: 1:63291004810:web:7a8301e17c4e528768da73
          VITE_FIREBASE_MEASUREMENT_ID: G-SK12ZCRM26
```

4. **Commit 메시지 작성:**
```
Add OpenAI API key for DALL-E 3 image generation
```

5. **"Commit changes" 버튼 클릭**

---

## ✅ 완료 후 확인

### 1. 자동 배포 시작 확인
https://github.com/sunsudun25-cloud/hidi-story-maker/actions
- 새로운 워크플로우 실행 확인 (약 30초 후)

### 2. 배포 성공 확인 (2-3분)
- 초록색 체크 표시 확인

### 3. Production 사이트 테스트
https://story-make-fbbd7.web.app

**테스트 시나리오:**
1. 홈 → "그림 만들기" 클릭
2. 프롬프트 입력: "귀여운 고양이"
3. 스타일 선택: "수채화"
4. "🎨 그림 만들기" 클릭
5. LoadingSpinner 표시 확인 (10-30초)
6. DALL-E 3가 생성한 고품질 이미지 확인!

---

## 🎨 DALL-E 3 기능 특징

### 지원하는 스타일:
- ✅ 수채화 (watercolor)
- ✅ 동화풍 (fairytale)
- ✅ 파스텔톤 (pastel)
- ✅ 따뜻한 느낌 (warm)
- ✅ 애니메이션 (anime)
- ✅ 연필스케치 (sketch)

### 품질:
- **해상도**: 1024x1024
- **품질**: Standard (고품질은 $0.080/이미지)
- **생성 시간**: 10-30초

### 비용:
- **이미지 1개**: $0.040 (약 50원)
- **무료 크레딧**: $5 (약 125개 이미지)

---

## 🔍 문제 해결

### Q: "VITE_OPENAI_API_KEY가 설정되지 않았습니다" 에러
**A:** GitHub Secret 등록 확인
1. Secret 이름이 정확히 `VITE_OPENAI_API_KEY`인지 확인
2. Workflow 파일에 `${{ secrets.VITE_OPENAI_API_KEY }}`로 작성되었는지 확인

### Q: 배포는 성공했지만 이미지 생성이 안 됩니다
**A:** 브라우저 콘솔 (F12) 확인
- API Key 에러: Secret 값 재확인
- 403 에러: OpenAI 크레딧 확인
- CORS 에러: 없음 (서버사이드 API 호출)

### Q: "insufficient_quota" 에러
**A:** OpenAI 크레딧 부족
- https://platform.openai.com/usage 에서 사용량 확인
- 크레딧 충전: https://platform.openai.com/account/billing

---

## 📊 현재 상태

- ✅ **로컬 환경**: OpenAI DALL-E 3 통합 완료
- ✅ **코드 빌드**: 성공
- ⏳ **GitHub Secret**: 등록 필요 (1단계)
- ⏳ **Workflow 수정**: 필요 (2단계)
- ⏳ **Production 배포**: Secret 등록 후 자동 진행

---

## 🎯 작업 순서 요약

1. ✅ OpenAI API Key 발급
2. ✅ 로컬 `.env` 파일 설정
3. ✅ `geminiService.ts` DALL-E 3 통합
4. ✅ 로컬 테스트 성공
5. ⏳ **GitHub Secret 등록** ← 지금 여기!
6. ⏳ Workflow 파일 수정
7. ⏳ 자동 배포 및 테스트

---

**GitHub Secret 등록이 완료되면 알려주세요!** 🚀
그러면 Workflow 파일 수정을 진행하겠습니다.
