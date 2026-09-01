import React, { useState } from 'react';
import type { Role } from '../../data/types';
import { RoleIcon } from '../common/RoleIcon';

interface NightOrderEditorProps {
  selectedRoles: Role[];
}

export const NightOrderEditor: React.FC<NightOrderEditorProps> = ({ selectedRoles }) => {
  const [activeTab, setActiveTab] = useState<'first' | 'other'>('first');

  // Sorted by firstNight / otherNight
  const firstNightRoles = [...selectedRoles]
    .filter(r => (r.firstNight !== undefined && r.firstNight > 0))
    .sort((a, b) => (a.firstNight || 999) - (b.firstNight || 999));

  const otherNightRoles = [...selectedRoles]
    .filter(r => (r.otherNight !== undefined && r.otherNight > 0))
    .sort((a, b) => (a.otherNight || 999) - (b.otherNight || 999));

  const currentList = activeTab === 'first' ? firstNightRoles : otherNightRoles;

  return (
    <div className="bg-slate-900/90 border border-slate-700 rounded-xl p-4 shadow-xl space-y-4 text-left">
      <div className="flex items-center justify-between border-b border-slate-700 pb-3">
        <div>
          <h3 className="text-base font-bold text-sky-400 flex items-center gap-2">
            <span>🌙 夜晚行動順序 (Night Order)</span>
            <span className="text-xs px-2 py-0.5 bg-sky-950/80 text-sky-300 rounded-full border border-sky-700/50">
              {currentList.length} 位行動角色
            </span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            根據官方規則自動生成之夜晚喚醒次序，供說書人夜晚行動參考。
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex bg-slate-800 p-1 rounded-lg border border-slate-700">
          <button
            onClick={() => setActiveTab('first')}
            className={`px-3 py-1 text-xs font-bold rounded-md transition-colors ${
              activeTab === 'first'
                ? 'bg-blue-600 text-white shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            首夜 (First Night)
          </button>
          <button
            onClick={() => setActiveTab('other')}
            className={`px-3 py-1 text-xs font-bold rounded-md transition-colors ${
              activeTab === 'other'
                ? 'bg-indigo-600 text-white shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            其他夜晚 (Other Nights)
          </button>
        </div>
      </div>

      {/* Action Order List */}
      <div className="space-y-2 max-h-72 overflow-y-auto custom-scrollbar pr-1">
        {currentList.map((role, idx) => (
          <div
            key={`${activeTab}-${role.id}`}
            className="flex items-center gap-3 p-2.5 bg-slate-800/80 border border-slate-700/80 rounded-lg hover:border-slate-500 transition-colors"
          >
            <div className="w-6 h-6 rounded-full bg-slate-900 border border-slate-600 flex items-center justify-center text-xs font-mono font-bold text-sky-300 shrink-0">
              {idx + 1}
            </div>
            <div className="w-8 h-8 rounded-full border border-slate-500 bg-black/60 overflow-hidden shrink-0 flex items-center justify-center">
              <RoleIcon icon={role.icon || `/icons/${role.id}.png`} className="w-full h-full object-contain" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-bold text-xs text-white truncate">{role.name}</span>
                <span className="text-[10px] text-slate-400 capitalize">({role.type})</span>
              </div>
              <p className="text-[11px] text-slate-300 line-clamp-1">
                {role.ability}
              </p>
            </div>
          </div>
        ))}

        {currentList.length === 0 && (
          <div className="text-center py-8 text-slate-500 text-xs">
            {activeTab === 'first' ? '當前劇本沒有首夜行動的角色' : '當前劇本沒有其他夜晚行動的角色'}
          </div>
        )}
      </div>
    </div>
  );
};
