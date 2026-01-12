#!/bin/bash
# 더미 Data URL 테스트
curl -s -X POST https://ad3a4794.story-maker-4l6.pages.dev/api/generate-image \
  -H "Content-Type: application/json" \
  -d '{"prompt":"REMOVE_API_KEY_TEST"}' | python3 -c "
import json, sys
data = json.load(sys.stdin)
if 'imageData' in data:
    img = data['imageData']
    if img.startswith('data:image/svg'):
        print('✅ 더미 이미지 테스트 성공: Data URL 형식')
        print('   Prefix:', img[:60])
    else:
        print('❌ Data URL이 아님')
"
