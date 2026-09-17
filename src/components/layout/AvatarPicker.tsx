import { useRef, useState } from "react";

// 14 組內建頭像（血染鐘樓風格的插畫，放在 public/avatars/）
const PRESET_AVATARS = Array.from({ length: 14 }, (_, i) => `/avatars/preset-${String(i + 1).padStart(2, "0")}.png`);

const MAX_UPLOAD_BYTES = 8 * 1024 * 1024; // 8MB，避免手機原圖太大卡住畫布處理
const OUTPUT_SIZE = 200; // 輸出正方形頭像邊長（px）

/** 把使用者上傳的圖片裁成正方形並壓縮成小尺寸 JPEG data URI，直接存進 Firebase 玩家資料（沒有另外架 Storage） */
const resizeImageFile = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("檔案讀取失敗"));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error("圖片讀取失敗，請確認檔案格式"));
      img.onload = () => {
        const size = Math.min(img.width, img.height);
        const sx = (img.width - size) / 2;
        const sy = (img.height - size) / 2;
        const canvas = document.createElement("canvas");
        canvas.width = OUTPUT_SIZE;
        canvas.height = OUTPUT_SIZE;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("瀏覽器不支援圖片處理"));
          return;
        }
        ctx.drawImage(img, sx, sy, size, size, 0, 0, OUTPUT_SIZE, OUTPUT_SIZE);
        resolve(canvas.toDataURL("image/jpeg", 0.85));
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  });
};

// 外框統一用 inset box-shadow（畫在圖片內側）取代 border，蓋住縮圖邊緣可能殘留的一絲透明留白
const RING_SELECTED = "shadow-[inset_0_0_0_2px_#fbbf24,0_0_10px_rgba(251,191,36,0.5)]";
const RING_IDLE = "shadow-[inset_0_0_0_1.5px_rgba(255,255,255,0.15)]";
// 預設頭像格子的 hover：外框轉金黃、放大、提亮，效果要明顯
const HOVER_TILE = "hover:shadow-[inset_0_0_0_2px_#fbbf24] hover:scale-110 hover:brightness-125 hover:z-10";

interface AvatarPickerProps {
  value: string | null;
  onChange: (url: string | null) => void;
}

export const AvatarPicker = ({ value, onChange }: AvatarPickerProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadError, setUploadError] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = ""; // 允許重複選同一個檔案也會觸發 onChange
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setUploadError("請選擇圖片檔案");
      return;
    }
    if (file.size > MAX_UPLOAD_BYTES) {
      setUploadError("圖片太大了，請選擇 8MB 以內的檔案");
      return;
    }

    setUploadError("");
    setIsProcessing(true);
    try {
      const dataUrl = await resizeImageFile(file);
      onChange(dataUrl);
    } catch (err: any) {
      setUploadError(err.message || "圖片處理失敗，請換一張再試");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-4">
        {/* 外層不能加 overflow-hidden，不然左上角的清除按鈕會被裁掉；圓形裁切交給內層處理 */}
        <div className="relative h-24 w-24 shrink-0">
          <div className={`h-full w-full rounded-full bg-black/50 overflow-hidden ${RING_IDLE}`}>
            {value ? (
              <img src={value} alt="目前頭像" className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-white/25">
                <svg viewBox="0 0 24 24" fill="currentColor" className="h-11 w-11">
                  <circle cx="12" cy="8" r="4" />
                  <path d="M4 20c0-4.4 3.6-8 8-8s8 3.6 8 8v1H4v-1z" />
                </svg>
              </div>
            )}
          </div>
          {value && (
            <button
              type="button"
              onClick={() => onChange(null)}
              title="清除頭像"
              className="absolute -top-[9px] -left-[9px] flex h-[28.8px] w-[28.8px] items-center justify-center rounded-full bg-black/90 border border-white/30 text-white/70 hover:text-white hover:bg-red-950/90 hover:border-red-500/60 transition-all shadow-lg z-10"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" className="h-[14.4px] w-[14.4px]">
                <path d="M6 6l12 12M18 6L6 18" />
              </svg>
            </button>
          )}
        </div>
        <div className="flex-1 text-xs text-white/50 leading-relaxed">
          {isProcessing ? "圖片處理中..." : "點下方「＋」可上傳自訂頭像，或從預設頭像挑一個"}
        </div>
      </div>

      {uploadError && (
        <p className="text-xs text-red-400">{uploadError}</p>
      )}

      <div>
        <p className="mb-1.5 text-xs font-medium tracking-wider text-white/50 uppercase">選擇頭像</p>
        <div className="grid grid-cols-6 gap-2.5">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isProcessing}
            title="上傳自訂頭像"
            className={`aspect-square rounded-full border-2 border-dashed border-white/30 flex items-center justify-center text-white/40 transition-all disabled:opacity-50 hover:border-amber-400 hover:text-amber-300 hover:scale-110 hover:bg-white/5 hover:z-10`}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" className="h-1/3 w-1/3">
              <path d="M12 5v14M5 12h14" />
            </svg>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />
          {PRESET_AVATARS.map((src) => (
            <button
              key={src}
              type="button"
              onClick={() => onChange(src)}
              className={`aspect-square rounded-full overflow-hidden transition-all ${value === src ? RING_SELECTED : `${RING_IDLE} ${HOVER_TILE}`}`}
            >
              <img src={src} alt="預設頭像" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
