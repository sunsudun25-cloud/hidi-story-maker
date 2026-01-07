#!/bin/bash

# 🔄 Auto Recovery Script
# 샌드박스 재부팅 후 자동으로 서버를 복구합니다.

set -e

WEBAPP_DIR="/home/user/webapp"
LOG_FILE="$WEBAPP_DIR/auto-recover.log"

# 로그 함수
log() {
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

log "=========================================="
log "🔄 Auto Recovery Script Started"
log "=========================================="

# 1. 작업 디렉토리 확인
if [ ! -d "$WEBAPP_DIR" ]; then
  log "❌ ERROR: Directory $WEBAPP_DIR not found"
  exit 1
fi

cd "$WEBAPP_DIR"
log "✅ Working directory: $(pwd)"

# 2. PM2 상태 확인
PM2_RUNNING=$(pm2 jlist 2>/dev/null | grep -c '"name":"webapp"' || echo "0")

if [ "$PM2_RUNNING" -gt 0 ]; then
  log "✅ PM2 process already running"
  pm2 list
  exit 0
fi

log "⚠️  PM2 process not found, starting recovery..."

# 3. 포트 3000 정리
log "🧹 Cleaning port 3000..."
fuser -k 3000/tcp 2>/dev/null || true
sleep 2

# 4. 최신 코드 확인 (선택사항)
if [ -d ".git" ]; then
  log "📥 Checking for updates..."
  git fetch origin main 2>&1 | tee -a "$LOG_FILE"
  
  LOCAL=$(git rev-parse HEAD)
  REMOTE=$(git rev-parse origin/main)
  
  if [ "$LOCAL" != "$REMOTE" ]; then
    log "🔄 Updates found, pulling..."
    git pull origin main 2>&1 | tee -a "$LOG_FILE"
  else
    log "✅ Code is up to date"
  fi
fi

# 5. 의존성 확인
if [ ! -d "node_modules" ]; then
  log "📦 Installing dependencies..."
  npm install 2>&1 | tee -a "$LOG_FILE"
fi

# 6. 빌드
log "🏗️  Building project..."
npm run build 2>&1 | tee -a "$LOG_FILE"

# 7. PM2로 시작
log "🚀 Starting webapp with PM2..."
pm2 start ecosystem.config.cjs 2>&1 | tee -a "$LOG_FILE"

# 8. 5초 대기 후 상태 확인
sleep 5

# 9. 서버 응답 확인
log "🏥 Checking server health..."
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000 --connect-timeout 5 --max-time 10)

if [ "$HTTP_CODE" = "200" ]; then
  log "✅ Server is healthy (HTTP $HTTP_CODE)"
  log "🎉 Recovery completed successfully!"
else
  log "⚠️  Server health check failed (HTTP $HTTP_CODE)"
  log "📊 PM2 Status:"
  pm2 list | tee -a "$LOG_FILE"
  log "📋 PM2 Logs:"
  pm2 logs webapp --nostream --lines 20 | tee -a "$LOG_FILE"
fi

# 10. PM2 프로세스 저장
log "💾 Saving PM2 process list..."
pm2 save 2>&1 | tee -a "$LOG_FILE"

log "=========================================="
log "🏁 Auto Recovery Script Completed"
log "=========================================="
