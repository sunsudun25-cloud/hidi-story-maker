import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import CanvaHeader from "../components/CanvaHeader";

export default function WritingVoice() {
  const navigate = useNavigate();
  
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [isSupported, setIsSupported] = useState(true);
  
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    // Web Speech API 지원 확인
    const SpeechRecognition = 
      (window as any).SpeechRecognition || 
      (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setIsSupported(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "ko-KR";

    recognition.onresult = (event: any) => {
      let finalTranscript = "";
      let interimTranscript = "";

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript + " ";
        } else {
          interimTranscript += transcript;
        }
      }

      if (finalTranscript) {
        setTranscript((prev) => prev + finalTranscript);
      }
    };

    recognition.onerror = (event: any) => {
      console.error("음성 인식 오류:", event.error);
      if (event.error === "no-speech") {
        alert("음성이 감지되지 않았습니다. 다시 시도해주세요.");
      } else if (event.error === "not-allowed") {
        alert("마이크 권한이 필요합니다. 브라우저 설정에서 마이크를 허용해주세요.");
      }
      setIsRecording(false);
    };

    recognition.onend = () => {
      setIsRecording(false);
    };

    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const handleStartRecording = () => {
    if (!recognitionRef.current) return;

    try {
      recognitionRef.current.start();
      setIsRecording(true);
    } catch (error) {
      console.error("녹음 시작 오류:", error);
    }
  };

  const handleStopRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleClear = () => {
    setTranscript("");
  };

  const handleStartWriting = () => {
    if (!transcript.trim()) {
      alert("먼저 음성을 입력해주세요.");
      return;
    }

    navigate("/writing/editor", {
      state: {
        genre: "voice",
        label: "음성으로 쓴 글",
        initialText: transcript,
      },
    });
  };

  if (!isSupported) {
    return (
      <div className="pb-24">
        <CanvaHeader title="말로 입력하기" color="var(--canva-yellow)" />
        <div className="p-5">
          <div className="bg-red-50 border border-red-300 rounded-xl p-6 text-center">
            <p className="text-xl text-red-600 font-semibold mb-4">
              ⚠️ 지원되지 않는 브라우저
            </p>
            <p className="text-gray-700 mb-4">
              이 기능은 Chrome, Edge, Safari 브라우저에서만 사용 가능합니다.
            </p>
            <button
              onClick={() => navigate("/write")}
              className="bg-emerald-500 text-white px-6 py-3 rounded-xl text-lg font-bold hover:bg-emerald-600 transition-colors"
            >
              ← 글쓰기 방법 선택으로
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-24">
      <CanvaHeader title="말로 입력하기" color="var(--canva-yellow)" />

      <div className="p-5">
        <h2 className="text-2xl font-bold mb-4">🎤 음성으로 글쓰기</h2>

        <p className="text-gray-700 mb-6 leading-relaxed text-lg">
          마이크 버튼을 누르고 이야기해주세요
        </p>

        {/* 마이크 버튼 */}
        <div className="flex justify-center mb-6">
          {isRecording ? (
            <button
              onClick={handleStopRecording}
              className="
                w-32 h-32 rounded-full
                bg-red-500 text-white shadow-2xl
                flex items-center justify-center
                animate-pulse
                active:scale-95
                transition-transform duration-200
              "
            >
              <div className="text-center">
                <div className="text-5xl mb-2">🎤</div>
                <div className="text-sm font-semibold">녹음 중...</div>
              </div>
            </button>
          ) : (
            <button
              onClick={handleStartRecording}
              className="
                w-32 h-32 rounded-full
                bg-purple-500 text-white shadow-xl
                flex items-center justify-center
                hover:bg-purple-600
                active:scale-95
                transition-all duration-200
              "
            >
              <div className="text-center">
                <div className="text-5xl mb-2">🎤</div>
                <div className="text-sm font-semibold">녹음 시작</div>
              </div>
            </button>
          )}
        </div>

        {/* 상태 표시 */}
        <div className="text-center mb-6">
          {isRecording ? (
            <p className="text-red-600 font-semibold text-lg animate-pulse">
              🔴 녹음 중... 이야기하세요!
            </p>
          ) : (
            <p className="text-gray-600 text-lg">
              {transcript ? "✅ 음성이 입력되었습니다" : "🎙️ 마이크 버튼을 눌러 시작하세요"}
            </p>
          )}
        </div>

        {/* 텍스트 출력 영역 */}
        <div className="mb-6">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            📝 인식된 텍스트
          </label>
          <textarea
            value={transcript}
            onChange={(e) => setTranscript(e.target.value)}
            placeholder="음성이 여기에 텍스트로 변환됩니다..."
            className="
              w-full h-[250px] p-4 text-lg
              border-2 rounded-xl border-gray-300
              focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent
              resize-none leading-relaxed
            "
          />
          <p className="text-sm text-gray-500 mt-2">
            {transcript.length} 글자
          </p>
        </div>

        {/* 버튼 영역 */}
        <div className="space-y-3">
          <button
            onClick={handleStartWriting}
            disabled={!transcript.trim()}
            className="
              w-full py-4 text-xl font-bold rounded-xl
              bg-emerald-500 text-white shadow-lg 
              hover:bg-emerald-600
              active:scale-95
              disabled:bg-gray-300 disabled:cursor-not-allowed
              transition-all duration-200
            "
          >
            ✅ 글쓰기 시작
          </button>

          {transcript && (
            <button
              onClick={handleClear}
              className="
                w-full py-3 text-lg font-semibold
                bg-gray-100 text-gray-700 rounded-xl
                hover:bg-gray-200
                transition-colors duration-200
              "
            >
              🗑️ 내용 지우기
            </button>
          )}

          <button
            onClick={() => navigate("/write")}
            className="
              w-full py-3 text-lg font-semibold
              bg-gray-100 text-gray-700 rounded-xl
              hover:bg-gray-200
              transition-colors duration-200
            "
          >
            ← 글쓰기 방법 선택으로
          </button>
        </div>

        {/* 도움말 */}
        <div className="mt-6 p-4 bg-purple-50 rounded-xl border border-purple-200">
          <p className="text-sm text-purple-800">
            💡 <strong>Tip:</strong> 천천히 또박또박 말씀해주시면 더 정확하게 인식됩니다!
          </p>
          <p className="text-xs text-purple-700 mt-2">
            ⚠️ Chrome, Edge, Safari 브라우저에서만 사용 가능합니다.
          </p>
        </div>
      </div>
    </div>
  );
}
