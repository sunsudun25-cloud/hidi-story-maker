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
    const prompt = `당신은 소설 줄거리를 기획하는 전문가입니다.

사용자 정보:
- 주인공: ${answers.protagonist}
- 배경: ${answers.setting}
- 사건: ${answers.conflict}
- 분위기: ${answers.mood}

위 정보로 기승전결 구조의 줄거리를 작성하세요.

출력 형식 예시:

[기]
사랑할 여유 없이 고시촌에서 살아가던 철수는 비 오는 날 편의점 앞에서 젖은 케이크를 들고 서 있는 영희를 만난다. 우연한 도움으로 시작된 짧은 인연은 철수의 무미건조한 일상에 잔잔한 파문을 만든다.

[승]
영희가 케이크를 들고 있었던 사연을 알게 된 철수는 그녀를 향한 마음이 단순한 동정이 아니라는 것을 깨닫는다. 그러나 현실과 시험 앞에서 쉽게 다가가지 못한다.

[전]
고시 실패와 생활고가 겹치면서 철수는 점점 영희에게서 멀어진다. 영희 역시 자신의 사정 때문에 철수를 찾지 못하고, 두 사람 사이에는 침묵만 쌓여간다.

[결]
결국 철수는 처음 만났던 그 자리에서 다시 용기를 낸다. 멈춰 있던 자신의 삶을 조금씩 바꾸기 시작하며, 영희에게도 진심을 전한다.

반드시 위와 똑같은 형식으로 작성하세요:
- [기], [승], [전], [결] 태그 필수
- 각 단계마다 2-3문장
- 구연동화체 금지 ("~답니다", "~였단다" 등)
- ${guide.tone}
- ${guide.style}`;

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
 * 📖 줄거리 텍스트를 기승전결 객체로 파싱 (강력한 indexOf 방식)
 */
function parsePlot(rawText) {
  console.log('📖 [parsePlot] 원본 텍스트 길이:', rawText?.length || 0);
  console.log('📖 [parsePlot] 원본 텍스트 미리보기:', rawText?.substring(0, 100) + '...');
  
  // 줄바꿈 정규화
  const text = (rawText || "").replace(/\r/g, "").trim();
  
  /**
   * 시작 태그부터 끝 태그 전까지 텍스트 추출
   */
  const getSection = (startTag, endTag) => {
    const start = text.indexOf(startTag);
    if (start === -1) {
      console.warn(`⚠️ ${startTag} 태그를 찾을 수 없음`);
      return "";
    }
    
    const from = start + startTag.length;
    const end = endTag ? text.indexOf(endTag, from) : text.length;
    
    if (end === -1 || end === from) {
      // 끝 태그가 없으면 끝까지
      const content = text.slice(from).trim();
      console.log(`✅ ${startTag} 파싱 성공 (끝까지): ${content.substring(0, 50)}...`);
      return content;
    }
    
    const content = text.slice(from, end).trim();
    console.log(`✅ ${startTag} 파싱 성공: ${content.substring(0, 50)}...`);
    return content;
  };
  
  const beginning = getSection("[기]", "[승]");
  const development = getSection("[승]", "[전]");
  const turn = getSection("[전]", "[결]");
  const conclusion = getSection("[결]", null);  // 끝까지
  
  const plot = {
    beginning,
    development,
    turn,
    conclusion
  };
  
  console.log('📊 파싱 결과:', {
    beginning: beginning ? `✅ (${beginning.length}자)` : '❌',
    development: development ? `✅ (${development.length}자)` : '❌',
    turn: turn ? `✅ (${turn.length}자)` : '❌',
    conclusion: conclusion ? `✅ (${conclusion.length}자)` : '❌'
  });
  
  // 🔧 백업: 파싱 실패 시 전체 텍스트를 4등분
  const emptyCount = [beginning, development, turn, conclusion].filter(x => !x).length;
  
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
    } else {
      // 최악의 경우: 전체 텍스트를 기에만 넣기
      plot.beginning = plot.beginning || text.trim();
      console.log('⚠️ 최종 백업: 전체 텍스트를 기에 할당');
    }
  }

  return plot;
}
