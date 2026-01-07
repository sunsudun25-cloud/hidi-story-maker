# 🔍 서버 중단 원인 분석 보고서

## 📊 분석 결과

### 🎯 주요 원인: **샌드박스 시스템 재부팅**

**발생 시간**: 2026년 1월 7일 오전 6:58 (KST 기준)

```
runlevel (to lvl 5)   6.1.102    Wed Jan  7 06:59   still running
reboot   system boot  6.1.102    Wed Jan  7 06:58   still running
```

---

## 🔍 상세 분석

### 1️⃣ 시스템 재부팅 확인
- **마지막 재부팅**: 2026-01-07 06:58 (약 26분 전)
- **이전 재부팅**: 2025-10-27 13:24 (71일 전)
- **결론**: 샌드박스 환경이 완전히 재시작됨

### 2️⃣ PM2 프로세스 상태
- **현재 가동 시간**: 79초 (방금 재시작됨)
- **재시작 횟수**: 0회
- **생성 시간**: 2026-01-07T07:22:48 (사용자가 수동으로 시작)
- **이전 프로세스**: 모두 삭제됨

### 3️⃣ PM2 로그 분석
**이전 프로세스 종료 기록** (2025-12-08):
```
2025-12-08T21:41:56: PM2 log: pid=80700 msg=process killed
2025-12-08T21:43:13: PM2 log: pid=80860 msg=process killed
2025-12-08T21:47:39: PM2 log: pid=80975 msg=process killed
2025-12-08T21:50:29: PM2 log: pid=81144 msg=process killed
2025-12-08T21:57:47: PM2 log: pid=81303 msg=process killed
```

**특징**:
- 짧은 간격으로 반복 종료 (2-7분 간격)
- 모두 `process killed` 메시지
- 이는 **정상 종료가 아닌 강제 종료**를 의미

### 4️⃣ 메모리 상태
**현재 시스템 메모리**:
```
Total:     987 MB
Used:      533 MB (54%)
Free:      257 MB (26%)
Available: 453 MB (46%)
```

**webapp 프로세스 메모리**:
```
Used Heap:  13.33 MB
Heap Usage: 89.74% (높음!)
Heap Size:  14.85 MB
```

**분석**:
- Heap 사용률이 89.74%로 매우 높음
- 메모리 누수 가능성 있음
- 장시간 실행 시 메모리 부족으로 자동 종료될 수 있음

---

## 🎯 왜 서버가 중단되었나?

### **최종 결론**: 3가지 원인의 복합 작용

#### 1️⃣ **샌드박스 재부팅 (주 원인)** ⭐️
- 샌드박스 환경이 2026-01-07 06:58에 재부팅됨
- PM2는 시스템 재부팅 시 자동으로 프로세스를 복구하지 못함
- **PM2는 startup 스크립트가 없으면 재부팅 후 프로세스를 자동 시작하지 않음**

#### 2️⃣ **PM2 자동 시작 미설정** ⭐️
PM2는 다음이 설정되지 않으면 재부팅 후 자동 시작되지 않습니다:
```bash
pm2 startup  # 자동 시작 등록 (설정 안 됨)
pm2 save     # 현재 프로세스 목록 저장 (설정 안 됨)
```

#### 3️⃣ **메모리 누수 가능성** (부가 원인)
- Heap 사용률 89.74%로 매우 높음
- 이전 로그에서 반복적인 프로세스 종료 발견
- 장시간 실행 시 OOM (Out of Memory)로 강제 종료 가능성

---

## 🛡️ 재발 방지 솔루션

### ✅ 해결책 1: PM2 자동 시작 설정 (권장) ⭐️

**설정 방법**:
```bash
# 1. PM2 startup 스크립트 생성
pm2 startup

# 위 명령어가 출력하는 명령어를 실행 (예시):
# sudo env PATH=$PATH:/usr/bin pm2 startup systemd -u user --hp /home/user

# 2. 현재 프로세스 목록 저장
pm2 save

# 3. 확인
pm2 list
```

**효과**:
- ✅ 시스템 재부팅 시 PM2가 자동으로 시작됨
- ✅ 저장된 프로세스 목록이 자동으로 복구됨
- ✅ 수동 개입 불필요

---

### ✅ 해결책 2: 헬스 체크 스크립트 (추가 보호)

**스크립트 생성**:
```bash
#!/bin/bash
# /home/user/webapp/health-check.sh

# 서버가 응답하지 않으면 재시작
curl -f http://localhost:3000 > /dev/null 2>&1
if [ $? -ne 0 ]; then
  echo "$(date): Server down, restarting..."
  cd /home/user/webapp
  pm2 restart webapp
fi
```

**Cron 설정**:
```bash
# 5분마다 헬스 체크
*/5 * * * * /home/user/webapp/health-check.sh >> /home/user/webapp/health-check.log 2>&1
```

---

### ✅ 해결책 3: PM2 모니터링 설정

**메모리 제한 설정**:
```javascript
// ecosystem.config.cjs
module.exports = {
  apps: [{
    name: 'webapp',
    script: 'npx',
    args: 'vite --host 0.0.0.0 --port 3000',
    max_memory_restart: '200M',  // 200MB 초과 시 자동 재시작
    autorestart: true,            // 자동 재시작 활성화
    max_restarts: 10,             // 최대 재시작 횟수
    min_uptime: '10s',            // 최소 가동 시간
    restart_delay: 4000,          // 재시작 지연 (4초)
  }]
}
```

---

### ✅ 해결책 4: 메모리 누수 방지

**Vite 개발 서버 최적화**:
```javascript
// vite.config.ts
export default defineConfig({
  server: {
    watch: {
      // 불필요한 파일 감시 제외
      ignored: ['**/node_modules/**', '**/dist/**', '**/.git/**']
    },
    // HMR 연결 제한
    hmr: {
      overlay: true
    }
  }
})
```

---

## 📊 비교: Before vs After

### Before (현재)
- ❌ 시스템 재부팅 시 서버 자동 시작 안 됨
- ❌ PM2 프로세스 목록 저장 안 됨
- ❌ 메모리 제한 없음 (무한정 증가 가능)
- ❌ 헬스 체크 없음
- ❌ 수동 복구 필요

### After (개선 후)
- ✅ 시스템 재부팅 시 PM2가 자동으로 프로세스 복구
- ✅ PM2 프로세스 목록 자동 저장 및 복원
- ✅ 메모리 200MB 초과 시 자동 재시작
- ✅ 5분마다 헬스 체크 및 자동 복구
- ✅ 완전 자동화 (수동 개입 불필요)

---

## 🚀 즉시 적용 가이드

### Step 1: PM2 자동 시작 설정
```bash
cd /home/user/webapp

# PM2 startup 설정
pm2 startup

# 현재 프로세스 저장
pm2 save

# 확인
pm2 list
```

### Step 2: ecosystem.config.cjs 개선
```bash
# 현재 파일 백업
cp ecosystem.config.cjs ecosystem.config.cjs.backup

# 메모리 제한 추가 (수동 편집 필요)
# max_memory_restart: '200M' 추가
```

### Step 3: 헬스 체크 스크립트 생성
```bash
# 스크립트 생성
cat > /home/user/webapp/health-check.sh << 'EOF'
#!/bin/bash
curl -f http://localhost:3000 > /dev/null 2>&1
if [ $? -ne 0 ]; then
  echo "$(date): Server down, restarting..."
  cd /home/user/webapp
  pm2 restart webapp
fi
EOF

# 실행 권한 부여
chmod +x /home/user/webapp/health-check.sh

# Cron 등록 (선택사항)
# crontab -e
# */5 * * * * /home/user/webapp/health-check.sh >> /home/user/webapp/health-check.log 2>&1
```

---

## 📝 요약

### 문제
- 샌드박스가 06:58에 재부팅됨
- PM2 자동 시작이 설정되지 않아 프로세스가 복구되지 않음
- 메모리 사용률이 높아 장시간 실행 시 위험

### 해결
1. **PM2 자동 시작 설정** (`pm2 startup` + `pm2 save`)
2. **메모리 제한 설정** (200MB 초과 시 재시작)
3. **헬스 체크 스크립트** (5분마다 확인)

### 결과
- ✅ 재부팅 시 자동 복구
- ✅ 메모리 누수 방지
- ✅ 다운타임 최소화
- ✅ 완전 자동화

---

## 🎯 다음 작업

다음 중 하나를 선택하여 진행하세요:

1. **PM2 자동 시작 설정하기** (가장 중요)
2. **ecosystem.config.cjs 개선하기** (메모리 제한)
3. **헬스 체크 스크립트 만들기** (추가 보호)
4. **Cloudflare Pages에 배포하기** (프로덕션 환경)

---

**생성 일시**: 2026-01-07
**분석 대상**: Story Maker (webapp)
**샌드박스 ID**: i5dcsscuqxml7neuit43a-de59bda9
