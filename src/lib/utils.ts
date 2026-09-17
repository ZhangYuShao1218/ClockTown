import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * 把 Firebase RTDB 讀回來的「陣列狀」資料正規化成真正的 JS 陣列。
 * RTDB 把陣列存成 {0: x, 1: y, ...} 這種物件，當某個 index 被寫入 null 刪除後
 * （例如移除第一格的傳奇角色/偽裝），讀回來的 key 集合不再是從 0 連續的整數，
 * RTDB 就會回傳一般物件而不是陣列，導致前端對它呼叫 .map/.filter 等陣列方法直接噴錯、整個畫面掛掉。
 * 這裡統一在讀取的地方轉一次，不管 RTDB 回傳真陣列還是這種「洞洞物件」都能處理。
 */
export function toRtdbArray<T = unknown>(value: unknown, minLength = 0, fill: T | null = null): (T | null)[] {
  let arr: (T | null)[];
  if (Array.isArray(value)) {
    arr = value as (T | null)[];
  } else if (value && typeof value === 'object') {
    const obj = value as Record<string, T>;
    const maxIndex = Object.keys(obj).reduce((max, key) => {
      const n = Number(key);
      return Number.isInteger(n) && n > max ? n : max;
    }, -1);
    arr = Array.from({ length: maxIndex + 1 }, (_, i) => obj[i] ?? fill);
  } else {
    arr = [];
  }
  while (arr.length < minLength) arr.push(fill);
  return arr;
}
