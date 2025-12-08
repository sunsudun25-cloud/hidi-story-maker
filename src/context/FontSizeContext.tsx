import { createContext, useState, ReactNode, useEffect } from "react";

type FontSize = "small" | "medium" | "large";

interface FontSizeContextType {
  size: FontSize;
  sizeClass: string; // CSS class 이름
  setSize: (size: FontSize) => void;
}

export const FontSizeContext = createContext<FontSizeContextType>({
  size: "medium",
  sizeClass: "font-medium",
  setSize: () => {},
});

export function FontSizeProvider({ children }: { children: ReactNode }) {
  const [size, setSize] = useState<FontSize>("medium");

  // size → class로 변환
  const sizeClass =
    size === "small" ? "font-small" : size === "large" ? "font-large" : "font-medium";

  // localStorage에서 저장된 크기 불러오기
  useEffect(() => {
    const saved = localStorage.getItem("font-size");
    if (saved === "small" || saved === "medium" || saved === "large") {
      setSize(saved);
    }
  }, []);

  // size 변경 시 localStorage에 저장
  useEffect(() => {
    localStorage.setItem("font-size", size);
  }, [size]);

  return (
    <FontSizeContext.Provider value={{ size, sizeClass, setSize }}>
      {children}
    </FontSizeContext.Provider>
  );
}
