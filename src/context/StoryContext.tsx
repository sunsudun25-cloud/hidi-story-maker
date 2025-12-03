import { createContext, useContext, useState, ReactNode } from 'react'

// Story 타입 정의
export interface Story {
  id: string
  title: string
  content: string
  createdAt: Date
  updatedAt: Date
}

// Context 타입 정의
interface StoryContextType {
  stories: Story[]
  addStory: (title: string, content: string) => void
  updateStory: (id: string, title: string, content: string) => void
  deleteStory: (id: string) => void
  getStory: (id: string) => Story | undefined
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

  // 스토리 추가
  const addStory = (title: string, content: string) => {
    const newStory: Story = {
      id: Date.now().toString(),
      title,
      content,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    setStories((prev) => [...prev, newStory])
  }

  // 스토리 업데이트
  const updateStory = (id: string, title: string, content: string) => {
    setStories((prev) =>
      prev.map((story) =>
        story.id === id
          ? { ...story, title, content, updatedAt: new Date() }
          : story
      )
    )
  }

  // 스토리 삭제
  const deleteStory = (id: string) => {
    setStories((prev) => prev.filter((story) => story.id !== id))
  }

  // 특정 스토리 가져오기
  const getStory = (id: string): Story | undefined => {
    return stories.find((story) => story.id === id)
  }

  const value = {
    stories,
    addStory,
    updateStory,
    deleteStory,
    getStory,
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
