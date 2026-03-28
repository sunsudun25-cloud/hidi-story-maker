/**
 * Cloudflare Pages Function - GPT Image 1.5 전용 (실사 스타일)
 * 
 * 목적: 실사 스타일 전용 이미지 생성
 * 모델: gpt-image-1.5 (최신)
 * 환경변수: OPENAI_API_KEY_GPT_IMAGE (별도 API 키)
 * 버전: 1.0.1
 */

interface Env {
  OPENAI_API_KEY_GPT_IMAGE: string;  // 실사 전용 API 키
}

interface GenerateRequest {
  prompt: string;
  model?: string;
  size?: string;
  quality?: string;
  n?: number;
}

interface ErrorResponse {
  error: string;
  details?: any;
}

// CORS 헤더
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

/**
 * OPTIONS 요청 처리
 */
function handleOptions(): Response {
  return new Response(null, {
    status: 204,
    headers: corsHeaders
  });
}

/**
 * GPT Image 1.5 API 호출
 */
async function callGPTImageAPI(
  apiKey: string,
  prompt: string,
  model: string,
  size: string,
  quality: string
): Promise<any> {
  const requestBody = {
    model,
    prompt,
    n: 1,
    size,
    quality,
    output_format: "png"  // ⭐ PNG 형식으로 b64_json 응답 받기
  };

  console.log('🔍 [GPT IMAGE 1.5 API] Request:', {
    model,
    size,
    quality,
    output_format: "png",
    promptLength: prompt.length,
    apiKeyPrefix: apiKey?.slice(0, 8) || 'MISSING',  // ⭐ 8자로 줄임
    endpoint: 'https://api.openai.com/v1/images/generations',
    timestamp: new Date().toISOString()
  });

  const response = await fetch('https://api.openai.com/v1/images/generations', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify(requestBody)
  });

  const responseText = await response.text();
  
  if (!response.ok) {
    console.error('❌ [GPT IMAGE 1.5 API] Error:', response.status, responseText);
    throw new Error(`OpenAI API Error ${response.status}: ${responseText}`);
  }

  const data = JSON.parse(responseText);
  console.log('✅ [GPT IMAGE 1.5 API] Success:', {
    hasData: !!data.data,
    dataLength: data.data?.length,
    timestamp: new Date().toISOString()
  });

  return data;
}

/**
 * 메인 핸들러
 */
export async function onRequestPost(context: { request: Request; env: Env }): Promise<Response> {
  const { request, env } = context;

  // ⏱️ [CF0] Cloudflare Function 시작
  const cf0 = Date.now();
  console.log('⏱️ [CF0] Cloudflare Function start', {
    timestamp: cf0
  });

  try {
    // 🔍 디버깅: 환경변수 확인
    console.log('[GPT IMAGE ENV CHECK]', {
      hasKey: !!env.OPENAI_API_KEY_GPT_IMAGE,
      keyPrefix: env.OPENAI_API_KEY_GPT_IMAGE?.slice(0, 8) || 'MISSING',
      keyType: env.OPENAI_API_KEY_GPT_IMAGE?.startsWith('sk-') ? 'OpenAI' : (env.OPENAI_API_KEY_GPT_IMAGE?.startsWith('AIza') ? 'Gemini' : 'Unknown'),
      endpoint: '/api/generate-image-realistic',
      timestamp: new Date().toISOString()
    });

    // ⚠️ 임시: OPENAI_API_KEY_GPT_IMAGE가 없으면 OPENAI_API_KEY 사용
    const apiKey = env.OPENAI_API_KEY_GPT_IMAGE || env.OPENAI_API_KEY;
    
    // API 키 확인
    if (!apiKey) {
      console.error('❌ [GPT IMAGE 1.5] Missing API key');
      return Response.json(
        { 
          error: 'Server configuration error: OpenAI API key not configured',
          details: 'Please set OPENAI_API_KEY or OPENAI_API_KEY_GPT_IMAGE environment variable'
        } as ErrorResponse,
        { status: 500, headers: corsHeaders }
      );
    }
    
    console.log('🔑 [GPT IMAGE KEY]', {
      usingGptImageKey: !!env.OPENAI_API_KEY_GPT_IMAGE,
      usingFallback: !env.OPENAI_API_KEY_GPT_IMAGE && !!env.OPENAI_API_KEY,
      keyPrefix: apiKey.slice(0, 8)
    });

    // 요청 파싱
    const body = await request.json() as GenerateRequest;
    const { 
      prompt, 
      model = 'gpt-image-1.5',  // 기본값: 최신 모델
      size = '1536x1024',       // 기본값: 와이드 화면
      quality = 'high',         // 기본값: 고품질
    } = body;

    if (!prompt) {
      return Response.json(
        { error: 'Missing required field: prompt' } as ErrorResponse,
        { status: 400, headers: corsHeaders }
      );
    }

    // 모델 검증 (GPT Image 계열만 허용)
    if (!model.startsWith('gpt-image')) {
      return Response.json(
        { 
          error: 'Invalid model',
          details: 'This endpoint only supports gpt-image models (gpt-image-1, gpt-image-1.5, etc.)'
        } as ErrorResponse,
        { status: 400, headers: corsHeaders }
      );
    }

    // ⏱️ [CF1] OpenAI API 호출 직전
    const cf1 = Date.now();
    console.log('⏱️ [CF1] Before OpenAI API call', {
      timestamp: cf1,
      elapsed_cf_setup: cf1 - cf0,
      message: 'Cloudflare Function 준비 시간'
    });

    // API 호출
    const data = await callGPTImageAPI(
      apiKey,  // ⚠️ 임시: fallback 키 사용
      prompt,
      model,
      size,
      quality
    );

    // ⏱️ [CF2] OpenAI API 응답 완료
    const cf2 = Date.now();
    console.log('⏱️ [CF2] After OpenAI API response', {
      timestamp: cf2,
      elapsed_openai_call: cf2 - cf1,
      message: '⭐ OpenAI 이미지 생성 시간 (실제 AI 처리)'
    });

    // ⭐ b64_json 응답 처리 (GPT Image는 base64로 응답)
    const base64Data = data.data?.[0]?.b64_json;
    if (!base64Data) {
      console.error('❌ No b64_json in response:', {
        hasData: !!data.data,
        firstItem: data.data?.[0] ? Object.keys(data.data[0]) : []
      });
      throw new Error('No b64_json in response');
    }

    // ⏱️ [CF3] base64 데이터 URL 생성 직전
    const cf3 = Date.now();
    console.log('⏱️ [CF3] Before base64 data URL creation', {
      timestamp: cf3,
      elapsed_data_extraction: cf3 - cf2,
      base64_length: base64Data.length,
      message: 'base64 데이터 추출 시간'
    });

    const imageUrl = `data:image/png;base64,${base64Data}`;
    
    // ⏱️ [CF4] 응답 반환 직전
    const cf4 = Date.now();
    console.log('⏱️ [CF4] Before response return', {
      timestamp: cf4,
      elapsed_url_creation: cf4 - cf3,
      total_cloudflare_time: cf4 - cf0,
      message: 'data URL 생성 시간'
    });
    
    console.log('✅ [GPT IMAGE 1.5] Image generated successfully:', {
      base64Length: base64Data.length,
      imageUrlPrefix: imageUrl.substring(0, 50) + '...'
    });

    console.log('📊 [CLOUDFLARE FUNCTION TIME BREAKDOWN]', {
      "1_CF_Setup": `${cf1 - cf0}ms`,
      "2_OpenAI_API": `${cf2 - cf1}ms ⬅️ ⭐ OpenAI 실제 생성 시간`,
      "3_Base64_Extract": `${cf3 - cf2}ms`,
      "4_DataURL_Create": `${cf4 - cf3}ms`,
      "TOTAL": `${cf4 - cf0}ms`
    });

    // 응답
    return Response.json(
      {
        success: true,
        imageUrl,
        model,
        size,
        quality,
        timestamp: new Date().toISOString()
      },
      { status: 200, headers: corsHeaders }
    );

  } catch (error: any) {
    console.error('❌ [GPT IMAGE 1.5] Handler error:', error);
    
    return Response.json(
      {
        error: error.message || 'Internal server error',
        details: error.stack
      } as ErrorResponse,
      { status: 500, headers: corsHeaders }
    );
  }
}

/**
 * OPTIONS 핸들러
 */
export async function onRequestOptions(): Promise<Response> {
  return handleOptions();
}
