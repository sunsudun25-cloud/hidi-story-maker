import { createContext, useState, ReactNode } from "react";

type FontSize = "font-small" | "font-medium" | "font-large";

interface FontSizeContextType {
  sizeClass: FontSize;
  setSizeClass: (size: FontSize) => void;
}

export const FontSizeContext = createContext<FontSizeContextType>({
  sizeClass: "font-medium",
  setSizeClass: () => {},
});

interface FontSizeProviderProps {
  children: ReactNode;
}

export function FontSizeProvider({ children }: FontSizeProviderProps) {
  const [sizeClass, setSizeClass] = useState<FontSize>("font-medium");

  return (
    <FontSizeContext.Provider value={{ sizeClass, setSizeClass }}>
      {children}
    </FontSizeContext.Provider>
  );
}
