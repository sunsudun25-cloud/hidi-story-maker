/**
 * Firebase Functions - OpenAI DALL-E 3 프록시 API
 * 완전한 환경변수 지원 버전
 */

const { onRequest } = require('firebase-functions/v2/https');
const logger = require('firebase-functions/logger');
const cors = require('cors')({ origin: true });
const { OpenAI } = require('openai');
const functions = require('firebase-functions');

/**
 * DALL-E 3 이미지 생성 API
 */
exports.generateImage = onRequest(
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
        logger.info('⚪ OPTIONS 요청 수신');
        return res.status(204).send('');
      }

      // POST 요청만 허용
      if (req.method !== 'POST') {
        logger.warn('⚠️ POST가 아닌 요청:', req.method);
        return res.status(405).json({ 
          success: false, 
          error: 'Method Not Allowed. Use POST.' 
        });
      }

      try {
        logger.info('🚀 [generateImage] 함수 호출됨');
        
        // 🔑 OpenAI API 키 불러오기 (2가지 방법 지원)
        const OPENAI_API_KEY = 
          process.env.OPENAI_API_KEY ||              // 로컬 .env (에뮬레이터)
          functions.config().openai?.key;            // 배포 환경 (실서버)
        
        if (!OPENAI_API_KEY) {
          logger.error('❌ OPENAI_API_KEY가 설정되지 않았습니다!');
          logger.error('💡 해결 방법: firebase functions:config:set openai.key="YOUR_KEY"');
          return res.status(500).json({ 
            success: false, 
            error: 'API 키가 설정되지 않았습니다.' 
          });
        }

        logger.info('✅ OpenAI API 키 확인됨 (출처:', process.env.OPENAI_API_KEY ? '.env' : 'Firebase Config', ')');

        // OpenAI 클라이언트 초기화 (함수 내부에서!)
        const openai = new OpenAI({
          apiKey: OPENAI_API_KEY
        });

        // 요청 파라미터 추출
        const { prompt, style } = req.body;

        if (!prompt) {
          logger.warn('⚠️ prompt 파라미터 누락');
          return res.status(400).json({ 
            success: false, 
            error: 'prompt 파라미터가 필요합니다.' 
          });
        }

        logger.info('📝 요청 파라미터:', { prompt, style });

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
        const fullPrompt = `${prompt}. ${stylePrompt}. High quality, detailed, no text or watermarks.`;

        logger.info('🎨 전체 프롬프트:', fullPrompt);
        logger.info('📡 OpenAI API 호출 시작...');

        // OpenAI SDK를 사용한 이미지 생성
        const response = await openai.images.generate({
          model: 'dall-e-3',
          prompt: fullPrompt,
          n: 1,
          size: '1024x1024',
          quality: 'standard',
          response_format: 'b64_json'
        });

        logger.info('📥 OpenAI API 응답 수신');

        const base64Data = response.data[0].b64_json;

        if (!base64Data) {
          logger.error('❌ Base64 데이터가 없습니다!');
          return res.status(500).json({ 
            success: false, 
            error: '이미지 생성 실패: 데이터 없음' 
          });
        }

        const dataUrl = `data:image/png;base64,${base64Data}`;
        logger.info('✅ 이미지 생성 완료 (Base64 길이:', base64Data.length, ')');

        // 성공 응답
        return res.status(200).json({
          success: true,
          imageData: dataUrl,
          prompt: fullPrompt,
          style: style || "기본"
        });

      } catch (error) {
        logger.error('❌ 오류 발생:', error);
        
        // OpenAI API 오류 상세 처리
        if (error.status) {
          return res.status(error.status).json({ 
            success: false, 
            error: `OpenAI API 오류: ${error.message}` 
          });
        }
        
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
exports.health = onRequest(
  { region: 'asia-northeast1' },
  (req, res) => {
    return cors(req, res, () => {
      logger.info('💚 헬스체크 요청');
      return res.status(200).json({ 
        status: 'ok', 
        timestamp: Date.now(),
        region: 'asia-northeast1',
        nodejs: process.version
      });
    });
  }
);

/**
 * Gemini 텍스트 생성 API
 */
const { geminiText } = require('./geminiText');
exports.geminiText = geminiText;
