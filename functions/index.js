/**
 * Firebase Functions - OpenAI DALL-E 3 프록시 API
 * 
 * 클라이언트에서 직접 OpenAI API를 호출하지 않고
 * Firebase Functions를 통해 프록시하여 API 키를 안전하게 보호합니다.
 */

const functions = require('firebase-functions');
const admin = require('firebase-admin');
const cors = require('cors')({ origin: true });
const OpenAI = require('openai');
require('dotenv').config({ path: '.env.production' });

// Firebase Admin 초기화
admin.initializeApp();

/**
 * DALL-E 3 이미지 생성 API
 * 
 * @endpoint POST /generateImage
 * @body {
 *   prompt: string,    // 이미지 생성 프롬프트
 *   style?: string     // 스타일 옵션 (선택)
 * }
 * @returns {
 *   success: boolean,
 *   imageData: string, // Base64 Data URL
 *   error?: string
 * }
 */
exports.generateImage = functions
  .region('asia-northeast1') // 서울 리전 (가장 가까운 리전)
  .runWith({
    timeoutSeconds: 300,     // 5분 타임아웃 (DALL-E 3 생성 시간 고려)
    memory: '512MB'          // 메모리 할당
  })
  .https.onRequest((req, res) => {
    cors(req, res, async () => {
      // CORS 헤더 명시적으로 설정
      res.set('Access-Control-Allow-Origin', '*');
      res.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
      res.set('Access-Control-Allow-Headers', 'Content-Type');

      // OPTIONS 요청 (CORS preflight) 처리
      if (req.method === 'OPTIONS') {
        res.status(204).send('');
        return;
      }

      // POST 요청만 허용
      if (req.method !== 'POST') {
        res.status(405).json({ 
          success: false, 
          error: 'Method Not Allowed. Use POST.' 
        });
        return;
      }

      try {
        console.log('🚀 [generateImage] 함수 호출됨');
        
        // 환경 변수에서 OpenAI API 키 가져오기
        // 1순위: Firebase Functions Config
        // 2순위: .env.production 파일
        const OPENAI_API_KEY = functions.config().openai?.key || process.env.OPENAI_API_KEY;
        
        if (!OPENAI_API_KEY) {
          console.error('❌ OPENAI_API_KEY 환경 변수가 설정되지 않았습니다!');
          res.status(500).json({ 
            success: false, 
            error: '서버 설정 오류: API 키가 없습니다.' 
          });
          return;
        }

        console.log('✅ OpenAI API 키 확인됨');

        // 요청 본문에서 파라미터 추출
        const { prompt, style } = req.body;

        if (!prompt) {
          res.status(400).json({ 
            success: false, 
            error: 'prompt 파라미터가 필요합니다.' 
          });
          return;
        }

        console.log('📝 요청 파라미터:', { prompt, style });

        // 스타일 매핑
        const styleMap = {
          "수채화": "watercolor painting style",
          "watercolor": "watercolor painting style",
          "동화풍": "fairytale illustration style",
          "fairytale": "fairytale illustration style",
          "파스텔톤": "soft pastel colors style",
          "pastel": "soft pastel colors style",
          "따뜻한 스타일": "warm and cozy atmosphere",
          "warm": "warm and cozy atmosphere",
          "애니메이션": "anime illustration style",
          "연필스케치": "pencil sketch style",
          "기본": "illustration style",
          "기본 스타일": "illustration style"
        };

        const stylePrompt = styleMap[style || "기본"] || "illustration style";
        const fullPrompt = `${prompt}. ${stylePrompt}. High quality, detailed, no text or watermarks. Professional artwork.`;

        console.log('🎨 전체 프롬프트:', fullPrompt);

        // OpenAI 클라이언트 초기화
        const openai = new OpenAI({
          apiKey: OPENAI_API_KEY
        });

        console.log('📡 OpenAI API 호출 시작...');

        // DALL-E 3 이미지 생성
        const response = await openai.images.generate({
          model: "dall-e-3",
          prompt: fullPrompt,
          n: 1,
          size: "1024x1024",
          quality: "standard",
          response_format: "b64_json"  // Base64로 받기
        });

        console.log('📥 OpenAI API 응답 수신');

        const base64Data = response.data[0].b64_json;

        if (!base64Data) {
          console.error('❌ Base64 데이터가 없습니다!');
          res.status(500).json({ 
            success: false, 
            error: '이미지 생성 실패: 데이터 없음' 
          });
          return;
        }

        const dataUrl = `data:image/png;base64,${base64Data}`;
        console.log('✅ 이미지 생성 완료 (Base64 길이:', base64Data.length, ')');

        // 성공 응답
        res.status(200).json({
          success: true,
          imageData: dataUrl,
          prompt: fullPrompt,
          style: style || "기본"
        });

      } catch (error) {
        console.error('❌ 오류 발생:', error);
        
        // OpenAI API 오류 처리
        if (error.status) {
          res.status(error.status).json({ 
            success: false, 
            error: `OpenAI API 오류: ${error.message}` 
          });
        } else {
          res.status(500).json({ 
            success: false, 
            error: `서버 오류: ${error.message}` 
          });
        }
      }
    });
  });

/**
 * 헬스체크 엔드포인트
 * 
 * @endpoint GET /health
 * @returns { status: "ok", timestamp: number }
 */
exports.health = functions
  .region('asia-northeast1')
  .https.onRequest((req, res) => {
    cors(req, res, () => {
      res.status(200).json({ 
        status: "ok", 
        timestamp: Date.now(),
        region: "asia-northeast1"
      });
    });
  });
