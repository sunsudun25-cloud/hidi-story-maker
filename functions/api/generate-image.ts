/**
 * Cloudflare Pages Function - OpenAI DALL-E 3 프록시
 * CORS 완전 지원 버전
 */

interface Env {
  OPENAI_API_KEY: string;
}

interface ImageRequest {
  prompt: string;
  style?: string;
  model?: string;
  size?: string;
  quality?: string;
}

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
    const { prompt, style, model, size, quality } = body;
    
    // 요청 ID 생성 (추적용)
    const requestId = `req_${Date.now()}_${Math.random().toString(36).substring(7)}`;

    if (!prompt) {
      return new Response(
        JSON.stringify({ success: false, error: "프롬프트가 없습니다." }),
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

    console.log('🎨 이미지 생성 요청:', { requestId, prompt, style, model, size, quality });

    // 스타일 매핑
    const styleMap: Record<string, string> = {
      '수채화': 'watercolor painting style',
      'watercolor': 'watercolor painting style',
      '동화풍': 'children\'s book illustration style',
      'fairytale': 'children\'s book illustration style',
      '파스텔톤': 'soft pastel colors style',
      'pastel': 'soft pastel colors style',
      '따뜻한 스타일': 'warm and cozy atmosphere',
      'warm': 'warm and cozy atmosphere',
      '애니메이션': 'anime illustration style',
      '연필스케치': 'pencil sketch style',
      '기본': 'illustration style',
      '기본 스타일': 'illustration style',
    };

    const stylePrompt = styleMap[style || '기본'] || 'illustration style';
    
    // ⭐ 스타일을 프롬프트 본문에 강하게 삽입
    const styleEnforcement = `
[STYLE ENFORCEMENT - HIGHEST PRIORITY]
Medium: ${stylePrompt}
Art Style: ${stylePrompt}
This MUST be created in ${stylePrompt}.
Style Requirements: ${stylePrompt} is MANDATORY.
`;
    
    // ⭐ 동화책 삽화 전용 프롬프트 강화 (텍스트 제거 + 단일 페이지)
    const noTextGuide = `
[CRITICAL REQUIREMENT - NO TEXT]
This must be a pure illustration with ABSOLUTELY NO TEXT.
- NO words, letters, numbers, or symbols of any kind
- NO signs, labels, captions, or speech bubbles  
- NO written language in any form (English, Korean, etc.)
- Only visual imagery, no textual elements
- Pure illustration without any text overlay
`;

    const singlePageGuide = `
[IMPORTANT - SINGLE PAGE]
Create a SINGLE PAGE illustration (NOT a book spread).
- Show ONE complete scene, not two pages
- NO center fold or gutter line
- Full frame composition, not split pages
- Single unified image, not left-right divided layout
`;
    
    const consistencyGuide = '[CONSISTENCY] Consistent character design and art style';
    const qualityGuide = '[QUALITY] High quality detailed illustration, clean composition';
    
    // 프롬프트 구성: 스타일 강제 → 사용자 프롬프트 → 제약사항
    const fullPrompt = `${styleEnforcement}\n\nMain Subject: ${prompt}\n\n${singlePageGuide}\n${noTextGuide}\n${consistencyGuide}\n${qualityGuide}`;

    console.log('📡 OpenAI API 호출:', { requestId, model: model || 'dall-e-3', size: size || '1024x1024', quality: quality || 'standard' });
    console.log('📝 Full Prompt:', fullPrompt);

    // OpenAI API 호출
    const openaiResponse = await fetch("https://api.openai.com/v1/images/generations", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: model || "dall-e-3",
        prompt: fullPrompt,
        n: 1,
        size: size || "1024x1024",
        quality: quality || "standard",
        response_format: "b64_json",
      }),
    });

    if (!openaiResponse.ok) {
      const errorData = await openaiResponse.text();
      console.error('❌ OpenAI API 오류:', errorData);
      return new Response(
        JSON.stringify({ 
          success: false,
          fallback: false,
          error: `OpenAI API error: ${openaiResponse.status}`,
          request_id: requestId,
          model_used: model || 'dall-e-3'
        }),
        { 
          status: openaiResponse.status, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }

    const data = await openaiResponse.json() as any;
    const base64Data = data.data[0].b64_json;

    if (!base64Data) {
      return new Response(
        JSON.stringify({ 
          success: false,
          fallback: false,
          error: 'No image data received',
          request_id: requestId,
          model_used: model || 'dall-e-3'
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
        prompt: fullPrompt,
        style: style || '기본',
        request_id: requestId,
        model_used: model || 'dall-e-3',
        size_used: size || '1024x1024',
        quality_used: quality || 'standard',
        timestamp: new Date().toISOString()
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
