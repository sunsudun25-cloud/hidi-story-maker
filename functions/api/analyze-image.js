/**
 * Cloudflare Pages Function - 이미지 텍스트 인식 (OCR)
 * Google Gemini Vision API 사용
 * 손글씨, 인쇄물 모두 인식 가능
 */

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
    const { imageBase64, type } = body;

    // 입력 검증
    if (!imageBase64) {
      return new Response(
        JSON.stringify({ success: false, error: "이미지가 없습니다." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // API 키 확인
    if (!env.GEMINI_API_KEY) {
      console.error('❌ GEMINI_API_KEY not configured');
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Gemini API key not configured.',
        }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Base64 데이터에서 MIME 타입과 실제 데이터 분리
    let mimeType = 'image/jpeg';
    let base64Data = imageBase64;
    
    if (imageBase64.startsWith('data:')) {
      const matches = imageBase64.match(/^data:([^;]+);base64,(.+)$/);
      if (matches) {
        mimeType = matches[1];
        base64Data = matches[2];
      }
    }

    console.log('📸 [OCR] 이미지 분석 시작:', { type, mimeType });

    // 타입별 프롬프트 설정
    const prompts = {
      handwriting: `이 이미지에 있는 손글씨를 정확하게 읽어서 텍스트로 변환해주세요.

규칙:
1. 한글, 영어, 숫자 모두 인식해주세요
2. 줄바꿈, 문단 구분을 유지해주세요
3. 인식할 수 없는 글자는 [?]로 표시해주세요
4. 오직 텍스트만 출력하고, 다른 설명은 추가하지 마세요

이미지에서 읽은 내용:`,
      
      print: `이 이미지에 있는 인쇄된 텍스트를 정확하게 읽어서 추출해주세요.

규칙:
1. 모든 텍스트를 순서대로 읽어주세요
2. 줄바꿈, 문단 구분을 유지해주세요
3. 제목, 본문을 구분해주세요
4. 오직 텍스트만 출력하고, 다른 설명은 추가하지 마세요

추출된 텍스트:`,
      
      general: `이 이미지의 내용을 자세히 설명해주세요.
이미지에 텍스트가 있다면 그것도 함께 알려주세요.`
    };

    const prompt = prompts[type] || prompts.general;

    // Gemini Vision API 호출
    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${env.GEMINI_API_KEY}`;
    
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
              },
              {
                inline_data: {
                  mime_type: mimeType,
                  data: base64Data
                }
              }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.1,  // 낮은 온도로 정확도 향상
          maxOutputTokens: 2000,
        }
      }),
    });

    if (!geminiResponse.ok) {
      const errorData = await geminiResponse.text();
      console.error('❌ Gemini Vision API 오류:', errorData);
      throw new Error(`Gemini Vision API error: ${geminiResponse.status}`);
    }

    const data = await geminiResponse.json();
    const extractedText = data.candidates?.[0]?.content?.parts?.[0]?.text || "";

    if (!extractedText) {
      console.error('❌ Gemini 응답에 텍스트 없음:', JSON.stringify(data));
      throw new Error('텍스트를 인식할 수 없습니다');
    }

    console.log('✅ [OCR] 텍스트 추출 완료:', extractedText.substring(0, 100));

    return new Response(
      JSON.stringify({
        success: true,
        text: extractedText.trim()
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );

  } catch (error) {
    console.error('❌ [OCR] 오류:', error);
    
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
