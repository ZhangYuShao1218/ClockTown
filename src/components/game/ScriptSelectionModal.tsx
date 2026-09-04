import { useMemo, useRef, useState } from 'react';
import { Modal } from '../common/Modal';
import { AllScripts } from '../../data/scripts';
import { RoleIcon } from '../common/RoleIcon';

interface ScriptSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentScriptId: string;
  onSelect?: (scriptId: string) => void;
  readOnly?: boolean;
  onViewRoleInfo?: (scriptId: string) => void;
}

const PAGE_SIZE = 6;

export const ScriptSelectionModal = ({ isOpen, onClose, currentScriptId, onSelect, readOnly, onViewRoleInfo }: ScriptSelectionModalProps) => {
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(0);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const goPage = (p: number) => {
    setPage(p);
    // 捲回視窗最上方（Modal 內容捲軸）
    requestAnimationFrame(() => scrollRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }));
  };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const keys = Object.keys(AllScripts);
    if (!q) return keys;
    return keys.filter(key => {
      const s = AllScripts[key];
      return (
        s.name.toLowerCase().includes(q) ||
        (s.description || '').toLowerCase().includes(q) ||
        s.roles.some(r => r?.name?.toLowerCase().includes(q))
      );
    });
  }, [query]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, pageCount - 1);
  const pageKeys = filtered.slice(safePage * PAGE_SIZE, safePage * PAGE_SIZE + PAGE_SIZE);

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="" maxWidth="max-w-[95vw] lg:max-w-5xl" fullBleedOnMobile={true}>
      <div ref={scrollRef} className="relative px-1 pt-2 sm:px-4 sm:pt-6">
        {/* 關閉按鈕 */}
        <button
          onClick={onClose}
          aria-label="關閉"
          className="absolute right-1 top-1 z-20 flex h-9 w-9 items-center justify-center rounded-full border-2 border-red-400/50 bg-red-900/80 text-white shadow-lg transition-colors hover:bg-red-700"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
        </button>

        {/* Search bar（手機時右側留位給關閉鈕） */}
        <div className="mx-auto mb-4 sm:mb-6 mt-1 max-w-md pr-11 sm:pr-0">
          <div className="relative">
            <svg className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-4.35-4.35M17 11a6 6 0 11-12 0 6 6 0 0112 0z" />
            </svg>
            <input
              type="text"
              value={query}
              onChange={(e) => { setQuery(e.target.value); setPage(0); }}
              placeholder="搜尋劇本名稱、簡介或角色…"
              className="w-full rounded-xl border-2 border-slate-600 bg-slate-900/80 py-2 pl-9 pr-8 text-sm text-slate-200 placeholder:text-slate-500 shadow-inner transition-colors duration-200 focus:border-indigo-400 focus:outline-none"
            />
            {query && (
              <button
                type="button"
                onClick={() => { setQuery(''); setPage(0); }}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 text-slate-500 transition-colors duration-200 hover:text-slate-200"
                aria-label="清除搜尋"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>

        {pageKeys.length === 0 ? (
          <div className="py-16 text-center text-slate-500">找不到符合「{query}」的劇本</div>
        ) : (
          <div className="flex min-h-[240px] sm:min-h-[320px] flex-wrap content-start justify-center gap-3 sm:gap-6 pb-2">
            {pageKeys.map(key => {
              const script = AllScripts[key];
              const isSelected = key === currentScriptId;

              return (
                <div
                  key={key}
                  className="relative group/card w-full max-w-[360px] h-auto sm:w-[280px] sm:h-[300px] z-10 hover:z-50"
                >
                  {/* Base Card (Front) */}
                  <div
                    className={`static sm:absolute sm:inset-0 z-30 flex flex-col items-center justify-center px-3 py-2.5 sm:px-4 sm:py-[11px] rounded-2xl border-2 transition-all shadow-xl bg-slate-900 ${!readOnly ? 'cursor-pointer' : 'cursor-pointer'} ${
                      isSelected
                        ? 'border-indigo-400 shadow-[0_0_20px_rgba(99,102,241,0.5)]'
                        : 'border-slate-500 hover:border-slate-300'
                    }`}
                    onClick={() => { if(!readOnly && onSelect) { onSelect(key); onClose(); } else if (readOnly && onViewRoleInfo) { onViewRoleInfo(key); } }}
                  >
                    {isSelected && (
                      <div className="absolute top-0 right-0 bg-indigo-500 text-white text-[10px] font-bold px-3 py-1 rounded-bl-xl rounded-tr-xl z-40 shadow-md">
                        目前使用
                      </div>
                    )}

                    <img
                      src={`/drama/Drama_${key}.png`}
                      alt={script.name}
                      className="w-full h-[120px] sm:h-auto sm:flex-1 min-h-0 object-contain mb-2 drop-shadow-[0_0_15px_rgba(255,255,255,0.15)] transition-all duration-300"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        e.currentTarget.nextElementSibling?.classList.remove('hidden');
                      }}
                    />
                    <svg className="hidden w-full max-h-[160px] text-slate-500 mb-3 opacity-80 group-hover/card:scale-105 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>
                    </svg>

                    {/* Default Info（桌機 hover 時隱藏；手機常駐） */}
                    <div className="flex flex-col items-center transition-all duration-300 overflow-hidden max-h-[100px] opacity-100 sm:group-hover/card:max-h-0 sm:group-hover/card:opacity-0 sm:group-hover/card:m-0">
                      <h3 className="text-base sm:text-lg font-bold text-[#ff6b6b] leading-tight drop-shadow-md text-center mb-1.5 sm:mb-2">{script.name}</h3>
                      <div className="flex gap-2">
                        <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-sky-900/60 border border-sky-700/50 text-sky-200 shadow-inner whitespace-nowrap">
                          難易度: {script.difficulty || '基礎'}
                        </span>
                        <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-amber-900/60 border border-amber-700/50 text-amber-200 shadow-inner whitespace-nowrap">
                          {script.recommendedPlayers || '5-15人'}
                        </span>
                      </div>
                    </div>

                    {/* Description（桌機 hover 展開全文；手機常駐兩行截斷） */}
                    <div className="overflow-hidden transition-all duration-300 w-full px-2 mt-1.5 max-h-16 opacity-100 sm:mt-0 sm:max-h-0 sm:opacity-0 sm:group-hover/card:max-h-[250px] sm:group-hover/card:opacity-100 sm:group-hover/card:mt-2">
                      <p className="text-xs text-slate-300 leading-relaxed text-left w-full line-clamp-2 sm:line-clamp-none">
                        {script.description}
                      </p>
                    </div>
                  </div>

                  {/* Single Drawer（僅桌機 hover 使用；手機直接點卡片看角色） */}
                  <div className="hidden sm:block absolute inset-0 z-20 transition-transform duration-500 ease-[cubic-bezier(0.2,0.8,0.2,1)] group-hover/card:translate-x-[calc(100%-16px)] rounded-2xl pointer-events-none group-hover/card:pointer-events-auto">
                    <div className="absolute inset-0 bg-slate-900 border-2 border-slate-600 rounded-2xl p-5 opacity-0 group-hover/card:opacity-100 transition-opacity duration-300 shadow-[20px_0_30px_rgba(0,0,0,0.5)] flex flex-col pt-6 pl-8">
                      <h4 className="text-lg font-bold text-amber-500 mb-2 drop-shadow-[0_4px_8px_rgba(0,0,0,0.9)] [text-shadow:_1px_2px_4px_rgba(0,0,0,0.8)]">出場角色</h4>
                      <hr className="border-amber-500/30 mb-3" />
                      <div className="flex-1 overflow-y-auto custom-scrollbar pr-1 content-start">
                        <div className="flex gap-2 flex-wrap">
                          {script.roles.filter(Boolean).map((r, idx) => (
                            <div key={r.id || idx} className="w-9 h-9 rounded-full bg-black overflow-hidden border-2 border-slate-700 hover:border-slate-300 transition-colors shadow-sm relative group/tooltip" title={r.name || '未知角色'}>
                              {r.icon ? <RoleIcon icon={r.icon} className="w-full h-full object-cover bg-[radial-gradient(circle_at_center,_#f4e5c5_0%,_#dcb37b_100%)]" /> : null}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                </div>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {pageCount > 1 && (
          <div className="flex items-center justify-center gap-2 pb-4 pt-2">
            <button
              type="button"
              onClick={() => goPage(Math.max(0, safePage - 1))}
              disabled={safePage === 0}
              className="rounded-lg border border-slate-600 bg-slate-900 px-3 py-1.5 text-sm text-slate-300 transition-colors duration-200 hover:border-slate-300 hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
            >
              上一頁
            </button>
            {Array.from({ length: pageCount }).map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => goPage(i)}
                className={`h-8 w-8 rounded-lg border text-sm font-bold transition-colors duration-200 ${
                  i === safePage
                    ? 'border-indigo-400 bg-indigo-500 text-white shadow-[0_0_12px_rgba(99,102,241,0.5)]'
                    : 'border-slate-600 bg-slate-900 text-slate-300 hover:border-slate-300 hover:text-white'
                }`}
              >
                {i + 1}
              </button>
            ))}
            <button
              type="button"
              onClick={() => goPage(Math.min(pageCount - 1, safePage + 1))}
              disabled={safePage === pageCount - 1}
              className="rounded-lg border border-slate-600 bg-slate-900 px-3 py-1.5 text-sm text-slate-300 transition-colors duration-200 hover:border-slate-300 hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
            >
              下一頁
            </button>
          </div>
        )}
      </div>
    </Modal>
  );
};
