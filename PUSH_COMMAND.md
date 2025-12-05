# GitHub 푸시 명령어

## 🔐 토큰을 사용한 푸시 방법

생성하신 GitHub Personal Access Token을 아래 명령어에 넣어서 실행하세요:

```bash
cd /home/user/webapp
git push https://YOUR_TOKEN@github.com/sunsudun25-cloud/hidi-story-maker.git main
```

## 📋 단계별 가이드

### 1️⃣ 토큰 복사
- GitHub Settings > Developer settings > Personal access tokens에서 생성한 토큰 복사
- 형식: `ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx` (40자 정도)

### 2️⃣ 명령어 작성
```bash
# 예시 (실제 토큰으로 교체 필요)
git push https://ghp_1A2B3C4D5E6F7G8H9I0J1K2L3M4N5O6P7Q8R9S0T@github.com/sunsudun25-cloud/hidi-story-maker.git main
```

### 3️⃣ 실행
터미널에서 위 명령어 실행

### 4️⃣ 성공 메시지 확인
```
Enumerating objects: X, done.
Counting objects: 100% (X/X), done.
...
To https://github.com/sunsudun25-cloud/hidi-story-maker.git
 * [new branch]      main -> main
Branch 'main' set up to track remote branch 'main' from 'origin'.
```

## ✅ 푸시 성공 후 확인사항

1. **GitHub 저장소 확인**
   - https://github.com/sunsudun25-cloud/hidi-story-maker
   - 코드가 올라갔는지 확인

2. **GitHub Actions 자동 배포**
   - https://github.com/sunsudun25-cloud/hidi-story-maker/actions
   - 첫 번째 workflow가 자동 실행됨 (단, Firebase Service Account 설정 필요)

3. **다음 단계: Firebase 자동 배포 설정**
   - Firebase Console에서 Service Account JSON 다운로드
   - GitHub Secrets에 `FIREBASE_SERVICE_ACCOUNT` 등록
   - 자동 배포 완료!

## 🔄 이후 푸시 방법

토큰이 credential helper에 저장되면, 다음부터는 간단하게:
```bash
git push
```

## 📚 참고 문서
- `FINAL_PUSH_INSTRUCTIONS.md` - 전체 배포 워크플로우
- `GITHUB_AUTH_STEPS.md` - GitHub 인증 상세 가이드
- `HOW_TO_DEPLOY.md` - Firebase 배포 가이드
