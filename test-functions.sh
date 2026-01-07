#!/bin/bash

# Firebase Functions API 테스트 스크립트
# 사용법: ./test-functions.sh [local|production]

# 색상 정의
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 환경 설정
MODE=${1:-production}

if [ "$MODE" = "local" ]; then
    BASE_URL="http://localhost:5001/story-make-fbbd7/asia-northeast1"
    echo -e "${BLUE}🧪 로컬 에뮬레이터 테스트 모드${NC}"
else
    BASE_URL="https://asia-northeast1-story-make-fbbd7.cloudfunctions.net"
    echo -e "${BLUE}🚀 프로덕션 테스트 모드${NC}"
fi

echo "Base URL: $BASE_URL"
echo ""

# 테스트 데이터
CLASS_NAME="테스트 수업 $(date +%H%M%S)"
INSTRUCTOR_NAME="김선생"
INSTRUCTOR_PIN="123456"
LEARNER_CODE="0001"
LEARNER_NAME="김학생"

# ========================================
# Test 1: 수업 생성
# ========================================
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}Test 1: 수업 생성 (classCreate)${NC}"
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

RESPONSE=$(curl -s -X POST "$BASE_URL/classCreate" \
  -H "Content-Type: application/json" \
  -d "{
    \"className\": \"$CLASS_NAME\",
    \"instructorName\": \"$INSTRUCTOR_NAME\",
    \"instructorPin\": \"$INSTRUCTOR_PIN\"
  }")

echo "Response: $RESPONSE"

# 수업 코드 추출
CLASS_CODE=$(echo $RESPONSE | grep -o '"classCode":"[^"]*"' | cut -d'"' -f4)

if [ -n "$CLASS_CODE" ]; then
    echo -e "${GREEN}✅ 수업 생성 성공!${NC}"
    echo -e "${GREEN}   수업 코드: $CLASS_CODE${NC}"
else
    echo -e "${RED}❌ 수업 생성 실패${NC}"
    exit 1
fi

echo ""
sleep 1

# ========================================
# Test 2: 강사 PIN 검증 (정상)
# ========================================
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}Test 2: 강사 PIN 검증 - 정상 (classVerifyPin)${NC}"
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

RESPONSE=$(curl -s -X POST "$BASE_URL/classVerifyPin" \
  -H "Content-Type: application/json" \
  -d "{
    \"classCode\": \"$CLASS_CODE\",
    \"instructorPin\": \"$INSTRUCTOR_PIN\"
  }")

echo "Response: $RESPONSE"

VALID=$(echo $RESPONSE | grep -o '"valid":true')

if [ -n "$VALID" ]; then
    echo -e "${GREEN}✅ PIN 검증 성공!${NC}"
else
    echo -e "${RED}❌ PIN 검증 실패${NC}"
fi

echo ""
sleep 1

# ========================================
# Test 3: 강사 PIN 검증 (잘못된 PIN)
# ========================================
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}Test 3: 강사 PIN 검증 - 잘못된 PIN${NC}"
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

RESPONSE=$(curl -s -X POST "$BASE_URL/classVerifyPin" \
  -H "Content-Type: application/json" \
  -d "{
    \"classCode\": \"$CLASS_CODE\",
    \"instructorPin\": \"999999\"
  }")

echo "Response: $RESPONSE"

INVALID=$(echo $RESPONSE | grep -o '"valid":false')

if [ -n "$INVALID" ]; then
    echo -e "${GREEN}✅ 잘못된 PIN 감지 성공!${NC}"
else
    echo -e "${RED}❌ 잘못된 PIN 감지 실패${NC}"
fi

echo ""
sleep 1

# ========================================
# Test 4: 학생 등록 (신규)
# ========================================
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}Test 4: 학생 등록 - 신규 (learnerEnsure)${NC}"
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

RESPONSE=$(curl -s -X POST "$BASE_URL/learnerEnsure" \
  -H "Content-Type: application/json" \
  -d "{
    \"classCode\": \"$CLASS_CODE\",
    \"learnerCode\": \"$LEARNER_CODE\",
    \"learnerName\": \"$LEARNER_NAME\"
  }")

echo "Response: $RESPONSE"

LEARNER_ID=$(echo $RESPONSE | grep -o '"learnerId":"[^"]*"' | cut -d'"' -f4)
IS_NEW=$(echo $RESPONSE | grep -o '"isNew":true')

if [ -n "$LEARNER_ID" ] && [ -n "$IS_NEW" ]; then
    echo -e "${GREEN}✅ 학생 등록 성공!${NC}"
    echo -e "${GREEN}   학생 ID: $LEARNER_ID${NC}"
else
    echo -e "${RED}❌ 학생 등록 실패${NC}"
    exit 1
fi

echo ""
sleep 1

# ========================================
# Test 5: 학생 등록 (기존)
# ========================================
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}Test 5: 학생 등록 - 기존 학생 재로그인${NC}"
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

RESPONSE=$(curl -s -X POST "$BASE_URL/learnerEnsure" \
  -H "Content-Type: application/json" \
  -d "{
    \"classCode\": \"$CLASS_CODE\",
    \"learnerCode\": \"$LEARNER_CODE\",
    \"learnerName\": \"$LEARNER_NAME\"
  }")

echo "Response: $RESPONSE"

IS_EXISTING=$(echo $RESPONSE | grep -o '"isNew":false')

if [ -n "$IS_EXISTING" ]; then
    echo -e "${GREEN}✅ 기존 학생 로그인 성공!${NC}"
else
    echo -e "${RED}❌ 기존 학생 로그인 실패${NC}"
fi

echo ""
sleep 1

# ========================================
# Test 6: 작품 저장 (이미지)
# ========================================
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}Test 6: 작품 저장 - 이미지 (artifactSave)${NC}"
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

# 작은 테스트 이미지 (1x1 빨간색 픽셀)
TEST_IMAGE="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8DwHwAFBQIAX8jx0gAAAABJRU5ErkJggg=="

RESPONSE=$(curl -s -X POST "$BASE_URL/artifactSave" \
  -H "Content-Type: application/json" \
  -d "{
    \"learnerId\": \"$LEARNER_ID\",
    \"type\": \"image\",
    \"title\": \"테스트 이미지 $(date +%H%M%S)\",
    \"data\": {
      \"prompt\": \"테스트 프롬프트\",
      \"style\": \"테스트 스타일\"
    },
    \"files\": {
      \"image\": \"$TEST_IMAGE\"
    }
  }")

echo "Response: $RESPONSE"

ARTIFACT_ID=$(echo $RESPONSE | grep -o '"artifactId":"[^"]*"' | cut -d'"' -f4)
SHARE_ID=$(echo $RESPONSE | grep -o '"shareId":"[^"]*"' | cut -d'"' -f4)

if [ -n "$ARTIFACT_ID" ] && [ -n "$SHARE_ID" ]; then
    echo -e "${GREEN}✅ 작품 저장 성공!${NC}"
    echo -e "${GREEN}   작품 ID: $ARTIFACT_ID${NC}"
    echo -e "${GREEN}   공유 ID: $SHARE_ID${NC}"
else
    echo -e "${RED}❌ 작품 저장 실패${NC}"
fi

echo ""
sleep 1

# ========================================
# Test 7: 작품 목록 조회
# ========================================
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}Test 7: 작품 목록 조회 (artifactList)${NC}"
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

RESPONSE=$(curl -s -X GET "$BASE_URL/artifactList?learnerId=$LEARNER_ID")

echo "Response: $RESPONSE"

COUNT=$(echo $RESPONSE | grep -o '"count":[0-9]*' | cut -d':' -f2)

if [ -n "$COUNT" ]; then
    echo -e "${GREEN}✅ 작품 목록 조회 성공!${NC}"
    echo -e "${GREEN}   작품 개수: $COUNT${NC}"
else
    echo -e "${RED}❌ 작품 목록 조회 실패${NC}"
fi

echo ""
sleep 1

# ========================================
# Test 8: 공유 ID로 작품 조회
# ========================================
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}Test 8: 공유 ID로 작품 조회 (artifactByShare)${NC}"
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

if [ -n "$SHARE_ID" ]; then
    RESPONSE=$(curl -s -X GET "$BASE_URL/artifactByShare?shareId=$SHARE_ID")
    
    echo "Response: $RESPONSE"
    
    TITLE=$(echo $RESPONSE | grep -o '"title":"[^"]*"' | head -1)
    
    if [ -n "$TITLE" ]; then
        echo -e "${GREEN}✅ 공유 작품 조회 성공!${NC}"
        echo -e "${GREEN}   $TITLE${NC}"
    else
        echo -e "${RED}❌ 공유 작품 조회 실패${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  이전 테스트에서 SHARE_ID를 얻지 못해 스킵${NC}"
fi

echo ""
sleep 1

# ========================================
# Test 9: ZIP 다운로드 (실제 파일은 다운로드하지 않음)
# ========================================
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}Test 9: ZIP 다운로드 테스트 (exportClassZip)${NC}"
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

echo "ZIP 다운로드는 실제 파일이 생성되므로 헤더만 확인합니다."

HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$BASE_URL/exportClassZip" \
  -H "Content-Type: application/json" \
  -d "{
    \"classCode\": \"$CLASS_CODE\",
    \"instructorPin\": \"$INSTRUCTOR_PIN\"
  }")

if [ "$HTTP_CODE" = "200" ]; then
    echo -e "${GREEN}✅ ZIP 다운로드 API 정상 (HTTP 200)${NC}"
else
    echo -e "${YELLOW}⚠️  ZIP 다운로드 응답: HTTP $HTTP_CODE${NC}"
    echo -e "${YELLOW}   (작품이 없거나 다른 이유일 수 있음)${NC}"
fi

echo ""

# ========================================
# 테스트 요약
# ========================================
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}🎉 테스트 완료!${NC}"
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "${BLUE}생성된 테스트 데이터:${NC}"
echo -e "  수업 코드: ${GREEN}$CLASS_CODE${NC}"
echo -e "  학생 ID: ${GREEN}$LEARNER_ID${NC}"
echo -e "  작품 ID: ${GREEN}$ARTIFACT_ID${NC}"
echo -e "  공유 ID: ${GREEN}$SHARE_ID${NC}"
echo ""
echo -e "${BLUE}공유 링크:${NC}"
echo -e "  ${GREEN}https://story-maker-4l6.pages.dev/share/$SHARE_ID${NC}"
echo ""
