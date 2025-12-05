# 이미지 생성 API 설정 가이드

## ⚠️ 중요: Gemini API는 이미지 생성을 지원하지 않습니다!

현재 콘솔 에러의 주요 원인:
```
Failed to load resource: the server responded with a status of 403 ()
```

**Gemini API는 텍스트 생성만 지원합니다.** 이미지 생성 기능을 사용하려면 별도의 이미지 생성 API가 필요합니다.

---

## 🎨 이미지 생성 API 옵션

### 1. **OpenAI DALL-E 3** (추천) ⭐
- **장점**: 고품질, 한국어 프롬프트 지원, 간단한 API
- **가격**: $0.040/이미지 (1024x1024)
- **설정 난이도**: ⭐⭐ (쉬움)

**API Key 발급:**
1. https://platform.openai.com/api-keys 방문
2. **Create new secret key** 클릭
3. 키 복사 (예: `sk-proj-...`)

**환경 변수 설정:**
```bash
# .env 파일에 추가
VITE_OPENAI_API_KEY=sk-proj-your-api-key-here
```

**코드 예시:**
```typescript
const response = await fetch('https://api.openai.com/v1/images/generations', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`
  },
  body: JSON.stringify({
    model: "dall-e-3",
    prompt: "귀여운 고양이 그림, 수채화 스타일",
    n: 1,
    size: "1024x1024"
  })
});
```

---

### 2. **Stability AI (Stable Diffusion)**
- **장점**: 저렴, 다양한 모델, 커스터마이징 가능
- **가격**: $0.002-0.020/이미지
- **설정 난이도**: ⭐⭐⭐ (중간)

**API Key 발급:**
1. https://platform.stability.ai/account/keys 방문
2. **Create API Key** 클릭

**환경 변수:**
```bash
VITE_STABILITY_API_KEY=sk-your-api-key
```

---

### 3. **Replicate.com** (다양한 모델)
- **장점**: SDXL, Flux, Midjourney 스타일 모델 등 다양
- **가격**: $0.001-0.05/이미지 (모델별 상이)
- **설정 난이도**: ⭐⭐⭐⭐ (복잡)

**API Token 발급:**
1. https://replicate.com/account/api-tokens 방문
2. Token 생성

---

### 4. **Google Cloud Imagen API**
- **장점**: Google 제품, 고품질
- **단점**: 복잡한 설정, 높은 가격
- **가격**: $0.020-0.12/이미지
- **설정 난이도**: ⭐⭐⭐⭐⭐ (매우 복잡)

---

## 🚀 빠른 해결 방법 (OpenAI DALL-E 사용)

### 1단계: OpenAI API Key 발급
https://platform.openai.com/api-keys

### 2단계: `.env` 파일에 추가
```bash
VITE_OPENAI_API_KEY=sk-proj-your-api-key-here
```

### 3단계: `geminiService.ts` 수정

**새로운 `generateImage` 함수:**
```typescript
export async function generateImage(prompt: string, style?: string): Promise<string> {
  const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;

  if (!OPENAI_API_KEY) {
    throw new Error("⚠️ VITE_OPENAI_API_KEY가 설정되지 않았습니다!");
  }

  const fullPrompt = `${prompt}. Style: ${style || "illustration"}. High quality, no text.`;

  const response = await fetch('https://api.openai.com/v1/images/generations', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${OPENAI_API_KEY}`
    },
    body: JSON.stringify({
      model: "dall-e-3",
      prompt: fullPrompt,
      n: 1,
      size: "1024x1024",
      quality: "standard"
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("OpenAI API 오류:", errorText);
    throw new Error(`이미지 생성 실패: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  const imageUrl = data.data[0].url;

  if (!imageUrl) {
    throw new Error("이미지 URL을 받지 못했습니다.");
  }

  return imageUrl;
}
```

### 4단계: GitHub Actions Workflow 업데이트

`.github/workflows/deploy.yml`의 `Build project` 섹션에 추가:
```yaml
env:
  VITE_OPENAI_API_KEY: ${{ secrets.VITE_OPENAI_API_KEY }}
  VITE_GEMINI_API_KEY: AIzaSyDLyiqqcZgzCi09YmEtuPmMWXKS0EQlWos
  # ... (기존 환경 변수들)
```

### 5단계: GitHub Secrets 등록
1. https://github.com/sunsudun25-cloud/hidi-story-maker/settings/secrets/actions
2. **New repository secret** 클릭
3. Name: `VITE_OPENAI_API_KEY`
4. Value: `sk-proj-your-api-key`

---

## 💰 비용 예상

### OpenAI DALL-E 3:
- 이미지 1개: $0.040 (약 50원)
- 테스트 100회: $4 (약 5,000원)
- 월 1,000개: $40 (약 50,000원)

### Stability AI:
- 이미지 1개: $0.002-0.020
- 테스트 100회: $0.2-2
- 월 1,000개: $2-20

---

## ❓ FAQ

### Q: 무료로 이미지 생성할 수 있나요?
A: 아쉽게도 고품질 AI 이미지 생성은 대부분 유료입니다. 
   - OpenAI: 첫 $5 무료 크레딧 제공
   - Stability AI: 25 크레딧 무료 제공

### Q: Gemini로 이미지 생성이 안 되나요?
A: Gemini API는 텍스트 생성만 지원합니다. Google의 Imagen API는 별도 서비스입니다.

### Q: 다른 무료 대안은?
A: 
1. **Craiyon** (구 DALL-E mini) - 무료, 저품질
2. **Hugging Face Spaces** - 무료, 느림
3. **로컬 Stable Diffusion** - 무료, 서버 필요

---

## 🎯 추천 사항

**프로토타입/테스트 단계:**
- OpenAI DALL-E 3 ($5 무료 크레딧으로 시작)

**프로덕션 배포:**
- 비용 중시: Stability AI
- 품질 중시: OpenAI DALL-E 3
- 다양성 중시: Replicate.com

---

## 📞 도움이 필요하시면

이미지 생성 API를 선택하고, API Key를 발급받으신 후 알려주세요.
코드를 수정하여 통합해드리겠습니다! 🚀
