import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import * as db from '../services/dbService'

// Story 타입 정의
export interface Story {
  id: string
  title: string
  content: string
  image?: string        // 선택적 이미지 필드
  description?: string  // 선택적 설명 필드
  createdAt: Date
  updatedAt: Date
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
      try {
        setIsLoading(true)
        const savedStories = await db.getAllStories()
        setStories(savedStories)
      } catch (error) {
        console.error('⚠️ 스토리 불러오기 실패 (IndexedDB 접근 불가):', error)
        // IndexedDB 접근 불가 시 빈 배열로 계속 진행
        setStories([])
      } finally {
        setIsLoading(false)
      }
    }
    loadStories()
  }, [])

  // 스토리 추가
  const addStory = async (title: string, content: string) => {
    const newStory: Story = {
      id: Date.now().toString(),
      title,
      content,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    
    try {
      await db.addStory(newStory)
      setStories((prev) => [...prev, newStory])
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
    const newStory: Story = {
      id: Date.now().toString(),
      title,
      content,
      image,
      description,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    
    try {
      await db.addStory(newStory)
      setStories((prev) => [...prev, newStory])
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
        prev.map((story) => (story.id === id ? updatedStory : story))
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
      await db.clearAllStories()
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
