/**
 * Cloudflare Pages Function - OpenAI DALL-E 3 프록시
 * /api/generate-image 엔드포인트
 */

interface Env {
  OPENAI_API_KEY: string;
}

interface ImageRequest {
  prompt: string;
  style?: string;
}

export async function onRequestPost(context: { request: Request; env: Env }) {
  const { request, env } = context;

  try {
    // API 키 확인
    if (!env.OPENAI_API_KEY) {
      console.error('❌ OPENAI_API_KEY not configured');
      return new Response(
        JSON.stringify({ success: false, error: 'API key not configured' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // 요청 파라미터 파싱
    const body = await request.json() as ImageRequest;
    const { prompt, style } = body;

    if (!prompt) {
      return new Response(
        JSON.stringify({ success: false, error: 'prompt is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    console.log('🎨 이미지 생성 요청:', { prompt, style });

    // 스타일 매핑
    const styleMap: Record<string, string> = {
      '수채화': 'watercolor painting style',
      'watercolor': 'watercolor painting style',
      '동화풍': 'fairytale illustration style',
      'fairytale': 'fairytale illustration style',
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
    const fullPrompt = `${prompt}. ${stylePrompt}. High quality, detailed, no text or watermarks.`;

    console.log('📡 OpenAI API 호출:', fullPrompt);

    // OpenAI API 호출
    const openaiResponse = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'dall-e-3',
        prompt: fullPrompt,
        n: 1,
        size: '1024x1024',
        quality: 'standard',
        response_format: 'b64_json',
      }),
    });

    if (!openaiResponse.ok) {
      const errorData = await openaiResponse.text();
      console.error('❌ OpenAI API 오류:', errorData);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: `OpenAI API error: ${openaiResponse.status}` 
        }),
        { status: openaiResponse.status, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const data = await openaiResponse.json() as any;
    const base64Data = data.data[0].b64_json;

    if (!base64Data) {
      return new Response(
        JSON.stringify({ success: false, error: 'No image data received' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const dataUrl = `data:image/png;base64,${base64Data}`;
    console.log('✅ 이미지 생성 완료');

    // 성공 응답
    return new Response(
      JSON.stringify({
        success: true,
        imageData: dataUrl,
        prompt: fullPrompt,
        style: style || '기본',
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('❌ Function 오류:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
