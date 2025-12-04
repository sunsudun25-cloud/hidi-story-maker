import { Story } from '../context/StoryContext'

// IndexedDB 데이터베이스 설정
const DB_NAME = 'StoryDB'
const DB_VERSION = 2  // 버전 업그레이드
const STORE_NAME = 'stories'
const IMAGE_STORE_NAME = 'images'  // 이미지 저장소

// IndexedDB 초기화
const initDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)

    request.onerror = () => {
      reject(new Error('데이터베이스를 열 수 없습니다.'))
    }

    request.onsuccess = () => {
      resolve(request.result)
    }

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result

      // Stories Object Store가 없으면 생성
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const objectStore = db.createObjectStore(STORE_NAME, { keyPath: 'id' })
        objectStore.createIndex('title', 'title', { unique: false })
        objectStore.createIndex('createdAt', 'createdAt', { unique: false })
      }

      // Images Object Store가 없으면 생성
      if (!db.objectStoreNames.contains(IMAGE_STORE_NAME)) {
        const imageStore = db.createObjectStore(IMAGE_STORE_NAME, { keyPath: 'id', autoIncrement: true })
        imageStore.createIndex('prompt', 'prompt', { unique: false })
        imageStore.createIndex('createdAt', 'createdAt', { unique: false })
      }
    }
  })
}

// 모든 스토리 가져오기
export const getAllStories = async (): Promise<Story[]> => {
  const db = await initDB()
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readonly')
    const objectStore = transaction.objectStore(STORE_NAME)
    const request = objectStore.getAll()

    request.onsuccess = () => {
      const stories = request.result.map((story: any) => ({
        ...story,
        createdAt: new Date(story.createdAt),
        updatedAt: new Date(story.updatedAt),
      }))
      resolve(stories)
    }

    request.onerror = () => {
      reject(new Error('스토리를 가져올 수 없습니다.'))
    }
  })
}

// 스토리 추가
export const addStory = async (story: Story): Promise<void> => {
  const db = await initDB()
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readwrite')
    const objectStore = transaction.objectStore(STORE_NAME)
    const request = objectStore.add({
      ...story,
      createdAt: story.createdAt.toISOString(),
      updatedAt: story.updatedAt.toISOString(),
    })

    request.onsuccess = () => {
      resolve()
    }

    request.onerror = () => {
      reject(new Error('스토리를 추가할 수 없습니다.'))
    }
  })
}

// 스토리 업데이트
export const updateStory = async (story: Story): Promise<void> => {
  const db = await initDB()
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readwrite')
    const objectStore = transaction.objectStore(STORE_NAME)
    const request = objectStore.put({
      ...story,
      createdAt: story.createdAt.toISOString(),
      updatedAt: story.updatedAt.toISOString(),
    })

    request.onsuccess = () => {
      resolve()
    }

    request.onerror = () => {
      reject(new Error('스토리를 업데이트할 수 없습니다.'))
    }
  })
}

// 스토리 삭제
export const deleteStory = async (id: string): Promise<void> => {
  const db = await initDB()
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readwrite')
    const objectStore = transaction.objectStore(STORE_NAME)
    const request = objectStore.delete(id)

    request.onsuccess = () => {
      resolve()
    }

    request.onerror = () => {
      reject(new Error('스토리를 삭제할 수 없습니다.'))
    }
  })
}

// 특정 스토리 가져오기
export const getStory = async (id: string): Promise<Story | undefined> => {
  const db = await initDB()
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readonly')
    const objectStore = transaction.objectStore(STORE_NAME)
    const request = objectStore.get(id)

    request.onsuccess = () => {
      if (request.result) {
        const story = {
          ...request.result,
          createdAt: new Date(request.result.createdAt),
          updatedAt: new Date(request.result.updatedAt),
        }
        resolve(story)
      } else {
        resolve(undefined)
      }
    }

    request.onerror = () => {
      reject(new Error('스토리를 가져올 수 없습니다.'))
    }
  })
}

// 모든 스토리 삭제 (초기화)
export const clearAllStories = async (): Promise<void> => {
  const db = await initDB()
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readwrite')
    const objectStore = transaction.objectStore(STORE_NAME)
    const request = objectStore.clear()

    request.onsuccess = () => {
      resolve()
    }

    request.onerror = () => {
      reject(new Error('스토리를 삭제할 수 없습니다.'))
    }
  })
}

// ========== 이미지 관련 함수 ==========

export interface SavedImage {
  id?: number;
  image: string;
  prompt: string;
  style?: string;
  createdAt: string;
}

// 이미지 저장
export const saveImageToDB = async (imageData: Omit<SavedImage, 'id'>): Promise<number> => {
  const db = await initDB()
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([IMAGE_STORE_NAME], 'readwrite')
    const objectStore = transaction.objectStore(IMAGE_STORE_NAME)
    const request = objectStore.add({
      ...imageData,
      createdAt: new Date().toISOString()
    })

    request.onsuccess = () => {
      resolve(request.result as number)
    }

    request.onerror = () => {
      reject(new Error('이미지를 저장할 수 없습니다.'))
    }
  })
}

// 모든 이미지 가져오기
export const getAllImages = async (): Promise<SavedImage[]> => {
  const db = await initDB()
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([IMAGE_STORE_NAME], 'readonly')
    const objectStore = transaction.objectStore(IMAGE_STORE_NAME)
    const request = objectStore.getAll()

    request.onsuccess = () => {
      resolve(request.result)
    }

    request.onerror = () => {
      reject(new Error('이미지를 가져올 수 없습니다.'))
    }
  })
}

// 이미지 삭제
export const deleteImage = async (id: number): Promise<void> => {
  const db = await initDB()
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([IMAGE_STORE_NAME], 'readwrite')
    const objectStore = transaction.objectStore(IMAGE_STORE_NAME)
    const request = objectStore.delete(id)

    request.onsuccess = () => {
      resolve()
    }

    request.onerror = () => {
      reject(new Error('이미지를 삭제할 수 없습니다.'))
    }
  })
}

// 모든 이미지 삭제 (초기화)
export const clearAllImages = async (): Promise<void> => {
  const db = await initDB()
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([IMAGE_STORE_NAME], 'readwrite')
    const objectStore = transaction.objectStore(IMAGE_STORE_NAME)
    const request = objectStore.clear()

    request.onsuccess = () => {
      resolve()
    }

    request.onerror = () => {
      reject(new Error('이미지를 삭제할 수 없습니다.'))
    }
  })
}
