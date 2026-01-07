#!/bin/bash

# 🧪 Quick Functions Test Script
# 배포된 Firebase Functions를 빠르게 테스트합니다.

set -e

# ANSI 색상 코드
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Base URL (프로덕션)
BASE_URL="https://asia-northeast1-story-make-fbbd7.cloudfunctions.net"

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}🧪 Firebase Functions Quick Test${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "Base URL: ${YELLOW}$BASE_URL${NC}"
echo ""

# 전역 변수
CLASS_CODE=""
LEARNER_ID=""
ARTIFACT_ID=""
SHARE_ID=""

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# Test 1: 수업 생성 (classCreate)
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${YELLOW}Test 1: 수업 생성 (classCreate)${NC}"
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

RESPONSE=$(curl -s -X POST "$BASE_URL/classCreate" \
  -H "Content-Type: application/json" \
  -d '{
    "className": "테스트 수업",
    "instructorName": "김선생님",
    "instructorPin": "123456"
  }')

echo "응답: $RESPONSE"

# classCode 추출
CLASS_CODE=$(echo "$RESPONSE" | grep -o '"classCode":"[^"]*"' | cut -d'"' -f4)

if [ -n "$CLASS_CODE" ]; then
  echo -e "${GREEN}✓ 수업 생성 성공!${NC}"
  echo -e "  수업 코드: ${GREEN}$CLASS_CODE${NC}"
else
  echo -e "${RED}✗ 수업 생성 실패${NC}"
  exit 1
fi

echo ""

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# Test 2: 강사 PIN 확인 (classVerifyPin)
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${YELLOW}Test 2: 강사 PIN 확인 (classVerifyPin)${NC}"
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

RESPONSE=$(curl -s -X POST "$BASE_URL/classVerifyPin" \
  -H "Content-Type: application/json" \
  -d "{
    \"classCode\": \"$CLASS_CODE\",
    \"instructorPin\": \"123456\"
  }")

echo "응답: $RESPONSE"

if echo "$RESPONSE" | grep -q '"valid":true'; then
  echo -e "${GREEN}✓ PIN 확인 성공!${NC}"
else
  echo -e "${RED}✗ PIN 확인 실패${NC}"
fi

echo ""

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# Test 3: 학생 등록 (learnerEnsure)
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${YELLOW}Test 3: 학생 등록 (learnerEnsure)${NC}"
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

RESPONSE=$(curl -s -X POST "$BASE_URL/learnerEnsure" \
  -H "Content-Type: application/json" \
  -d "{
    \"classCode\": \"$CLASS_CODE\",
    \"learnerName\": \"김철수\"
  }")

echo "응답: $RESPONSE"

# learnerId 추출
LEARNER_ID=$(echo "$RESPONSE" | grep -o '"learnerId":"[^"]*"' | cut -d'"' -f4)

if [ -n "$LEARNER_ID" ]; then
  echo -e "${GREEN}✓ 학생 등록 성공!${NC}"
  echo -e "  학생 ID: ${GREEN}$LEARNER_ID${NC}"
else
  echo -e "${RED}✗ 학생 등록 실패${NC}"
  exit 1
fi

echo ""

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# Test 4: 작품 저장 (artifactSave)
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${YELLOW}Test 4: 작품 저장 (artifactSave)${NC}"
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# 작은 테스트 이미지 (1x1 픽셀)
TEST_IMAGE="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="

RESPONSE=$(curl -s -X POST "$BASE_URL/artifactSave" \
  -H "Content-Type: application/json" \
  -d "{
    \"learnerId\": \"$LEARNER_ID\",
    \"type\": \"storybook\",
    \"title\": \"나의 첫 동화책\",
    \"data\": {
      \"prompt\": \"우주를 여행하는 고양이\",
      \"style\": \"동화 스타일\"
    },
    \"files\": [
      {
        \"name\": \"cover.png\",
        \"data\": \"$TEST_IMAGE\",
        \"type\": \"cover\"
      }
    ]
  }")

echo "응답: $RESPONSE"

# artifactId와 shareId 추출
ARTIFACT_ID=$(echo "$RESPONSE" | grep -o '"artifactId":"[^"]*"' | cut -d'"' -f4)
SHARE_ID=$(echo "$RESPONSE" | grep -o '"shareId":"[^"]*"' | cut -d'"' -f4)

if [ -n "$ARTIFACT_ID" ]; then
  echo -e "${GREEN}✓ 작품 저장 성공!${NC}"
  echo -e "  작품 ID: ${GREEN}$ARTIFACT_ID${NC}"
  echo -e "  공유 ID: ${GREEN}$SHARE_ID${NC}"
else
  echo -e "${RED}✗ 작품 저장 실패${NC}"
  exit 1
fi

echo ""

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# Test 5: 작품 목록 조회 (artifactList)
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${YELLOW}Test 5: 작품 목록 조회 (artifactList)${NC}"
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

RESPONSE=$(curl -s -X GET "$BASE_URL/artifactList?learnerId=$LEARNER_ID")

echo "응답: $RESPONSE"

if echo "$RESPONSE" | grep -q '"success":true'; then
  echo -e "${GREEN}✓ 작품 목록 조회 성공!${NC}"
else
  echo -e "${RED}✗ 작품 목록 조회 실패${NC}"
fi

echo ""

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# Test 6: 공유 링크로 작품 조회 (artifactByShare)
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${YELLOW}Test 6: 공유 링크로 작품 조회 (artifactByShare)${NC}"
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

RESPONSE=$(curl -s -X GET "$BASE_URL/artifactByShare?shareId=$SHARE_ID")

echo "응답: $RESPONSE"

if echo "$RESPONSE" | grep -q '"success":true'; then
  echo -e "${GREEN}✓ 공유 링크 조회 성공!${NC}"
else
  echo -e "${RED}✗ 공유 링크 조회 실패${NC}"
fi

echo ""

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# Test 7: 강사용 ZIP 다운로드 (exportClassZip)
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${YELLOW}Test 7: 강사용 ZIP 다운로드 (exportClassZip)${NC}"
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

echo "ZIP 다운로드 중..."

HTTP_CODE=$(curl -s -o "class-export-test.zip" -w "%{http_code}" -X POST "$BASE_URL/exportClassZip" \
  -H "Content-Type: application/json" \
  -d "{
    \"classCode\": \"$CLASS_CODE\",
    \"instructorPin\": \"123456\"
  }")

if [ "$HTTP_CODE" -eq 200 ]; then
  FILE_SIZE=$(stat -f%z "class-export-test.zip" 2>/dev/null || stat -c%s "class-export-test.zip" 2>/dev/null)
  echo -e "${GREEN}✓ ZIP 다운로드 성공!${NC}"
  echo -e "  파일 크기: ${GREEN}$FILE_SIZE bytes${NC}"
  echo -e "  파일 위치: ${GREEN}class-export-test.zip${NC}"
else
  echo -e "${RED}✗ ZIP 다운로드 실패 (HTTP $HTTP_CODE)${NC}"
fi

echo ""

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# 최종 요약
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}📊 테스트 결과 요약${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "  수업 코드: ${GREEN}$CLASS_CODE${NC}"
echo -e "  학생 ID: ${GREEN}$LEARNER_ID${NC}"
echo -e "  작품 ID: ${GREEN}$ARTIFACT_ID${NC}"
echo -e "  공유 ID: ${GREEN}$SHARE_ID${NC}"
echo ""
echo -e "${GREEN}✓ 모든 테스트 완료!${NC}"
echo ""
echo -e "${YELLOW}다음 단계:${NC}"
echo -e "  1. Firebase Console에서 Firestore 데이터 확인"
echo -e "  2. Firebase Console에서 Storage 파일 확인"
echo -e "  3. 프론트엔드 UI 연동"
echo ""
