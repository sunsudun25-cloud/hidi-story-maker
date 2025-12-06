/**
 * Firebase Functions - OpenAI DALL-E 3 프록시 API
 */

const functions = require('firebase-functions/v2');
const cors = require('cors')({ origin: true });

/**
 * DALL-E 3 이미지 생성 API
 */
exports.generateImage = functions.https.onRequest(
  {
    region: 'asia-northeast1',
    timeoutSeconds: 300,
    memory: '512MiB'
  },
  async (req, res) => {
    return cors(req, res, async () => {
      // CORS 헤더
      res.set('Access-Control-Allow-Origin', '*');
      res.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
      res.set('Access-Control-Allow-Headers', 'Content-Type');

      // OPTIONS 요청 처리
      if (req.method === 'OPTIONS') {
        return res.status(204).send('');
      }

      // POST 요청만 허용
      if (req.method !== 'POST') {
        return res.status(405).json({ 
          success: false, 
          error: 'Method Not Allowed. Use POST.' 
        });
      }

      try {
        console.log('🚀 [generateImage] 함수 호출됨');
        
        // OpenAI API 키 가져오기
        const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
        
        if (!OPENAI_API_KEY) {
          console.error('❌ OPENAI_API_KEY가 설정되지 않았습니다!');
          return res.status(500).json({ 
            success: false, 
            error: 'API 키가 설정되지 않았습니다.' 
          });
        }

        console.log('✅ OpenAI API 키 확인됨');

        // 요청 파라미터 추출
        const { prompt, style } = req.body;

        if (!prompt) {
          return res.status(400).json({ 
            success: false, 
            error: 'prompt 파라미터가 필요합니다.' 
          });
        }

        console.log('📝 요청 파라미터:', { prompt, style });

        // 스타일 매핑
        const styleMap = {
          "수채화": "watercolor painting style",
          "동화풍": "fairytale illustration style",
          "파스텔톤": "soft pastel colors style",
          "따뜻한 스타일": "warm and cozy atmosphere",
          "애니메이션": "anime illustration style",
          "연필스케치": "pencil sketch style",
          "기본": "illustration style"
        };

        const stylePrompt = styleMap[style || "기본"] || "illustration style";
        const fullPrompt = `${prompt}. ${stylePrompt}. High quality, detailed, no text or watermarks.`;

        console.log('🎨 전체 프롬프트:', fullPrompt);
        console.log('📡 OpenAI API 호출 시작...');

        // OpenAI API 호출
        const openaiResponse = await fetch('https://api.openai.com/v1/images/generations', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${OPENAI_API_KEY}`
          },
          body: JSON.stringify({
            model: 'dall-e-3',
            prompt: fullPrompt,
            n: 1,
            size: '1024x1024',
            quality: 'standard',
            response_format: 'b64_json'
          })
        });

        if (!openaiResponse.ok) {
          const errorData = await openaiResponse.json();
          console.error('❌ OpenAI API 오류:', errorData);
          return res.status(openaiResponse.status).json({ 
            success: false, 
            error: `OpenAI API 오류: ${errorData.error?.message || 'Unknown error'}` 
          });
        }

        const openaiData = await openaiResponse.json();
        console.log('📥 OpenAI API 응답 수신');

        const base64Data = openaiData.data[0].b64_json;

        if (!base64Data) {
          console.error('❌ Base64 데이터가 없습니다!');
          return res.status(500).json({ 
            success: false, 
            error: '이미지 생성 실패: 데이터 없음' 
          });
        }

        const dataUrl = `data:image/png;base64,${base64Data}`;
        console.log('✅ 이미지 생성 완료 (Base64 길이:', base64Data.length, ')');

        // 성공 응답
        return res.status(200).json({
          success: true,
          imageData: dataUrl,
          prompt: fullPrompt,
          style: style || "기본"
        });

      } catch (error) {
        console.error('❌ 오류 발생:', error);
        return res.status(500).json({ 
          success: false, 
          error: `서버 오류: ${error.message}` 
        });
      }
    });
  }
);

/**
 * 헬스체크 엔드포인트
 */
exports.health = functions.https.onRequest(
  { region: 'asia-northeast1' },
  (req, res) => {
    return cors(req, res, () => {
      return res.status(200).json({ 
        status: 'ok', 
        timestamp: Date.now(),
        region: 'asia-northeast1'
      });
    });
  }
);
