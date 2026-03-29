/**
 * Cloudflare Pages Function - 소설 줄거리 생성 (기승전결 구조)
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
      console.log(`⏳ [generate-plot] Rate limit hit, retrying in ${delay}ms (attempt ${attempt + 1}/${maxRetries})`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
}

// 📖 장르별 줄거리 가이드
const PLOT_GUIDES = {
  fantasy: {
    instruction: "판타지 소설의 기승전결 줄거리를 작성해주세요.",
    style: "평범한 세계에서 시작하여 신비로운 사건이 일어나고, 점차 확대되며, 결말에서 해결되는 구조",
    tone: "신비롭고 모험적인 분위기"
  },
  romance: {
    instruction: "로맨스 소설의 기승전결 줄거리를 작성해주세요.",
    style: "만남에서 시작하여 감정이 발전하고, 갈등이 생기고, 결말에서 관계가 정리되는 구조",
    tone: "감성적이고 섬세한 분위기"
  },
  healing: {
    instruction: "힐링 소설의 기승전결 줄거리를 작성해주세요.",
    style: "일상의 문제로 시작하여 작은 변화가 일어나고, 내면이 성장하며, 결말에서 평화를 찾는 구조",
    tone: "따뜻하고 조용한 분위기"
  },
  mystery: {
    instruction: "미스터리 소설의 기승전결 줄거리를 작성해주세요.",
    style: "사건 발생으로 시작하여 단서를 찾아가고, 진실에 접근하며, 결말에서 진상이 밝혀지는 구조",
    tone: "긴장감 있고 궁금증을 유발하는 분위기"
  }
};

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
    const { genre, answers } = body;

    // 입력 검증
    if (!genre || !answers) {
      return new Response(
        JSON.stringify({ success: false, error: "장르 또는 답변이 없습니다." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 장르별 가이드 가져오기
    const guide = PLOT_GUIDES[genre] || PLOT_GUIDES.fantasy;

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

    // 📖 줄거리 생성 프롬프트 구성
    const prompt = `
당신은 소설 줄거리를 기획하는 전문가입니다.

${guide.instruction}

[사용자의 답변]
${JSON.stringify(answers, null, 2)}

[줄거리 작성 규칙]
1. 기승전결 구조로 작성: 기(시작), 승(전개), 전(위기), 결(결말)
2. 각 단계는 2-3문장으로 간결하게 작성
3. ${guide.style}
4. ${guide.tone}
5. 사용자의 답변 내용을 반영
6. 구연동화체 절대 금지: "~답니다", "~였단다", "~했지요", "~이었어요" 사용 금지
7. 줄거리만 작성, 다른 설명 불필요

[중요! 출력 형식]
반드시 정확히 이 형식으로만 출력하세요. 다른 텍스트는 절대 포함하지 마세요:

[기] 
2-3문장의 시작 부분 줄거리

[승] 
2-3문장의 전개 부분 줄거리

[전] 
2-3문장의 위기 부분 줄거리

[결] 
2-3문장의 결말 부분 줄거리

주의: [기], [승], [전], [결] 태그는 반드시 각 줄의 맨 앞에 있어야 하고, 대괄호 안에 정확히 한글 한 글자만 있어야 합니다.
`;

    console.log('📖 [generate-plot] 줄거리 생성 시작:', genre);

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
            temperature: 0.7,
            maxOutputTokens: 1000,
          }
        }),
      });

      if (!geminiResponse.ok) {
        const errorData = await geminiResponse.text();
        console.error('❌ Gemini API 오류:', errorData);
        
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

    console.log('✅ [generate-plot] 줄거리 생성 완료');

    // 📖 줄거리 파싱
    const plot = parsePlot(text);

    return new Response(
      JSON.stringify({
        success: true,
        plot: plot,
        rawText: text.trim()
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );

  } catch (error) {
    console.error('❌ [generate-plot] 오류:', error);
    
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

/**
 * 📖 줄거리 텍스트를 기승전결 객체로 파싱
 */
function parsePlot(text) {
  console.log('📖 [parsePlot] 원본 텍스트:', text);
  
  const plot = {
    beginning: "",
    development: "",
    turn: "",
    conclusion: ""
  };

  // 여러 형식 지원: [기], **기**, 기:, 기), 등
  const patterns = {
    beginning: /(?:\[기\]|기\s*[:)]\s*|\*\*기\*\*)\s*([\s\S]*?)(?=\[승\]|승\s*[:)]\s*|\*\*승\*\*|$)/i,
    development: /(?:\[승\]|승\s*[:)]\s*|\*\*승\*\*)\s*([\s\S]*?)(?=\[전\]|전\s*[:)]\s*|\*\*전\*\*|$)/i,
    turn: /(?:\[전\]|전\s*[:)]\s*|\*\*전\*\*)\s*([\s\S]*?)(?=\[결\]|결\s*[:)]\s*|\*\*결\*\*|$)/i,
    conclusion: /(?:\[결\]|결\s*[:)]\s*|\*\*결\*\*)\s*([\s\S]*?)$/i
  };

  // 각 섹션 파싱
  const beginningMatch = text.match(patterns.beginning);
  const developmentMatch = text.match(patterns.development);
  const turnMatch = text.match(patterns.turn);
  const conclusionMatch = text.match(patterns.conclusion);

  if (beginningMatch) {
    plot.beginning = beginningMatch[1].trim();
    console.log('✅ 기 파싱 성공:', plot.beginning.substring(0, 50) + '...');
  } else {
    console.warn('⚠️ 기 파싱 실패');
  }
  
  if (developmentMatch) {
    plot.development = developmentMatch[1].trim();
    console.log('✅ 승 파싱 성공:', plot.development.substring(0, 50) + '...');
  } else {
    console.warn('⚠️ 승 파싱 실패');
  }
  
  if (turnMatch) {
    plot.turn = turnMatch[1].trim();
    console.log('✅ 전 파싱 성공:', plot.turn.substring(0, 50) + '...');
  } else {
    console.warn('⚠️ 전 파싱 실패');
  }
  
  if (conclusionMatch) {
    plot.conclusion = conclusionMatch[1].trim();
    console.log('✅ 결 파싱 성공:', plot.conclusion.substring(0, 50) + '...');
  } else {
    console.warn('⚠️ 결 파싱 실패');
  }

  console.log('📊 파싱 결과:', {
    beginning: plot.beginning ? '✅' : '❌',
    development: plot.development ? '✅' : '❌',
    turn: plot.turn ? '✅' : '❌',
    conclusion: plot.conclusion ? '✅' : '❌'
  });

  // 🔧 백업: 파싱 실패 시 전체 텍스트를 4등분
  const emptyCount = [plot.beginning, plot.development, plot.turn, plot.conclusion].filter(x => !x).length;
  
  if (emptyCount >= 2) {
    console.warn('⚠️ 파싱 실패가 많아 백업 전략 사용: 텍스트 4등분');
    
    // 줄바꿈으로 문단 분리
    const paragraphs = text.split(/\n\n+/).filter(p => p.trim().length > 10);
    
    if (paragraphs.length >= 4) {
      plot.beginning = plot.beginning || paragraphs[0].trim();
      plot.development = plot.development || paragraphs[1].trim();
      plot.turn = plot.turn || paragraphs[2].trim();
      plot.conclusion = plot.conclusion || paragraphs[3].trim();
      console.log('✅ 백업 전략으로 4개 문단 할당 완료');
    } else if (paragraphs.length === 1) {
      // 하나의 긴 텍스트면 문장으로 분리
      const sentences = paragraphs[0].split(/\. /).filter(s => s.trim().length > 10);
      const quarter = Math.ceil(sentences.length / 4);
      
      plot.beginning = plot.beginning || sentences.slice(0, quarter).join('. ') + '.';
      plot.development = plot.development || sentences.slice(quarter, quarter * 2).join('. ') + '.';
      plot.turn = plot.turn || sentences.slice(quarter * 2, quarter * 3).join('. ') + '.';
      plot.conclusion = plot.conclusion || sentences.slice(quarter * 3).join('. ') + '.';
      console.log('✅ 백업 전략으로 문장 분할 완료');
    } else {
      // 최악의 경우: 전체 텍스트를 기에만 넣기
      plot.beginning = plot.beginning || text.trim();
      console.log('⚠️ 최종 백업: 전체 텍스트를 기에 할당');
    }
  }

  return plot;
}
