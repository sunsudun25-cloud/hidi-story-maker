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

    // 스타일 매핑 (photo-realistic → photo-inspired illustration)
    const styleMap: Record<string, string> = {
      '수채화': 'soft watercolor wash, gentle paper texture, warm light, flowing brushstrokes',
      'watercolor': 'soft watercolor wash, gentle paper texture, warm light',
      '동화풍': 'children\'s book illustration style, clear lines, bright colors, storybook quality',
      'fairytale': 'children\'s book illustration style, clear lines, bright colors',
      '파스텔톤': 'pastel colors, soft gradients, gentle atmosphere, light and airy',
      'pastel': 'pastel colors, soft gradients, gentle atmosphere',
      '따뜻한 스타일': 'warm color palette, cozy atmosphere, inviting composition',
      'warm': 'warm color palette, cozy atmosphere',
      '만화풍': 'clean lineart, flat colors, simple shading, cartoon style, cute and friendly',
      '감성 사진 같은 그림': 'photo-inspired illustration, natural lighting, subtle imperfections, realistic yet artistic',
      '애니메이션': 'anime illustration style',
      '연필스케치': 'pencil sketch style',
      '흑백 스케치': 'pencil sketch, line drawing, monochrome, hatching and cross-hatching, artistic rendering',
      '기본': 'illustration style, balanced composition, pleasing aesthetics',
      '기본 스타일': 'illustration style, balanced composition',
    };

    // ✅ 스타일 기본값 강제 (빈 값 방지)
    const safeStyle = style || '수채화';
    const stylePrompt = styleMap[safeStyle] || styleMap['기본'];
    
    // ⭐ 강력한 스타일 강제 프롬프트 (모든 경로 동일 적용)
    const fullPrompt = `
[STYLE DIRECTIVE]
Style: ${safeStyle}
Rendering: ${stylePrompt}

${prompt}

=== OUTPUT RULES ===
No readable text, no letters, no typography.
No watermark, no logo, no brand marks.
Single illustration, one scene, clean composition.
Bright, positive, age-appropriate for all ages.
`.trim();

    console.log('📡 OpenAI API 호출:', { requestId, model: model || 'dall-e-3', size: size || '1024x1024', quality: quality || 'standard' });
    console.log('🔍 [STYLE CHECK] Original style:', style, '→ Safe style:', safeStyle);
    console.log('📝 [FINAL PROMPT]:', fullPrompt);

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
        style: safeStyle, // ✅ 실제 적용된 스타일 반환
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
