/**
 * Cloudflare Pages Function - 이미지 기반 글쓰기 조언
 * Google Gemini Vision API 사용
 * 이미지를 분석하고 글쓰기 조언 제공
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
    const { imageBase64, genre } = body;

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

    console.log('📸 [글쓰기 조언] 이미지 분석 시작:', { genre, mimeType });

    // 장르별 분석 프롬프트
    const genrePrompts = {
      diary: `이 사진을 보고 일기를 쓴다면 어떤 내용을 담을 수 있는지 조언해주세요.

다음 형식으로 답변해주세요:
1. 시각적 요소: (사진 속 주요 사물/장면을 3-5개 나열)
2. 분위기/감정: (이 사진이 주는 느낌을 한 문장으로)
3. 글쓰기 조언: (이 사진으로 일기를 쓸 때 어떤 점을 강조하면 좋을지)`,

      letter: `이 사진을 편지에 포함한다면 어떤 내용을 담을 수 있는지 조언해주세요.

다음 형식으로 답변해주세요:
1. 시각적 요소: (사진 속 주요 사물/장면을 3-5개 나열)
2. 분위기/감정: (이 사진이 주는 느낌을 한 문장으로)
3. 글쓰기 조언: (이 사진을 편지에 넣을 때 어떤 이야기를 담으면 좋을지)`,

      essay: `이 사진을 보고 수필을 쓴다면 어떤 내용을 담을 수 있는지 조언해주세요.

다음 형식으로 답변해주세요:
1. 시각적 요소: (사진 속 주요 사물/장면을 3-5개 나열)
2. 분위기/감정: (이 사진이 주는 느낌을 한 문장으로)
3. 글쓰기 조언: (이 사진으로 수필을 쓸 때 어떤 주제나 교훈을 담으면 좋을지)`,

      poem: `이 사진을 보고 시를 쓴다면 어떤 내용을 담을 수 있는지 조언해주세요.

다음 형식으로 답변해주세요:
1. 시각적 요소: (사진 속 주요 사물/장면을 3-5개 나열)
2. 분위기/감정: (이 사진이 주는 느낌을 한 문장으로)
3. 글쓰기 조언: (이 사진으로 시를 쓸 때 어떤 이미지나 감정을 표현하면 좋을지)`,

      novel: `이 사진을 보고 소설을 쓴다면 어떤 내용을 담을 수 있는지 조언해주세요.

다음 형식으로 답변해주세요:
1. 시각적 요소: (사진 속 주요 사물/장면을 3-5개 나열)
2. 분위기/감정: (이 사진이 주는 느낌을 한 문장으로)
3. 글쓰기 조언: (이 사진을 배경으로 소설을 쓸 때 어떤 줄거리나 사건을 만들 수 있을지)`,

      fourcut: `이 사진을 보고 4컷 인터뷰를 쓴다면 어떤 내용을 담을 수 있는지 조언해주세요.

다음 형식으로 답변해주세요:
1. 시각적 요소: (사진 속 주요 사물/장면을 3-5개 나열)
2. 분위기/감정: (이 사진이 주는 느낌을 한 문장으로)
3. 글쓰기 조언: (이 사진으로 4컷 인터뷰를 만들 때 어떤 질문과 답변을 만들 수 있을지)`,

      autobiography: `이 사진을 보고 자서전을 쓴다면 어떤 내용을 담을 수 있는지 조언해주세요.

다음 형식으로 답변해주세요:
1. 시각적 요소: (사진 속 주요 사물/장면을 3-5개 나열)
2. 분위기/감정: (이 사진이 주는 느낌을 한 문장으로)
3. 글쓰기 조언: (이 사진을 자서전에 넣을 때 어떤 삶의 경험이나 교훈을 담으면 좋을지)`,
    };

    const prompt = genrePrompts[genre] || genrePrompts.essay;

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
          temperature: 0.5,
          maxOutputTokens: 800,
        }
      }),
    });

    if (!geminiResponse.ok) {
      const errorData = await geminiResponse.text();
      console.error('❌ Gemini Vision API 오류:', errorData);
      throw new Error(`Gemini Vision API error: ${geminiResponse.status}`);
    }

    const data = await geminiResponse.json();
    const rawAdvice = data.candidates?.[0]?.content?.parts?.[0]?.text || "";

    if (!rawAdvice) {
      console.error('❌ Gemini 응답 없음:', JSON.stringify(data));
      throw new Error('조언을 생성할 수 없습니다');
    }

    console.log('✅ [글쓰기 조언] 생성 완료:', rawAdvice.substring(0, 150));

    // 응답 파싱 (1. 시각적 요소: ... 2. 분위기/감정: ... 3. 글쓰기 조언: ...)
    const parseAdvice = (text) => {
      const visualMatch = text.match(/1\.\s*시각적 요소[:\s]+(.*?)(?=2\.|$)/s);
      const moodMatch = text.match(/2\.\s*분위기\/감정[:\s]+(.*?)(?=3\.|$)/s);
      const adviceMatch = text.match(/3\.\s*글쓰기 조언[:\s]+(.*?)$/s);

      return {
        visualElements: visualMatch ? visualMatch[1].trim() : "분석 결과 없음",
        mood: moodMatch ? moodMatch[1].trim() : "분석 결과 없음",
        writingAdvice: adviceMatch ? adviceMatch[1].trim() : "분석 결과 없음",
        rawText: text
      };
    };

    const parsedAdvice = parseAdvice(rawAdvice);

    console.log('📝 [파싱 결과]:', {
      visualElements: parsedAdvice.visualElements.substring(0, 50),
      mood: parsedAdvice.mood.substring(0, 50),
      advice: parsedAdvice.writingAdvice.substring(0, 50)
    });

    return new Response(
      JSON.stringify({
        success: true,
        ...parsedAdvice
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );

  } catch (error) {
    console.error('❌ [글쓰기 조언] 오류:', error);
    
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
