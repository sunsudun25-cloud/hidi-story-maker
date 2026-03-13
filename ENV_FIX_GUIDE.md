# 🔧 환경변수 오류 해결 가이드

## ❌ **현재 오류**
```
Server configuration error: GPT Image API key not configured
Please set OPENAI_API_KEY_GPT_IMAGE environment variable
```

## 🎯 **문제 원인**

Cloudflare Pages Functions에서 환경변수가 제대로 바인딩되지 않았습니다.

---

## ✅ **해결 방법 (단계별)**

### **1단계: 환경변수 다시 확인**

1. https://dash.cloudflare.com 접속
2. **Workers & Pages** → **story-maker-4l6**
3. **Settings** → **Environment variables** 스크롤
4. `OPENAI_API_KEY_GPT_IMAGE` 있는지 확인

**있으면**: 다음 단계로
**없으면**: 다시 추가 (Add variable)

---

### **2단계: 환경변수 타입 확인**

**중요**: Type이 **"Secret"**이어야 합니다!

만약 일반 Variable이면:
1. 기존 변수 삭제
2. 다시 추가할 때 **Type: Secret** 선택
3. Variable name: `OPENAI_API_KEY_GPT_IMAGE`
4. Value: `sk-proj-2026story...` (API 키)
5. Environment: **Production**

---

### **3단계: 환경변수 Rotate (재설정)**

이미 있다면, **Rotate** 버튼을 눌러 재설정:

1. 기존 `OPENAI_API_KEY_GPT_IMAGE` 옆 **...** (점 3개) 클릭
2. **Edit** 또는 **Rotate** 선택
3. API 키 다시 입력: `sk-proj-2026story...`
4. **Save** 클릭

---

### **4단계: 프로젝트 재배포 (필수!)**

환경변수를 수정했으면 **반드시 재배포**:

1. **Deployments** 탭 이동
2. 최신 배포 (`516417aa` 또는 가장 위) 옆 **⋮** 클릭
3. **Retry deployment** 선택
4. 새 배포 완료 대기 (1-2분)

---

### **5단계: 새 배포 URL로 테스트**

새 배포가 완료되면:
1. 새 URL 복사 (예: `https://abc123.story-maker-4l6-01i.pages.dev`)
2. 해당 URL 접속
3. 로그인: C6855 / 0001
4. 실사 스타일 선택 후 테스트
5. **F12** 눌러 콘솔 확인

---

## 🧪 **테스트 확인**

### **성공 시 로그**:
```javascript
✅ [GPT IMAGE 1.5 API] Request: {
  model: "gpt-image-1.5",
  ...
}
✅ [GPT IMAGE 1.5 API] Success
```

### **실패 시 로그** (여전히):
```javascript
❌ Server configuration error: GPT Image API key not configured
```

→ 이 경우 다음 방법 시도

---

## 🔄 **대안: CLI로 환경변수 설정**

Dashboard가 안 되면 CLI 사용:

### **Windows CMD/PowerShell에서**:

```bash
# 1. wrangler 로그인 (아직 안 했으면)
npx wrangler login

# 2. Secret 추가
npx wrangler pages secret put OPENAI_API_KEY_GPT_IMAGE --project-name story-maker-4l6

# 프롬프트가 나오면:
# Enter a secret value: [여기서 sk-proj-2026story... 입력]

# 3. Secret 확인
npx wrangler pages secret list --project-name story-maker-4l6
```

**출력 예상**:
```
┌─────────────────────────────┐
│ Secret Name                 │
├─────────────────────────────┤
│ OPENAI_API_KEY_GPT_IMAGE    │
└─────────────────────────────┘
```

---

## 🐛 **디버깅: 환경변수가 전달되는지 확인**

코드에 임시 로그를 추가해서 확인할 수 있습니다.

`functions/api/generate-image-realistic.ts` 파일에서:

```typescript
export async function onRequestPost(context: { request: Request; env: Env }): Promise<Response> {
  const { request, env } = context;

  // 🔍 디버깅: 환경변수 확인 (실제 값은 보이지 않음, 존재 여부만)
  console.log('🔍 [DEBUG] Environment check:', {
    hasKey: !!env.OPENAI_API_KEY_GPT_IMAGE,
    keyLength: env.OPENAI_API_KEY_GPT_IMAGE?.length || 0,
    keyPrefix: env.OPENAI_API_KEY_GPT_IMAGE?.substring(0, 10) || 'MISSING'
  });

  // 기존 코드...
}
```

이렇게 수정 후 재배포하면, 콘솔에서 환경변수가 전달되는지 확인 가능합니다.

---

## 📋 **체크리스트**

- [ ] Cloudflare Dashboard에서 `OPENAI_API_KEY_GPT_IMAGE` 확인
- [ ] Type이 "Secret"인지 확인
- [ ] Environment가 "Production"인지 확인
- [ ] API 키 값이 올바른지 확인 (`sk-proj-2026story...`)
- [ ] 환경변수 Rotate (재설정)
- [ ] 프로젝트 재배포 (Retry deployment)
- [ ] 새 URL로 테스트
- [ ] 콘솔에서 오류 메시지 확인

---

## 💡 **최종 확인 사항**

### **API 키 형식**
```
sk-proj-2026story로 시작
예: sk-proj-2026story1234abcd5678efgh...
```

### **환경변수 이름 (대소문자 정확히)**
```
OPENAI_API_KEY_GPT_IMAGE
```

### **프로젝트 이름**
```
story-maker-4l6
```

---

## 🚀 **완료 후**

환경변수가 제대로 설정되면:
1. 실사 스타일 → GPT Image 1.5 사용
2. 초사실적 품질
3. 다른 스타일 → 기존 DALL-E 3 사용

---

**문제가 계속되면 콘솔 로그 전체를 공유해주세요!**
