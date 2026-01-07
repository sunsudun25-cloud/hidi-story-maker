/**
 * Cloudflare Pages Function - Gemini API Proxy
 * 
 * 목적: Gemini API 키를 서버사이드에서 안전하게 관리
 * 브라우저에 API 키가 노출되지 않도록 프록시 역할 수행
 * 
 * 설정 방법:
 * npx wrangler pages secret put GEMINI_API_KEY --project-name story-maker
 */

interface GeminiRequest {
  prompt: string;
  temperature?: number;
  maxTokens?: number;
}

interface Env {
  GEMINI_API_KEY: string;
}

// CORS 헤더
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

// 응답 헬퍼
function jsonResponse(body: any, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json",
      ...corsHeaders,
    },
  });
}

export const onRequest: PagesFunction<Env> = async (context) => {
  const { request, env } = context;

  // OPTIONS 요청 처리 (CORS preflight)
  if (request.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: corsHeaders,
    });
  }

  // POST 요청만 허용
  if (request.method !== "POST") {
    return jsonResponse({ error: "Method not allowed" }, 405);
  }

  try {
    // 요청 본문 파싱
    const body: GeminiRequest = await request.json();
    const { prompt, temperature = 0.7, maxTokens = 2000 } = body;

    // 프롬프트 검증
    if (!prompt || prompt.trim().length === 0) {
      return jsonResponse(
        { error: "프롬프트를 입력해주세요." },
        400
      );
    }

    // API 키 확인
    if (!env.GEMINI_API_KEY) {
      console.error("❌ GEMINI_API_KEY not configured");
      return jsonResponse(
        { error: "API 키가 설정되지 않았습니다." },
        500
      );
    }

    console.log("🚀 Gemini API 요청:", {
      promptLength: prompt.length,
      temperature,
      maxTokens,
    });

    // Gemini API 호출
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${env.GEMINI_API_KEY}`;
    
    const geminiResponse = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: prompt,
              },
            ],
          },
        ],
        generationConfig: {
          temperature,
          maxOutputTokens: maxTokens,
        },
      }),
    });

    if (!geminiResponse.ok) {
      const errorText = await geminiResponse.text();
      console.error("❌ Gemini API 오류:", errorText);
      return jsonResponse(
        { error: "Gemini API 요청 실패", details: errorText },
        geminiResponse.status
      );
    }

    const data = await geminiResponse.json();
    console.log("✅ Gemini API 응답 성공");

    // 응답 추출
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "";

    return jsonResponse({
      success: true,
      text,
      usage: {
        promptTokens: data.usageMetadata?.promptTokenCount || 0,
        completionTokens: data.usageMetadata?.candidatesTokenCount || 0,
        totalTokens: data.usageMetadata?.totalTokenCount || 0,
      },
    });

  } catch (error: any) {
    console.error("❌ Gemini Proxy 오류:", error);
    return jsonResponse(
      { 
        error: "서버 오류가 발생했습니다.",
        message: error.message 
      },
      500
    );
  }
};
