/**
 * IndexedDB 유틸리티
 * Main.js의 Table API를 대체하는 로컬 저장소
 */

const DB_NAME = "AIStoryMakerDB";
const DB_VERSION = 1;
const STORE_NAME = "works";

export interface Work {
  id?: number;
  title: string;
  content: string;
  genre: string;
  contentType: "text" | "image";
  createdAt: Date;
  updatedAt: Date;
  imageUrl?: string;
  imageBase64?: string;
}

/**
 * IndexedDB 초기화
 */
function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      // 스토어가 없으면 생성
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const objectStore = db.createObjectStore(STORE_NAME, {
          keyPath: "id",
          autoIncrement: true,
        });

        // 인덱스 생성
        objectStore.createIndex("genre", "genre", { unique: false });
        objectStore.createIndex("contentType", "contentType", { unique: false });
        objectStore.createIndex("createdAt", "createdAt", { unique: false });
      }
    };
  });
}

/**
 * 작품 추가
 */
export async function addWork(
  title: string,
  content: string,
  genre: string,
  contentType: "text" | "image" = "text",
  imageUrl?: string,
  imageBase64?: string
): Promise<number> {
  const db = await openDB();

  const work: Work = {
    title,
    content,
    genre,
    contentType,
    createdAt: new Date(),
    updatedAt: new Date(),
    imageUrl,
    imageBase64,
  };

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], "readwrite");
    const store = transaction.objectStore(STORE_NAME);
    const request = store.add(work);

    request.onsuccess = () => resolve(request.result as number);
    request.onerror = () => reject(request.error);
  });
}

/**
 * 작품 수정
 */
export async function updateWork(
  id: number,
  title: string,
  content: string
): Promise<void> {
  const db = await openDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], "readwrite");
    const store = transaction.objectStore(STORE_NAME);
    const getRequest = store.get(id);

    getRequest.onsuccess = () => {
      const work = getRequest.result;
      if (work) {
        work.title = title;
        work.content = content;
        work.updatedAt = new Date();

        const updateRequest = store.put(work);
        updateRequest.onsuccess = () => resolve();
        updateRequest.onerror = () => reject(updateRequest.error);
      } else {
        reject(new Error("Work not found"));
      }
    };

    getRequest.onerror = () => reject(getRequest.error);
  });
}

/**
 * 작품 삭제
 */
export async function deleteWork(id: number): Promise<void> {
  const db = await openDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], "readwrite");
    const store = transaction.objectStore(STORE_NAME);
    const request = store.delete(id);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

/**
 * 모든 작품 가져오기
 */
export async function getAllWorks(): Promise<Work[]> {
  const db = await openDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], "readonly");
    const store = transaction.objectStore(STORE_NAME);
    const request = store.getAll();

    request.onsuccess = () => {
      const works = request.result as Work[];
      // 최신순 정렬
      works.sort((a, b) => {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
      resolve(works);
    };

    request.onerror = () => reject(request.error);
  });
}

/**
 * ID로 작품 가져오기
 */
export async function getWorkById(id: number): Promise<Work | null> {
  const db = await openDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], "readonly");
    const store = transaction.objectStore(STORE_NAME);
    const request = store.get(id);

    request.onsuccess = () => resolve(request.result || null);
    request.onerror = () => reject(request.error);
  });
}

/**
 * 장르별 작품 가져오기
 */
export async function getWorksByGenre(genre: string): Promise<Work[]> {
  const db = await openDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], "readonly");
    const store = transaction.objectStore(STORE_NAME);
    const index = store.index("genre");
    const request = index.getAll(genre);

    request.onsuccess = () => {
      const works = request.result as Work[];
      works.sort((a, b) => {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
      resolve(works);
    };

    request.onerror = () => reject(request.error);
  });
}

/**
 * 타입별 작품 가져오기 (텍스트 / 이미지)
 */
export async function getWorksByType(contentType: "text" | "image"): Promise<Work[]> {
  const db = await openDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], "readonly");
    const store = transaction.objectStore(STORE_NAME);
    const index = store.index("contentType");
    const request = index.getAll(contentType);

    request.onsuccess = () => {
      const works = request.result as Work[];
      works.sort((a, b) => {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
      resolve(works);
    };

    request.onerror = () => reject(request.error);
  });
}

/**
 * 데이터베이스 초기화 (모든 데이터 삭제)
 */
export async function clearAllWorks(): Promise<void> {
  const db = await openDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], "readwrite");
    const store = transaction.objectStore(STORE_NAME);
    const request = store.clear();

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

export default {
  addWork,
  updateWork,
  deleteWork,
  getAllWorks,
  getWorkById,
  getWorksByGenre,
  getWorksByType,
  clearAllWorks,
};
