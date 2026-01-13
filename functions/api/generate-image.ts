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

// 스타일 매핑 (전역 상수)
const STYLE_MAP: Record<string, string> = {
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

/**
 * ⭐ 핵심: 프롬프트 강화 함수 (모든 경로에서 무조건 호출)
 * @param rawPrompt 사용자 입력 프롬프트
 * @param rawStyle 사용자 선택 스타일
 * @returns 강화된 최종 프롬프트
 */
function buildEnhancedPrompt(rawPrompt: string, rawStyle: string): string {
  // 1) "기본" 또는 빈 값이면 안전 스타일로 보정
  const normalizedStyle = !rawStyle || rawStyle === '기본' ? '수채화' : rawStyle;
  const stylePrompt = STYLE_MAP[normalizedStyle] || STYLE_MAP['기본'];
  
  // 2) 강화 프롬프트 구성 (스타일 강제 + 출력 규칙)
  const enhancedPrompt = `
[STYLE DIRECTIVE]
Style: ${normalizedStyle}
Rendering: ${stylePrompt}

${rawPrompt}

=== OUTPUT RULES ===
No readable text, no letters, no typography.
No watermark, no logo, no brand marks.
Single illustration, one scene, clean composition.
Bright, positive, age-appropriate for all ages.
`.trim();

  return enhancedPrompt;
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

    // ⭐⭐⭐ 핵심: 모든 경로(Practice/DrawDirect/Custom)에서 무조건 강화 프롬프트 적용
    const rawPrompt = prompt || '';
    const rawStyle = style || '';
    const finalPrompt = buildEnhancedPrompt(rawPrompt, rawStyle);
    
    // 최종 적용된 스타일 추출 (디버그용)
    const normalizedStyle = !rawStyle || rawStyle === '기본' ? '수채화' : rawStyle;

    // ✅ 검증용 로그
    console.log('📡 [GEN_IMAGE] style=', normalizedStyle);
    console.log('📝 [FINAL_PROMPT_HEAD]', finalPrompt.slice(0, 250));
    console.log('📡 OpenAI API 호출:', { requestId, model: model || 'dall-e-3', size: size || '1024x1024', quality: quality || 'standard' });

    // OpenAI API 호출
    const openaiResponse = await fetch("https://api.openai.com/v1/images/generations", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: model || "dall-e-3",
        prompt: finalPrompt, // ✅ buildEnhancedPrompt 결과 사용
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
        prompt: finalPrompt, // ✅ 강화된 프롬프트 반환
        style: normalizedStyle, // ✅ 실제 적용된 스타일 반환
        request_id: requestId,
        model_used: model || 'dall-e-3',
        size_used: size || '1024x1024',
        quality_used: quality || 'standard',
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
