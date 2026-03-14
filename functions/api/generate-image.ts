/**
 * Cloudflare Pages Function - OpenAI DALL-E 3 프록시
 * CORS 완전 지원 + A안(서버 프롬프트 빌더) 적용
 */

interface Env {
  OPENAI_API_KEY: string;
  OPENAI_API_KEY_GPT_IMAGE: string;  // 실사 전용 API 키
}

// ⭐ A안: 서버에서 프롬프트 빌드 (promptBuilder 로직 복사)
type PurposeKey = "story" | "memory" | "class" | "photo";
type MoodKey = "bright" | "warm" | "calm" | "dreamy";

const styleMapping: Record<string, string> = {
  "수채화": "soft watercolor wash, visible paper texture, uneven brush strokes, gentle warm light, hand-painted imperfections",
  "파스텔톤": "pastel colors, soft gradients, gentle atmosphere, light and airy, minimal clutter",
  "동화풍": "children's book illustration, clear lines, bright colors, storybook quality, friendly and readable composition",
  "애니메이션": "anime-inspired illustration, clean line art, soft shading, friendly and cute, not realistic photo",
  "연필스케치": "pencil sketch, monochrome, hatching, hand-drawn lines, artistic rendering",
  "감성 사진 같은 그림": "photo-inspired illustration with natural lighting and subtle realistic details, but still an illustration (not a real photo)",
  "기본": "illustration style, balanced composition, pleasing aesthetics"
};

const purposeDefaultStyle: Record<PurposeKey, string> = {
  story: "동화풍",
  memory: "수채화",
  class: "파스텔톤",
  photo: "감성 사진 같은 그림"
};

const purposeDirectives: Record<PurposeKey, string> = {
  story: "Single-page illustration for a storybook. Clear subject, readable composition, leave comfortable negative space. Not a comic panel. Not a multi-page spread.",
  memory: "Emotional, cozy illustration. Soft lighting, gentle shadows, warm tone. Keep it simple and not busy.",
  class: "Presentation-friendly illustration. Clean layout, uncluttered background, clear focal point, high readability.",
  photo: "Photo-inspired illustration with natural lighting and subtle realistic details, but still an illustration (not a real photo)."
};

const moodDirectives: Record<MoodKey, string> = {
  bright: "Bright, positive, welcoming atmosphere.",
  warm: "Warm, cozy, comforting atmosphere.",
  calm: "Calm, quiet, peaceful atmosphere.",
  dreamy: "Dreamy, magical, gentle atmosphere."
};

const negativeConstraints = `
=== NEGATIVE CONSTRAINTS ===
No readable text or letters (no English, no Korean).
No watermark, no logo.
No signs, labels, captions, numbers, or symbols.
Pure illustration only.
`;

// 🚀 P0 패키지: 연령 추론 방지 정책
const agePolicyDirective = `
=== AGE POLICY ===
- Do NOT assume elderly people.
- Only depict elderly if explicitly mentioned (할머니/할아버지/시니어/노인).
- Otherwise keep characters age-neutral.
`;

// 🚀 P0 패키지: 사람 포함 정책
const peoplePolicyDirective = `
=== PEOPLE POLICY ===
- If prompt says "DO NOT INCLUDE ANY PEOPLE" then strictly no people.
- If prompt says "INCLUDE" then follow the specified age/character guidance.
`;

const qualityFooter = `
=== QUALITY ===
Clean composition, readable, not busy.
High quality illustration with consistent style.
`;

function normalizeUserText(text: string): string {
  const t = (text || "").trim();
  if (!t) return "A simple, friendly illustration of a cute subject in a bright natural background.";
  if (t.length < 6) return `${t}, simple background, clear subject, gentle lighting`;
  return t;
}

function buildServerPrompt(userText: string, purpose: string, mood: string | undefined, styleLabel: string | undefined): { prompt: string, finalStyle: string } {
  const normalizedText = normalizeUserText(userText);
  const purposeKey = (purpose || "memory") as PurposeKey;
  
  // 스타일 결정: 사용자 선택 > 목적 기본값 > "기본"
  const finalStyleLabel = 
    (styleLabel && styleLabel !== "기본") 
      ? styleLabel 
      : (purposeDefaultStyle[purposeKey] || "기본");
  
  const styleText = styleMapping[finalStyleLabel] || styleMapping["기본"];
  const purposeText = purposeDirectives[purposeKey] || purposeDirectives.memory;
  const moodText = mood ? (moodDirectives[mood as MoodKey] || "Bright and friendly atmosphere.") : "Bright and friendly atmosphere.";

  const prompt = `
[STYLE DIRECTIVE]
StyleLabel: ${finalStyleLabel}
Rendering: ${styleText}

[PURPOSE DIRECTIVE]
${purposeText}

[MOOD]
${moodText}

[USER REQUEST]
${normalizedText}

${agePolicyDirective}
${peoplePolicyDirective}
${negativeConstraints}
${qualityFooter}
`.trim();

  return { prompt, finalStyle: finalStyleLabel };
}

interface ImageRequest {
  // A안: 클라이언트는 userText + 메타데이터만 전송
  userText?: string;      // 사용자 입력 (한 줄 설명)
  purpose?: string;       // story | memory | class | photo
  mood?: string;          // bright | warm | calm | dreamy
  style?: string;         // 기본 | 수채화 | 동화풍 | 파스텔톤 | ...
  
  // 하위 호환성: 기존 prompt 필드도 지원
  prompt?: string;
  
  model?: string;
  size?: string;
  quality?: string;
}

/**
 * ⭐ A안(서버 단일화): 클라이언트에서 buildAutoPrompt()로 완성된 프롬프트 받음
 * 서버는 받은 프롬프트를 그대로 OpenAI에 전달
 */

export async function onRequest(context: { request: Request; env: Env }) {
  const { request, env } = context;

  // ⭐ CORS 헤더
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };

  // ⭐ OPTIONS 요청 (Preflight) 처리
  if (request.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: corsHeaders,
    });
  }

  try {
    const body = await request.json() as ImageRequest;
    const { userText, purpose, mood, style, prompt, model, size, quality } = body;
    
    // 요청 ID 생성 (추적용)
    const requestId = `req_${Date.now()}_${Math.random().toString(36).substring(7)}`;

    // ⭐ A안: userText가 있으면 서버에서 프롬프트 빌드, 없으면 기존 prompt 사용
    const rawPrompt = userText || prompt;
    
    if (!rawPrompt) {
      return new Response(
        JSON.stringify({ success: false, error: "프롬프트 또는 userText가 없습니다." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ⭐ 모델별 API 키 분기
    const actualModel = model || "dall-e-3";
    const isGptImage = actualModel.includes("gpt-image");
    
    // GPT Image는 OPENAI_API_KEY_GPT_IMAGE, 그 외는 OPENAI_API_KEY
    const apiKey = isGptImage
      ? env.OPENAI_API_KEY_GPT_IMAGE
      : env.OPENAI_API_KEY;
    
    // 🔍 키 디버깅 로그 (prefix만)
    console.log("[KEY DEBUG]", {
      model: actualModel,
      isGptImage,
      usingKey: isGptImage ? "OPENAI_API_KEY_GPT_IMAGE" : "OPENAI_API_KEY",
      keyPrefix: apiKey ? apiKey.slice(0, 8) : "MISSING",
      keyType: apiKey?.startsWith('sk-') ? 'OpenAI' : (apiKey?.startsWith('AIza') ? 'Gemini' : 'Unknown'),
      hasGptImageKey: !!env.OPENAI_API_KEY_GPT_IMAGE,
      hasDefaultKey: !!env.OPENAI_API_KEY
    });
    
    // API 키 확인
    if (!apiKey) {
      const keyName = isGptImage ? "OPENAI_API_KEY_GPT_IMAGE" : "OPENAI_API_KEY";
      console.error(`❌ ${keyName} not configured`);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: `${keyName} not configured. Please add to environment variables.` 
        }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log('🎨 이미지 생성 요청:', { requestId, userText, purpose, mood, style, prompt, model, size, quality });

    // ⭐⭐⭐ 클라이언트 프롬프트를 그대로 사용 (서버에서 재생성하지 않음)
    let finalPrompt: string;
    let normalizedStyle: string;
    
    if (prompt) {
      // 클라이언트에서 완성된 프롬프트를 보냈을 때 (4단 구조 프롬프트)
      finalPrompt = prompt;
      normalizedStyle = style || '기본';
      console.log('✅ 클라이언트 프롬프트 사용:', { finalPromptLength: finalPrompt.length, style: normalizedStyle });
    } else if (userText) {
      // 레거시: userText만 있을 때 서버에서 빌드
      const { prompt: builtPrompt, finalStyle } = buildServerPrompt(rawPrompt, purpose || 'memory', mood, style);
      finalPrompt = builtPrompt;
      normalizedStyle = finalStyle;
      console.log('⚠️ 서버 프롬프트 빌드 사용 (레거시):', { finalPromptLength: finalPrompt.length, style: normalizedStyle });
    } else {
      finalPrompt = rawPrompt || 'A simple, friendly illustration.';
      normalizedStyle = style || '기본';
      console.log('⚠️ 기본 프롬프트 사용:', { finalPromptLength: finalPrompt.length });
    }

    // ⭐ 상세 디버깅 로그 (서버)
    const defaultQuality = "hd";
    
    console.log('🔍 [MODEL CHECK]:', {
      clientModel: model,
      actualModelUsed: actualModel,
      isGptImage: isGptImage
    });
    
    const serverDebugPayload = {
      requestId,
      styleMode: normalizedStyle,
      finalPrompt,
      promptLength: finalPrompt.length,
      requestBody: {
        model: actualModel,
        prompt: finalPrompt,
        size: size || "1024x1024",
        quality: quality || defaultQuality,
        response_format: "b64_json"
      },
      // ⭐ 키워드 검사 (동화책 문구 혼입 확인)
      containsStorybook: finalPrompt.includes('storybook') || finalPrompt.includes('동화책') || finalPrompt.includes('그림책'),
      containsIllustrative: finalPrompt.includes('illustrative') || finalPrompt.includes('일러스트') || finalPrompt.includes('삽화'),
      containsWarm: finalPrompt.includes('warm') || finalPrompt.includes('따뜻'),
      containsEducational: finalPrompt.includes('educational') || finalPrompt.includes('교육용'),
      containsPhotoRealistic: finalPrompt.includes('photorealistic') || finalPrompt.includes('실제 사진') || finalPrompt.includes('포토저널리즘') || finalPrompt.includes('뉴스 현장'),
      contains3D: finalPrompt.includes('3D') || finalPrompt.includes('렌더링') || finalPrompt.includes('CGI'),
    };
    
    console.log('🔍 [IMAGE DEBUG - SERVER]', JSON.stringify(serverDebugPayload, null, 2));
    console.log('[SERVER FINAL PROMPT]', finalPrompt);
    console.log('[SERVER STYLE MODE]', normalizedStyle);
    console.log('[SERVER REQUEST BODY]', JSON.stringify({
      model: actualModel,
      prompt: finalPrompt.substring(0, 500) + '...',
      size: size || "1024x1024",
      quality: quality || defaultQuality
    }, null, 2));

    // ⭐ GPT Image vs DALL-E 파라미터 분기
    // (isGptImage는 이미 위에서 선언됨)
    
    // ⭐ 프롬프트 길이 체크
    const promptLength = finalPrompt.length;
    console.log('📏 [PROMPT LENGTH]', {
      length: promptLength,
      maxDallE3: 4000,
      isOverLimit: promptLength > 4000,
      preview: finalPrompt.substring(0, 100) + '...'
    });
    
    let requestBody: any;
    if (isGptImage) {
      // GPT Image 모델용 파라미터
      // GPT Image quality: "low" | "medium" | "high" | "auto"
      const gptQuality = quality === "hd" ? "high" : (quality || "high");
      
      requestBody = {
        model: actualModel,
        prompt: finalPrompt,
        n: 1,
        size: size || "1024x1024",  // GPT Image: 1024x1024/1536x1024/1024x1536/auto
        quality: gptQuality  // GPT Image는 low/medium/high/auto
        // ⚠️ style 파라미터 제거 (GPT Image는 지원 안 함)
        // ⚠️ response_format 제거 (GPT Image는 기본 b64_json 반환)
      };
    } else {
      // DALL-E 3 모델용 파라미터
      requestBody = {
        model: actualModel,
        prompt: finalPrompt,
        n: 1,
        size: size || "1024x1024",  // DALL-E: 1024x1024/1792x1024/1024x1792
        quality: quality || defaultQuality,  // DALL-E는 standard/hd
        response_format: "b64_json"
        // DALL-E는 style: "natural" | "vivid" 가능 (선택사항)
      };
    }
    
    console.log('🚀 [API REQUEST]', {
      model: actualModel,
      isGptImage,
      requestBody
    });
    
    // OpenAI API 호출 (모델별 API 키 사용)
    const openaiResponse = await fetch("https://api.openai.com/v1/images/generations", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,  // ⭐ 분기된 API 키 사용
      },
      body: JSON.stringify(requestBody),
    });

    if (!openaiResponse.ok) {
      const errorData = await openaiResponse.text();
      console.error('❌ OpenAI API 오류:', {
        status: openaiResponse.status,
        statusText: openaiResponse.statusText,
        body: errorData
      });
      return new Response(
        JSON.stringify({ 
          success: false,
          fallback: false,
          error: `OpenAI API error: ${openaiResponse.status} - ${errorData}`,
          request_id: requestId,
          model_used: model || defaultModel,
          hint: openaiResponse.status === 400 ? 'GPT Image 모델 파라미터 오류. quality는 low/medium/high, output_format은 png/webp/jpeg만 허용됩니다.' : undefined
        }),
        { 
          status: openaiResponse.status, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }

    const data = await openaiResponse.json() as any;
    console.log('📦 OpenAI 응답 데이터:', {
      hasData: !!data.data,
      dataLength: data.data?.length,
      firstItem: data.data?.[0] ? Object.keys(data.data[0]) : []
    });

    // ⭐ GPT Image와 DALL-E 모두 b64_json 반환
    const base64Data = data.data[0]?.b64_json;

    if (!base64Data) {
      console.error('❌ 이미지 데이터 없음:', data);
      return new Response(
        JSON.stringify({ 
          success: false,
          fallback: false,
          error: 'No b64_json data received from OpenAI',
          request_id: requestId,
          model_used: model || defaultModel,
          response_keys: data.data?.[0] ? Object.keys(data.data[0]) : []
        }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const dataUrl = `data:image/png;base64,${base64Data}`;
    
    // ⭐ 더미 이미지 감지
    const imageSize = base64Data.length;
    const isDummy = imageSize < 10000; // 10KB 미만은 더미일 가능성
    
    console.log('✅ 이미지 생성 완료:', { 
      requestId, 
      imageSize,
      isDummy,
      promptPreview: finalPrompt.substring(0, 200) + "..."
    });

    // 성공 응답
    return new Response(
      JSON.stringify({
        success: true,
        fallback: false,
        isDummy: isDummy,  // ⭐ 더미 여부 추가
        usePlaceholder: isDummy,  // ⭐ 플레이스홀더 여부
        imageUrl: dataUrl,
        imageData: dataUrl, // 하위 호환성 유지
        prompt: finalPrompt, // ✅ 강화된 프롬프트 반환
        style: normalizedStyle, // ✅ 실제 적용된 스타일 반환
        request_id: requestId,
        model_used: model || 'dall-e-3',
        size_used: size || '1024x1024',
        quality_used: quality || 'hd',
        timestamp: new Date().toISOString(),
        // ✅ 디버그 필드
        debug: {
          style: normalizedStyle,
          originalStyle: style || '(empty)',
          finalPromptHead: finalPrompt.slice(0, 250),
          finalPromptFull: finalPrompt,  // ⭐ 전체 프롬프트
          imageSize: imageSize,
          isDummy: isDummy
        }
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );

  } catch (error) {
    console.error('❌ Function 오류:', error);
    
    // 에러 시 fallback 응답 (선택적)
    const requestId = `req_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    
    return new Response(
      JSON.stringify({ 
        success: false,
        fallback: false, // fallback 이미지 반환 시 true로 변경
        error: error instanceof Error ? error.message : 'Unknown error',
        request_id: requestId,
        model_used: 'dall-e-3',
        timestamp: new Date().toISOString()
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
}
