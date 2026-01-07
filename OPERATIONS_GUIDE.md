# 🛠️ Story Maker 운영 가이드

## 📋 목차
1. [일상 운영](#일상-운영)
2. [문제 해결](#문제-해결)
3. [모니터링](#모니터링)
4. [백업 및 복구](#백업-및-복구)
5. [배포](#배포)

---

## 🔄 일상 운영

### 서버 상태 확인
```bash
# 빠른 대시보드
cd /home/user/webapp
./monitor.sh

# PM2 상태 확인
pm2 list

# 실시간 모니터링
pm2 monit
```

### 서버 재시작
```bash
# 일반 재시작
pm2 restart webapp

# 포트 정리 후 재시작
cd /home/user/webapp
fuser -k 3000/tcp 2>/dev/null || true
pm2 restart webapp

# 완전 재시작 (빌드 포함)
cd /home/user/webapp
npm run build
pm2 restart webapp
```

### 로그 확인
```bash
# 실시간 로그
pm2 logs webapp

# 최근 로그만 (블로킹 없음)
pm2 logs webapp --nostream

# 에러 로그만
pm2 logs webapp --err

# 출력 로그만
pm2 logs webapp --out

# 로그 파일 직접 확인
tail -f /home/user/.pm2/logs/webapp-out-0.log
tail -f /home/user/.pm2/logs/webapp-error-0.log
```

---

## 🔥 문제 해결

### 시나리오 1: 서버가 응답하지 않음

**증상**: 브라우저에서 접속 안 됨, HTTP 에러

**해결 단계**:
```bash
# 1. 현재 상태 확인
./monitor.sh

# 2. PM2 프로세스 확인
pm2 list

# 3. 서버 응답 확인
curl http://localhost:3000

# 4. 헬스 체크 실행
./health-check.sh

# 5. 자동 복구 실행
./auto-recover.sh
```

**수동 복구**:
```bash
cd /home/user/webapp
fuser -k 3000/tcp 2>/dev/null || true
npm run build
pm2 delete webapp 2>/dev/null || true
pm2 start ecosystem.config.cjs
pm2 save
```

---

### 시나리오 2: 메모리 부족

**증상**: 서버가 자주 재시작됨, PM2 로그에 "memory limit" 메시지

**해결 단계**:
```bash
# 1. 현재 메모리 사용량 확인
free -h
pm2 describe webapp

# 2. 메모리 제한 확인 (ecosystem.config.cjs)
grep max_memory_restart ecosystem.config.cjs

# 3. 메모리 누수 확인
pm2 monit  # 메모리 사용량이 계속 증가하는지 확인

# 4. 해결 방법
# Option A: 메모리 제한 증가 (ecosystem.config.cjs)
# max_memory_restart: '300M'  (200M → 300M)

# Option B: 서버 재시작 주기 설정
# cron: '0 */6 * * *'  # 6시간마다 재시작
```

**메모리 누수 방지**:
- Vite 개발 서버는 장시간 실행 시 메모리 누수 가능
- **권장**: 프로덕션은 Cloudflare Pages 사용
- **개발**: 6-12시간마다 재시작 권장

---

### 시나리오 3: 샌드박스 재부팅 후 서버 안 살아남

**증상**: 시스템 재부팅 후 서버 자동 시작 안 됨

**현재 상황**:
- PM2 startup이 설정되지 않음 (샌드박스 제약)
- `pm2 save`로 프로세스 목록은 저장됨

**해결 단계**:
```bash
# 1. 자동 복구 스크립트 실행
cd /home/user/webapp
./auto-recover.sh

# 2. 수동 복구
cd /home/user/webapp
npm run build
pm2 start ecosystem.config.cjs
pm2 save
```

**근본 해결** (샌드박스에서 가능한 경우):
```bash
# PM2 startup 설정
pm2 startup
# 출력된 명령어 실행 (sudo 권한 필요)
pm2 save
```

---

### 시나리오 4: 포트 3000이 이미 사용 중

**증상**: "EADDRINUSE: address already in use :::3000"

**해결 단계**:
```bash
# 1. 포트 사용 프로세스 확인
lsof -i :3000

# 2. 프로세스 종료
fuser -k 3000/tcp

# 3. 또는 특정 PID 종료
kill -9 <PID>

# 4. PM2로 재시작
pm2 restart webapp
```

---

### 시나리오 5: 빌드 실패

**증상**: `npm run build` 실패, 에러 메시지

**해결 단계**:
```bash
# 1. node_modules 삭제 및 재설치
cd /home/user/webapp
rm -rf node_modules package-lock.json
npm install

# 2. 캐시 정리
npm cache clean --force

# 3. 다시 빌드
npm run build

# 4. 성공하면 서버 시작
pm2 restart webapp
```

---

## 📊 모니터링

### 모니터링 대시보드
```bash
# 종합 대시보드
./monitor.sh

# PM2 실시간 모니터링 (CPU, Memory)
pm2 monit

# PM2 웹 대시보드 (선택사항)
pm2 web
# http://localhost:9615 접속
```

### 주요 지표

| 지표 | 정상 범위 | 경고 | 위험 |
|------|-----------|------|------|
| **CPU 사용률** | 0-30% | 30-70% | 70%+ |
| **메모리 사용률** | 0-150MB | 150-180MB | 180MB+ |
| **HTTP 응답 시간** | <0.1초 | 0.1-0.5초 | 0.5초+ |
| **재시작 횟수** | 0-2회/일 | 2-5회/일 | 5회+/일 |

### 자동 모니터링 설정

**Cron으로 헬스 체크 설정**:
```bash
# Crontab 편집
crontab -e

# 아래 추가 (5분마다 헬스 체크)
*/5 * * * * /home/user/webapp/health-check.sh

# 로그 확인
tail -f /home/user/webapp/health-check.log
```

**일일 리포트 생성**:
```bash
# 매일 오전 9시에 모니터링 리포트 생성
0 9 * * * /home/user/webapp/monitor.sh > /home/user/webapp/daily-report-$(date +\%Y\%m\%d).txt
```

---

## 💾 백업 및 복구

### 자동 백업 설정

**Git으로 코드 백업**:
```bash
# 현재 상태 저장
cd /home/user/webapp
git add .
git commit -m "backup: $(date '+%Y-%m-%d %H:%M:%S')"
git push origin main
```

**PM2 프로세스 목록 백업**:
```bash
# PM2 프로세스 저장
pm2 save

# 백업 파일 위치
ls -lh /home/user/.pm2/dump.pm2
```

**작품 데이터 백업** (IndexedDB):
- 현재: 브라우저 로컬 저장
- 추후: Firebase로 자동 백업 (수업 시스템)

---

### 복구 절차

**전체 복구 (재부팅 후)**:
```bash
cd /home/user/webapp
./auto-recover.sh
```

**코드 복구 (GitHub에서)**:
```bash
cd /home/user/webapp
git fetch origin main
git reset --hard origin/main
npm install
npm run build
pm2 restart webapp
```

**PM2 프로세스 복구**:
```bash
pm2 resurrect
# 또는
pm2 start ecosystem.config.cjs
```

---

## 🚀 배포

### 개발 환경 (Sandbox)

**현재 실행 중**:
- URL: https://3000-i5dcsscuqxml7neuit43a-de59bda9.sandbox.novita.ai
- 포트: 3000
- 프로세스: PM2 (webapp)

**업데이트 방법**:
```bash
cd /home/user/webapp
git pull origin main
npm install
npm run build
pm2 restart webapp
```

---

### 프로덕션 환경 (Cloudflare Pages)

**현재 배포 URL**:
- https://story-maker-4l6.pages.dev

**배포 방법**:
```bash
# 1. 빌드
cd /home/user/webapp
npm run build

# 2. Cloudflare Pages 배포
npx wrangler pages deploy dist --project-name story-maker

# 3. 확인
curl https://story-maker-4l6.pages.dev
```

**자동 배포** (GitHub Actions):
- GitHub에 push하면 자동 배포
- 현재 설정: main 브랜치

---

## 🎯 빠른 참조

### 자주 사용하는 명령어

```bash
# 서버 상태 확인
./monitor.sh

# 서버 재시작
pm2 restart webapp

# 로그 확인
pm2 logs webapp --nostream

# 헬스 체크
./health-check.sh

# 자동 복구
./auto-recover.sh

# 전체 재빌드
npm run build && pm2 restart webapp

# 프로덕션 배포
npm run build && npx wrangler pages deploy dist --project-name story-maker
```

---

### 스크립트 정리

| 스크립트 | 용도 | 실행 빈도 |
|----------|------|-----------|
| `monitor.sh` | 서버 상태 대시보드 | 수시 |
| `health-check.sh` | 서버 헬스 체크 및 자동 복구 | 5분마다 (cron) |
| `auto-recover.sh` | 재부팅 후 자동 복구 | 재부팅 시 |
| `quick-test.sh` | Firebase Functions 테스트 | 배포 후 |

---

## 📞 긴급 연락처

**문제 발생 시**:
1. `./monitor.sh` 실행하여 현재 상태 파악
2. `./health-check.sh` 실행하여 자동 복구 시도
3. `./auto-recover.sh` 실행하여 완전 복구
4. 여전히 실패 시 수동 개입

**관련 문서**:
- `SERVER_DOWN_ANALYSIS.md` - 서버 중단 원인 분석
- `TESTING_GUIDE.md` - 테스트 가이드
- `CLASSROOM_DEPLOYMENT_GUIDE.md` - Firebase Functions 배포
- `README.md` - 프로젝트 전체 개요

---

**마지막 업데이트**: 2026-01-07
**문서 버전**: 1.0
