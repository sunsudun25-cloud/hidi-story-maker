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
    const { prompt, style } = body;

    if (!prompt) {
      return new Response(
        JSON.stringify({ success: false, error: "프롬프트가 없습니다." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // API 키 확인
    if (!env.OPENAI_API_KEY) {
      console.error('❌ OPENAI_API_KEY not configured');
      return new Response(
        JSON.stringify({ success: false, error: 'API key not configured' }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log('🎨 이미지 생성 요청:', { prompt, style });

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
    
    // ⭐⭐⭐ 역할 재정의: 책이 아닌 순수 삽화 작가
    const roleDefinition = `
You are a PURE ILLUSTRATION ARTIST, NOT a book designer.
Your ONLY job is to create standalone artwork for children's books.
You do NOT create book pages, book spreads, or anything with text.
You create ONLY the picture that goes inside the book.
    `.trim();
    
    // ⭐⭐⭐ 텍스트 완전 금지 (구조적 접근)
    const textProhibition = `
ABSOLUTE PROHIBITION - NO TEXT ANYWHERE:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
This is NOT a book page. This is ONLY the illustration.
The text will be added separately by the publisher.

DO NOT include:
❌ NO text, letters, words, alphabets, numbers
❌ NO books with visible text or writing
❌ NO signs, posters, billboards with text
❌ NO speech bubbles, captions, labels
❌ NO logos, watermarks, signatures
❌ NO newspapers, magazines with readable text
❌ NO chalkboards, whiteboards with writing
❌ NO computer screens, phones with text
❌ NO ANY form of written language (English, Korean, Chinese, Japanese, etc.)

INSTEAD, show:
✅ Character facial expressions and body language
✅ Environmental storytelling through objects and scenes
✅ Actions and interactions between characters
✅ Visual metaphors and symbolic elements
✅ Pure artistic composition without words
    `.trim();
    
    // ⭐⭐⭐ 삽화 전용 지침
    const illustrationGuidelines = `
ILLUSTRATION GUIDELINES:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
- Create a single, unified scene (NOT a book spread)
- Focus on character emotions and actions
- Use visual storytelling only
- Clean, simple composition
- Professional children's book illustration quality
- Art style: ${stylePrompt}
    `.trim();
    
    // ⭐ 프롬프트 구조: 역할 → 금지사항 → 장면 → 스타일
    const fullPrompt = `${roleDefinition}

${textProhibition}

SCENE TO ILLUSTRATE:
${prompt}

${illustrationGuidelines}`;

    console.log('📡 OpenAI API 호출:', fullPrompt);

    // OpenAI API 호출
    const openaiResponse = await fetch("https://api.openai.com/v1/images/generations", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "dall-e-3",
        prompt: fullPrompt,
        n: 1,
        size: "1024x1024",
        quality: "standard",
        response_format: "b64_json",
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
        JSON.stringify({ success: false, error: 'No image data received' }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const dataUrl = `data:image/png;base64,${base64Data}`;
    console.log('✅ 이미지 생성 완료');

    // 성공 응답
    return new Response(
      JSON.stringify({
        success: true,
        imageUrl: dataUrl,  // imageData → imageUrl로 변경 (imageService.ts와 일치)
        imageData: dataUrl, // 하위 호환성 유지
        prompt: fullPrompt,
        style: style || '기본',
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );

  } catch (error) {
    console.error('❌ Function 오류:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
}
