import React, { useState } from 'react';
import type { Role } from '../../data/types';
import { RoleIcon } from '../common/RoleIcon';
import { OfficialJinxes, type JinxRule } from './jinxData';

interface ScriptPreviewSheetProps {
  scriptName: string;
  scriptAuthor: string;
  scriptDescription: string;
  selectedRoles: Role[];
  customJinxes: JinxRule[];
  onClose: () => void;
}

export const ScriptPreviewSheet: React.FC<ScriptPreviewSheetProps> = ({
  scriptName,
  scriptAuthor,
  scriptDescription,
  selectedRoles,
  customJinxes,
  onClose
}) => {
  const [theme, setTheme] = useState<'dark' | 'parchment' | 'clean'>('dark');
  const [sheetType, setSheetType] = useState<'character' | 'night'>('character');

  // Group roles by team
  const townsfolk = selectedRoles.filter(r => r.type === 'townsfolk');
  const outsiders = selectedRoles.filter(r => r.type === 'outsider');
  const minions = selectedRoles.filter(r => r.type === 'minion');
  const demons = selectedRoles.filter(r => r.type === 'demon');
  const travelers = selectedRoles.filter(r => r.type === 'traveler');
  const fabled = selectedRoles.filter(r => r.type === 'fabled');

  // Active jinxes
  const roleIds = new Set(selectedRoles.map(r => r.id));
  const activeOfficialJinxes = OfficialJinxes.filter(j => 
    (roleIds.has(j.role1) && roleIds.has(j.role2)) ||
    (roleIds.has(j.role2) && roleIds.has(j.role1))
  );
  const allJinxes = [...activeOfficialJinxes, ...customJinxes];

  // Night Orders
  const firstNightRoles = [...selectedRoles]
    .filter(r => (r.firstNight !== undefined && r.firstNight > 0))
    .sort((a, b) => (a.firstNight || 999) - (b.firstNight || 999));

  const otherNightRoles = [...selectedRoles]
    .filter(r => (r.otherNight !== undefined && r.otherNight > 0))
    .sort((a, b) => (a.otherNight || 999) - (b.otherNight || 999));

  const handlePrint = () => {
    window.print();
  };

  const getRole = (id: string) => selectedRoles.find(r => r.id === id) || { id, name: id, icon: `/icons/${id}.png` };

  // Theme container classes
  const themeContainerClass = {
    dark: 'bg-[#111317] text-slate-100 border-slate-700',
    parchment: 'bg-[#f4ebd0] text-[#2c1d11] border-[#a48259]',
    clean: 'bg-white text-slate-900 border-slate-300'
  }[theme];

  const sectionHeaderClass = (type: string) => {
    if (theme === 'dark') {
      switch (type) {
        case 'townsfolk': return 'text-blue-400 border-blue-500/40 bg-blue-950/40';
        case 'outsider': return 'text-sky-400 border-sky-500/40 bg-sky-950/40';
        case 'minion': return 'text-amber-400 border-amber-500/40 bg-amber-950/40';
        case 'demon': return 'text-red-400 border-red-500/40 bg-red-950/40';
        default: return 'text-purple-400 border-purple-500/40 bg-purple-950/40';
      }
    } else if (theme === 'parchment') {
      switch (type) {
        case 'townsfolk': return 'text-[#1e3a8a] border-[#1e3a8a]/40 bg-[#dbeafe]/50';
        case 'outsider': return 'text-[#0369a1] border-[#0369a1]/40 bg-[#e0f2fe]/50';
        case 'minion': return 'text-[#b45309] border-[#b45309]/40 bg-[#fef3c7]/50';
        case 'demon': return 'text-[#b91c1c] border-[#b91c1c]/40 bg-[#fee2e2]/50';
        default: return 'text-[#6b21a8] border-[#6b21a8]/40 bg-[#f3e8ff]/50';
      }
    } else {
      switch (type) {
        case 'townsfolk': return 'text-blue-700 border-blue-300 bg-blue-50';
        case 'outsider': return 'text-sky-700 border-sky-300 bg-sky-50';
        case 'minion': return 'text-amber-700 border-amber-300 bg-amber-50';
        case 'demon': return 'text-red-700 border-red-300 bg-red-50';
        default: return 'text-purple-700 border-purple-300 bg-purple-50';
      }
    }
  };

  return (
    <div className="fixed inset-0 z-[200] bg-black/90 backdrop-blur-md flex flex-col overflow-hidden">
      {/* Top Controls Bar (Hidden during print) */}
      <div className="print:hidden flex items-center justify-between p-4 bg-slate-900 border-b border-slate-700 shrink-0">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-bold text-white tracking-wider flex items-center gap-2">
            <span>📜 劇本單預覽與列印</span>
          </h2>

          {/* Sheet Type Toggle */}
          <div className="flex bg-slate-800 p-1 rounded-lg border border-slate-700">
            <button
              onClick={() => setSheetType('character')}
              className={`px-3 py-1 text-xs font-bold rounded-md transition-colors ${
                sheetType === 'character' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              劇本角色單
            </button>
            <button
              onClick={() => setSheetType('night')}
              className={`px-3 py-1 text-xs font-bold rounded-md transition-colors ${
                sheetType === 'night' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              夜晚行動表
            </button>
          </div>

          {/* Theme Switcher */}
          <div className="flex bg-slate-800 p-1 rounded-lg border border-slate-700">
            <button
              onClick={() => setTheme('dark')}
              className={`px-2.5 py-1 text-xs font-bold rounded-md transition-colors ${
                theme === 'dark' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              🌙 暗黑風格
            </button>
            <button
              onClick={() => setTheme('parchment')}
              className={`px-2.5 py-1 text-xs font-bold rounded-md transition-colors ${
                theme === 'parchment' ? 'bg-[#c5ad83] text-[#2c1d11]' : 'text-slate-400 hover:text-white'
              }`}
            >
              📜 羊皮紙風格
            </button>
            <button
              onClick={() => setTheme('clean')}
              className={`px-2.5 py-1 text-xs font-bold rounded-md transition-colors ${
                theme === 'clean' ? 'bg-white text-black' : 'text-slate-400 hover:text-white'
              }`}
            >
              📄 簡約白底
            </button>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handlePrint}
            className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-lg text-sm shadow-md transition-colors flex items-center gap-2"
          >
            <span>🖨️ 列印 / 另存為 PDF</span>
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-200 font-bold rounded-lg text-sm transition-colors"
          >
            ✕ 關閉
          </button>
        </div>
      </div>

      {/* Main Sheet Container */}
      <div className="flex-1 overflow-y-auto p-4 md:p-8 flex justify-center custom-scrollbar">
        <div
          id="print-sheet-area"
          className={`w-full max-w-[900px] min-h-[1100px] p-8 md:p-12 rounded-xl shadow-2xl border transition-all ${themeContainerClass} print:border-none print:shadow-none print:p-0 print:m-0 print:w-full print:max-w-none`}
        >
          {/* Header */}
          <div className="text-center pb-6 border-b-2 border-current/20 mb-6">
            <h1 className="text-3xl md:text-4xl font-extrabold font-serif tracking-widest uppercase mb-1">
              {scriptName || '血染鐘樓自訂劇本'}
            </h1>
            <div className="text-xs md:text-sm opacity-75 font-mono">
              作者：{scriptAuthor || 'Steven Medway'}
            </div>
            {scriptDescription && (
              <p className="mt-3 text-xs md:text-sm max-w-xl mx-auto leading-relaxed opacity-85">
                {scriptDescription}
              </p>
            )}
          </div>

          {sheetType === 'character' ? (
            <div className="space-y-6">
              {/* Townsfolk */}
              {townsfolk.length > 0 && (
                <div>
                  <div className={`px-3 py-1 rounded-md font-bold text-sm border mb-3 uppercase tracking-wider flex justify-between items-center ${sectionHeaderClass('townsfolk')}`}>
                    <span>鎮民 (Townsfolk)</span>
                    <span className="text-xs font-mono">{townsfolk.length}</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {townsfolk.map(r => (
                      <div key={r.id} className="flex items-start gap-3 p-2.5 rounded-lg border border-current/10 bg-current/[0.03]">
                        <div className="w-10 h-10 rounded-full border border-current/20 shrink-0 overflow-hidden flex items-center justify-center p-0.5">
                          <RoleIcon icon={r.icon || `/icons/${r.id}.png`} className="w-full h-full object-contain" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-bold text-sm tracking-wide">{r.name}</div>
                          <div className="text-xs opacity-85 leading-tight mt-0.5">{r.ability}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Outsiders */}
              {outsiders.length > 0 && (
                <div>
                  <div className={`px-3 py-1 rounded-md font-bold text-sm border mb-3 uppercase tracking-wider flex justify-between items-center ${sectionHeaderClass('outsider')}`}>
                    <span>外來者 (Outsiders)</span>
                    <span className="text-xs font-mono">{outsiders.length}</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {outsiders.map(r => (
                      <div key={r.id} className="flex items-start gap-3 p-2.5 rounded-lg border border-current/10 bg-current/[0.03]">
                        <div className="w-10 h-10 rounded-full border border-current/20 shrink-0 overflow-hidden flex items-center justify-center p-0.5">
                          <RoleIcon icon={r.icon || `/icons/${r.id}.png`} className="w-full h-full object-contain" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-bold text-sm tracking-wide">{r.name}</div>
                          <div className="text-xs opacity-85 leading-tight mt-0.5">{r.ability}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Minions */}
              {minions.length > 0 && (
                <div>
                  <div className={`px-3 py-1 rounded-md font-bold text-sm border mb-3 uppercase tracking-wider flex justify-between items-center ${sectionHeaderClass('minion')}`}>
                    <span>爪牙 (Minions)</span>
                    <span className="text-xs font-mono">{minions.length}</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {minions.map(r => (
                      <div key={r.id} className="flex items-start gap-3 p-2.5 rounded-lg border border-current/10 bg-current/[0.03]">
                        <div className="w-10 h-10 rounded-full border border-current/20 shrink-0 overflow-hidden flex items-center justify-center p-0.5">
                          <RoleIcon icon={r.icon || `/icons/${r.id}.png`} className="w-full h-full object-contain" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-bold text-sm tracking-wide">{r.name}</div>
                          <div className="text-xs opacity-85 leading-tight mt-0.5">{r.ability}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Demons */}
              {demons.length > 0 && (
                <div>
                  <div className={`px-3 py-1 rounded-md font-bold text-sm border mb-3 uppercase tracking-wider flex justify-between items-center ${sectionHeaderClass('demon')}`}>
                    <span>惡魔 (Demons)</span>
                    <span className="text-xs font-mono">{demons.length}</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {demons.map(r => (
                      <div key={r.id} className="flex items-start gap-3 p-2.5 rounded-lg border border-current/10 bg-current/[0.03]">
                        <div className="w-10 h-10 rounded-full border border-current/20 shrink-0 overflow-hidden flex items-center justify-center p-0.5">
                          <RoleIcon icon={r.icon || `/icons/${r.id}.png`} className="w-full h-full object-contain" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-bold text-sm tracking-wide">{r.name}</div>
                          <div className="text-xs opacity-85 leading-tight mt-0.5">{r.ability}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Travelers & Fabled */}
              {(travelers.length > 0 || fabled.length > 0) && (
                <div>
                  <div className={`px-3 py-1 rounded-md font-bold text-sm border mb-3 uppercase tracking-wider flex justify-between items-center ${sectionHeaderClass('traveler')}`}>
                    <span>旅行者與傳奇 (Travelers & Fabled)</span>
                    <span className="text-xs font-mono">{travelers.length + fabled.length}</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {[...travelers, ...fabled].map(r => (
                      <div key={r.id} className="flex items-start gap-3 p-2.5 rounded-lg border border-current/10 bg-current/[0.03]">
                        <div className="w-10 h-10 rounded-full border border-current/20 shrink-0 overflow-hidden flex items-center justify-center p-0.5">
                          <RoleIcon icon={r.icon || `/icons/${r.id}.png`} className="w-full h-full object-contain" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-bold text-sm tracking-wide">{r.name}</div>
                          <div className="text-xs opacity-85 leading-tight mt-0.5">{r.ability}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Jinxes Section at bottom */}
              {allJinxes.length > 0 && (
                <div className="pt-4 border-t-2 border-current/20">
                  <h4 className="font-bold text-sm tracking-wider uppercase mb-2 flex items-center gap-1.5">
                    <span>⚖️ 相剋規則 (Jinxes)</span>
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                    {allJinxes.map((j, idx) => {
                      const r1 = getRole(j.role1);
                      const r2 = getRole(j.role2);
                      return (
                        <div key={`sheet-jinx-${idx}`} className="p-2 rounded border border-current/10 bg-current/[0.02]">
                          <span className="font-bold">{r1.name} / {r2.name}</span>：
                          <span className="opacity-85">{j.reason}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Night Order Sheet */
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* First Night */}
              <div>
                <div className="px-3 py-1.5 rounded-md font-bold text-sm bg-blue-900/40 border border-blue-500/40 text-blue-400 mb-4 flex justify-between items-center">
                  <span>首夜行動順序 (First Night)</span>
                  <span className="font-mono text-xs">{firstNightRoles.length}</span>
                </div>
                <div className="space-y-2">
                  {firstNightRoles.map((r, idx) => (
                    <div key={`fn-${r.id}`} className="flex items-center gap-3 p-2 rounded-lg border border-current/10 bg-current/[0.03]">
                      <span className="w-5 h-5 rounded-full bg-current/10 font-mono text-xs flex items-center justify-center font-bold">
                        {idx + 1}
                      </span>
                      <div className="w-7 h-7 rounded-full overflow-hidden shrink-0 border border-current/20">
                        <RoleIcon icon={r.icon || `/icons/${r.id}.png`} className="w-full h-full object-contain" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-xs">{r.name}</div>
                        <div className="text-[10px] opacity-75 truncate">{r.ability}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Other Nights */}
              <div>
                <div className="px-3 py-1.5 rounded-md font-bold text-sm bg-indigo-900/40 border border-indigo-500/40 text-indigo-400 mb-4 flex justify-between items-center">
                  <span>其他夜晚行動 (Other Nights)</span>
                  <span className="font-mono text-xs">{otherNightRoles.length}</span>
                </div>
                <div className="space-y-2">
                  {otherNightRoles.map((r, idx) => (
                    <div key={`on-${r.id}`} className="flex items-center gap-3 p-2 rounded-lg border border-current/10 bg-current/[0.03]">
                      <span className="w-5 h-5 rounded-full bg-current/10 font-mono text-xs flex items-center justify-center font-bold">
                        {idx + 1}
                      </span>
                      <div className="w-7 h-7 rounded-full overflow-hidden shrink-0 border border-current/20">
                        <RoleIcon icon={r.icon || `/icons/${r.id}.png`} className="w-full h-full object-contain" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-xs">{r.name}</div>
                        <div className="text-[10px] opacity-75 truncate">{r.ability}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
