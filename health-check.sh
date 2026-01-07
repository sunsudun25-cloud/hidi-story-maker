#!/bin/bash

# 🏥 Story Maker Health Check Script
# 5분마다 실행하여 서버 상태를 확인하고 필요시 자동 복구

LOG_FILE="/home/user/webapp/health-check.log"
MAX_LOG_SIZE=1048576  # 1MB

# 로그 크기 확인 및 로테이션
if [ -f "$LOG_FILE" ] && [ $(stat -f%z "$LOG_FILE" 2>/dev/null || stat -c%s "$LOG_FILE" 2>/dev/null) -gt $MAX_LOG_SIZE ]; then
  mv "$LOG_FILE" "$LOG_FILE.old"
fi

# 현재 시간
NOW=$(date '+%Y-%m-%d %H:%M:%S')

# 서버 응답 확인
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000 --connect-timeout 5 --max-time 10)

if [ "$HTTP_CODE" != "200" ]; then
  echo "[$NOW] ❌ Server health check failed (HTTP $HTTP_CODE)" >> "$LOG_FILE"
  
  # PM2 프로세스 상태 확인
  PM2_STATUS=$(pm2 jlist 2>/dev/null | grep -o '"name":"webapp"' | wc -l)
  
  if [ "$PM2_STATUS" -eq 0 ]; then
    echo "[$NOW] 🚀 PM2 process not found, starting webapp..." >> "$LOG_FILE"
    cd /home/user/webapp
    pm2 start ecosystem.config.cjs >> "$LOG_FILE" 2>&1
  else
    echo "[$NOW] 🔄 Restarting webapp..." >> "$LOG_FILE"
    cd /home/user/webapp
    pm2 restart webapp >> "$LOG_FILE" 2>&1
  fi
  
  # 재시작 후 확인
  sleep 5
  HTTP_CODE_AFTER=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000 --connect-timeout 5 --max-time 10)
  
  if [ "$HTTP_CODE_AFTER" = "200" ]; then
    echo "[$NOW] ✅ Server recovered successfully (HTTP $HTTP_CODE_AFTER)" >> "$LOG_FILE"
  else
    echo "[$NOW] ⚠️  Server recovery failed (HTTP $HTTP_CODE_AFTER)" >> "$LOG_FILE"
  fi
else
  # 정상 상태는 로그에 기록하지 않음 (로그 용량 절약)
  # echo "[$NOW] ✅ Server is healthy (HTTP $HTTP_CODE)" >> "$LOG_FILE"
  :
fi
