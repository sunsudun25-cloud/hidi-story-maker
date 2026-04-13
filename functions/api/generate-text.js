/**
 * Cloudflare Pages Function - AI 텍스트 생성
 * Google Gemini API 사용 + Rate Limit & Retry 처리
 */

// ✅ 재시도 헬퍼 함수
async function retryWithBackoff(fn, maxRetries = 3, baseDelay = 1000) {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      const isLastAttempt = attempt === maxRetries - 1;
      const isRateLimitError = error.status === 429 || error.message?.includes('rate limit');
      
      if (isLastAttempt || !isRateLimitError) {
        throw error;
      }
      
      // Exponential backoff: 1s, 2s, 4s
      const delay = baseDelay * Math.pow(2, attempt);
      console.log(`⏳ [generate-text] Rate limit hit, retrying in ${delay}ms (attempt ${attempt + 1}/${maxRetries})`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
}

export async function onRequest(context) {
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
    const body = await request.json();
    // 🔥 maxTokens 기본값을 4000으로 증가 (드라마 대본 등 긴 응답을 위해)
    const { prompt, temperature = 0.7, maxTokens = 4000 } = body;

    if (!prompt || !prompt.trim()) {
      return new Response(
        JSON.stringify({ success: false, error: "프롬프트가 없습니다." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // API 키 확인
    if (!env.GEMINI_API_KEY) {
      console.error('❌ GEMINI_API_KEY not configured');
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Gemini API key not configured. Please add GEMINI_API_KEY to environment variables.',
        }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log('📝 [generate-text] Gemini API 호출 시작');

    // ✅ 재시도 로직 적용
    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${env.GEMINI_API_KEY}`;
    
    const text = await retryWithBackoff(async () => {
      const geminiResponse = await fetch(geminiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompt
                }
              ]
            }
          ],
          generationConfig: {
            temperature: temperature,
            maxOutputTokens: maxTokens,
          }
        }),
      });

      if (!geminiResponse.ok) {
        const errorData = await geminiResponse.text();
        console.error('❌ Gemini API 오류:', errorData);
        
        // Rate limit 에러인지 확인
        if (geminiResponse.status === 429) {
          const error = new Error(`Gemini API rate limit: ${geminiResponse.status}`);
          error.status = 429;
          throw error;
        }
        
        throw new Error(`Gemini API error: ${geminiResponse.status}`);
      }

      const data = await geminiResponse.json();
      const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text || "";

      if (!generatedText) {
        console.error('❌ Gemini 응답에 텍스트 없음:', JSON.stringify(data));
        throw new Error('No text in Gemini response');
      }

      return generatedText;
    });

    console.log('✅ [generate-text] 텍스트 생성 완료:', text.length, '자');

    return new Response(
      JSON.stringify({
        success: true,
        text: text.trim()
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );

  } catch (error) {
    console.error('❌ [generate-text] 오류:', error);
    
    // Rate limit 에러에 대한 친절한 메시지
    if (error.status === 429 || error.message?.includes('rate limit')) {
      return new Response(
        JSON.stringify({ 
          success: false,
          error: '현재 많은 사용자가 접속하여 잠시 대기 중입니다. 10초 후에 다시 시도해주세요.',
          retryAfter: 10
        }),
        { 
          status: 429, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }
    
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message || 'Unknown error',
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
}
