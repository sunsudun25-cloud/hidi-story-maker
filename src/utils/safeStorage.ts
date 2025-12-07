/**
 * safeStorage.ts — localStorage 안전 래퍼 (오류 0%)
 * 모든 컴포넌트에서 이 함수만 사용
 */

export function safeStorageSet(key: string, value: any): void {
  try {
    if (typeof window === "undefined") return;
    if (!window.localStorage) return;
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.warn("⚠️ Storage blocked (무시):", e);
  }
}

export function safeStorageGet(key: string): any {
  try {
    if (typeof window === "undefined") return null;
    if (!window.localStorage) return null;
    const v = window.localStorage.getItem(key);
    return v ? JSON.parse(v) : null;
  } catch (e) {
    console.warn("⚠️ Storage blocked (무시):", e);
    return null;
  }
}

export function safeStorageRemove(key: string): void {
  try {
    if (typeof window === "undefined") return;
    if (!window.localStorage) return;
    window.localStorage.removeItem(key);
  } catch (e) {
    console.warn("⚠️ Storage blocked (무시):", e);
  }
}
