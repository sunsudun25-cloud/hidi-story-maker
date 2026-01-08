/**
 * Story Maker 저작권 등록용 자동 화면 캡처 스크립트
 * 
 * 사용법:
 * node capture-screenshots.js
 */

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

// 설정
const BASE_URL = 'https://story-maker-4l6.pages.dev';
const OUTPUT_DIR = './copyright_screenshots';
const VIEWPORT_SIZE = { width: 1920, height: 1080 };
const WAIT_TIME = 2000; // 화면 로딩 대기 시간 (밀리초)

// 저작권 제출용 디렉토리 구조 생성
function createDirectories() {
  const dirs = [
    OUTPUT_DIR,
    `${OUTPUT_DIR}/1_그림만들기`,
    `${OUTPUT_DIR}/2_글쓰기`,
    `${OUTPUT_DIR}/3_동화책만들기`,
  ];

  dirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      console.log(`✅ 디렉토리 생성: ${dir}`);
    }
  });
}

// 스크린샷 저장 헬퍼
async function takeScreenshot(page, filename, description) {
  const filepath = path.join(OUTPUT_DIR, filename);
  await page.screenshot({ 
    path: filepath,
    fullPage: true // 전체 페이지 캡처
  });
  console.log(`✅ 캡처 완료: ${description}`);
  console.log(`   파일: ${filepath}`);
}

// 대기 헬퍼
async function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// 1. 그림 만들기 모듈 캡처
async function captureDrawingModule(browser) {
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📸 1. 그림 만들기 모듈 캡처 시작');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  const page = await browser.newPage();
  await page.setViewportSize(VIEWPORT_SIZE);

  try {
    // 01. 시작 화면
    await page.goto(BASE_URL);
    await wait(WAIT_TIME);
    await takeScreenshot(page, '1_그림만들기/01_시작화면.png', '시작 화면 (Welcome)');

    // 02. 홈 화면
    await page.click('text=시작하기');
    await wait(WAIT_TIME);
    await takeScreenshot(page, '1_그림만들기/02_홈화면.png', '홈 화면 (그림/글쓰기/동화책 선택)');

    // 03. 그림 만들기 선택
    await page.click('text=그림 만들기');
    await wait(WAIT_TIME);
    await takeScreenshot(page, '1_그림만들기/03_그림만들기선택.png', '그림 만들기 옵션');

    // 04. 말로 설명하기
    await page.click('text=말로 설명하기');
    await wait(WAIT_TIME);
    await takeScreenshot(page, '1_그림만들기/04_말로설명하기.png', '음성 입력 화면');

    // 05. 프롬프트 입력 (음성 대신 텍스트로)
    const promptInput = await page.locator('textarea, input[type="text"]').first();
    if (await promptInput.isVisible()) {
      await promptInput.fill('우주를 여행하는 귀여운 고양이');
      await wait(1000);
      await takeScreenshot(page, '1_그림만들기/05_프롬프트입력.png', '프롬프트 입력');
    }

    // 06. 뒤로가기 후 직접 입력
    await page.goBack();
    await wait(WAIT_TIME);
    await page.click('text=직접 입력하기');
    await wait(WAIT_TIME);
    await takeScreenshot(page, '1_그림만들기/06_직접입력화면.png', '직접 입력 화면');

    // 07. 손글씨 입력 버튼
    const handwritingButton = await page.locator('button:has-text("손글씨")').first();
    if (await handwritingButton.isVisible()) {
      await takeScreenshot(page, '1_그림만들기/07_손글씨버튼.png', '손글씨 입력 버튼');
    }

    // 08. 사진 업로드 버튼
    const photoButton = await page.locator('button:has-text("사진")').first();
    if (await photoButton.isVisible()) {
      await takeScreenshot(page, '1_그림만들기/08_사진업로드버튼.png', '사진 업로드 버튼');
    }

    console.log('\n✅ 그림 만들기 모듈 캡처 완료 (8장)\n');

  } catch (error) {
    console.error('❌ 그림 만들기 캡처 중 오류:', error.message);
  } finally {
    await page.close();
  }
}

// 2. 글쓰기 모듈 캡처
async function captureWritingModule(browser) {
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📸 2. 글쓰기 모듈 캡처 시작');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  const page = await browser.newPage();
  await page.setViewportSize(VIEWPORT_SIZE);

  try {
    // 01. 홈 화면 이동
    await page.goto(BASE_URL);
    await wait(WAIT_TIME);
    await page.click('text=시작하기');
    await wait(WAIT_TIME);

    // 02. 글쓰기 선택
    await page.click('text=글쓰기');
    await wait(WAIT_TIME);
    await takeScreenshot(page, '2_글쓰기/01_글쓰기선택.png', '글쓰기 옵션');

    // 03. 연습하기
    await page.click('text=연습하기');
    await wait(WAIT_TIME);
    await takeScreenshot(page, '2_글쓰기/02_연습하기.png', '글쓰기 연습 화면');

    // 04. 뒤로가기 후 장르 선택
    await page.goBack();
    await wait(WAIT_TIME);
    await page.click('text=장르 선택하기');
    await wait(WAIT_TIME);
    await takeScreenshot(page, '2_글쓰기/03_장르선택.png', '장르 선택 화면');

    // 05. 일기 선택
    const diaryButton = await page.locator('button:has-text("일기")').first();
    if (await diaryButton.isVisible()) {
      await diaryButton.click();
      await wait(WAIT_TIME);
      await takeScreenshot(page, '2_글쓰기/04_일기편집기.png', '일기 편집기');
    }

    // 06. 텍스트 입력
    const editor = await page.locator('textarea').first();
    if (await editor.isVisible()) {
      await editor.fill('오늘은 정말 행복한 하루였다.\n\n아침에 일어나니 햇살이 너무 따뜻했다.');
      await wait(1000);
      await takeScreenshot(page, '2_글쓰기/05_텍스트입력.png', '텍스트 입력');
    }

    // 07. AI 도우미 메뉴
    const aiButton = await page.locator('button:has-text("AI")').first();
    if (await aiButton.isVisible()) {
      await aiButton.click();
      await wait(1000);
      await takeScreenshot(page, '2_글쓰기/06_AI도우미메뉴.png', 'AI 도우미 메뉴');
    }

    console.log('\n✅ 글쓰기 모듈 캡처 완료 (6장)\n');

  } catch (error) {
    console.error('❌ 글쓰기 캡처 중 오류:', error.message);
  } finally {
    await page.close();
  }
}

// 3. 동화책 만들기 모듈 캡처
async function captureStorybookModule(browser) {
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📸 3. 동화책 만들기 모듈 캡처 시작');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  const page = await browser.newPage();
  await page.setViewportSize(VIEWPORT_SIZE);

  try {
    // 01. 홈 화면 이동
    await page.goto(BASE_URL);
    await wait(WAIT_TIME);
    await page.click('text=시작하기');
    await wait(WAIT_TIME);

    // 02. 동화책 만들기 선택
    await page.click('text=동화책 만들기');
    await wait(WAIT_TIME);
    await takeScreenshot(page, '3_동화책만들기/01_동화책선택.png', '동화책 만들기 시작');

    // 03. 주제 입력 화면
    await takeScreenshot(page, '3_동화책만들기/02_주제입력화면.png', '주제 입력 화면');

    // 04. 주제 입력
    const promptInput = await page.locator('textarea, input[type="text"]').first();
    if (await promptInput.isVisible()) {
      await promptInput.fill('우주를 여행하는 용감한 토끼 이야기');
      await wait(1000);
      await takeScreenshot(page, '3_동화책만들기/03_주제입력완료.png', '주제 입력 완료');
    }

    // 05. 스타일 선택
    const styleButton = await page.locator('button:has-text("동화"), button:has-text("스타일")').first();
    if (await styleButton.isVisible()) {
      await takeScreenshot(page, '3_동화책만들기/04_스타일선택.png', '스타일 선택');
    }

    // 06. 내 작품 보기 (결과 확인용)
    await page.goto(`${BASE_URL}/my-works`);
    await wait(WAIT_TIME);
    await takeScreenshot(page, '3_동화책만들기/05_내작품목록.png', '내 작품 목록');

    console.log('\n✅ 동화책 만들기 모듈 캡처 완료 (5장)\n');

  } catch (error) {
    console.error('❌ 동화책 캡처 중 오류:', error.message);
  } finally {
    await page.close();
  }
}

// 메인 실행
async function main() {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🎬 Story Maker 저작권 등록용 자동 화면 캡처');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  console.log(`📍 대상 URL: ${BASE_URL}`);
  console.log(`📁 저장 위치: ${OUTPUT_DIR}`);
  console.log(`📏 해상도: ${VIEWPORT_SIZE.width}x${VIEWPORT_SIZE.height}\n`);

  // 디렉토리 생성
  createDirectories();

  // 브라우저 시작
  console.log('🚀 브라우저 시작 중...\n');
  const browser = await chromium.launch({
    headless: true, // 백그라운드 실행
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    // 각 모듈 캡처
    await captureDrawingModule(browser);
    await captureWritingModule(browser);
    await captureStorybookModule(browser);

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ 모든 캡처 완료!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    // 결과 요약
    console.log('📊 캡처 결과 요약:');
    console.log(`   - 그림 만들기: 8장`);
    console.log(`   - 글쓰기: 6장`);
    console.log(`   - 동화책 만들기: 5장`);
    console.log(`   - 총: 19장\n`);

    console.log(`📂 저장 위치: ${path.resolve(OUTPUT_DIR)}\n`);

    console.log('🎯 다음 단계:');
    console.log('   1. 캡처된 이미지 확인');
    console.log('   2. 누락된 화면 수동 캡처');
    console.log('   3. 동화책 PDF 샘플 생성');
    console.log('   4. 기능 설명서 작성');
    console.log('   5. 압축 및 제출\n');

  } catch (error) {
    console.error('\n❌ 오류 발생:', error);
  } finally {
    await browser.close();
    console.log('🏁 브라우저 종료\n');
  }
}

// 스크립트 실행
main().catch(error => {
  console.error('❌ 치명적 오류:', error);
  process.exit(1);
});
