import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import * as db from '../services/dbService'

// Story 타입 정의 (dbService와 동일하게 유지)
export interface Story {
  id: string
  title: string
  content: string
  image?: string        // 선택적 이미지 필드
  description?: string  // 선택적 설명 필드
  createdAt: Date | string
  updatedAt: Date | string
}

// Context 타입 정의
interface StoryContextType {
  stories: Story[]
  addStory: (title: string, content: string) => Promise<void>
  addStoryWithImage: (title: string, content: string, image?: string, description?: string) => Promise<void>
  updateStory: (id: string, title: string, content: string) => Promise<void>
  deleteStory: (id: string) => Promise<void>
  getStory: (id: string) => Story | undefined
  clearAll: () => Promise<void>
  isLoading: boolean
}

// Context 생성
const StoryContext = createContext<StoryContextType | undefined>(undefined)

// Provider Props 타입
interface StoryProviderProps {
  children: ReactNode
}

// Provider 컴포넌트
export const StoryProvider = ({ children }: StoryProviderProps) => {
  const [stories, setStories] = useState<Story[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // 컴포넌트 마운트 시 IndexedDB에서 데이터 불러오기
  useEffect(() => {
    const loadStories = async () => {
      // IndexedDB 사용 가능 여부 먼저 확인
      if (!db.isIndexedDBAvailable()) {
        console.warn('⚠️ IndexedDB 사용 불가 - localStorage fallback 모드')
        setStories([])
        setIsLoading(false)
        return
      }

      try {
        setIsLoading(true)
        const savedStories = await db.getAllStories()
        // Date 객체로 정규화
        const normalizedStories = savedStories.map(story => ({
          ...story,
          createdAt: story.createdAt instanceof Date ? story.createdAt : new Date(story.createdAt),
          updatedAt: story.updatedAt instanceof Date ? story.updatedAt : new Date(story.updatedAt || story.createdAt),
        }))
        setStories(normalizedStories)
      } catch (error) {
        console.error('⚠️ 스토리 불러오기 실패 (IndexedDB 접근 불가):', error)
        // IndexedDB 접근 불가 시 빈 배열로 계속 진행
        setStories([])
      } finally {
        setIsLoading(false)
      }
    }
    
    // 비동기 로딩을 약간 지연시켜 초기 렌더링 차단 방지
    const timer = setTimeout(() => {
      loadStories()
    }, 0)

    return () => clearTimeout(timer)
  }, [])

  // 스토리 추가
  const addStory = async (title: string, content: string) => {
    try {
      const newStory = await db.saveStory(title, content)
      const normalizedStory: Story = {
        ...newStory,
        createdAt: new Date(newStory.createdAt),
        updatedAt: new Date(newStory.updatedAt || newStory.createdAt),
      }
      setStories((prev) => [...prev, normalizedStory])
    } catch (error) {
      console.error('스토리 추가 실패:', error)
      throw error
    }
  }

  // 이미지와 함께 스토리 추가
  const addStoryWithImage = async (
    title: string,
    content: string,
    image?: string,
    description?: string
  ) => {
    try {
      const newStory = await db.saveStory(title, content, image, description)
      const normalizedStory: Story = {
        ...newStory,
        createdAt: new Date(newStory.createdAt),
        updatedAt: new Date(newStory.updatedAt || newStory.createdAt),
      }
      setStories((prev) => [...prev, normalizedStory])
    } catch (error) {
      console.error('스토리 추가 실패:', error)
      throw error
    }
  }

  // 스토리 업데이트
  const updateStory = async (id: string, title: string, content: string) => {
    const existingStory = stories.find((story) => story.id === id)
    if (!existingStory) {
      throw new Error('스토리를 찾을 수 없습니다.')
    }

    const updatedStory: Story = {
      ...existingStory,
      title,
      content,
      updatedAt: new Date(),
    }

    try {
      await db.updateStory(updatedStory)
      setStories((prev) =>
        prev.map((story) => {
          if (story.id === id) {
            return {
              ...updatedStory,
              createdAt: new Date(updatedStory.createdAt),
              updatedAt: new Date(updatedStory.updatedAt),
            }
          }
          return story
        })
      )
    } catch (error) {
      console.error('스토리 업데이트 실패:', error)
      throw error
    }
  }

  // 스토리 삭제
  const deleteStory = async (id: string) => {
    try {
      await db.deleteStory(id)
      setStories((prev) => prev.filter((story) => story.id !== id))
    } catch (error) {
      console.error('스토리 삭제 실패:', error)
      throw error
    }
  }

  // 모든 스토리 삭제
  const clearAll = async () => {
    try {
      await db.clearAll()
      setStories([])
    } catch (error) {
      console.error('모든 스토리 삭제 실패:', error)
      throw error
    }
  }

  // 특정 스토리 가져오기
  const getStory = (id: string): Story | undefined => {
    return stories.find((story) => story.id === id)
  }

  const value = {
    stories,
    addStory,
    addStoryWithImage,
    updateStory,
    deleteStory,
    getStory,
    clearAll,
    isLoading,
  }

  return <StoryContext.Provider value={value}>{children}</StoryContext.Provider>
}

// Custom Hook
export const useStory = () => {
  const context = useContext(StoryContext)
  if (context === undefined) {
    throw new Error('useStory must be used within a StoryProvider')
  }
  return context
}
