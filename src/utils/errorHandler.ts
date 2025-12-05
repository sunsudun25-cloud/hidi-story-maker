/**
 * 사용자 친화적인 에러 메시지 생성
 * AI 서비스 에러를 노인 친화적인 메시지로 변환
 */
export function friendlyErrorMessage(error: any): string {
  console.error("Error occurred:", error);

  // 에러 타입별 메시지 분기
  if (error?.message?.includes("API key")) {
    return (
      "API 키 설정에 문제가 있어요.\n" +
      "관리자에게 문의해주세요."
    );
  }

  if (error?.message?.includes("network") || error?.message?.includes("fetch")) {
    return (
      "인터넷 연결을 확인해주세요.\n" +
      "잠시 후 다시 시도해주세요."
    );
  }

  if (error?.message?.includes("quota") || error?.message?.includes("limit")) {
    return (
      "오늘 사용 가능한 횟수를 초과했어요.\n" +
      "내일 다시 시도해주세요."
    );
  }

  // 기본 메시지
  return (
    "요청을 이해하기 조금 어려웠어요.\n" +
    "조금 더 쉬운 문장으로 다시 한 번 말씀해주실 수 있을까요?"
  );
}

/**
 * 에러를 콘솔에 로깅하고 사용자에게 알림
 */
export function handleError(error: any, customMessage?: string): void {
  const message = customMessage || friendlyErrorMessage(error);
  alert(message);
}
