/**
 * Classroom Service - 수업 운영 시스템 클라이언트
 * 
 * Firebase Functions API를 호출하여 수업 관리 및 작품 저장/조회
 * 로그인 없이 수업코드 + 학생코드로 6개월 클라우드 저장
 */

// Firebase Functions Gen 2 uses Cloud Run URLs
// Note: Each function has its own URL with different subdomain
const FUNCTIONS_BASE_URL = "https://asia-northeast1-story-make-fbbd7.cloudfunctions.net";

/**
 * ========================================
 * TypeScript 타입 정의
 * ========================================
 */

export interface ClassInfo {
  classCode: string;
  className: string;
  instructorName: string;
  expiresAt: string;
  learnerCount?: number;
  artifactCount?: number;
}

export interface LearnerInfo {
  learnerId: string;
  learnerName: string;
  classCode: string;
  isNew: boolean;
}

export interface ArtifactSaveRequest {
  learnerId: string;
  type: 'story' | 'image' | 'storybook';
  title: string;
  data: any;
  files?: { [key: string]: string }; // Base64 or URL
}

export interface ArtifactInfo {
  artifactId: string;
  shareId: string;
  type: string;
  title: string;
  createdAt: string;
  thumbnail?: string;
}

export interface ArtifactDetail extends ArtifactInfo {
  data: any;
  files: { [key: string]: string };
  learnerName: string;
}

/**
 * ========================================
 * 로컬 스토리지 관리
 * ========================================
 */

const STORAGE_KEYS = {
  CLASS_CODE: 'classroom_classCode',
  LEARNER_CODE: 'classroom_learnerCode',
  LEARNER_ID: 'classroom_learnerId',
  LEARNER_NAME: 'classroom_learnerName',
};

// 현재 로그인된 학생 정보 저장
export function saveCurrentLearner(learnerInfo: LearnerInfo): void {
  try {
    localStorage.setItem(STORAGE_KEYS.CLASS_CODE, learnerInfo.classCode);
    localStorage.setItem(STORAGE_KEYS.LEARNER_CODE, learnerInfo.learnerId.split('-')[1]);
    localStorage.setItem(STORAGE_KEYS.LEARNER_ID, learnerInfo.learnerId);
    localStorage.setItem(STORAGE_KEYS.LEARNER_NAME, learnerInfo.learnerName);
  } catch (e) {
    console.warn('⚠️ localStorage 저장 실패:', e);
  }
}

// 현재 로그인된 학생 정보 조회
export function getCurrentLearner(): LearnerInfo | null {
  try {
    const classCode = localStorage.getItem(STORAGE_KEYS.CLASS_CODE);
    const learnerId = localStorage.getItem(STORAGE_KEYS.LEARNER_ID);
    const learnerName = localStorage.getItem(STORAGE_KEYS.LEARNER_NAME);

    if (!classCode || !learnerId || !learnerName) {
      return null;
    }

    return {
      learnerId,
      learnerName,
      classCode,
      isNew: false,
    };
  } catch (e) {
    console.warn('⚠️ localStorage 조회 실패:', e);
    return null;
  }
}

// 로그아웃 (로컬 데이터 삭제)
export function clearCurrentLearner(): void {
  try {
    localStorage.removeItem(STORAGE_KEYS.CLASS_CODE);
    localStorage.removeItem(STORAGE_KEYS.LEARNER_CODE);
    localStorage.removeItem(STORAGE_KEYS.LEARNER_ID);
    localStorage.removeItem(STORAGE_KEYS.LEARNER_NAME);
  } catch (e) {
    console.warn('⚠️ localStorage 삭제 실패:', e);
  }
}

/**
 * ========================================
 * API 호출 함수
 * ========================================
 */

/**
 * 1. 수업 생성 (강사용)
 */
export async function createClass(
  className: string,
  instructorName: string,
  instructorPin: string
): Promise<ClassInfo> {
  console.log('🚀 수업 생성 요청:', { className, instructorName });

  const response = await fetch(`${FUNCTIONS_BASE_URL}/classCreate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ className, instructorName, instructorPin }),
  });

  const data = await response.json();

  if (!response.ok || !data.success) {
    throw new Error(data.error || '수업 생성 실패');
  }

  console.log('✅ 수업 생성 완료:', data.classCode);
  return data;
}

/**
 * 2. 강사 PIN 검증
 */
export async function verifyInstructorPin(
  classCode: string,
  instructorPin: string
): Promise<boolean> {
  console.log('🔑 강사 PIN 검증:', classCode);

  const response = await fetch(`${FUNCTIONS_BASE_URL}/classVerifyPin`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ classCode, instructorPin }),
  });

  const data = await response.json();

  if (!response.ok || !data.success) {
    throw new Error(data.error || 'PIN 검증 실패');
  }

  console.log('✅ PIN 검증 결과:', data.valid);
  return data.valid;
}

/**
 * 3. 학생 등록/로그인
 */
export async function ensureLearner(
  classCode: string,
  learnerCode: string,
  learnerName?: string
): Promise<LearnerInfo> {
  console.log('👤 학생 로그인:', { classCode, learnerCode });

  const response = await fetch(`${FUNCTIONS_BASE_URL}/learnerEnsure`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ classCode, learnerCode, learnerName }),
  });

  const data = await response.json();

  if (!response.ok || !data.success) {
    throw new Error(data.error || '학생 로그인 실패');
  }

  const learnerInfo: LearnerInfo = {
    learnerId: data.learnerId,
    learnerName: data.learnerName,
    classCode,
    isNew: data.isNew,
  };

  // 로컬 저장
  saveCurrentLearner(learnerInfo);

  console.log('✅ 학생 로그인 완료:', learnerInfo);
  return learnerInfo;
}

/**
 * 4. 작품 저장 (통합)
 */
export async function saveArtifact(request: ArtifactSaveRequest): Promise<{
  artifactId: string;
  shareId: string;
  shareUrl: string;
}> {
  console.log('💾 작품 저장:', { type: request.type, title: request.title });

  const response = await fetch(`${FUNCTIONS_BASE_URL}/artifactSave`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  });

  const data = await response.json();

  if (!response.ok || !data.success) {
    throw new Error(data.error || '작품 저장 실패');
  }

  console.log('✅ 작품 저장 완료:', data.artifactId);
  return data;
}

/**
 * 5. 학생 작품 목록 조회
 */
export async function listArtifacts(learnerId: string): Promise<ArtifactInfo[]> {
  console.log('📚 작품 목록 조회:', learnerId);

  const response = await fetch(
    `${FUNCTIONS_BASE_URL}/artifactList?learnerId=${encodeURIComponent(learnerId)}`
  );

  const data = await response.json();

  if (!response.ok || !data.success) {
    throw new Error(data.error || '작품 목록 조회 실패');
  }

  console.log('✅ 작품 목록:', data.count);
  return data.artifacts;
}

/**
 * 6. 공유 ID로 작품 조회 (기기 변경)
 */
export async function getArtifactByShare(shareId: string): Promise<ArtifactDetail> {
  console.log('🔗 공유 작품 조회:', shareId);

  const response = await fetch(
    `${FUNCTIONS_BASE_URL}/artifactByShare?shareId=${encodeURIComponent(shareId)}`
  );

  const data = await response.json();

  if (!response.ok || !data.success) {
    throw new Error(data.error || '작품 조회 실패');
  }

  console.log('✅ 작품 조회 완료:', data.artifact.title);
  return data.artifact;
}

/**
 * 7. 작품 삭제 (본인만 가능)
 */
export async function deleteArtifact(artifactId: string, learnerId: string): Promise<void> {
  console.log('🗑️ 작품 삭제 요청:', { artifactId, learnerId });

  const response = await fetch(`${FUNCTIONS_BASE_URL}/artifactDelete`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ artifactId, learnerId }),
  });

  const data = await response.json();

  if (!response.ok || !data.success) {
    throw new Error(data.error || '작품 삭제 실패');
  }

  console.log('✅ 작품 삭제 완료:', artifactId);
}

/**
 * 8. 강사용 ZIP 다운로드 (전체 작품)
 */
export async function exportClassZip(
  classCode: string,
  instructorPin: string
): Promise<Blob> {
  console.log('📦 ZIP 다운로드 요청:', classCode);

  const response = await fetch(`${FUNCTIONS_BASE_URL}/exportClassZip`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ classCode, instructorPin }),
  });

  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.error || 'ZIP 다운로드 실패');
  }

  const blob = await response.blob();
  console.log('✅ ZIP 다운로드 완료:', blob.size, 'bytes');
  return blob;
}

/**
 * ========================================
 * 헬퍼 함수
 * ========================================
 */

/**
 * ZIP 파일 다운로드 (브라우저)
 */
export function downloadZipFile(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * 공유 URL 생성
 */
export function getShareUrl(shareId: string): string {
  return `https://story-maker-4l6.pages.dev/share/${shareId}`;
}

/**
 * QR 코드 URL 생성 (공유 링크용)
 */
export function getQRCodeUrl(shareId: string): string {
  const shareUrl = getShareUrl(shareId);
  return `https://api.qrserver.com/v1/create-qr-code/?size=256x256&data=${encodeURIComponent(shareUrl)}`;
}

export default {
  // 수업 관리
  createClass,
  verifyInstructorPin,
  ensureLearner,
  
  // 작품 관리
  saveArtifact,
  listArtifacts,
  getArtifactByShare,
  exportClassZip,
  
  // 로컬 데이터
  saveCurrentLearner,
  getCurrentLearner,
  clearCurrentLearner,
  
  // 헬퍼
  downloadZipFile,
  getShareUrl,
  getQRCodeUrl,
};
