import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { AllRoles } from '../../data/roles';
import type { Role, Script } from '../../data/types';

export type SeatTokenType = 'icon' | 'text' | 'image';
export interface SeatToken {
  id: string;
  type: SeatTokenType;
  content: string;
  icon?: string;
  image?: string;
  text?: string;
  roleId?: string;
}

interface SeatTokenModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (token: SeatToken) => void;
  script?: Script;
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

const ROLE_TYPE_LABEL: Record<string, { label: string; color: string }> = {
  townsfolk: { label: '鎮民', color: 'text-blue-300' },
  outsider: { label: '外來者', color: 'text-sky-300' },
  minion: { label: '爪牙', color: 'text-rose-300' },
  demon: { label: '惡魔', color: 'text-red-400' },
  traveler: { label: '旅行者', color: 'text-purple-300' },
  fabled: { label: '傳奇', color: 'text-amber-300' },
  loric: { label: '奇遇', color: 'text-amber-200' },
};

export const SeatTokenModal: React.FC<SeatTokenModalProps> = ({ isOpen, onClose, onSave, script }) => {
  const [textVal, setTextVal] = useState('');
  const [showRoles, setShowRoles] = useState(false);
  const [roleSearch, setRoleSearch] = useState('');
  const [roleScope, setRoleScope] = useState<'all' | 'script'>('all');

  useEffect(() => {
    const onEsc = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    if (isOpen) window.addEventListener('keydown', onEsc);
    return () => window.removeEventListener('keydown', onEsc);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!isOpen) {
      setShowRoles(false);
      setRoleSearch('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleImageClick = (item: { image: string; text: string }) => {
    onSave({ id: Date.now().toString(), type: 'image', content: item.text, image: item.image, text: item.text });
    onClose();
  };

  const handleRoleClick = (role: Role) => {
    onSave({
      id: Date.now().toString(),
      type: 'image',
      content: role.name,
      image: role.icon || `/icons/${role.id}.png`,
      text: role.name,
      roleId: role.id,
    });
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

  const baseRoles: Role[] =
    roleScope === 'script' && script?.roles?.length
      ? script.roles
      : Object.values(AllRoles);

  const filteredRoles = roleSearch.trim()
    ? baseRoles.filter((r) => r.name.includes(roleSearch.trim()) || r.id.toLowerCase().includes(roleSearch.trim().toLowerCase()))
    : baseRoles;

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
          <div className="flex items-center gap-2.5">
            {showRoles && (
              <button
                type="button"
                onClick={() => setShowRoles(false)}
                className="rounded-md px-2 py-0.5 text-xs font-bold text-amber-300 border border-amber-500/30 bg-amber-950/50 hover:bg-amber-900/60 transition-colors"
              >
                ◂ 返回
              </button>
            )}
            <h2 className="font-serif text-lg font-bold tracking-widest text-amber-100/90">
              {showRoles ? '選擇角色標記' : '座位筆記'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-md px-2 py-0.5 text-white/35 transition-colors hover:bg-white/10 hover:text-white"
            aria-label="關閉"
          >
            ✕
          </button>
        </div>

        {showRoles ? (
          <div className="flex flex-col gap-3 px-5 py-4 max-h-[70vh]">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={roleSearch}
                onChange={(e) => setRoleSearch(e.target.value)}
                placeholder="搜尋角色名稱..."
                className="flex-1 rounded-lg border border-amber-900/30 bg-black/40 px-3 py-2 text-sm text-white placeholder-white/30 focus:border-amber-500/60 focus:outline-none"
                autoFocus
              />
              {script?.roles?.length ? (
                <div className="flex rounded-lg border border-amber-900/30 bg-black/40 p-0.5 text-xs font-bold">
                  <button
                    type="button"
                    onClick={() => setRoleScope('all')}
                    className={`px-2.5 py-1.5 rounded-md transition-colors ${roleScope === 'all' ? 'bg-amber-600/60 text-white' : 'text-white/50 hover:text-white'}`}
                  >
                    全部
                  </button>
                  <button
                    type="button"
                    onClick={() => setRoleScope('script')}
                    className={`px-2.5 py-1.5 rounded-md transition-colors ${roleScope === 'script' ? 'bg-amber-600/60 text-white' : 'text-white/50 hover:text-white'}`}
                  >
                    本劇本
                  </button>
                </div>
              ) : null}
            </div>

            <div className="flex-1 overflow-y-auto grid grid-cols-4 sm:grid-cols-5 gap-2.5 pr-1 custom-scrollbar">
              {filteredRoles.map((role) => {
                const meta = ROLE_TYPE_LABEL[role.type] || { label: '', color: 'text-white/80' };
                return (
                  <button
                    key={role.id}
                    type="button"
                    onClick={() => handleRoleClick(role)}
                    className="group flex flex-col items-center gap-1 rounded-lg p-1.5 hover:bg-white/5 transition-colors"
                    title={`${role.name} (${meta.label})`}
                  >
                    <span className="flex h-12 w-12 items-center justify-center rounded-full border border-amber-700/50 bg-[radial-gradient(circle_at_center,_#f4e5c5_0%,_#dcb37b_100%)] overflow-hidden shadow group-hover:border-amber-400">
                      <img
                        src={role.icon || `/icons/${role.id}.png`}
                        alt={role.name}
                        className="h-[88%] w-[88%] object-contain transition-transform group-hover:scale-110"
                      />
                    </span>
                    <span className={`text-xs font-bold text-center leading-tight line-clamp-1 ${meta.color}`}>
                      {role.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
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

                {/* 角色（展開所有角色） */}
                <button
                  type="button"
                  onClick={() => setShowRoles(true)}
                  className="group flex flex-col items-center gap-1.5 rounded-lg p-1 transition-colors hover:bg-white/5"
                  title="展開所有角色標記"
                >
                  <span className="flex h-[68px] w-[68px] items-center justify-center rounded-full border-2 border-amber-600/70 bg-gradient-to-b from-amber-950/60 to-black/40 shadow-[0_2px_8px_rgba(0,0,0,0.55),inset_0_0_0_1px_rgba(0,0,0,0.4)] transition-all group-hover:border-amber-300 group-hover:shadow-amber-500/30 text-amber-300">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8 transition-transform group-hover:scale-110">
                      <path d="M4.5 19.5A2.5 2.5 0 017 17h12.5" />
                      <path d="M7 2h12.5v20H7a2.5 2.5 0 01-2.5-2.5v-15A2.5 2.5 0 017 2z" />
                      <circle cx="12.5" cy="9.5" r="2.2" />
                      <path d="M9.5 14.5c.6-1.5 5.4-1.5 6 0" />
                    </svg>
                  </span>
                  <span className="text-[15px] font-bold leading-none text-amber-200 transition-colors group-hover:text-amber-100">
                    角色
                  </span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>,
    document.body
  );
};
