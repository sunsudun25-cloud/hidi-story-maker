/**
 * dbService.ts
 * 시니어 친화 버전 — IndexedDB 안정화 + Safari Private 대응 + fallback 저장소
 */

const DB_NAME = "AIStoryMakerDB";
const DB_VERSION = 3;

// Object Stores
const STORE_NAME = "stories";
const IMAGE_STORE_NAME = "images";
const STORYBOOK_STORE_NAME = "storybooks";

/* ------------------------------------------------------------------
    TypeScript 타입 정의
------------------------------------------------------------------ */
export interface Story {
  id: string;
  title: string;
  content: string;
  image?: string;
  description?: string;
  createdAt: string | Date;
  updatedAt?: string | Date;
}

export interface SavedImage {
  id?: string;
  image: string;
  prompt: string;
  style?: string;
  createdAt: string;
}

export interface StorybookPage {
  text: string;
  imageUrl?: string;
}

export interface Storybook {
  id?: string;
  title: string;
  prompt?: string;
  style?: string;
  coverImageUrl?: string;
  pages: StorybookPage[];
  createdAt: string;
}

/* ------------------------------------------------------------------
    1) IndexedDB 사용 가능 여부 체크
------------------------------------------------------------------ */
export function isIndexedDBAvailable(): boolean {
  try {
    // 시크릿 모드 감지
    if (typeof indexedDB === "undefined") {
      return false;
    }
    
    // 실제 IndexedDB 접근 가능 여부 테스트
    try {
      const testDB = indexedDB.open("__test__");
      testDB.onerror = () => false;
      return true;
    } catch {
      return false;
    }
  } catch {
    return false;
  }
}

/* ------------------------------------------------------------------
    2) Fallback 저장소 (localStorage 기반)
------------------------------------------------------------------ */
function saveFallback(key: string, data: any) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (err) {
    console.warn("⚠️ localStorage 저장 실패:", err);
  }
}

function loadFallback(key: string) {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
}

/* ==================================================================
    IndexedDB 초기화
================================================================== */
export async function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    try {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      /* ----- 성공 ----- */
      request.onsuccess = () => resolve(request.result);

      /* ----- 실패 ----- */
      request.onerror = () =>
        reject(new Error("IndexedDB 초기화 실패: " + request.error));

      /* ----- 스키마 업데이트 ----- */
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Stories Store
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const store = db.createObjectStore(STORE_NAME, { keyPath: "id" });
          store.createIndex("title", "title", { unique: false });
          store.createIndex("createdAt", "createdAt", { unique: false });
        }

        // Images Store
        if (!db.objectStoreNames.contains(IMAGE_STORE_NAME)) {
          const store = db.createObjectStore(IMAGE_STORE_NAME, { 
            keyPath: "id", 
            autoIncrement: false 
          });
          store.createIndex("prompt", "prompt", { unique: false });
          store.createIndex("createdAt", "createdAt", { unique: false });
        }

        // Storybooks Store
        if (!db.objectStoreNames.contains(STORYBOOK_STORE_NAME)) {
          const store = db.createObjectStore(STORYBOOK_STORE_NAME, { 
            keyPath: "id", 
            autoIncrement: false 
          });
          store.createIndex("title", "title", { unique: false });
          store.createIndex("createdAt", "createdAt", { unique: false });
        }
      };
    } catch (err) {
      reject(err);
    }
  });
}

/* ==================================================================
    스토리 관련 함수
================================================================== */

/**
 * 스토리 저장 (새 스토리 추가)
 */
export async function saveStory(title: string, content: string, image?: string, description?: string): Promise<Story> {
  const data: Story = {
    id: crypto.randomUUID(),
    title,
    content,
    image,
    description,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  if (!isIndexedDBAvailable()) {
    saveFallback(`story-fb-${data.id}`, data);
    return data;
  }

  try {
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);
    store.put(data);
    return new Promise((resolve, reject) => {
      tx.oncomplete = () => resolve(data);
      tx.onerror = () => {
        saveFallback(`story-fb-${data.id}`, data);
        resolve(data);
      };
    });
  } catch (err) {
    saveFallback(`story-fb-${data.id}`, data);
    return data;
  }
}

/**
 * 스토리 추가 (Context API 호환)
 */
export async function addStory(story: Story): Promise<void> {
  const data = {
    ...story,
    createdAt: typeof story.createdAt === 'string' ? story.createdAt : story.createdAt.toISOString(),
    updatedAt: story.updatedAt 
      ? (typeof story.updatedAt === 'string' ? story.updatedAt : story.updatedAt.toISOString())
      : new Date().toISOString(),
  };

  if (!isIndexedDBAvailable()) {
    saveFallback(`story-fb-${data.id}`, data);
    return;
  }

  try {
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);
    store.put(data);
    return new Promise((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => {
        saveFallback(`story-fb-${data.id}`, data);
        resolve();
      };
    });
  } catch (err) {
    saveFallback(`story-fb-${data.id}`, data);
  }
}

/**
 * 스토리 수정
 */
export async function updateStory(story: Story): Promise<void> {
  const updated = {
    ...story,
    updatedAt: new Date().toISOString(),
    createdAt: typeof story.createdAt === 'string' ? story.createdAt : story.createdAt.toISOString(),
  };

  if (!isIndexedDBAvailable()) {
    saveFallback(`story-fb-${story.id}`, updated);
    return;
  }

  try {
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, "readwrite");
    tx.objectStore(STORE_NAME).put(updated);
    return new Promise((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => {
        saveFallback(`story-fb-${story.id}`, updated);
        resolve();
      };
    });
  } catch (err) {
    saveFallback(`story-fb-${story.id}`, updated);
  }
}

/**
 * 스토리 삭제
 */
export async function deleteStory(id: string): Promise<void> {
  if (!isIndexedDBAvailable()) {
    localStorage.removeItem(`story-fb-${id}`);
    return;
  }

  try {
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, "readwrite");
    tx.objectStore(STORE_NAME).delete(id);
    return new Promise((resolve) => {
      tx.oncomplete = () => {
        localStorage.removeItem(`story-fb-${id}`);
        resolve();
      };
      tx.onerror = () => {
        localStorage.removeItem(`story-fb-${id}`);
        resolve();
      };
    });
  } catch (err) {
    localStorage.removeItem(`story-fb-${id}`);
  }
}

/**
 * 특정 스토리 가져오기
 */
export async function getStory(id: string): Promise<Story | undefined> {
  if (!isIndexedDBAvailable()) {
    const fallback = loadFallback(`story-fb-${id}`);
    return fallback ? normalizeStory(fallback) : undefined;
  }

  try {
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, "readonly");
    const store = tx.objectStore(STORE_NAME);
    const request = store.get(id);

    return new Promise((resolve) => {
      request.onsuccess = () => {
        if (request.result) {
          resolve(normalizeStory(request.result));
        } else {
          const fallback = loadFallback(`story-fb-${id}`);
          resolve(fallback ? normalizeStory(fallback) : undefined);
        }
      };
      request.onerror = () => {
        const fallback = loadFallback(`story-fb-${id}`);
        resolve(fallback ? normalizeStory(fallback) : undefined);
      };
    });
  } catch (err) {
    const fallback = loadFallback(`story-fb-${id}`);
    return fallback ? normalizeStory(fallback) : undefined;
  }
}

/**
 * 모든 스토리 불러오기 (IndexedDB + localStorage 병합)
 */
export async function getAllStories(): Promise<Story[]> {
  // localStorage 우선 사용 (IndexedDB 오류 회피)
  const fallbackStories = loadStoriesFromFallback();
  
  // IndexedDB 사용 불가능하면 localStorage만 사용
  if (!isIndexedDBAvailable()) {
    console.warn("⚠ IndexedDB 사용 불가 → localStorage 사용");
    return fallbackStories;
  }

  try {
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, "readonly");
    const store = tx.objectStore(STORE_NAME);
    const request = store.getAll();

    return new Promise((resolve) => {
      request.onsuccess = () => {
        const indexedDBStories = (request.result || []).map(normalizeStory);
        
        // 병합 및 중복 제거 (id 기준)
        const allStories = [...indexedDBStories, ...fallbackStories];
        const uniqueStories = Array.from(
          new Map(allStories.map(s => [s.id, s])).values()
        );
        
        resolve(uniqueStories);
      };
      request.onerror = () => {
        console.warn("⚠ IndexedDB getAll 실패 → localStorage 사용");
        resolve(fallbackStories);
      };
    });
  } catch (err) {
    console.warn("⚠ 스토리 불러오기 실패 (IndexedDB 접근 불가):", err);
    return fallbackStories;
  }
}

/**
 * 모든 스토리 삭제
 */
export async function clearAllStories(): Promise<void> {
  // localStorage 정리
  Object.keys(localStorage)
    .filter((k) => k.startsWith("story-fb-"))
    .forEach((k) => localStorage.removeItem(k));

  if (!isIndexedDBAvailable()) {
    return;
  }

  try {
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, "readwrite");
    tx.objectStore(STORE_NAME).clear();
    return new Promise((resolve) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => resolve();
    });
  } catch (err) {
    console.warn("⚠️ IndexedDB clear 실패:", err);
  }
}

/* ------------------------------------------------------------------
    Fallback 스토리 불러오기
------------------------------------------------------------------ */
function loadStoriesFromFallback(): Story[] {
  const keys = Object.keys(localStorage).filter((k) =>
    k.startsWith("story-fb-")
  );

  return keys
    .map((k) => loadFallback(k))
    .filter(Boolean)
    .map(normalizeStory);
}

/* ------------------------------------------------------------------
    Story 정규화 (Date 객체 변환)
------------------------------------------------------------------ */
function normalizeStory(data: any): Story {
  return {
    ...data,
    createdAt: data.createdAt instanceof Date ? data.createdAt : new Date(data.createdAt || Date.now()),
    updatedAt: data.updatedAt instanceof Date ? data.updatedAt : new Date(data.updatedAt || Date.now()),
  };
}

/* ==================================================================
    이미지 관련 함수
================================================================== */

/**
 * 이미지 저장
 */
export async function saveImageToDB(data: Omit<SavedImage, 'id'>): Promise<SavedImage> {
  const record: SavedImage = {
    id: crypto.randomUUID(),
    ...data,
    createdAt: data.createdAt || new Date().toISOString(),
  };

  if (!isIndexedDBAvailable()) {
    saveFallback(`image-fb-${record.id}`, record);
    return record;
  }

  try {
    const db = await openDB();
    const tx = db.transaction(IMAGE_STORE_NAME, "readwrite");
    tx.objectStore(IMAGE_STORE_NAME).put(record);
    return new Promise((resolve) => {
      tx.oncomplete = () => resolve(record);
      tx.onerror = () => {
        saveFallback(`image-fb-${record.id}`, record);
        resolve(record);
      };
    });
  } catch (err) {
    saveFallback(`image-fb-${record.id}`, record);
    return record;
  }
}

/**
 * 모든 이미지 불러오기
 */
export async function getAllImages(): Promise<SavedImage[]> {
  if (!isIndexedDBAvailable()) {
    return loadImagesFromFallback();
  }

  try {
    const db = await openDB();
    
    // 스토어 존재 확인
    if (!db.objectStoreNames.contains(IMAGE_STORE_NAME)) {
      console.warn('Image store does not exist, returning empty array');
      return loadImagesFromFallback();
    }
    
    const tx = db.transaction(IMAGE_STORE_NAME, "readonly");
    const store = tx.objectStore(IMAGE_STORE_NAME);
    const request = store.getAll();

    return new Promise((resolve) => {
      request.onsuccess = () => {
        const indexedDBImages = request.result || [];
        const fallbackImages = loadImagesFromFallback();
        
        // 병합 및 중복 제거
        const allImages = [...indexedDBImages, ...fallbackImages];
        const uniqueImages = Array.from(
          new Map(allImages.map(img => [img.id, img])).values()
        );
        
        resolve(uniqueImages);
      };
      request.onerror = () => resolve(loadImagesFromFallback());
    });
  } catch (err) {
    console.error('getAllImages error:', err);
    return loadImagesFromFallback();
  }
}

/**
 * 이미지 삭제
 */
export async function deleteImage(id: string | number): Promise<void> {
  const stringId = String(id);
  
  // localStorage 정리
  localStorage.removeItem(`image-fb-${stringId}`);

  if (!isIndexedDBAvailable()) {
    return;
  }

  try {
    const db = await openDB();
    const tx = db.transaction(IMAGE_STORE_NAME, "readwrite");
    tx.objectStore(IMAGE_STORE_NAME).delete(stringId);
    return new Promise((resolve) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => resolve();
    });
  } catch (err) {
    console.warn("⚠️ 이미지 삭제 실패:", err);
  }
}

/**
 * 모든 이미지 삭제
 */
export async function clearAllImages(): Promise<void> {
  // localStorage 정리
  Object.keys(localStorage)
    .filter((k) => k.startsWith("image-fb-"))
    .forEach((k) => localStorage.removeItem(k));

  if (!isIndexedDBAvailable()) {
    return;
  }

  try {
    const db = await openDB();
    const tx = db.transaction(IMAGE_STORE_NAME, "readwrite");
    tx.objectStore(IMAGE_STORE_NAME).clear();
    return new Promise((resolve) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => resolve();
    });
  } catch (err) {
    console.warn("⚠️ 이미지 전체 삭제 실패:", err);
  }
}

function loadImagesFromFallback(): SavedImage[] {
  const keys = Object.keys(localStorage).filter((k) =>
    k.startsWith("image-fb-")
  );

  return keys.map((k) => loadFallback(k)).filter(Boolean);
}

/* ==================================================================
    동화책 관련 함수
================================================================== */

/**
 * 동화책 저장
 */
export async function saveStorybook(storybookData: Omit<Storybook, 'id'>): Promise<string> {
  const record: Storybook = {
    id: crypto.randomUUID(),
    ...storybookData,
    createdAt: new Date().toISOString()
  };

  if (!isIndexedDBAvailable()) {
    saveFallback(`storybook-fb-${record.id}`, record);
    return record.id!;
  }

  try {
    const db = await openDB();
    const tx = db.transaction(STORYBOOK_STORE_NAME, "readwrite");
    tx.objectStore(STORYBOOK_STORE_NAME).put(record);
    return new Promise((resolve) => {
      tx.oncomplete = () => resolve(record.id!);
      tx.onerror = () => {
        saveFallback(`storybook-fb-${record.id}`, record);
        resolve(record.id!);
      };
    });
  } catch (err) {
    saveFallback(`storybook-fb-${record.id}`, record);
    return record.id!;
  }
}

/**
 * 모든 동화책 가져오기
 */
export async function getAllStorybooks(): Promise<Storybook[]> {
  if (!isIndexedDBAvailable()) {
    return loadStorybooksFromFallback();
  }

  try {
    const db = await openDB();
    
    // 스토어 존재 확인
    if (!db.objectStoreNames.contains(STORYBOOK_STORE_NAME)) {
      console.warn('Storybook store does not exist, returning empty array');
      return loadStorybooksFromFallback();
    }
    
    const tx = db.transaction(STORYBOOK_STORE_NAME, "readonly");
    const store = tx.objectStore(STORYBOOK_STORE_NAME);
    const request = store.getAll();

    return new Promise((resolve) => {
      request.onsuccess = () => {
        const indexedDBBooks = request.result || [];
        const fallbackBooks = loadStorybooksFromFallback();
        
        // 병합 및 중복 제거
        const allBooks = [...indexedDBBooks, ...fallbackBooks];
        const uniqueBooks = Array.from(
          new Map(allBooks.map(b => [b.id, b])).values()
        );
        
        resolve(uniqueBooks);
      };
      request.onerror = () => resolve(loadStorybooksFromFallback());
    });
  } catch (err) {
    console.error('getAllStorybooks error:', err);
    return loadStorybooksFromFallback();
  }
}

/**
 * 특정 동화책 가져오기
 */
export async function getStorybook(id: string | number): Promise<Storybook | undefined> {
  const stringId = String(id);
  
  if (!isIndexedDBAvailable()) {
    const fallback = loadFallback(`storybook-fb-${stringId}`);
    return fallback || undefined;
  }

  try {
    const db = await openDB();
    const tx = db.transaction(STORYBOOK_STORE_NAME, "readonly");
    const store = tx.objectStore(STORYBOOK_STORE_NAME);
    const request = store.get(stringId);

    return new Promise((resolve) => {
      request.onsuccess = () => {
        if (request.result) {
          resolve(request.result);
        } else {
          const fallback = loadFallback(`storybook-fb-${stringId}`);
          resolve(fallback || undefined);
        }
      };
      request.onerror = () => {
        const fallback = loadFallback(`storybook-fb-${stringId}`);
        resolve(fallback || undefined);
      };
    });
  } catch (err) {
    const fallback = loadFallback(`storybook-fb-${stringId}`);
    return fallback || undefined;
  }
}

/**
 * 동화책 업데이트
 */
export async function updateStorybook(id: string | number, storybookData: Omit<Storybook, 'id'>): Promise<void> {
  const stringId = String(id);
  const updated: Storybook = {
    ...storybookData,
    id: stringId,
  };

  if (!isIndexedDBAvailable()) {
    saveFallback(`storybook-fb-${stringId}`, updated);
    return;
  }

  try {
    const db = await openDB();
    const tx = db.transaction(STORYBOOK_STORE_NAME, "readwrite");
    tx.objectStore(STORYBOOK_STORE_NAME).put(updated);
    return new Promise((resolve) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => {
        saveFallback(`storybook-fb-${stringId}`, updated);
        resolve();
      };
    });
  } catch (err) {
    saveFallback(`storybook-fb-${stringId}`, updated);
  }
}

/**
 * 동화책 삭제
 */
export async function deleteStorybook(id: string | number): Promise<void> {
  const stringId = String(id);
  
  // localStorage 정리
  localStorage.removeItem(`storybook-fb-${stringId}`);

  if (!isIndexedDBAvailable()) {
    return;
  }

  try {
    const db = await openDB();
    const tx = db.transaction(STORYBOOK_STORE_NAME, "readwrite");
    tx.objectStore(STORYBOOK_STORE_NAME).delete(stringId);
    return new Promise((resolve) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => resolve();
    });
  } catch (err) {
    console.warn("⚠️ 동화책 삭제 실패:", err);
  }
}

/**
 * 모든 동화책 삭제
 */
export async function clearAllStorybooks(): Promise<void> {
  // localStorage 정리
  Object.keys(localStorage)
    .filter((k) => k.startsWith("storybook-fb-"))
    .forEach((k) => localStorage.removeItem(k));

  if (!isIndexedDBAvailable()) {
    return;
  }

  try {
    const db = await openDB();
    const tx = db.transaction(STORYBOOK_STORE_NAME, "readwrite");
    tx.objectStore(STORYBOOK_STORE_NAME).clear();
    return new Promise((resolve) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => resolve();
    });
  } catch (err) {
    console.warn("⚠️ 동화책 전체 삭제 실패:", err);
  }
}

function loadStorybooksFromFallback(): Storybook[] {
  const keys = Object.keys(localStorage).filter((k) =>
    k.startsWith("storybook-fb-")
  );

  return keys.map((k) => loadFallback(k)).filter(Boolean);
}

/* ==================================================================
    전체 초기화 (개발용)
================================================================== */
export async function clearAll(): Promise<void> {
  // localStorage 전체 정리
  Object.keys(localStorage)
    .filter((k) => 
      k.startsWith("story-fb-") || 
      k.startsWith("image-fb-") || 
      k.startsWith("storybook-fb-")
    )
    .forEach((k) => localStorage.removeItem(k));

  if (!isIndexedDBAvailable()) {
    return;
  }

  try {
    // IndexedDB 전체 삭제
    await new Promise<void>((resolve, reject) => {
      const request = indexedDB.deleteDatabase(DB_NAME);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
      request.onblocked = () => {
        console.warn("⚠️ DB 삭제가 차단되었습니다. 다른 탭을 닫아주세요.");
        resolve(); // 차단되어도 계속 진행
      };
    });
  } catch (err) {
    console.warn("⚠️ IndexedDB 삭제 실패:", err);
  }
}
