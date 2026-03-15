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
  onResult: (text: string, isFinal: boolean) => void;  // isFinal 파라미터 추가
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
    // ✅ 전체 transcript를 재구성 (중복 방지)
    let interimTranscript = "";
    let finalTranscript = "";
    
    for (let i = 0; i < event.results.length; i++) {
      const result = event.results[i];
      const transcript = result[0].transcript;
      
      if (result.isFinal) {
        finalTranscript += transcript + " ";
      } else {
        interimTranscript += transcript;
      }
    }
    
    // 최종 결과가 있으면 최종 결과만 전달
    if (finalTranscript.trim()) {
      console.log("✅ 음성 인식 최종 결과:", finalTranscript.trim());
      options.onResult(finalTranscript.trim(), true);
    } 
    // 중간 결과만 있으면 중간 결과 전달
    else if (interimTranscript.trim()) {
      console.log("⏳ 중간 결과:", interimTranscript.trim());
      options.onResult(interimTranscript.trim(), false);
    }
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
 * const stopListening = startListening(
 *   (text) => console.log("인식된 텍스트:", text),
 *   (error) => console.error(error),
 *   () => console.log("음성 인식 종료")
 * );
 * 
 * // 중지하려면
 * stopListening();
 * ```
 */
export function startListening(
  options: {
    onResult: (text: string, isFinal: boolean) => void;
    onError?: (error: string) => void;
    onEnd?: () => void;
  }
): () => void {
  if (!isSpeechRecognitionSupported()) {
    const errorMsg = "이 브라우저는 음성 인식을 지원하지 않습니다.\n\nChrome, Edge, Safari 브라우저를 사용해주세요.";
    if (options.onError) {
      options.onError(errorMsg);
    } else {
      alert(errorMsg);
    }
    return () => {};
  }

  let silenceTimer: NodeJS.Timeout | null = null;
  let stopFunction: (() => void) | null = null;

  stopFunction = startSpeechRecognition({
    lang: "ko-KR",
    continuous: true,  // ✅ 연속 인식 모드
    interimResults: true,  // ✅ 중간 결과도 표시
    onResult: (text, isFinal) => {
      options.onResult(text, isFinal);
      
      // ✅ 5초 침묵 타이머 리셋
      if (silenceTimer) {
        clearTimeout(silenceTimer);
      }
      
      // ✅ 최종 결과 후 5초 대기 후 자동 종료
      if (isFinal) {
        silenceTimer = setTimeout(() => {
          console.log("⏱️ 5초 침묵 감지 - 음성 인식 자동 종료");
          if (stopFunction) {
            stopFunction();
          }
        }, 5000);  // 5초 대기
      }
    },
    onError: (error) => {
      if (silenceTimer) {
        clearTimeout(silenceTimer);
      }
      if (options.onError) {
        options.onError(error);
      } else {
        alert(error);
      }
    },
    onEnd: () => {
      if (silenceTimer) {
        clearTimeout(silenceTimer);
      }
      if (options.onEnd) {
        options.onEnd();
      }
    },
  });

  // 수동 중지 시 타이머도 정리
  return () => {
    if (silenceTimer) {
      clearTimeout(silenceTimer);
    }
    if (stopFunction) {
      stopFunction();
    }
  };
}
