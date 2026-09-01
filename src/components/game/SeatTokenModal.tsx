import React, { useState } from 'react';
import { Modal } from '../common/Modal';

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

const PRESET_TOKENS = [
  { image: '/reminders/is_drunk.png', text: '是酒鬼' },
  { image: '/reminders/no_evil.png', text: '禁止邪惡' },
  { image: '/reminders/good.png', text: '善良' },
  { image: '/reminders/evil.png', text: '邪惡' },
  { image: '/reminders/poisoned.png', text: '中毒' },
  { image: '/reminders/protected.png', text: '受保護' },
  { image: '/reminders/dead.png', text: '死亡' },
  { image: '/reminders/madness.png', text: '瘋狂' },
];

export const SeatTokenModal: React.FC<SeatTokenModalProps> = ({ isOpen, onClose, onSave }) => {
  const [textVal, setTextVal] = useState('');

  if (!isOpen) return null;

  const handleImageClick = (item: { image: string, text: string }) => {
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

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="" noOverlay={true} maxWidth="max-w-md">
      <div className="px-4 pb-0 -mt-5 -mb-2 flex flex-col items-center">
        {/* Top: Text Input */}
        <form onSubmit={handleTextSubmit} className="flex w-full gap-2 mb-6">
          <input 
            type="text" 
            value={textVal} 
            onChange={(e) => setTextVal(e.target.value)} 
            placeholder="輸入任意文字筆記..."
            className="flex-1 text-lg px-4 py-2 bg-slate-800 border-2 border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            autoFocus
          />
          <button type="submit" disabled={!textVal.trim()} className="px-6 bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2 rounded-lg shadow-md disabled:opacity-50 transition-colors whitespace-nowrap">
            確定
          </button>
        </form>

        <div className="w-full border-t border-slate-700 mb-6 relative">
          <span className="absolute left-1/2 -translate-x-1/2 -top-3 bg-slate-900 px-3 text-sm text-slate-400">
            或選擇常用標記
          </span>
        </div>

        {/* Bottom: Preset Icons */}
        <div className="grid grid-cols-4 gap-4 w-full">
          {PRESET_TOKENS.map((item, idx) => (
            <button 
              key={idx} 
              onClick={() => handleImageClick(item)}
              className="relative flex flex-col items-center justify-center w-full aspect-square bg-slate-800 rounded-full border-2 border-slate-600 hover:border-amber-400 hover:scale-105 transition-all shadow-md group overflow-hidden"
            >
              <img src={item.image} alt={item.text} className="w-[85%] h-[85%] object-contain -mt-[16%] drop-shadow-md group-hover:scale-110 transition-transform" />
              <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full pointer-events-none drop-shadow-md">
                <path id={`curve-${idx}`} d="M 12 55 A 38 38 0 0 0 88 55" fill="transparent" />
                <text className="fill-amber-200 font-bold tracking-[4px]" style={{ fontSize: '21px', filter: 'drop-shadow(0px 2px 2px rgba(0,0,0,0.8))' }}>
                  <textPath href={`#curve-${idx}`} startOffset="50%" textAnchor="middle">
                    {item.text}
                  </textPath>
                </text>
              </svg>
            </button>
          ))}
        </div>
      </div>
    </Modal>
  );
};
