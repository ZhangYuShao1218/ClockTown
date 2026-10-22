/**
 * 圖片縮圖工具：頭像與自訂角色圖都以 data URI 直接存進 Firebase（沒有另外架 Storage），
 * 每次進房會乘上人數下載，所以存之前一律縮小壓縮。
 */

export const readFileAsDataUrl = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("檔案讀取失敗"));
    reader.onload = () => resolve(reader.result as string);
    reader.readAsDataURL(file);
  });

const loadImage = (src: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const img = new Image();
    img.onerror = () => reject(new Error("圖片讀取失敗，請確認檔案格式"));
    img.onload = () => resolve(img);
    img.src = src;
  });

interface ResizeOptions {
  /** 輸出正方形邊長（px） */
  size: number;
  /** cover：裁成正方形填滿；contain：完整保留、透明留白 */
  fit: "cover" | "contain";
  type: "image/jpeg" | "image/webp";
  quality: number;
}

/** 把圖片（網址或 data URI）縮成正方形 data URI。瀏覽器不支援 webp 編碼時會自動退回 PNG。 */
export const resizeImage = async (src: string, { size, fit, type, quality }: ResizeOptions): Promise<string> => {
  const img = await loadImage(src);
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("瀏覽器不支援圖片處理");

  if (fit === "cover") {
    const side = Math.min(img.width, img.height);
    ctx.drawImage(img, (img.width - side) / 2, (img.height - side) / 2, side, side, 0, 0, size, size);
  } else {
    const scale = Math.min(size / img.width, size / img.height, 1);
    const w = img.width * scale;
    const h = img.height * scale;
    ctx.drawImage(img, (size - w) / 2, (size - h) / 2, w, h);
  }
  return canvas.toDataURL(type, quality);
};

/** 玩家頭像：顯示時只有座位旁的小圓，128px 已足夠（約 4–6 KB） */
export const AVATAR_OPTIONS: ResizeOptions = { size: 128, fit: "cover", type: "image/jpeg", quality: 0.7 };

/** 自訂角色圖示：需保留透明背景，用 webp */
export const ROLE_ICON_OPTIONS: ResizeOptions = { size: 160, fit: "contain", type: "image/webp", quality: 0.8 };

/** 超過這個長度的頭像 data URI 視為舊版（200px / 0.85）未壓縮過的，需要重新壓縮 */
export const AVATAR_MAX_DATA_URL_LENGTH = 12_000;
