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

    // ⭐⭐⭐ A안(서버 단일화): 클라이언트에서 이미 완성된 프롬프트 받음
    // buildAutoPrompt()로 만들어진 최종 프롬프트를 그대로 사용
    const finalPrompt = prompt || 'A simple, friendly illustration.';
    const normalizedStyle = style || '기본';

    // ✅ 검증용 로그
    console.log('📡 [GEN_IMAGE] style=', normalizedStyle);
    console.log('📝 [FINAL_PROMPT_HEAD]', finalPrompt.slice(0, 300));
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
