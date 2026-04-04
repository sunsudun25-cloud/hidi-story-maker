/**
 * Cloudflare Pages Function - 텍스트 기반 상세 이미지 프롬프트 생성
 * 수필/글을 분석하여 문학적이고 상세한 이미지 프롬프트 생성
 */

export async function onRequest(context) {
  const { request, env } = context;

  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };

  if (request.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: corsHeaders,
    });
  }

  try {
    const body = await request.json();
    const { text, genre } = body;

    if (!text) {
      return new Response(
        JSON.stringify({ success: false, error: "텍스트가 없습니다." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

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

    console.log('🎨 [이미지 프롬프트 생성] 시작:', { textLength: text.length, genre });

    const prompt = `
다음 글을 읽고, 이 글의 분위기와 내용을 가장 잘 표현할 수 있는 상세한 이미지 프롬프트를 작성해주세요.

**원문:**
${text}

**이미지 프롬프트 작성 규칙:**

반드시 아래 5가지 섹션으로 나누어 작성하세요:

**[스타일/매체]**
- 그림의 표현 방식 (예: 색연필, 수채화, 잉크, 유화 등)
- 종이나 캔버스의 질감
- 전체적인 미술 스타일 (사실적, 일러스트, 스케치 등)
- 색상 팔레트 (따뜻한, 차분한, 자연스러운 등)

**[주제]**
- 이미지의 중심이 되는 사물이나 인물
- 구체적인 외형 묘사
- 위치와 포즈
- 표정이나 상태

**[배경/설정]**
- 장소 (실내/실외)
- 시간대 (아침, 저녁, 비오는 날 등)
- 공간의 분위기

**[핵심 요소 및 가구]**
- 좌측, 중앙, 우측, 상단, 바닥으로 나누어
- 각 영역에 있는 주요 사물
- 구체적인 묘사 (색상, 재질, 상태)

**[분위기 및 세부 사항]**
- 조명 (따뜻한, 차가운, 은은한 등)
- 날씨나 환경 효과 (비, 안개, 햇살 등)
- 감정을 표현하는 세부 요소 (웅덩이, 빛 반사, 그림자 등)
- 질감 표현

**중요한 원칙:**
1. 감정을 직접 말하지 말고, 시각적 요소로 표현하세요
2. 구체적이고 세밀하게 묘사하세요
3. 원문의 분위기를 시각적으로 담아내세요
4. 문학적이고 예술적인 톤을 유지하세요

**출력 형식 예시:**

[스타일/매체]
세밀한 색연필과 잉크 윤곽선으로 손으로 그린 일러스트레이션으로, 질감이 살아있는 크림색 스케치 종이 위에 표현되었습니다. 스타일은 정교한 건축 드로잉과 부드러운 전통 색연필 셰이딩이 결합된 느낌으로, 고품질 스토리보드나 클래식 식물도감의 도판과 유사합니다. 색상 팔레트는 자연스럽고 차분한 톤으로 구성되었습니다.

[주제]
현관 구석에 놓인 낡은 검은색 우산. 손잡이 부분에는 여러 번 감긴 검은 테이프가 낡아서 일부 벗겨진 채로 보입니다. 우산대는 오래되어 약간 휘었고, 우산 천은 빗물에 젖은 흔적이 남아 있습니다.

[배경/설정]
전통 한옥의 현관 내부. 비가 내리는 늦은 오후의 장면으로, 창문을 통해 흐린 하늘과 빗줄기가 보입니다. 실내는 은은한 자연광과 함께 따뜻한 조명이 어우러져 있습니다.

[핵심 요소 및 가구]
좌측: 천장부터 바닥까지 이어지는 나무 프레임 유리문. 문 너머로 비 내리는 작은 정원이 보입니다.
중앙: 우산이 기대어 있는 낡은 나무 벽. 벽지는 세월의 흔적으로 약간 변색되어 있습니다.
우측: 여러 켤레의 신발이 가지런히 놓인 신발장. 그 위에는 작은 도자기 화병이 있습니다.
바닥: 정교한 타일 바닥으로, 우산 주변에 작은 물웅덩이가 있습니다.

[분위기 및 세부 사항]
외부: 유리문을 통해 보이는 비 내리는 정원. 이끼 낀 돌과 젖은 나뭇잎.
조명: 실내의 따뜻한 은은한 조명이 우산과 주변 바닥을 부드럽게 비춥니다.
세부 요소: 바닥의 물웅덩이와 물방울이 우산이 최근에 사용되었음을 암시합니다.
질감: 종이의 결(grain)이 드러나고, 색연필의 부드러운 질감이 전체적으로 표현됩니다.

---

위 예시를 참고하여, 주어진 글의 내용과 분위기를 담은 상세한 이미지 프롬프트를 작성해주세요.
`;

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
              }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 2000,
        }
      }),
    });

    if (!geminiResponse.ok) {
      const errorData = await geminiResponse.text();
      console.error('❌ Gemini API 오류:', errorData);
      throw new Error(`Gemini API error: ${geminiResponse.status}`);
    }

    const data = await geminiResponse.json();
    const imagePrompt = data.candidates?.[0]?.content?.parts?.[0]?.text || "";

    if (!imagePrompt) {
      console.error('❌ Gemini 응답 없음:', JSON.stringify(data));
      throw new Error('이미지 프롬프트 생성 실패');
    }

    console.log('✅ [이미지 프롬프트 생성] 완료:', imagePrompt.substring(0, 200));

    // 섹션별 파싱 (선택적)
    const parsePrompt = (text) => {
      const styleMatch = text.match(/\[스타일\/매체\](.*?)(?=\[주제\]|$)/s);
      const subjectMatch = text.match(/\[주제\](.*?)(?=\[배경\/설정\]|$)/s);
      const settingMatch = text.match(/\[배경\/설정\](.*?)(?=\[핵심 요소|$)/s);
      const elementsMatch = text.match(/\[핵심 요소.*?\](.*?)(?=\[분위기|$)/s);
      const atmosphereMatch = text.match(/\[분위기.*?\](.*?)$/s);

      return {
        style: styleMatch ? styleMatch[1].trim() : "",
        subject: subjectMatch ? subjectMatch[1].trim() : "",
        setting: settingMatch ? settingMatch[1].trim() : "",
        elements: elementsMatch ? elementsMatch[1].trim() : "",
        atmosphere: atmosphereMatch ? atmosphereMatch[1].trim() : "",
        fullPrompt: text
      };
    };

    const parsed = parsePrompt(imagePrompt);

    return new Response(
      JSON.stringify({
        success: true,
        prompt: imagePrompt,
        parsed: parsed
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );

  } catch (error) {
    console.error('❌ [이미지 프롬프트 생성] 오류:', error);
    
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
