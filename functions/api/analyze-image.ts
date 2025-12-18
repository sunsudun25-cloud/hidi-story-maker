/**
 * Cloudflare Pages Function - OpenAI Vision API 프록시
 * 손글씨 이미지를 분석하여 텍스트 추출
 */

interface Env {
  OPENAI_API_KEY: string;
}

interface AnalyzeRequest {
  imageBase64: string;
  type?: 'handwriting' | 'general';
}

export async function onRequest(context: { request: Request; env: Env }) {
  const { request, env } = context;

  // CORS 헤더
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };

  // OPTIONS 요청 (Preflight) 처리
  if (request.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: corsHeaders,
    });
  }

  try {
    const body = await request.json() as AnalyzeRequest;
    const { imageBase64, type = 'handwriting' } = body;

    if (!imageBase64) {
      return new Response(
        JSON.stringify({ success: false, error: "이미지 데이터가 없습니다." }),
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

    console.log('🔍 이미지 분석 요청:', { type });

    // 분석 타입에 따른 프롬프트
    const prompts = {
      handwriting: `이 이미지에 적힌 손글씨를 정확하게 읽어주세요.

중요한 규칙:
1. 한글, 영어, 숫자 모두 정확하게 읽어주세요
2. 읽은 텍스트만 출력하고, 설명이나 해석은 하지 마세요
3. 문장 부호도 그대로 유지해주세요
4. 여러 줄이면 줄바꿈도 그대로 유지해주세요
5. 만약 글씨를 읽을 수 없다면 "텍스트를 찾을 수 없습니다"라고 답해주세요

손글씨 텍스트:`,
      general: `이 이미지의 내용을 자세히 설명해주세요.

다음 내용을 포함해주세요:
1. 이미지에 무엇이 있는지
2. 색깔과 분위기
3. 전체적인 느낌

간단명료하게 2-3문장으로 설명해주세요.`
    };

    const prompt = prompts[type];

    console.log('📡 OpenAI Vision API 호출');

    // OpenAI Vision API 호출
    const openaiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: prompt
              },
              {
                type: "image_url",
                image_url: {
                  url: imageBase64,
                  detail: "high"
                }
              }
            ]
          }
        ],
        max_tokens: 1000,
        temperature: 0.3, // 정확한 텍스트 추출을 위해 낮은 temperature
      }),
    });

    if (!openaiResponse.ok) {
      const errorData = await openaiResponse.text();
      console.error('❌ OpenAI Vision API 오류:', errorData);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: `OpenAI Vision API error: ${openaiResponse.status}` 
        }),
        { 
          status: openaiResponse.status, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }

    const data = await openaiResponse.json() as any;
    const extractedText = data.choices[0].message.content.trim();

    console.log('✅ 이미지 분석 완료:', extractedText.substring(0, 100));

    // 성공 응답
    return new Response(
      JSON.stringify({
        success: true,
        text: extractedText,
        type: type,
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
