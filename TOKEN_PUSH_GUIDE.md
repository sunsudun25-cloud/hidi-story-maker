# 🚀 Token으로 푸시하기 - 단계별 가이드

## ✅ Token 생성 완료!

이제 토큰을 사용하여 코드를 GitHub에 푸시하겠습니다.

---

## 📝 푸시 명령어

### 방법 1: Token을 URL에 포함 (추천)

```bash
cd /home/user/webapp

git push https://YOUR_TOKEN@github.com/sunsudun25-cloud/hidi-story-maker.git main
```

**YOUR_TOKEN 부분을 실제 토큰으로 교체하세요!**

---

## 🔍 예시

**Token이 다음과 같다면:**
```
ghp_ABC123XYZ789DEF456GHI
```

**실제 명령어:**
```bash
git push https://ghp_ABC123XYZ789DEF456GHI@github.com/sunsudun25-cloud/hidi-story-maker.git main
```

---

## ✅ 성공 메시지

푸시가 성공하면 다음과 같은 메시지가 표시됩니다:

```
Enumerating objects: 80, done.
Counting objects: 100% (80/80), done.
Delta compression using up to 8 threads
Compressing objects: 100% (65/65), done.
Writing objects: 100% (80/80), 35.5 KiB | 3.5 MiB/s, done.
Total 80 (delta 25), reused 0 (delta 0), pack-reused 0
remote: Resolving deltas: 100% (25/25), done.
To https://github.com/sunsudun25-cloud/hidi-story-maker.git
 * [new branch]      main -> main
Branch 'main' set up to track remote branch 'main' from 'origin'.
```

**GitHub 저장소를 확인하세요:**
https://github.com/sunsudun25-cloud/hidi-story-maker

---

## 🔥 다음 단계 (푸시 성공 후)

### 1. Firebase 서비스 계정 다운로드
https://console.firebase.google.com/project/story-make-fbbd7/settings/serviceaccounts/adminsdk
→ "새 비공개 키 생성" 클릭

### 2. GitHub Secrets 등록
https://github.com/sunsudun25-cloud/hidi-story-maker/settings/secrets/actions
→ `FIREBASE_SERVICE_ACCOUNT` 추가

### 3. Actions 권한 설정
https://github.com/sunsudun25-cloud/hidi-story-maker/settings/actions
→ "Read and write permissions" 선택

### 4. 배포 확인
https://story-make-fbbd7.web.app

---

**지금 위 명령어를 실행해주세요!**
