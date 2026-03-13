# 🎨 GPT Image 1.5 실사 테스트 설정 가이드

## ✅ **배포 완료**
- **테스트 URL**: https://390b2a1e.story-maker-4l6-01i.pages.dev
- **프로젝트**: story-maker-4l6
- **새 엔드포인트**: `/api/generate-image-realistic` (GPT Image 1.5 전용)

---

## 🔑 **필수: 환경변수 설정**

### **1단계: Cloudflare Dashboard 접속**

https://dash.cloudflare.com 로그인

---

### **2단계: Pages 프로젝트 선택**

1. 왼쪽 메뉴에서 **Workers & Pages** 클릭
2. **story-maker-4l6** 프로젝트 선택

---

### **3단계: 환경변수 추가**

1. **Settings** 탭 클릭
2. **Environment variables** 섹션으로 스크롤
3. **Add variable** 버튼 클릭

**변수 정보**:
```
Variable name: OPENAI_API_KEY_GPT_IMAGE
Value: sk-proj-2026story로 시작하는 API 키
Environment: Production (프로덕션)
```

4. **Save** 버튼 클릭

---

### **4단계: 재배포 (환경변수 적용)**

환경변수를 추가한 후 **반드시 재배포**해야 적용됩니다.

#### **방법 1: Dashboard에서 재배포 (추천)**
1. **Deployments** 탭 클릭
2. 최신 배포 옆 **⋮** (3점 메뉴) 클릭
3. **Retry deployment** 선택

#### **방법 2: CLI로 재배포**
```bash
cd /home/user/webapp
npx wrangler pages deploy dist --project-name story-maker-4l6
```

---

## 🧪 **테스트 방법**

### **1. 실사 스타일 선택**
1. 로그인: C6855 / 0001
2. 테마: "🏠 집으로 가는 사람들"
3. 장소: 편의점 앞
4. 인터뷰어: 남자 아나운서
5. 답변자: 젊은 남자
6. **스타일: 실사 (📸)** ← 중요!
7. "마스터 이미지 생성" 클릭

---

### **2. 콘솔 로그 확인 (F12)**

**성공 시 로그**:
```javascript
🔍 [IMAGE ENGINE] API Request: {
  url: "/api/generate-image-realistic",  // 🆕 새 엔드포인트
  model: "gpt-image-1.5",                 // 🆕 최신 모델
  size: "1536x1024",
  quality: "high",
  isRealistic: true                       // 🆕 실사 플래그
}

🔍 [GPT IMAGE 1.5 API] Request: {
  model: "gpt-image-1.5",
  size: "1536x1024",
  quality: "high",
  promptLength: 285
}

✅ [GPT IMAGE 1.5 API] Success
✅ [IMAGE ENGINE] API Response: {
  hasImageUrl: true,
  model: "gpt-image-1.5",
  isRealistic: true
}

✅ [NEW ENGINE] Master image generated
```

**환경변수 미설정 시 오류**:
```javascript
❌ [GPT IMAGE 1.5] Missing API key: OPENAI_API_KEY_GPT_IMAGE
{
  error: "Server configuration error: GPT Image API key not configured",
  details: "Please set OPENAI_API_KEY_GPT_IMAGE environment variable"
}
```

→ 이 오류가 나오면 환경변수 설정 후 재배포 필요

---

### **3. 다른 스타일 테스트 (기존 유지)**

**3D, 일러스트, 애니메이션**은 기존 DALL-E 3 사용:
```javascript
🔍 [IMAGE ENGINE] API Request: {
  url: "/api/generate-image",     // 기존 엔드포인트
  model: "dall-e-3",              // 기존 모델
  isRealistic: false
}
```

→ 기존 API 키 사용 (OPENAI_API_KEY)

---

## 📊 **경로 분리 구조**

```
실사 (📸)
├─ 모델: gpt-image-1.5 (최신)
├─ 엔드포인트: /api/generate-image-realistic
├─ API 키: OPENAI_API_KEY_GPT_IMAGE (새 키)
└─ 품질: Ultra-realistic, 4K, 포토저널리즘

3D / 일러스트 / 애니메이션 (🎮 ✏️ 🎬)
├─ 모델: dall-e-3 (기존)
├─ 엔드포인트: /api/generate-image
├─ API 키: OPENAI_API_KEY (기존 키)
└─ 품질: 기존 유지
```

---

## 🔍 **디버깅 가이드**

### **문제 1: 환경변수 오류**
```
Server configuration error: GPT Image API key not configured
```

**해결**:
1. Cloudflare Dashboard → Settings → Environment variables
2. `OPENAI_API_KEY_GPT_IMAGE` 변수 추가
3. **재배포 필수!**

---

### **문제 2: 401 Unauthorized**
```
OpenAI API Error 401: Incorrect API key provided
```

**해결**:
1. OpenAI API 키가 올바른지 확인
2. `sk-proj-2026story...` 형식인지 확인
3. 키에 공백이나 줄바꿈이 없는지 확인

---

### **문제 3: 실사 이미지가 일러스트처럼 나옴**
```javascript
// 콘솔에서 확인
isRealistic: true  // ← 이게 true인지 확인
model: "gpt-image-1.5"  // ← 모델이 맞는지 확인
```

**해결**:
- 스타일 선택을 **실사 (📸)** 로 명확히 선택했는지 확인
- 다른 스타일이 아닌지 확인

---

## 📝 **환경변수 목록**

현재 프로젝트에서 사용하는 환경변수:

| 변수명 | 용도 | 모델 | 엔드포인트 |
|--------|------|------|-----------|
| `OPENAI_API_KEY` | 기존 이미지 생성 (일러스트 등) | DALL-E 3 | `/api/generate-image` |
| `OPENAI_API_KEY_GPT_IMAGE` | 🆕 실사 전용 | GPT Image 1.5 | `/api/generate-image-realistic` |

---

## 🚀 **테스트 체크리스트**

### **환경변수 설정 완료 후**

- [ ] Cloudflare Dashboard에서 `OPENAI_API_KEY_GPT_IMAGE` 추가
- [ ] 프로젝트 재배포
- [ ] 실사 스타일 선택
- [ ] 마스터 이미지 생성
- [ ] 콘솔에서 `isRealistic: true` 확인
- [ ] 콘솔에서 `model: "gpt-image-1.5"` 확인
- [ ] 이미지 품질이 초사실적인지 확인
- [ ] 3D/일러스트도 정상 작동하는지 확인

---

## 📸 **기대 효과**

### **GPT Image 1.5로 개선되는 점**:
1. ✅ 초사실적인 피부 질감
2. ✅ 자연스러운 조명과 그림자
3. ✅ 진짜 DSLR 카메라 느낌
4. ✅ 포토저널리즘 품질
5. ✅ 4K 수준 디테일
6. ✅ 필름 그레인 효과

### **프롬프트 강화**:
```
Before (gpt-image-1):
"Photojournalism style. Natural lighting..."

After (gpt-image-1.5):
"Ultra-realistic photojournalism style.
Professional DSLR camera, 50mm f/1.8 lens.
Natural daylight, soft ambient lighting.
Cinematic depth of field, bokeh background.
Sharp focus on subjects, 4K quality..."
```

---

## 💰 **비용 관리**

### **GPT Image 1.5 (예상)**:
- 해상도: 1536x1024
- 예상 가격: ~$0.10-0.15/이미지
- 테스트 50장: ~$5-7.5

### **기존 DALL-E 3**:
- 해상도: 1024x1024
- 가격: ~$0.04/이미지
- 계속 사용 (3D, 일러스트, 애니메이션)

**총 비용**: 실사만 새 API 키 사용, 나머지는 기존 유지

---

## 🎯 **다음 단계**

1. **환경변수 설정** ← 지금 할 일!
2. **재배포**
3. **실사 테스트**
4. **품질 비교** (기존 vs GPT Image 1.5)
5. **피드백**

---

**준비되셨으면 환경변수 설정 후 "설정 완료"라고 알려주세요!** 🚀
