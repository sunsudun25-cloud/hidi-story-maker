# ⚡ Firebase 배포 빠른 체크리스트

## ✅ 완료 상태
- [x] GitHub 저장소 생성 완료
- [x] 코드 푸시 완료
- [ ] Firebase Service Account 다운로드
- [ ] GitHub Secrets 등록
- [ ] GitHub Actions 워크플로우 추가
- [ ] 배포 확인

---

## 🚀 3단계 배포 가이드

### 1️⃣ Firebase Service Account (3분)
```
1. 방문: https://console.firebase.google.com/project/story-make-fbbd7/settings/serviceaccounts/adminsdk
2. "새 비공개 키 생성" 클릭
3. JSON 파일 다운로드
4. 전체 내용 복사
```

### 2️⃣ GitHub Secrets (5분)
```
1. 방문: https://github.com/sunsudun25-cloud/hidi-story-maker/settings/secrets/actions
2. "New repository secret" 클릭
3. Name: FIREBASE_SERVICE_ACCOUNT
4. Value: JSON 전체 내용 붙여넣기
5. "Add secret" 클릭
```

### 3️⃣ GitHub Actions 워크플로우 (3분)
```
1. 방문: https://github.com/sunsudun25-cloud/hidi-story-maker
2. "Add file" → "Create new file"
3. 파일명: .github/workflows/firebase-deploy.yml
4. 워크플로우 코드 복사 (DEPLOYMENT_SETUP_GUIDE.md 참고)
5. "Commit changes" 클릭
```

---

## 🔗 빠른 링크

### 필수 링크
- 📦 **Firebase Console**: https://console.firebase.google.com/project/story-make-fbbd7/settings/serviceaccounts/adminsdk
- 🔐 **GitHub Secrets**: https://github.com/sunsudun25-cloud/hidi-story-maker/settings/secrets/actions
- 📝 **GitHub 저장소**: https://github.com/sunsudun25-cloud/hidi-story-maker

### 확인 링크
- ⚙️ **GitHub Actions**: https://github.com/sunsudun25-cloud/hidi-story-maker/actions
- 🌐 **프로덕션 사이트**: https://story-make-fbbd7.web.app
- 📊 **Firebase Hosting**: https://console.firebase.google.com/project/story-make-fbbd7/hosting

---

## 💡 팁

### Secret 등록 시 주의사항
- JSON 전체를 복사하세요 (첫 `{`부터 마지막 `}`까지)
- 줄바꿈, 들여쓰기 모두 포함
- Name은 정확히 `FIREBASE_SERVICE_ACCOUNT` (대소문자 구분)

### 배포 확인
- GitHub Actions 실행: 2-3분 소요
- 초록색 ✅ = 성공
- 빨간색 ❌ = 실패 (로그 확인)

### 자동 배포
```bash
# 이후 모든 푸시는 자동 배포됩니다
git add .
git commit -m "새 기능 추가"
git push origin main
# → 2-3분 후 https://story-make-fbbd7.web.app 업데이트!
```

---

## 🐛 문제 발생 시

1. **Actions 실행 안됨**: [Actions 권한 설정](https://github.com/sunsudun25-cloud/hidi-story-maker/settings/actions)
2. **빌드 실패**: [Actions 로그](https://github.com/sunsudun25-cloud/hidi-story-maker/actions) 확인
3. **사이트 작동 안됨**: 브라우저 캐시 삭제 (Ctrl+Shift+R)

자세한 문제 해결은 `DEPLOYMENT_SETUP_GUIDE.md` 참고!

---

**예상 소요 시간: 총 11분** ⏱️
