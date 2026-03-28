/**
 * Cloudflare Pages Function - 글쓰기 이어쓰기 샘플 생성
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
      console.log(`⏳ [continue-writing] Rate limit hit, retrying in ${delay}ms (attempt ${attempt + 1}/${maxRetries})`);
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
    const { currentText, mood, genre, novelSubGenre, count = 3 } = body;

    if (!currentText || !currentText.trim()) {
      return new Response(
        JSON.stringify({ success: false, error: "현재 텍스트가 없습니다." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // API 키 확인
    if (!env.GEMINI_API_KEY) {
      console.error('❌ GEMINI_API_KEY not configured');
      return new Response(
        JSON.stringify({ success: false, error: 'Gemini API key not configured.' }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 장르별 이어쓰기 스타일 가이드
    const genreStyles = {
      fantasy: {
        style: "신비롭고 모험적인 분위기를 유지하며, 평범함 속에 비현실적인 요소가 자연스럽게 드러나도록",
        avoid: "구연동화체('얘들아, 할머니가~')는 절대 사용하지 말 것"
      },
      romance: {
        style: "인물의 감정 변화와 내면 묘사에 집중하며, 섬세하고 감성적으로",
        avoid: "구연동화체나 설명투는 사용하지 말 것"
      },
      healing: {
        style: "조용하고 따뜻한 일상의 묘사로, 위로와 평온함을 전달하며",
        avoid: "과도한 사건이나 갈등 없이 잔잔하게"
      },
      mystery: {
        style: "긴장감과 호기심을 유지하며, 새로운 단서나 의문점을 암시하도록",
        avoid: "성급한 해결이나 설명 없이 미스터리 분위기 유지"
      }
    };

    // 장르별 스타일 적용
    let styleGuide = "";
    if (genre === "novel" && novelSubGenre && genreStyles[novelSubGenre]) {
      const genreData = genreStyles[novelSubGenre];
      styleGuide = `
**장르**: ${novelSubGenre} 소설
**스타일 가이드**: ${genreData.style}
**주의사항**: ${genreData.avoid}`;
    } else {
      styleGuide = `분위기: ${mood || "자연스럽고 부드럽게"}`;
    }

    // Gemini API 호출 (이어쓰기 샘플 생성)
    const prompt = `당신은 현대 소설 작가입니다. 주어진 텍스트를 자연스럽게 이어서 작성하세요.

**현재 텍스트**:
${currentText}

${styleGuide}

**절대 금지 사항** (위반 시 즉시 실패):
1. "얘들아", "할머니가", "~답니다", "~했어요", "~였단다", "~랍니다" 같은 구연동화체 어미 사용 금지
2. "옛날 옛적에", "먼 옛날" 같은 전래동화 시작 금지
3. "그랬어요", "~했답니다" 같은 설명투 금지
4. 현재 텍스트에 없는 화자(할머니, 선생님 등) 등장 금지

**반드시 지켜야 할 규칙**:
1. 현재 텍스트의 **정확한 문체, 시제, 어미**를 그대로 유지하세요
2. 현재 텍스트가 "~했다" 어미면 계속 "~했다"로, "~한다" 어미면 계속 "~한다"로 작성
3. 각 버전은 2~3문장으로 작성
4. 번호와 본문만 출력 (설명, 인사, 주석 금지)

**출력 형식**:
1. [2~3문장]
2. [2~3문장]
3. [2~3문장]

지금 바로 이어쓰기를 시작하세요:`;

    console.log('📝 [continue-writing] Gemini API 호출 시작');

    // ✅ 재시도 로직 적용
    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${env.GEMINI_API_KEY}`;

    const responseText = await retryWithBackoff(async () => {
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
          systemInstruction: {
            parts: [
              {
                text: `You are a modern fiction writer. CRITICAL RULES:
1. NEVER use storytelling narrator voice ("얘들아", "할머니가", "~답니다", "~였단다")
2. NEVER add fairy tale openings ("옛날 옛적에")
3. ALWAYS match the exact writing style and tone of the given text
4. ALWAYS use the same sentence endings as the original text (if it uses "~했다", continue with "~했다")
5. Write in the SAME point of view and tense as the original
6. Do NOT add any explanations or greetings - ONLY output the numbered continuations`
              }
            ]
          },
          generationConfig: {
            temperature: 0.7,  // 일관성 강화 (0.8 → 0.7)
            maxOutputTokens: 500,
            topP: 0.95,
            topK: 40
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
      return data.candidates?.[0]?.content?.parts?.[0]?.text || "";
    });

    console.log('✅ [continue-writing] Gemini 응답:', responseText.slice(0, 100));

    // 응답 파싱: "1. 텍스트" 형식의 줄들 추출
    const rawSamples = responseText
      .split("\n")
      .filter(line => /^\d+\./.test(line.trim()))
      .map(line => line.replace(/^\d+\.\s*/, "").trim())
      .filter(text => text.length > 0);

    // 🔒 구연동화체 필터링 (금지된 표현이 있으면 제외)
    const forbiddenPatterns = [
      /얘들아/,
      /할머니가/,
      /했답니다/,
      /였단다/,
      /랍니다/,
      /였어요$/,
      /했어요$/,
      /옛날\s*옛적/,
      /먼\s*옛날/,
      /그랬어요/,
      /~랍니다/
    ];

    const samples = rawSamples
      .filter(text => {
        // 금지된 패턴이 하나라도 포함되어 있으면 제외
        const hasForbidden = forbiddenPatterns.some(pattern => pattern.test(text));
        if (hasForbidden) {
          console.log('⚠️ [continue-writing] 구연동화체 감지로 샘플 제외:', text.slice(0, 50));
        }
        return !hasForbidden;
      })
      .slice(0, count);

    console.log('✅ [continue-writing] 필터링 후 샘플 개수:', samples.length, '/', rawSamples.length);

    // 샘플이 너무 적으면 경고 메시지 추가
    if (samples.length === 0) {
      console.log('⚠️ [continue-writing] 모든 샘플이 구연동화체로 필터링됨');
      return new Response(
        JSON.stringify({
          success: false,
          error: 'AI가 적절한 이어쓰기를 생성하지 못했습니다. 다시 시도해주세요.',
          debug: '구연동화체 필터링으로 모든 샘플 제외됨'
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        samples,
        count: samples.length,
        filtered: rawSamples.length - samples.length
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );

  } catch (error) {
    console.error('❌ [continue-writing] 오류:', error);
    
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
        error: error.message || 'Unknown error'
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
}
