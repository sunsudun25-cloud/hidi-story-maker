# 프로덕션 환경 테스트 가이드

## 🚨 중요: 브라우저 캐시 완전 삭제 필수!

### **문제 증상**
- "API 키 설정이 없어요" 오류 발생
- 이미지 로딩 실패 (403 Blob URL 오류)
- 이전 이미지가 계속 표시됨

---

## ✅ 해결 방법

### **1단계: 브라우저 캐시 완전 삭제**

#### **Chrome/Edge**
```
1. F12 → Application 탭
2. Storage 섹션:
   - Local Storage → https://story-make-fbbd7.web.app 선택 → Clear All
   - Session Storage → Clear All
   - IndexedDB → myImageDB 선택 → Delete database
   - Cache Storage → workbox-precache 선택 → Delete
3. Network 탭:
   - ☑ Disable cache 체크
4. Console 탭:
   - 우클릭 → Clear console
5. 페이지 닫기 → 완전히 종료
```

#### **Firefox**
```
1. F12 → Storage 탭
2. 모든 항목 선택 후 삭제:
   - Local Storage
   - Session Storage
   - IndexedDB
   - Cache Storage
3. Network 탭:
   - ☑ Disable HTTP Cache 체크
4. 페이지 닫기 → 완전히 종료
```

---

### **2단계: 하드 리프레시**

#### **Windows/Linux**
```
Ctrl + Shift + R
또는
Ctrl + F5
```

#### **Mac**
```
Cmd + Shift + R
```

---

### **3단계: 시크릿/프라이빗 모드에서 테스트 (권장)**

#### **Chrome/Edge**
```
Ctrl + Shift + N (Windows/Linux)
Cmd + Shift + N (Mac)
```

#### **Firefox**
```
Ctrl + Shift + P (Windows/Linux)
Cmd + Shift + P (Mac)
```

**시크릿 모드 장점:**
- Service Worker 영향 없음
- 캐시 완전히 무시
- 실제 프로덕션 환경 테스트 가능

---

## 🧪 테스트 시나리오

### **직접 입력 이미지 생성**

```
1. 시크릿 모드에서 프로덕션 URL 접속
   https://story-make-fbbd7.web.app

2. F12 → Console 탭 열기

3. 홈 → 그림 그리기 → 직접 입력

4. 이미지 생성:
   - 설명: "파란 하늘을 나는 새"
   - 스타일: "동화풍"
   - "🚀 그림 만들기" 클릭

5. ⏳ 대기 (10-15초)

6. ✅ Console 로그 확인:
   ✅ [dalleService] OPENAI_API_KEY 확인됨: sk-proj-...
   🎨 [dalleService] DALL-E 3 이미지 생성 중 (Base64): ...
   📡 [dalleService] OpenAI API 호출 (Base64 요청)...
   📥 [dalleService] API 응답: { status: 200, ... }
   ✅ [dalleService] 이미지 생성 완료 (Base64, 길이: 324520)

7. ✅ 이미지 표시 확인
```

---

## 🐛 예상 오류와 해결

### **Case 1: "API 키 설정이 없어요"**
**원인**: Service Worker 캐시 문제
**해결**:
1. F12 → Application → Service Workers
2. "Unregister" 클릭
3. 페이지 새로고침

### **Case 2: 403 Blob URL 오류**
```
https://oaidalleapiprodscus.blob.core.windows.net/...
403: Server failed to authenticate
```
**원인**: 이전 세션의 URL이 캐시됨
**해결**:
1. IndexedDB 완전 삭제
2. 시크릿 모드에서 재테스트

### **Case 3: 이미지 생성 중 멈춤**
**원인**: OpenAI API 할당량 초과
**확인**: https://platform.openai.com/usage
**해결**: API 키 재충전

---

## 📊 정상 동작 확인 체크리스트

- [ ] F12 Console에 "✅ [dalleService] OPENAI_API_KEY 확인됨" 로그 나타남
- [ ] "📡 [dalleService] OpenAI API 호출" 로그 나타남
- [ ] "✅ [dalleService] 이미지 생성 완료 (Base64, 길이: ...)" 로그 나타남
- [ ] 생성된 이미지가 화면에 표시됨
- [ ] "📂 내 작품 보기"에서 이미지 1개만 저장됨
- [ ] 다운로드/공유 기능 정상 작동

---

## 🚀 배포 정보

| 항목 | 값 |
|-----|---|
| 커밋 | 5a3e9d6 |
| GitHub Secrets | ✅ VITE_OPENAI_API_KEY 설정됨 |
| 프로덕션 URL | https://story-make-fbbd7.web.app |
| 로컬 테스트 | ✅ 정상 (API 키 작동 확인) |

---

**문제가 지속되면 Console 로그 전체 스크린샷을 공유해주세요!**
