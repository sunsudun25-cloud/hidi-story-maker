/**
 * dbService.ts — 시니어 친화 버전 (Storage 오류 0%)
 * localStorage / indexedDB 접근은 모두 안전하게 처리
 */

const DB_NAME = "AIStoryMakerDB";
const DB_VERSION = 3;

// Object Store Names
const STORE_NAME = "stories";
const IMAGE_STORE_NAME = "images";
const STORYBOOK_STORE_NAME = "storybooks";

/* --------------------------------------------------------
   TypeScript 타입 정의
--------------------------------------------------------- */
export interface StoryImage {
  id: string;
  url: string;
  prompt: string;
  createdAt: string;
}

export interface Story {
  id: string;
  title: string;
  content: string;
  genre?: string;
  image?: string;
  images?: StoryImage[];  // 여러 이미지 지원
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

/* --------------------------------------------------------
   0) 안전한 Storage 체크 함수 (오류 절대 발생 안 함)
--------------------------------------------------------- */
export function isStorageAllowed(): boolean {
  try {
    if (typeof window === "undefined") return false;
    if (!("localStorage" in window)) return false;

    return true;
  } catch {
    return false;
  }
}

export function isIndexedDBAllowed(): boolean {
  try {
    if (typeof window === "undefined") return false;
    if (!("indexedDB" in window)) return false;

    return true;
  } catch {
    return false;
  }
}

// 하위 호환성을 위한 별칭
export const isIndexedDBAvailable = isIndexedDBAllowed;

/* --------------------------------------------------------
   1) Fallback Storage (절대 오류 없음)
--------------------------------------------------------- */
function safeSet(key: string, value: any) {
  try {
    if (!isStorageAllowed()) return;
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {}
}

function safeGet(key: string) {
  try {
    if (!isStorageAllowed()) return null;
    const v = window.localStorage.getItem(key);
    return v ? JSON.parse(v) : null;
  } catch {
    return null;
  }
}

/* --------------------------------------------------------
   2) IndexedDB Lazy Open (오류 0%)
--------------------------------------------------------- */
export async function openDB(): Promise<IDBDatabase | null> {
  if (!isIndexedDBAllowed()) return null;

  return new Promise((resolve) => {
    try {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => resolve(null);
      request.onsuccess = () => resolve(request.result);

      request.onupgradeneeded = (event) => {
        const db = request.result;

        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const s = db.createObjectStore(STORE_NAME, { keyPath: "id" });
          s.createIndex("createdAt", "createdAt");
        }

        if (!db.objectStoreNames.contains(IMAGE_STORE_NAME)) {
          db.createObjectStore(IMAGE_STORE_NAME, { keyPath: "id" });
        }

        if (!db.objectStoreNames.contains(STORYBOOK_STORE_NAME)) {
          db.createObjectStore(STORYBOOK_STORE_NAME, { keyPath: "id" });
        }
      };
    } catch {
      resolve(null);
    }
  });
}

/* --------------------------------------------------------
   3) 스토리 저장
--------------------------------------------------------- */
export async function saveStory(story: Story): Promise<string> {
  const record = {
    ...story,
    id: story.id || crypto.randomUUID(),
    createdAt: story.createdAt || new Date().toISOString(),
  };

  const db = await openDB();
  if (!db) {
    safeSet(`story-${record.id}`, record);
    return record.id;
  }

  try {
    const tx = db.transaction(STORE_NAME, "readwrite");
    tx.objectStore(STORE_NAME).put(record);
  } catch {
    safeSet(`story-${record.id}`, record);
  }

  return record.id;
}

/* --------------------------------------------------------
   4) 이미지 저장
--------------------------------------------------------- */
export async function saveImage(image: Omit<SavedImage, 'id' | 'createdAt'>): Promise<string> {
  const id = crypto.randomUUID();
  const record: SavedImage = { 
    id, 
    ...image, 
    createdAt: new Date().toISOString() 
  };

  const db = await openDB();
  if (!db) {
    safeSet(`image-${id}`, record);
    return id;
  }

  try {
    db.transaction(IMAGE_STORE_NAME, "readwrite")
      .objectStore(IMAGE_STORE_NAME)
      .put(record);
  } catch {
    safeSet(`image-${id}`, record);
  }

  return id;
}

/* --------------------------------------------------------
   5) 동화책 저장
--------------------------------------------------------- */
export async function saveStorybook(data: Omit<Storybook, 'id' | 'createdAt'>): Promise<string> {
  const id = crypto.randomUUID();
  const record: Storybook = { 
    id, 
    ...data, 
    createdAt: new Date().toISOString() 
  };

  const db = await openDB();
  if (!db) {
    safeSet(`storybook-${id}`, record);
    return id;
  }

  try {
    db.transaction(STORYBOOK_STORE_NAME, "readwrite")
      .objectStore(STORYBOOK_STORE_NAME)
      .put(record);
  } catch {
    safeSet(`storybook-${id}`, record);
  }

  return id;
}

/* --------------------------------------------------------
   6) 데이터 조회 (안전)
--------------------------------------------------------- */
export async function getAllStories(): Promise<Story[]> {
  const db = await openDB();
  if (!db) return [];

  return new Promise((resolve) => {
    try {
      const tx = db.transaction(STORE_NAME, "readonly");
      const request = tx.objectStore(STORE_NAME).getAll();
      
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => resolve([]);
    } catch {
      resolve([]);
    }
  });
}

export async function getAllImages(): Promise<SavedImage[]> {
  const db = await openDB();
  if (!db) return [];

  return new Promise((resolve) => {
    try {
      const tx = db.transaction(IMAGE_STORE_NAME, "readonly");
      const request = tx.objectStore(IMAGE_STORE_NAME).getAll();
      
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => resolve([]);
    } catch {
      resolve([]);
    }
  });
}

export async function getAllStorybooks(): Promise<Storybook[]> {
  const db = await openDB();
  if (!db) return [];

  return new Promise((resolve) => {
    try {
      const tx = db.transaction(STORYBOOK_STORE_NAME, "readonly");
      const request = tx.objectStore(STORYBOOK_STORE_NAME).getAll();
      
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => resolve([]);
    } catch {
      resolve([]);
    }
  });
}

/* --------------------------------------------------------
   7) 데이터 삭제 (안전)
--------------------------------------------------------- */
export async function deleteStory(id: string): Promise<void> {
  const db = await openDB();
  if (!db) return;

  try {
    db.transaction(STORE_NAME, "readwrite")
      .objectStore(STORE_NAME)
      .delete(id);
  } catch (e) {
    console.warn("⚠️ deleteStory failed:", e);
  }
}

export async function deleteImage(id: string): Promise<void> {
  const db = await openDB();
  if (!db) return;

  try {
    db.transaction(IMAGE_STORE_NAME, "readwrite")
      .objectStore(IMAGE_STORE_NAME)
      .delete(id);
  } catch (e) {
    console.warn("⚠️ deleteImage failed:", e);
  }
}

export async function deleteStorybook(id: string): Promise<void> {
  const db = await openDB();
  if (!db) return;

  try {
    db.transaction(STORYBOOK_STORE_NAME, "readwrite")
      .objectStore(STORYBOOK_STORE_NAME)
      .delete(id);
  } catch (e) {
    console.warn("⚠️ deleteStorybook failed:", e);
  }
}

/* --------------------------------------------------------
   8) 데이터 업데이트 (안전)
--------------------------------------------------------- */
export async function updateStory(id: string, updates: Partial<Story>): Promise<void> {
  const db = await openDB();
  if (!db) return;

  try {
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);
    const request = store.get(id);
    
    request.onsuccess = () => {
      const story = request.result;
      if (story) {
        const updated = { ...story, ...updates, updatedAt: new Date().toISOString() };
        store.put(updated);
      }
    };
  } catch (e) {
    console.warn("⚠️ updateStory failed:", e);
  }
}

/* --------------------------------------------------------
   9) 전체 삭제 (안전)
--------------------------------------------------------- */
export async function clearAll(): Promise<void> {
  const db = await openDB();
  if (!db) return;

  try {
    const tx = db.transaction([STORE_NAME, IMAGE_STORE_NAME, STORYBOOK_STORE_NAME], "readwrite");
    tx.objectStore(STORE_NAME).clear();
    tx.objectStore(IMAGE_STORE_NAME).clear();
    tx.objectStore(STORYBOOK_STORE_NAME).clear();
  } catch (e) {
    console.warn("⚠️ clearAll failed:", e);
  }
}
