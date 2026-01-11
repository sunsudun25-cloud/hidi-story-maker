#!/bin/bash

BASE_URL="https://asia-northeast1-story-make-fbbd7.cloudfunctions.net"

echo "🎓 테스트 수업 생성 중..."
echo ""

RESPONSE=$(curl -s -X POST \
  ${BASE_URL}/classCreate \
  -H "Content-Type: application/json" \
  -d '{
    "className": "Story Maker 체험반",
    "instructorName": "김선생님",
    "instructorPin": "123456"
  }')

echo "✅ 수업 생성 완료!"
echo ""
echo "$RESPONSE" | python3 -m json.tool
echo ""

CLASS_CODE=$(echo "$RESPONSE" | grep -o '"classCode":"[^"]*"' | cut -d'"' -f4)

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📋 수업 정보"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "수업 코드: $CLASS_CODE"
echo "수업 이름: Story Maker 체험반"
echo "강사: 김선생님"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "🎯 이제 앱에서 로그인 테스트:"
echo "   1. https://story-maker-4l6.pages.dev 접속"
echo "   2. '🎓 수업 코드로 시작하기' 클릭"
echo "   3. 수업 코드: $CLASS_CODE"
echo "   4. 학생 번호: 01"
echo "   5. '✓ 입장하기' 클릭"
echo ""
