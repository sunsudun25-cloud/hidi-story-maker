/**
 * Cloudflare Pages Function - OpenAI Image Proxy
 * - CORS 완전 지원
 * - 기본: dall-e-3 유지
 * - 옵션: model 지정 가능
 * - 안전장치: 새 모델 실패 시 dall-e-3로 1회 fallback
 */

interface Env {
  OPENAI_API_KEY: string;
}

type SupportedModel =
  | "dall-e-3"
  | "gpt-image-1.5"
  | "gpt-image-1"
  | "gpt-image-1-mini";

interface ImageRequest {
  prompt: string;
  style?: string;

  // ✅ 추가: 모델 선택(없으면 dall-e-3)
  model?: SupportedModel;

  // (선택) 향후 튜닝용
  size?: "1024x1024" | "1024x1536" | "1536x1024";
  quality?: "standard" | "high";
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

function jsonResponse(body: any, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

export async function onRequest(context: { request: Request; env: Env }) {
  const { request, env } = context;

  // ✅ OPTIONS (Preflight)
  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  const start = Date.now();

  try {
    const body = (await request.json()) as ImageRequest;
    const { prompt, style } = body;

    if (!prompt?.trim()) {
      return jsonResponse({ success: false, error: "프롬프트가 없습니다." }, 400);
    }

    if (!env.OPENAI_API_KEY) {
      console.error("❌ OPENAI_API_KEY not configured");
      return jsonResponse({ success: false, error: "API key not configured" }, 500);
    }

    // ✅ 모델 기본값: dall-e-3 유지 (운영 안정)
    const requestedModel: SupportedModel = body.model ?? "dall-e-3";

    // ✅ (선택) 품질/크기 기본값 유지
    const size = body.size ?? "1024x1024";
    const quality = body.quality ?? "standard";

    console.log("🎨 이미지 생성 요청:", { model: requestedModel, style, size, quality });

    // 스타일 매핑
    const styleMap: Record<string, string> = {
      수채화: "watercolor painting style",
      watercolor: "watercolor painting style",
      동화풍: "children's book illustration style",
      fairytale: "children's book illustration style",
      파스텔톤: "soft pastel colors style",
      pastel: "soft pastel colors style",
      "따뜻한 스타일": "warm and cozy atmosphere",
      warm: "warm and cozy atmosphere",
      애니메이션: "anime illustration style",
      연필스케치: "pencil sketch style",
      기본: "illustration style",
      "기본 스타일": "illustration style",
    };

    const stylePrompt = styleMap[style || "기본"] || "illustration style";

    // 삽화 전용 역할 정의
    const illustrationPurpose = `
This image is an 'ILLUSTRATION-ONLY picture' for a children's book.
The book's text will be printed SEPARATELY on top of this illustration.
Therefore, NO form of text should EVER appear in the picture itself.
`.trim();

    const absoluteProhibitions = `
ABSOLUTELY FORBIDDEN (그림 안에 절대 금지):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
❌ English, Korean, numbers, sentences
❌ Speech bubbles, captions, book text
❌ Signs, labels, posters, card-like designs
❌ Logos, watermarks, signatures, symbols

IMPORTANT RESTRICTIONS (중요한 제한):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
- The picture should be PURE SCENE DEPICTION only
- Do NOT make it look like a storybook 'page'
- Do NOT create designs that suggest space for text
- Do NOT place letter-like elements at the top or center

VALIDATION RULE (검증 규칙):
If any letters or words appear in the image, the result is INVALID.
`.trim();

    const styleGuide = `
ILLUSTRATION STYLE (삽화 스타일):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
- Warm and gentle children's book illustration style
- Hand-drawn feel, pastel tones
- Picture book atmosphere for children
- Digital art with analog sensibility
- Art style: ${stylePrompt}
`.trim();

    // ✅ 프롬프트: (유지) 텍스트 금지 강조
    const fullPrompt = `🚫 NO TEXT NO WORDS NO LETTERS NO NUMBERS ANYWHERE IN THE IMAGE 🚫
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
This is a PURE ILLUSTRATION with ZERO TEXT.
The text will be added SEPARATELY by the publisher.

${illustrationPurpose}

${absoluteProhibitions}

${styleGuide}

SCENE DESCRIPTION (장면 설명):
${prompt}

🚫 CRITICAL REMINDER: NO TEXT, NO WORDS, NO LETTERS, NO SYMBOLS 🚫
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
If you add ANY text, the image will be REJECTED and REGENERATED.`;

    async function callOpenAI(model: SupportedModel) {
      const t0 = Date.now();

      const res = await fetch("https://api.openai.com/v1/images/generations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${env.OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model,
          prompt: fullPrompt,
          n: 1,
          size,
          quality,
          response_format: "b64_json",
        }),
      });

      const ms = Date.now() - t0;
      console.log(`📡 OpenAI 응답: model=${model}, ok=${res.ok}, ms=${ms}`);

      if (!res.ok) {
        const text = await res.text();
        console.error(`❌ OpenAI API 오류(model=${model}):`, text);
        return { ok: false as const, status: res.status, errorText: text };
      }

      const data = (await res.json()) as any;
      const base64Data = data?.data?.[0]?.b64_json as string | undefined;

      if (!base64Data) {
        return { ok: false as const, status: 500, errorText: "No image data received" };
      }

      return { ok: true as const, base64Data };
    }

    // ✅ 1차 호출 (요청 모델)
    let result = await callOpenAI(requestedModel);

    // ✅ fallback: 요청 모델이 dall-e-3가 아니고 실패했을 때만 1회 재시도
    if (!result.ok && requestedModel !== "dall-e-3") {
      console.warn("⚠️ 1차 실패 → dall-e-3로 fallback 재시도");
      result = await callOpenAI("dall-e-3");
    }

    if (!result.ok) {
      return jsonResponse(
        { success: false, error: `OpenAI API error: ${result.status}` },
        result.status
      );
    }

    const dataUrl = `data:image/png;base64,${result.base64Data}`;
    const totalMs = Date.now() - start;

    console.log("✅ 이미지 생성 완료", { totalMs, modelUsed: requestedModel });

    return jsonResponse({
      success: true,
      imageUrl: dataUrl,
      imageData: dataUrl, // 하위 호환성 유지
      prompt: fullPrompt,
      style: style || "기본",
      // ✅ 디버깅/운영 확인용(프론트에서 안 써도 됨)
      meta: {
        requestedModel,
        size,
        quality,
        totalMs,
      },
    });
  } catch (error) {
    console.error("❌ Function 오류:", error);
    return jsonResponse(
      { success: false, error: error instanceof Error ? error.message : "Unknown error" },
      500
    );
  }
}
