import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

export type SeatTokenType = 'icon' | 'text' | 'image';
export interface SeatToken {
  id: string;
  type: SeatTokenType;
  content: string;
  icon?: string;
  image?: string;
  text?: string;
}

interface SeatTokenModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (token: SeatToken) => void;
}

/** 常用座位標記。image 可為 /reminders/*.png 或 /character/*.png。 */
const PRESET_TOKENS: { image: string; text: string }[] = [
  { image: '/reminders/good.png', text: '善良' },
  { image: '/character/character_spy_minion.png', text: '邪惡' },
  { image: '/character/character_imp_demon.png', text: '是惡魔' },
  { image: '/character/character_baron_minion.png', text: '是爪牙' },
  { image: '/character/character_fortune_teller_townsfolk.png', text: '干擾項' },
  { image: '/reminders/poisoned.png', text: '中毒' },
  { image: '/reminders/is_drunk.png', text: '是酒鬼' },
  { image: '/reminders/madness.png', text: '瘋狂' },
  { image: '/reminders/protected.png', text: '保護' },
];

export const SeatTokenModal: React.FC<SeatTokenModalProps> = ({ isOpen, onClose, onSave }) => {
  const [textVal, setTextVal] = useState('');

  useEffect(() => {
    const onEsc = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    if (isOpen) window.addEventListener('keydown', onEsc);
    return () => window.removeEventListener('keydown', onEsc);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleImageClick = (item: { image: string; text: string }) => {
    onSave({ id: Date.now().toString(), type: 'image', content: item.text, image: item.image, text: item.text });
    onClose();
  };

  const handleTextSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (textVal.trim()) {
      onSave({ id: Date.now().toString(), type: 'text', content: textVal.trim() });
      setTextVal('');
      onClose();
    }
  };

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4 backdrop-blur-[2px]"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg overflow-hidden rounded-2xl border-2 border-amber-600/50 bg-gradient-to-b from-[#1c1712] to-[#141009] shadow-[0_0_60px_rgba(0,0,0,0.75),0_0_0_1px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.06)] animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-amber-900/30 bg-white/[0.03] px-5 py-3.5">
          <h2 className="font-serif text-lg font-bold tracking-widest text-amber-100/90">座位筆記</h2>
          <button
            onClick={onClose}
            className="rounded-md px-2 py-0.5 text-white/35 transition-colors hover:bg-white/10 hover:text-white"
            aria-label="關閉"
          >
            ✕
          </button>
        </div>

        <div className="flex flex-col gap-5 px-5 py-5">
          {/* 自訂文字筆記 */}
          <div>
            <label className="mb-2 block text-sm font-bold uppercase tracking-widest text-amber-200/75">
              自訂文字
            </label>
            <form onSubmit={handleTextSubmit} className="flex gap-2">
              <input
                type="text"
                value={textVal}
                onChange={(e) => setTextVal(e.target.value)}
                placeholder="輸入任意文字筆記…"
                className="min-w-0 flex-1 rounded-lg border border-amber-900/30 bg-black/40 px-4 py-2.5 text-base text-white placeholder-white/25 shadow-inner transition-colors focus:border-amber-500/60 focus:outline-none"
                autoFocus
              />
              <button
                type="submit"
                disabled={!textVal.trim()}
                className="shrink-0 rounded-lg border border-amber-500/60 bg-amber-600 px-6 py-2.5 text-base font-extrabold tracking-wider text-white shadow-md transition-colors hover:bg-amber-500 disabled:opacity-35"
              >
                加入
              </button>
            </form>
          </div>

          {/* 常用標記 */}
          <div>
            <div className="mb-3 flex items-center gap-3">
              <span className="text-sm font-bold uppercase tracking-widest text-amber-200/75">常用標記</span>
              <span className="h-px flex-1 bg-amber-900/30" />
            </div>
            <div className="grid grid-cols-5 gap-x-2 gap-y-4">
              {PRESET_TOKENS.map((item) => (
                <button
                  key={item.text}
                  onClick={() => handleImageClick(item)}
                  className="group flex flex-col items-center gap-1.5 rounded-lg p-1 transition-colors hover:bg-white/5"
                  title={item.text}
                >
                  <span className="flex h-[68px] w-[68px] items-center justify-center rounded-full border-2 border-amber-700/60 bg-gradient-to-b from-black/55 to-black/25 shadow-[0_2px_8px_rgba(0,0,0,0.55),inset_0_0_0_1px_rgba(0,0,0,0.4)] transition-all group-hover:border-amber-400 group-hover:shadow-amber-500/30">
                    <img
                      src={item.image}
                      alt={item.text}
                      className="h-[82%] w-[82%] object-contain drop-shadow transition-transform group-hover:scale-110"
                    />
                  </span>
                  <span className="text-[15px] font-bold leading-none text-white/90 transition-colors group-hover:text-amber-200">
                    {item.text}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};
