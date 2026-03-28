/**
 * 환경변수 진단 API
 * 용도: 환경변수가 실제로 읽히는지 확인
 * URL: /api/debug-env
 */

interface Env {
  OPENAI_API_KEY?: string;
  OPENAI_API_KEY_GPT_IMAGE?: string;
  GEMINI_API_KEY?: string;
}

export async function onRequestGet(context: { env: Env }) {
  const { env } = context;

  return Response.json({
    timestamp: new Date().toISOString(),
    environment: "Cloudflare Pages",
    
    // OpenAI 키 확인
    hasOpenAI: !!env.OPENAI_API_KEY,
    openAIPrefix: env.OPENAI_API_KEY?.slice(0, 8) || "MISSING",
    openAIType: env.OPENAI_API_KEY?.startsWith('sk-') ? 'OpenAI' : 
                (env.OPENAI_API_KEY?.startsWith('AIza') ? 'Gemini' : 'Unknown'),
    
    // GPT Image 전용 키 확인
    hasGptImage: !!env.OPENAI_API_KEY_GPT_IMAGE,
    gptImagePrefix: env.OPENAI_API_KEY_GPT_IMAGE?.slice(0, 8) || "MISSING",
    gptImageType: env.OPENAI_API_KEY_GPT_IMAGE?.startsWith('sk-') ? 'OpenAI' : 
                  (env.OPENAI_API_KEY_GPT_IMAGE?.startsWith('AIza') ? 'Gemini' : 'Unknown'),
    
    // Gemini 키 확인
    hasGemini: !!env.GEMINI_API_KEY,
    geminiPrefix: env.GEMINI_API_KEY?.slice(0, 8) || "MISSING",
    
    // 진단 결과
    diagnosis: {
      allKeysPresent: !!(env.OPENAI_API_KEY && env.OPENAI_API_KEY_GPT_IMAGE),
      gptImageKeyValid: env.OPENAI_API_KEY_GPT_IMAGE?.startsWith('sk-') || false,
      recommendation: env.OPENAI_API_KEY_GPT_IMAGE?.startsWith('sk-') 
        ? "✅ GPT Image key looks good!"
        : env.OPENAI_API_KEY_GPT_IMAGE?.startsWith('AIza')
        ? "❌ Wrong key! Gemini key in GPT Image slot"
        : "❌ GPT Image key is MISSING"
    }
  }, {
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    }
  });
}
