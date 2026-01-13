// src/utils/purposeConfig.ts
import type { PurposeKey } from "./promptBuilder";

export interface PurposeConfig {
  size: "1024x1024" | "1024x1536" | "1536x1024";
  quality: "standard" | "hd";
}

export const purposeConfig: Record<PurposeKey, PurposeConfig> = {
  story: { size: "1024x1536", quality: "standard" },   // 세로형 (동화책)
  memory: { size: "1024x1024", quality: "standard" },  // 정사각형 (추억)
  class: { size: "1536x1024", quality: "standard" },   // 가로형 (발표)
  photo: { size: "1024x1024", quality: "standard" }    // 정사각형 (사진)
};

// 한글 목적 → PurposeKey 매핑
export const purposeKeyMap: Record<string, PurposeKey> = {
  '이야기/동화': 'story',
  '감정/추억': 'memory',
  '발표/수업': 'class',
  '사진 느낌': 'photo'
};
