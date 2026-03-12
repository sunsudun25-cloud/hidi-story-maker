/**
 * Cloudflare Pages Function - OpenAI DALL-E 3 프록시
 * CORS 완전 지원 + A안(서버 프롬프트 빌더) 적용
 */

interface Env {
  OPENAI_API_KEY: string;
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

    // API 키 확인
    if (!env.OPENAI_API_KEY) {
      console.error('❌ OPENAI_API_KEY not configured');
      console.error('📝 Please add OPENAI_API_KEY to Cloudflare Pages environment variables');
      return new Response(
        JSON.stringify({ success: false, error: 'OpenAI API key not configured. Please add OPENAI_API_KEY to environment variables.' }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log('🎨 이미지 생성 요청:', { requestId, userText, purpose, mood, style, model, size, quality });

    // ⭐⭐⭐ A안(서버 단일화): 서버에서 프롬프트 생성
    // userText가 있으면 서버에서 빌드, 없으면 기존 prompt 사용 (하위 호환)
    let finalPrompt: string;
    let normalizedStyle: string;
    
    if (userText) {
      const { prompt, finalStyle } = buildServerPrompt(rawPrompt, purpose || 'memory', mood, style);
      finalPrompt = prompt;
      normalizedStyle = finalStyle;
    } else {
      finalPrompt = rawPrompt || 'A simple, friendly illustration.';
      normalizedStyle = style || '기본';
    }

    // ✅ 검증용 로그
    console.log('📡 [GEN_IMAGE] style=', normalizedStyle);
    console.log('📝 [FINAL_PROMPT_HEAD]', finalPrompt.slice(0, 300));
    
    // ⭐ GPT Image 모델 사용
    const defaultModel = "gpt-image-1";  // gpt-image-1, gpt-image-1.5, gpt-image-1-mini
    const defaultQuality = "medium";  // low | medium | high | auto
    const defaultOutputFormat = "png";  // png | webp | jpeg
    
    console.log('📡 OpenAI API 호출:', { 
      requestId, 
      model: model || defaultModel, 
      size: size || '1024x1024', 
      quality: quality || defaultQuality,
      output_format: defaultOutputFormat
    });

    // OpenAI API 호출 (GPT Image)
    // 주의: GPT Image는 b64_json만 지원, url 응답 형식 없음
    const openaiResponse = await fetch("https://api.openai.com/v1/images/generations", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: model || defaultModel,
        prompt: finalPrompt,
        size: size || "1024x1024",
        quality: quality || defaultQuality,
        output_format: defaultOutputFormat,
        // GPT Image에서는 n, response_format 파라미터 사용 안함
      }),
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
          model_used: model || defaultModel
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

    const base64Data = data.data[0].b64_json;

    if (!base64Data) {
      console.error('❌ b64_json 데이터 없음:', data);
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
    console.log('✅ 이미지 생성 완료:', { requestId });

    // 성공 응답
    return new Response(
      JSON.stringify({
        success: true,
        fallback: false,
        imageUrl: dataUrl,
        imageData: dataUrl, // 하위 호환성 유지
        prompt: finalPrompt, // ✅ 강화된 프롬프트 반환
        style: normalizedStyle, // ✅ 실제 적용된 스타일 반환
        request_id: requestId,
        model_used: model || 'gpt-image-1',
        size_used: size || '1024x1024',
        quality_used: quality || 'medium',
        output_format_used: 'png',
        timestamp: new Date().toISOString(),
        // ✅ 임시 디버그 필드 (확인 후 제거 가능)
        debug: {
          style: normalizedStyle,
          originalStyle: style || '(empty)',
          finalPromptHead: finalPrompt.slice(0, 250)
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
        model_used: 'gpt-image-1.5',
        timestamp: new Date().toISOString()
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
}
