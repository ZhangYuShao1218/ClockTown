import React, { useState, useMemo } from 'react';
import { AllRoles } from '../../data/roles';
import type { Role, RoleType } from '../../data/types';
import { RoleIcon } from '../common/RoleIcon';

interface RolePickerProps {
  selectedRoleIds: string[];
  onAddRole: (role: Role) => void;
  onOpenCustomModal: () => void;
  customRoles: Role[];
}

export const RolePicker: React.FC<RolePickerProps> = ({
  selectedRoleIds,
  onAddRole,
  onOpenCustomModal,
  customRoles
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeType, setActiveType] = useState<RoleType | 'all'>('all');

  const allAvailableRoles = useMemo(() => {
    const map = new Map<string, Role>();
    Object.values(AllRoles).forEach(r => map.set(r.id, r));
    customRoles.forEach(r => map.set(r.id, r));
    return Array.from(map.values());
  }, [customRoles]);

  const filteredRoles = useMemo(() => {
    return allAvailableRoles.filter(role => {
      // Type filter
      if (activeType !== 'all' && role.type !== activeType) return false;

      // Search filter
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase().trim();
        const matchesName = role.name.toLowerCase().includes(query);
        const matchesAbility = role.ability.toLowerCase().includes(query);
        const matchesId = role.id.toLowerCase().includes(query);
        if (!matchesName && !matchesAbility && !matchesId) return false;
      }
      return true;
    });
  }, [allAvailableRoles, activeType, searchTerm]);

  const getRoleTypeBadge = (type: RoleType) => {
    switch (type) {
      case 'townsfolk':
        return <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-900/60 text-blue-300 border border-blue-700/50">鎮民</span>;
      case 'outsider':
        return <span className="text-[10px] px-1.5 py-0.5 rounded bg-sky-900/60 text-sky-300 border border-sky-700/50">外來者</span>;
      case 'minion':
        return <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-900/60 text-amber-300 border border-amber-700/50">爪牙</span>;
      case 'demon':
        return <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-900/60 text-red-300 border border-red-700/50">惡魔</span>;
      case 'traveler':
        return <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-900/60 text-purple-300 border border-purple-700/50">旅行者</span>;
      case 'fabled':
        return <span className="text-[10px] px-1.5 py-0.5 rounded bg-yellow-900/60 text-yellow-300 border border-yellow-700/50">傳奇</span>;
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-900/90 border border-slate-700 rounded-xl overflow-hidden shadow-2xl">
      {/* Top Search & Actions */}
      <div className="p-4 border-b border-slate-700 bg-black/40 space-y-3">
        <div className="flex items-center justify-between gap-2">
          <h3 className="text-base font-bold text-white tracking-wider flex items-center gap-2">
            <span>角色庫</span>
            <span className="text-xs px-2 py-0.5 bg-indigo-900/60 text-indigo-200 rounded-full border border-indigo-500/40">
              {filteredRoles.length}
            </span>
          </h3>
          <button
            onClick={onOpenCustomModal}
            className="text-xs px-3 py-1.5 bg-indigo-600/80 hover:bg-indigo-600 text-white font-bold rounded-lg border border-indigo-400/50 transition-colors shadow flex items-center gap-1"
          >
            <span>+</span>
            <span>自訂角色</span>
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="搜尋角色名稱、技能關鍵字..."
            className="w-full pl-9 pr-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 text-xs"
          />
          <svg className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>

        {/* Type Tabs */}
        <div className="flex gap-1 overflow-x-auto pb-1 scrollbar-none text-xs">
          {[
            { id: 'all', label: '全部' },
            { id: 'townsfolk', label: '鎮民' },
            { id: 'outsider', label: '外來者' },
            { id: 'minion', label: '爪牙' },
            { id: 'demon', label: '惡魔' },
            { id: 'traveler', label: '旅行者' },
            { id: 'fabled', label: '傳奇' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveType(tab.id as any)}
              className={`px-2.5 py-1 rounded-md font-bold transition-colors whitespace-nowrap ${
                activeType === tab.id
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Role Grid / List */}
      <div className="flex-1 overflow-y-auto p-3 custom-scrollbar space-y-2">
        {filteredRoles.map(role => {
          const isSelected = selectedRoleIds.includes(role.id);
          return (
            <div
              key={role.id}
              onClick={() => !isSelected && onAddRole(role)}
              className={`group flex items-start gap-3 p-2.5 rounded-lg border transition-all cursor-pointer ${
                isSelected
                  ? 'bg-slate-800/40 border-slate-700/50 opacity-40 cursor-default'
                  : 'bg-slate-800/80 hover:bg-slate-750 border-slate-600/80 hover:border-indigo-400 hover:shadow-lg hover:translate-x-1'
              }`}
            >
              {/* Role Icon */}
              <div className="w-10 h-10 rounded-full border border-slate-500 bg-black/60 shrink-0 overflow-hidden flex items-center justify-center p-0.5">
                <RoleIcon icon={role.icon || `/icons/${role.id}.png`} className="w-full h-full object-contain" />
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-1 mb-1">
                  <span className="font-bold text-sm text-white truncate group-hover:text-indigo-200">
                    {role.name}
                  </span>
                  {getRoleTypeBadge(role.type)}
                </div>
                <p className="text-[11px] text-slate-300 line-clamp-2 leading-tight">
                  {role.ability}
                </p>
              </div>

              {/* Action Indicator */}
              <div className="shrink-0 self-center">
                {isSelected ? (
                  <span className="text-xs text-slate-500 font-bold px-1.5 py-0.5 bg-slate-900 rounded">已選</span>
                ) : (
                  <span className="w-6 h-6 rounded-full bg-indigo-600/60 group-hover:bg-indigo-600 flex items-center justify-center text-white text-sm font-bold shadow transition-colors">
                    +
                  </span>
                )}
              </div>
            </div>
          );
        })}

        {filteredRoles.length === 0 && (
          <div className="text-center py-10 text-slate-500 text-sm">
            找不到符合條件的角色
          </div>
        )}
      </div>
    </div>
  );
};
