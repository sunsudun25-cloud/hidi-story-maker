/**
 * Firebase Functions for Story Maker
 * 수업 운영 시스템 - 로그인 없이 수업코드 + 학생코드로 6개월 클라우드 저장
 * 
 * Region: asia-northeast1 (Seoul/Tokyo)
 * Runtime: Node.js 20
 */

const functions = require('firebase-functions/v2');
const admin = require('firebase-admin');

// Firebase Admin 초기화
admin.initializeApp();

const db = admin.firestore();
const storage = admin.storage();

// CORS 설정
const corsOptions = {
  origin: true,
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

// 리전 설정
const REGION = 'asia-northeast1';

/**
 * ========================================
 * 수업 관리 API
 * ========================================
 */

/**
 * 1. 수업 생성
 * POST /classCreate
 * Body: { className: string, instructorName: string, instructorPin: string }
 * Returns: { classCode: string, expiresAt: timestamp }
 */
exports.classCreate = functions.https.onRequest({ 
  region: REGION,
  cors: corsOptions 
}, async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { className, instructorName, instructorPin } = req.body;

    // 입력 검증
    if (!className || !instructorName || !instructorPin) {
      return res.status(400).json({ 
        error: '필수 항목을 입력해주세요.',
        required: ['className', 'instructorName', 'instructorPin']
      });
    }

    // PIN 검증 (6자리 숫자)
    if (!/^\d{6}$/.test(instructorPin)) {
      return res.status(400).json({ 
        error: '강사 PIN은 6자리 숫자여야 합니다.'
      });
    }

    // 수업 코드 생성 (8자리 영숫자)
    const classCode = generateClassCode();

    // 만료일 설정 (6개월 후)
    const expiresAt = admin.firestore.Timestamp.fromDate(
      new Date(Date.now() + 180 * 24 * 60 * 60 * 1000) // 6개월
    );

    // Firestore에 저장
    await db.collection('classes').doc(classCode).set({
      classCode,
      className,
      instructorName,
      instructorPin: hashPin(instructorPin), // PIN 해시화
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      expiresAt,
      learnerCount: 0,
      artifactCount: 0
    });

    console.log(`✅ 수업 생성: ${classCode} - ${className}`);

    return res.status(200).json({
      success: true,
      classCode,
      className,
      expiresAt: expiresAt.toDate().toISOString(),
      message: `수업이 생성되었습니다. 수업 코드: ${classCode}`
    });

  } catch (error) {
    console.error('❌ classCreate 오류:', error);
    return res.status(500).json({ 
      error: '수업 생성 중 오류가 발생했습니다.',
      details: error.message 
    });
  }
});

/**
 * 2. 강사 PIN 검증
 * POST /classVerifyPin
 * Body: { classCode: string, instructorPin: string }
 * Returns: { valid: boolean }
 */
exports.classVerifyPin = functions.https.onRequest({ 
  region: REGION,
  cors: corsOptions 
}, async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { classCode, instructorPin } = req.body;

    if (!classCode || !instructorPin) {
      return res.status(400).json({ 
        error: '수업 코드와 강사 PIN을 입력해주세요.' 
      });
    }

    // 수업 조회
    const classDoc = await db.collection('classes').doc(classCode).get();

    if (!classDoc.exists) {
      return res.status(404).json({ 
        error: '존재하지 않는 수업 코드입니다.' 
      });
    }

    const classData = classDoc.data();
    const isValid = classData.instructorPin === hashPin(instructorPin);

    return res.status(200).json({
      success: true,
      valid: isValid,
      className: isValid ? classData.className : undefined
    });

  } catch (error) {
    console.error('❌ classVerifyPin 오류:', error);
    return res.status(500).json({ 
      error: 'PIN 검증 중 오류가 발생했습니다.',
      details: error.message 
    });
  }
});

/**
 * 3. 학생 등록 (존재하지 않으면 생성)
 * POST /learnerEnsure
 * Body: { classCode: string, learnerCode: string, learnerName?: string }
 * Returns: { learnerId: string, isNew: boolean }
 */
exports.learnerEnsure = functions.https.onRequest({ 
  region: REGION,
  cors: corsOptions 
}, async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { classCode, learnerCode, learnerName } = req.body;

    // 입력 검증
    if (!classCode || !learnerCode) {
      return res.status(400).json({ 
        error: '수업 코드와 학생 코드를 입력해주세요.' 
      });
    }

    // 학생 코드 검증 (4자리 숫자)
    if (!/^\d{4}$/.test(learnerCode)) {
      return res.status(400).json({ 
        error: '학생 코드는 4자리 숫자여야 합니다.' 
      });
    }

    // 수업 존재 확인
    const classDoc = await db.collection('classes').doc(classCode).get();

    if (!classDoc.exists) {
      return res.status(404).json({ 
        error: '존재하지 않는 수업 코드입니다.' 
      });
    }

    // 만료 확인
    const classData = classDoc.data();
    if (classData.expiresAt.toDate() < new Date()) {
      return res.status(410).json({ 
        error: '만료된 수업입니다.' 
      });
    }

    // 학생 ID 생성
    const learnerId = `${classCode}-${learnerCode}`;

    // 학생 문서 조회
    const learnerRef = db.collection('learners').doc(learnerId);
    const learnerDoc = await learnerRef.get();

    let isNew = false;

    if (!learnerDoc.exists) {
      // 새 학생 생성
      await learnerRef.set({
        learnerId,
        classCode,
        learnerCode,
        learnerName: learnerName || `학생 ${learnerCode}`,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        lastAccessAt: admin.firestore.FieldValue.serverTimestamp(),
        artifactCount: 0
      });

      // 수업의 학생 수 증가
      await db.collection('classes').doc(classCode).update({
        learnerCount: admin.firestore.FieldValue.increment(1)
      });

      isNew = true;
      console.log(`✅ 새 학생 등록: ${learnerId}`);
    } else {
      // 기존 학생 - 마지막 접속 시간 업데이트
      await learnerRef.update({
        lastAccessAt: admin.firestore.FieldValue.serverTimestamp()
      });
      console.log(`✅ 기존 학생 접속: ${learnerId}`);
    }

    const finalLearnerData = isNew 
      ? (await learnerRef.get()).data()
      : learnerDoc.data();

    return res.status(200).json({
      success: true,
      learnerId,
      learnerName: finalLearnerData.learnerName,
      isNew,
      message: isNew ? '새로운 학생으로 등록되었습니다.' : '환영합니다!'
    });

  } catch (error) {
    console.error('❌ learnerEnsure 오류:', error);
    return res.status(500).json({ 
      error: '학생 등록 중 오류가 발생했습니다.',
      details: error.message 
    });
  }
});

/**
 * ========================================
 * 작품 저장 및 조회 API
 * ========================================
 */

/**
 * 4. 작품 통합 저장
 * POST /artifactSave
 * Body: { 
 *   learnerId: string,
 *   type: 'story' | 'image' | 'storybook',
 *   title: string,
 *   data: { ... },
 *   files: { [key]: base64 | url }
 * }
 * Returns: { artifactId: string, shareId: string }
 */
exports.artifactSave = functions.https.onRequest({ 
  region: REGION,
  cors: corsOptions,
  timeoutSeconds: 300, // 5분 (파일 업로드 고려)
  memory: '1GiB'
}, async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { learnerId, type, title, data, files } = req.body;

    // 입력 검증
    if (!learnerId || !type || !title) {
      return res.status(400).json({ 
        error: '필수 항목을 입력해주세요.',
        required: ['learnerId', 'type', 'title']
      });
    }

    // 학생 존재 확인
    const learnerDoc = await db.collection('learners').doc(learnerId).get();

    if (!learnerDoc.exists) {
      return res.status(404).json({ 
        error: '존재하지 않는 학생입니다.' 
      });
    }

    const learnerData = learnerDoc.data();

    // 작품 ID 생성
    const artifactId = generateArtifactId();
    const shareId = generateShareId();

    // 파일 업로드 (Base64 → Storage)
    const uploadedFiles = {};
    
    if (files && Object.keys(files).length > 0) {
      for (const [key, value] of Object.entries(files)) {
        if (isBase64(value)) {
          // Base64 → Storage 업로드
          const filePath = `artifacts/${learnerData.classCode}/${learnerId}/${artifactId}/${key}`;
          const downloadURL = await uploadBase64ToStorage(value, filePath);
          uploadedFiles[key] = downloadURL;
        } else {
          // 이미 URL인 경우
          uploadedFiles[key] = value;
        }
      }
    }

    // Firestore에 저장
    await db.collection('artifacts').doc(artifactId).set({
      artifactId,
      shareId,
      learnerId,
      classCode: learnerData.classCode,
      learnerName: learnerData.learnerName,
      type,
      title,
      data: data || {},
      files: uploadedFiles,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    // 학생 및 수업의 작품 수 증가
    await learnerDoc.ref.update({
      artifactCount: admin.firestore.FieldValue.increment(1)
    });

    await db.collection('classes').doc(learnerData.classCode).update({
      artifactCount: admin.firestore.FieldValue.increment(1)
    });

    console.log(`✅ 작품 저장: ${artifactId} (${type}) - ${learnerData.learnerName}`);

    return res.status(200).json({
      success: true,
      artifactId,
      shareId,
      message: '작품이 저장되었습니다.',
      shareUrl: `https://story-maker-4l6.pages.dev/share/${shareId}`
    });

  } catch (error) {
    console.error('❌ artifactSave 오류:', error);
    return res.status(500).json({ 
      error: '작품 저장 중 오류가 발생했습니다.',
      details: error.message 
    });
  }
});

/**
 * 5. 학생 작품 목록 조회
 * GET /artifactList?learnerId=xxx
 * Returns: { artifacts: [...] }
 */
exports.artifactList = functions.https.onRequest({ 
  region: REGION,
  cors: corsOptions 
}, async (req, res) => {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { learnerId } = req.query;

    if (!learnerId) {
      return res.status(400).json({ 
        error: '학생 ID를 입력해주세요.' 
      });
    }

    // 작품 조회
    const snapshot = await db.collection('artifacts')
      .where('learnerId', '==', learnerId)
      .orderBy('createdAt', 'desc')
      .get();

    const artifacts = [];
    snapshot.forEach(doc => {
      const data = doc.data();
      artifacts.push({
        artifactId: data.artifactId,
        shareId: data.shareId,
        type: data.type,
        title: data.title,
        createdAt: data.createdAt?.toDate().toISOString(),
        thumbnail: data.files?.thumbnail || data.files?.cover || null
      });
    });

    return res.status(200).json({
      success: true,
      artifacts,
      count: artifacts.length
    });

  } catch (error) {
    console.error('❌ artifactList 오류:', error);
    return res.status(500).json({ 
      error: '작품 목록 조회 중 오류가 발생했습니다.',
      details: error.message 
    });
  }
});

/**
 * 6. 공유 ID로 작품 조회 (기기 변경 열람)
 * GET /artifactByShare?shareId=xxx
 * Returns: { artifact: {...} }
 */
exports.artifactByShare = functions.https.onRequest({ 
  region: REGION,
  cors: corsOptions 
}, async (req, res) => {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { shareId } = req.query;

    if (!shareId) {
      return res.status(400).json({ 
        error: '공유 ID를 입력해주세요.' 
      });
    }

    // 작품 조회
    const snapshot = await db.collection('artifacts')
      .where('shareId', '==', shareId)
      .limit(1)
      .get();

    if (snapshot.empty) {
      return res.status(404).json({ 
        error: '존재하지 않는 공유 ID입니다.' 
      });
    }

    const artifact = snapshot.docs[0].data();

    return res.status(200).json({
      success: true,
      artifact: {
        artifactId: artifact.artifactId,
        shareId: artifact.shareId,
        type: artifact.type,
        title: artifact.title,
        data: artifact.data,
        files: artifact.files,
        learnerName: artifact.learnerName,
        createdAt: artifact.createdAt?.toDate().toISOString()
      }
    });

  } catch (error) {
    console.error('❌ artifactByShare 오류:', error);
    return res.status(500).json({ 
      error: '작품 조회 중 오류가 발생했습니다.',
      details: error.message 
    });
  }
});

/**
 * 7. 강사용 일괄 다운로드 (ZIP)
 * POST /exportClassZip
 * Body: { classCode: string, instructorPin: string }
 * Returns: ZIP file stream
 */
exports.exportClassZip = functions.https.onRequest({ 
  region: REGION,
  cors: corsOptions,
  timeoutSeconds: 540, // 9분 (최대)
  memory: '2GiB'
}, async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { classCode, instructorPin } = req.body;

    // 입력 검증
    if (!classCode || !instructorPin) {
      return res.status(400).json({ 
        error: '수업 코드와 강사 PIN을 입력해주세요.' 
      });
    }

    // PIN 검증
    const classDoc = await db.collection('classes').doc(classCode).get();

    if (!classDoc.exists) {
      return res.status(404).json({ 
        error: '존재하지 않는 수업 코드입니다.' 
      });
    }

    const classData = classDoc.data();

    if (classData.instructorPin !== hashPin(instructorPin)) {
      return res.status(403).json({ 
        error: '잘못된 강사 PIN입니다.' 
      });
    }

    // 모든 작품 조회
    const snapshot = await db.collection('artifacts')
      .where('classCode', '==', classCode)
      .get();

    if (snapshot.empty) {
      return res.status(404).json({ 
        error: '작품이 없습니다.' 
      });
    }

    // ZIP 생성
    const archiver = require('archiver');
    const archive = archiver('zip', {
      zlib: { level: 9 } // 최대 압축
    });

    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', `attachment; filename="${classData.className}_작품모음_${Date.now()}.zip"`);

    archive.pipe(res);

    // 작품별로 폴더 생성 및 파일 추가
    for (const doc of snapshot.docs) {
      const artifact = doc.data();
      const folderName = `${artifact.learnerName}_${artifact.type}_${artifact.title}`.replace(/[<>:"/\\|?*]/g, '_');

      // data.json 추가 (재편집용)
      archive.append(JSON.stringify(artifact.data, null, 2), { 
        name: `${folderName}/data.json` 
      });

      // 파일 다운로드 및 추가
      if (artifact.files) {
        for (const [key, url] of Object.entries(artifact.files)) {
          try {
            const fileBuffer = await downloadFileFromStorage(url);
            const ext = getFileExtension(url);
            archive.append(fileBuffer, { 
              name: `${folderName}/${key}.${ext}` 
            });
          } catch (err) {
            console.warn(`⚠️ 파일 다운로드 실패: ${url}`, err);
          }
        }
      }
    }

    await archive.finalize();
    console.log(`✅ ZIP 다운로드: ${classCode} - ${snapshot.size}개 작품`);

  } catch (error) {
    console.error('❌ exportClassZip 오류:', error);
    return res.status(500).json({ 
      error: 'ZIP 생성 중 오류가 발생했습니다.',
      details: error.message 
    });
  }
});

/**
 * ========================================
 * 헬퍼 함수
 * ========================================
 */

// 수업 코드 생성 (8자리 영숫자)
function generateClassCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // 혼동 가능한 문자 제외
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

// 작품 ID 생성
function generateArtifactId() {
  return require('uuid').v4();
}

// 공유 ID 생성 (짧은 ID)
function generateShareId() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
  let id = '';
  for (let i = 0; i < 12; i++) {
    id += chars[Math.floor(Math.random() * chars.length)];
  }
  return id;
}

// PIN 해시화 (간단한 해시)
function hashPin(pin) {
  const crypto = require('crypto');
  return crypto.createHash('sha256').update(pin).digest('hex');
}

// Base64 확인
function isBase64(str) {
  if (typeof str !== 'string') return false;
  return str.startsWith('data:');
}

// Base64 → Storage 업로드
async function uploadBase64ToStorage(base64, filePath) {
  const bucket = storage.bucket();
  const file = bucket.file(filePath);

  // Base64에서 데이터 추출
  const matches = base64.match(/^data:(.+);base64,(.+)$/);
  if (!matches) {
    throw new Error('Invalid base64 format');
  }

  const contentType = matches[1];
  const data = matches[2];
  const buffer = Buffer.from(data, 'base64');

  // 업로드
  await file.save(buffer, {
    metadata: {
      contentType,
    },
  });

  // 공개 URL 생성
  await file.makePublic();
  return `https://storage.googleapis.com/${bucket.name}/${filePath}`;
}

// Storage에서 파일 다운로드
async function downloadFileFromStorage(url) {
  const https = require('https');
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      const chunks = [];
      res.on('data', (chunk) => chunks.push(chunk));
      res.on('end', () => resolve(Buffer.concat(chunks)));
      res.on('error', reject);
    });
  });
}

// 파일 확장자 추출
function getFileExtension(url) {
  const match = url.match(/\.([^./?#]+)(?:[?#]|$)/);
  return match ? match[1] : 'bin';
}

console.log('🚀 Firebase Functions 로드 완료');
