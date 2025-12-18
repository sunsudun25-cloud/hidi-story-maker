/**
 * Web Speech API를 사용한 음성 인식 서비스
 * 
 * 브라우저 지원:
 * - Chrome/Edge: webkitSpeechRecognition
 * - Firefox: 지원 안 함
 * - Safari: webkitSpeechRecognition
 * 
 * 한국어 음성 인식을 위한 유틸리티 함수들
 */

export interface SpeechRecognitionOptions {
  lang?: string;
  continuous?: boolean;
  interimResults?: boolean;
  onStart?: () => void;
  onEnd?: () => void;
  onResult: (text: string) => void;
  onError?: (error: string) => void;
}

/**
 * 브라우저가 Web Speech API를 지원하는지 확인
 */
export function isSpeechRecognitionSupported(): boolean {
  return !!(
    (window as any).SpeechRecognition ||
    (window as any).webkitSpeechRecognition
  );
}

/**
 * Web Speech API를 사용하여 음성 인식 시작
 */
export function startSpeechRecognition(options: SpeechRecognitionOptions): () => void {
  const SpeechRecognition =
    (window as any).SpeechRecognition ||
    (window as any).webkitSpeechRecognition;

  if (!SpeechRecognition) {
    const errorMsg = "이 브라우저는 음성 인식을 지원하지 않습니다.";
    if (options.onError) {
      options.onError(errorMsg);
    }
    throw new Error(errorMsg);
  }

  const recognition = new SpeechRecognition();

  // 기본 설정
  recognition.lang = options.lang || "ko-KR";
  recognition.continuous = options.continuous ?? false;
  recognition.interimResults = options.interimResults ?? false;

  // 이벤트 핸들러
  recognition.onstart = () => {
    console.log("🎤 음성 인식 시작");
    if (options.onStart) {
      options.onStart();
    }
  };

  recognition.onerror = (event: any) => {
    console.error("❌ 음성 인식 오류:", event.error);
    const errorMsg = getSpeechRecognitionErrorMessage(event.error);
    if (options.onError) {
      options.onError(errorMsg);
    }
  };

  recognition.onend = () => {
    console.log("🎤 음성 인식 종료");
    if (options.onEnd) {
      options.onEnd();
    }
  };

  recognition.onresult = (event: any) => {
    const transcript = event.results[0][0].transcript as string;
    console.log("✅ 음성 인식 결과:", transcript);
    options.onResult(transcript);
  };

  // 인식 시작
  recognition.start();

  // 중지 함수 반환
  return () => {
    try {
      recognition.stop();
    } catch (err) {
      console.warn("음성 인식 중지 중 오류:", err);
    }
  };
}

/**
 * 음성 인식 오류 메시지를 사용자 친화적으로 변환
 */
function getSpeechRecognitionErrorMessage(error: string): string {
  switch (error) {
    case "no-speech":
      return "음성이 감지되지 않았습니다. 다시 시도해주세요.";
    case "audio-capture":
      return "마이크를 사용할 수 없습니다. 마이크 권한을 확인해주세요.";
    case "not-allowed":
      return "마이크 권한이 거부되었습니다. 브라우저 설정에서 마이크 권한을 허용해주세요.";
    case "network":
      return "네트워크 오류가 발생했습니다. 인터넷 연결을 확인해주세요.";
    case "aborted":
      return "음성 인식이 중단되었습니다.";
    default:
      return `음성 인식 중 오류가 발생했습니다 (${error}). 다시 시도해주세요.`;
  }
}

/**
 * 간편한 음성 인식 실행 함수
 * 
 * @example
 * ```typescript
 * const stopListening = startListening((text) => {
 *   console.log("인식된 텍스트:", text);
 * });
 * 
 * // 중지하려면
 * stopListening();
 * ```
 */
export function startListening(
  onResult: (text: string) => void,
  onError?: (error: string) => void
): () => void {
  if (!isSpeechRecognitionSupported()) {
    const errorMsg = "이 브라우저는 음성 인식을 지원하지 않습니다.\n\nChrome, Edge, Safari 브라우저를 사용해주세요.";
    if (onError) {
      onError(errorMsg);
    } else {
      alert(errorMsg);
    }
    return () => {};
  }

  return startSpeechRecognition({
    lang: "ko-KR",
    continuous: false,
    interimResults: false,
    onResult,
    onError: (error) => {
      if (onError) {
        onError(error);
      } else {
        alert(error);
      }
    },
  });
}
