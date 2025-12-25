/**
 * AI 응답에서 메타 문구 제거
 * "네, 알겠습니다", "물론입니다" 등의 불필요한 문구를 삭제
 */
export function sanitizeAiStoryText(text: string): string {
  if (!text) return text;
  
  return text
    // 인사말 제거
    .replace(/^네[,! ]*알겠습니다[^\n]*\n?/g, "")
    .replace(/^알겠습니다[^\n]*\n?/g, "")
    .replace(/^물론입니다[^\n]*\n?/g, "")
    .replace(/^네[,! ]+[^\n]*\n?/g, "")
    
    // 구분선 제거
    .replace(/^\s*---+\s*\n?/gm, "")
    .replace(/^\s*===+\s*\n?/gm, "")
    
    // 페이지 표기 제거
    .replace(/^\s*\[\s*\d+\s*페이지\s*\]\s*\n?/gm, "")
    .replace(/^\s*\[\s*페이지\s*\d+\s*\]\s*\n?/gm, "")
    .replace(/^\s*페이지\s*\d+\s*:\s*\n?/gm, "")
    
    // 메타 설명 제거
    .replace(/^이제.*생성하겠습니다[^\n]*\n?/gm, "")
    .replace(/^다음.*내용입니다[^\n]*\n?/gm, "")
    
    .trim();
}

/**
 * 여러 페이지의 텍스트를 일괄 정리
 */
export function sanitizeStoryPages(pages: Array<{ text: string }>): Array<{ text: string }> {
  return pages.map(page => ({
    ...page,
    text: sanitizeAiStoryText(page.text)
  }));
}
