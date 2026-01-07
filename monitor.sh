#!/bin/bash

# 📊 Story Maker Monitoring Dashboard
# 서버 상태를 실시간으로 모니터링합니다.

clear

# ANSI 색상
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# 헤더
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}📊 Story Maker Monitoring Dashboard${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# 1. 시스템 정보
echo -e "${CYAN}🖥️  System Information${NC}"
echo -e "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
uptime | sed 's/^/  /'
echo ""

# 2. 메모리 사용량
echo -e "${CYAN}💾 Memory Usage${NC}"
echo -e "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
free -h | sed 's/^/  /'
echo ""

# 3. 디스크 사용량
echo -e "${CYAN}💿 Disk Usage${NC}"
echo -e "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
df -h /home/user/webapp | sed 's/^/  /'
echo ""

# 4. PM2 프로세스 상태
echo -e "${CYAN}🔄 PM2 Process Status${NC}"
echo -e "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
PM2_STATUS=$(pm2 jlist 2>/dev/null | grep -o '"name":"webapp"' | wc -l)

if [ "$PM2_STATUS" -gt 0 ]; then
  echo -e "  ${GREEN}✅ webapp is running${NC}"
  pm2 list | tail -n +4 | sed 's/^/  /'
else
  echo -e "  ${RED}❌ webapp is not running${NC}"
fi
echo ""

# 5. 서버 헬스 체크
echo -e "${CYAN}🏥 Server Health Check${NC}"
echo -e "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000 --connect-timeout 5 --max-time 10)

if [ "$HTTP_CODE" = "200" ]; then
  echo -e "  ${GREEN}✅ HTTP Status: $HTTP_CODE (Healthy)${NC}"
else
  echo -e "  ${RED}❌ HTTP Status: $HTTP_CODE (Unhealthy)${NC}"
fi

# 응답 시간 측정
RESPONSE_TIME=$(curl -s -o /dev/null -w "%{time_total}" http://localhost:3000 --connect-timeout 5 --max-time 10)
echo -e "  ⏱️  Response Time: ${RESPONSE_TIME}s"
echo ""

# 6. 포트 3000 확인
echo -e "${CYAN}🔌 Port 3000 Status${NC}"
echo -e "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
PORT_CHECK=$(lsof -i :3000 2>/dev/null || echo "")

if [ -n "$PORT_CHECK" ]; then
  echo -e "  ${GREEN}✅ Port 3000 is in use${NC}"
  lsof -i :3000 | sed 's/^/  /'
else
  echo -e "  ${RED}❌ Port 3000 is free${NC}"
fi
echo ""

# 7. 최근 로그 (에러만)
echo -e "${CYAN}📋 Recent Errors (Last 5)${NC}"
echo -e "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
if [ -f "/home/user/.pm2/logs/webapp-error-0.log" ]; then
  ERROR_COUNT=$(wc -l < /home/user/.pm2/logs/webapp-error-0.log)
  if [ "$ERROR_COUNT" -gt 0 ]; then
    tail -5 /home/user/.pm2/logs/webapp-error-0.log | sed 's/^/  /'
  else
    echo -e "  ${GREEN}✅ No errors${NC}"
  fi
else
  echo -e "  ${GREEN}✅ No error log file${NC}"
fi
echo ""

# 8. 헬스 체크 로그
echo -e "${CYAN}🏥 Health Check Log (Last 5)${NC}"
echo -e "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
if [ -f "/home/user/webapp/health-check.log" ]; then
  LOG_COUNT=$(wc -l < /home/user/webapp/health-check.log)
  if [ "$LOG_COUNT" -gt 0 ]; then
    tail -5 /home/user/webapp/health-check.log | sed 's/^/  /'
  else
    echo -e "  ${GREEN}✅ No health check logs yet${NC}"
  fi
else
  echo -e "  ${YELLOW}⚠️  Health check not configured${NC}"
fi
echo ""

# 9. 접속 URL
echo -e "${CYAN}🌐 Access URLs${NC}"
echo -e "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "  📍 Local:      ${GREEN}http://localhost:3000${NC}"
echo -e "  📍 Production: ${GREEN}https://story-maker-4l6.pages.dev${NC}"
echo ""

# 10. 빠른 액션
echo -e "${CYAN}⚡ Quick Actions${NC}"
echo -e "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "  pm2 restart webapp   - 서버 재시작"
echo -e "  pm2 logs webapp      - 로그 보기"
echo -e "  pm2 monit            - 실시간 모니터링"
echo -e "  ./health-check.sh    - 헬스 체크 수동 실행"
echo -e "  ./auto-recover.sh    - 자동 복구 실행"
echo ""

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}Last updated: $(date '+%Y-%m-%d %H:%M:%S')${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
