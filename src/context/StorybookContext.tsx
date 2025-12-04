import { createContext, useContext, useState, ReactNode } from 'react';

// 페이지 데이터 타입
export interface StorybookPage {
  text: string;
  imageUrl?: string;
}

// Context 타입 정의
interface StorybookContextType {
  storyPages: StorybookPage[];
  setStoryPages: React.Dispatch<React.SetStateAction<StorybookPage[]>>;
  setImageForPage: (pageIndex: number, image: string) => void;
  setTextForPage: (pageIndex: number, text: string) => void;
  addNewPage: (text: string) => void;
  deletePage: (pageIndex: number) => void;
  currentPage: number;
  setCurrentPage: React.Dispatch<React.SetStateAction<number>>;
  title: string;
  setTitle: React.Dispatch<React.SetStateAction<string>>;
  prompt: string;
  setPrompt: React.Dispatch<React.SetStateAction<string>>;
  style: string;
  setStyle: React.Dispatch<React.SetStateAction<string>>;
  coverImageUrl: string;
  setCoverImageUrl: React.Dispatch<React.SetStateAction<string>>;
  resetStorybook: () => void;
}

// Context 생성
const StorybookContext = createContext<StorybookContextType | undefined>(undefined);

// Provider Props 타입
interface StorybookProviderProps {
  children: ReactNode;
}

// Provider 컴포넌트
export const StorybookProvider = ({ children }: StorybookProviderProps) => {
  // 동화책 메타 정보
  const [title, setTitle] = useState<string>('나의 동화책');
  const [prompt, setPrompt] = useState<string>('');
  const [style, setStyle] = useState<string>('동화 스타일');
  const [coverImageUrl, setCoverImageUrl] = useState<string>('');

  // 페이지 데이터
  const [storyPages, setStoryPages] = useState<StorybookPage[]>([
    { text: '', imageUrl: undefined }
  ]);

  // 현재 페이지
  const [currentPage, setCurrentPage] = useState<number>(1);

  // 특정 페이지에 이미지 설정
  const setImageForPage = (pageIndex: number, image: string) => {
    setStoryPages(prev =>
      prev.map((page, i) =>
        i === pageIndex ? { ...page, imageUrl: image } : page
      )
    );
  };

  // 특정 페이지의 텍스트 설정
  const setTextForPage = (pageIndex: number, text: string) => {
    setStoryPages(prev =>
      prev.map((page, i) =>
        i === pageIndex ? { ...page, text } : page
      )
    );
  };

  // 새 페이지 추가
  const addNewPage = (text: string = '') => {
    setStoryPages(prev => [...prev, { text, imageUrl: undefined }]);
    setCurrentPage(storyPages.length + 1);
  };

  // 페이지 삭제
  const deletePage = (pageIndex: number) => {
    if (storyPages.length <= 1) {
      alert('최소 1개의 페이지는 필요합니다.');
      return;
    }

    setStoryPages(prev => prev.filter((_, i) => i !== pageIndex));
    
    // 현재 페이지 조정
    if (currentPage > storyPages.length - 1) {
      setCurrentPage(storyPages.length - 1);
    }
  };

  // 동화책 초기화
  const resetStorybook = () => {
    setTitle('나의 동화책');
    setPrompt('');
    setStyle('동화 스타일');
    setCoverImageUrl('');
    setStoryPages([{ text: '', imageUrl: undefined }]);
    setCurrentPage(1);
  };

  const value = {
    storyPages,
    setStoryPages,
    setImageForPage,
    setTextForPage,
    addNewPage,
    deletePage,
    currentPage,
    setCurrentPage,
    title,
    setTitle,
    prompt,
    setPrompt,
    style,
    setStyle,
    coverImageUrl,
    setCoverImageUrl,
    resetStorybook,
  };

  return (
    <StorybookContext.Provider value={value}>
      {children}
    </StorybookContext.Provider>
  );
};

// Custom Hook
export const useStorybook = () => {
  const context = useContext(StorybookContext);
  if (context === undefined) {
    throw new Error('useStorybook must be used within a StorybookProvider');
  }
  return context;
};
