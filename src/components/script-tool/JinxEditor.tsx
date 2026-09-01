import React, { useState, useMemo } from 'react';
import type { Role } from '../../data/types';
import { OfficialJinxes, type JinxRule } from './jinxData';
import { RoleIcon } from '../common/RoleIcon';

interface JinxEditorProps {
  selectedRoles: Role[];
  customJinxes: JinxRule[];
  onAddCustomJinx: (jinx: JinxRule) => void;
  onRemoveCustomJinx: (index: number) => void;
}

export const JinxEditor: React.FC<JinxEditorProps> = ({
  selectedRoles,
  customJinxes,
  onAddCustomJinx,
  onRemoveCustomJinx
}) => {
  const [role1Id, setRole1Id] = useState('');
  const [role2Id, setRole2Id] = useState('');
  const [reason, setReason] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  const selectedRoleIds = useMemo(() => new Set(selectedRoles.map(r => r.id)), [selectedRoles]);

  // Auto-detect official jinxes
  const activeOfficialJinxes = useMemo(() => {
    return OfficialJinxes.filter(j => 
      (selectedRoleIds.has(j.role1) && selectedRoleIds.has(j.role2)) ||
      (selectedRoleIds.has(j.role2) && selectedRoleIds.has(j.role1))
    );
  }, [selectedRoleIds]);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!role1Id || !role2Id || !reason.trim() || role1Id === role2Id) return;

    onAddCustomJinx({
      role1: role1Id,
      role2: role2Id,
      reason: reason.trim()
    });

    setRole1Id('');
    setRole2Id('');
    setReason('');
    setIsAdding(false);
  };

  const getRole = (id: string) => selectedRoles.find(r => r.id === id) || { id, name: id, icon: `/icons/${id}.png` };

  return (
    <div className="bg-slate-900/90 border border-slate-700 rounded-xl p-4 shadow-xl space-y-4 text-left">
      <div className="flex items-center justify-between border-b border-slate-700 pb-3">
        <div>
          <h3 className="text-base font-bold text-amber-400 flex items-center gap-2">
            <span>⚖️ 相剋規則 (Jinxes)</span>
            <span className="text-xs px-2 py-0.5 bg-amber-950/80 text-amber-300 rounded-full border border-amber-700/50">
              {activeOfficialJinxes.length + customJinxes.length} 條
            </span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            系統會自動偵測所選角色之間的相剋規則，您也可以手動增設自訂相剋。
          </p>
        </div>
        <button
          onClick={() => setIsAdding(!isAdding)}
          className="text-xs px-3 py-1.5 bg-amber-700/60 hover:bg-amber-600 text-amber-100 font-bold rounded-lg border border-amber-500/50 transition-colors shadow flex items-center gap-1"
        >
          <span>{isAdding ? '✕ 取消' : '+ 新增相剋'}</span>
        </button>
      </div>

      {/* Add Custom Jinx Form */}
      {isAdding && (
        <form onSubmit={handleAdd} className="p-3 bg-black/40 border border-amber-500/30 rounded-lg space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">第一位角色</label>
              <select
                value={role1Id}
                onChange={(e) => setRole1Id(e.target.value)}
                required
                className="w-full px-2.5 py-1.5 bg-slate-800 border border-slate-600 rounded text-white text-xs focus:outline-none focus:border-amber-500"
              >
                <option value="">-- 請選擇角色 --</option>
                {selectedRoles.map(r => (
                  <option key={`r1-${r.id}`} value={r.id}>{r.name} ({r.type})</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">第二位角色</label>
              <select
                value={role2Id}
                onChange={(e) => setRole2Id(e.target.value)}
                required
                className="w-full px-2.5 py-1.5 bg-slate-800 border border-slate-600 rounded text-white text-xs focus:outline-none focus:border-amber-500"
              >
                <option value="">-- 請選擇角色 --</option>
                {selectedRoles.filter(r => r.id !== role1Id).map(r => (
                  <option key={`r2-${r.id}`} value={r.id}>{r.name} ({r.type})</option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">相剋規則說明 (Reason)</label>
            <input
              type="text"
              required
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="請說明當這兩位角色同時存在時的特殊規則..."
              className="w-full px-3 py-1.5 bg-slate-800 border border-slate-600 rounded text-white text-xs focus:outline-none focus:border-amber-500"
            />
          </div>
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={!role1Id || !role2Id || !reason.trim()}
              className="px-4 py-1.5 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded text-xs shadow transition-colors disabled:opacity-50"
            >
              確認新增
            </button>
          </div>
        </form>
      )}

      {/* Jinx List */}
      <div className="space-y-2 max-h-60 overflow-y-auto custom-scrollbar pr-1">
        {/* Official Jinxes */}
        {activeOfficialJinxes.map((jinx, idx) => {
          const r1 = getRole(jinx.role1);
          const r2 = getRole(jinx.role2);
          return (
            <div key={`off-${idx}`} className="flex items-start gap-3 p-2.5 bg-slate-800/70 border border-amber-900/40 rounded-lg">
              <div className="flex items-center -space-x-2 shrink-0">
                <div className="w-8 h-8 rounded-full border border-amber-500/50 bg-black/60 overflow-hidden flex items-center justify-center">
                  <RoleIcon icon={r1.icon || `/icons/${r1.id}.png`} className="w-full h-full object-contain" />
                </div>
                <div className="w-8 h-8 rounded-full border border-amber-500/50 bg-black/60 overflow-hidden flex items-center justify-center">
                  <RoleIcon icon={r2.icon || `/icons/${r2.id}.png`} className="w-full h-full object-contain" />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="font-bold text-xs text-amber-300">{r1.name}</span>
                  <span className="text-slate-500 text-xs font-bold">✕</span>
                  <span className="font-bold text-xs text-amber-300">{r2.name}</span>
                  <span className="text-[10px] px-1.5 py-0.2 bg-amber-900/40 text-amber-300/80 rounded border border-amber-700/30">官方</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">{jinx.reason}</p>
              </div>
            </div>
          );
        })}

        {/* Custom Jinxes */}
        {customJinxes.map((jinx, idx) => {
          const r1 = getRole(jinx.role1);
          const r2 = getRole(jinx.role2);
          return (
            <div key={`cus-${idx}`} className="flex items-start gap-3 p-2.5 bg-indigo-950/40 border border-indigo-700/50 rounded-lg group">
              <div className="flex items-center -space-x-2 shrink-0">
                <div className="w-8 h-8 rounded-full border border-indigo-500 bg-black/60 overflow-hidden flex items-center justify-center">
                  <RoleIcon icon={r1.icon || `/icons/${r1.id}.png`} className="w-full h-full object-contain" />
                </div>
                <div className="w-8 h-8 rounded-full border border-indigo-500 bg-black/60 overflow-hidden flex items-center justify-center">
                  <RoleIcon icon={r2.icon || `/icons/${r2.id}.png`} className="w-full h-full object-contain" />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-indigo-300">{r1.name}</span>
                    <span className="text-slate-500 text-xs font-bold">✕</span>
                    <span className="font-bold text-xs text-indigo-300">{r2.name}</span>
                    <span className="text-[10px] px-1.5 py-0.2 bg-indigo-900/40 text-indigo-300 rounded border border-indigo-700/50">自訂</span>
                  </div>
                  <button
                    onClick={() => onRemoveCustomJinx(idx)}
                    className="text-red-400 hover:text-red-300 opacity-60 group-hover:opacity-100 transition-opacity text-xs"
                    title="刪除相剋規則"
                  >
                    ✕
                  </button>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">{jinx.reason}</p>
              </div>
            </div>
          );
        })}

        {activeOfficialJinxes.length === 0 && customJinxes.length === 0 && (
          <div className="text-center py-6 text-slate-500 text-xs">
            目前所選的角色之間沒有相剋規則
          </div>
        )}
      </div>
    </div>
  );
};
