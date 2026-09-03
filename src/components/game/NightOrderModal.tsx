import { useState } from "react";
import { Modal } from "../common/Modal";
import type { Script } from "../../data/types";
import { RoleIcon } from "../common/RoleIcon";
import { AllRoles } from "../../data/roles";
import { RoleTooltip } from "../common/RoleTooltip";

interface NightOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  script: Script | undefined;
}



const RolePill = ({ item, isBottom, setHoveredRoleTooltip }: { item: any; isBottom?: boolean; setHoveredRoleTooltip: any }) => {
  const role = AllRoles[item.id as keyof typeof AllRoles];
  
  const pillStyles: Record<string, { outer: string, inner: string }> = {
    'townsfolk': { outer: 'bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.4)]', inner: 'bg-slate-900/95' },
    'outsider': { outer: 'bg-gradient-to-br from-blue-500 from-10% to-red-900 to-90% shadow-[0_0_10px_rgba(96,165,250,0.4)]', inner: 'bg-slate-900/95' },
    'minion': { outer: 'bg-red-800 shadow-[0_0_10px_rgba(153,27,27,0.4)]', inner: 'bg-slate-900/95' },
    'demon': { outer: 'bg-[linear-gradient(135deg,#7f1d1d_0%,#ef4444_25%,#fef08a_40%,#ffffff_50%,#fef08a_60%,#ef4444_75%,#7f1d1d_100%)] shadow-[0_0_20px_rgba(239,68,68,0.8)] ring-1 ring-red-500/50', inner: 'bg-neutral-900/95 shadow-[inset_0_0_25px_rgba(239,68,68,0.7)]' },
    'info': { outer: 'bg-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.4)]', inner: 'bg-slate-900/95' }
  };

  const type = role?.type || item.type || 'info';
  const style = pillStyles[type] || pillStyles['info'];

  let reminderText = isBottom
    ? (role?.otherNightReminder || item.otherNightReminder || '')
    : (role?.firstNightReminder || item.firstNightReminder || '');

  if (!reminderText) {
    reminderText = role?.ability || item.ability || '';
  }

  const tooltipRole = {
    ...(role || item),
    ability: reminderText,
  };

  return (
    <div 
      className={`p-[2px] rounded-lg w-[80px] shrink-0 shadow-lg group hover:-translate-y-1 transition-transform relative ${style.outer}`}
      onMouseEnter={(e) => { const rect = e.currentTarget.getBoundingClientRect(); setHoveredRoleTooltip({ role: tooltipRole, x: rect.left + rect.width / 2, y: rect.bottom }); }}
      onMouseLeave={() => setHoveredRoleTooltip(null)}
    >
      <div className={`flex flex-col items-center px-[3px] pt-[3px] pb-2 rounded-[6px] w-full h-full ${style.inner}`}>
        
        {!isBottom && <div className="absolute bottom-[-10px] left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-white/20"></div>}
        {isBottom && <div className="absolute top-[-10px] left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-white/20"></div>}

        <div className="w-[70px] h-[70px] rounded-full border-2 border-white/30 bg-black mb-1 flex items-center justify-center shrink-0 relative overflow-visible">
          <div className="w-full h-full rounded-full overflow-hidden absolute inset-0 flex items-center justify-center">
            {role ? (
              <RoleIcon icon={role.icon} className="w-full h-full object-cover bg-[radial-gradient(circle_at_center,_#f4e5c5_0%,_#dcb37b_100%)]" />
            ) : (
              <span className="text-3xl font-bold font-serif text-white/80">{item.id === 'minion_info' ? 'M' : 'D'}</span>
            )}
          </div>
        </div>

        <span className="text-xs font-bold text-white text-center leading-tight mt-1">{item.name}</span>
      </div>
    </div>
  );
};

export const NightOrderModal = ({ isOpen, onClose, script }: NightOrderModalProps) => {
  const [hoveredRoleTooltip, setHoveredRoleTooltip] = useState<{ role: any, x: number, y: number } | null>(null);

  if (!isOpen || !script) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="max-w-[90vw]" noOverlay={true} title={""}>
      <div className="relative w-full h-auto max-h-[85vh] flex flex-col">
        {/* Floating Title */}
        <div className="absolute -top-[30px] right-2 z-50 pointer-events-none drop-shadow-xl text-right">
          <h2 className="text-2xl md:text-3xl font-bold text-[#ff6b6b] opacity-90 drop-shadow-[0_4px_8px_rgba(0,0,0,0.9)] [text-shadow:_1px_2px_4px_rgba(0,0,0,0.8)] whitespace-nowrap">
            {script.name} - 角色順序表
          </h2>
        </div>

        <div className="w-full py-4 mt-6 flex flex-col overflow-hidden">
          <div className="flex flex-col items-center w-full px-4 pb-4">
            
            {/* 上方：首夜 */}
            <div className="w-full overflow-x-auto overflow-y-hidden custom-scrollbar mb-2 relative pb-2 pt-1" onWheel={(e) => { e.currentTarget.scrollLeft += e.deltaY; }}>
              <div className="flex items-end gap-3 w-max mx-auto px-4">
                {[
                  { id: 'minion_info', name: '爪牙資訊', type: 'info', firstNight: 2000, firstNightReminder: '如果場上有7名或更多玩家：喚醒所有爪牙。向他們展示「這是惡魔」資訊標記，然後指出惡魔玩家。讓爪牙重新閉眼。' },
                  { id: 'demon_info', name: '惡魔資訊', type: 'info', firstNight: 3000, firstNightReminder: '如果場上有7名或更多玩家：喚醒惡魔。向其展示「這些是你的爪牙」資訊標記，然後指出所有爪牙玩家。向其展示「這些角色不在場」資訊標記，然後向其展示3個不在場的善良角色標記。讓惡魔重新閉眼。' },
                  ...[...script.roles]
                ]
                  .filter(r => (r.firstNight ?? 0) > 0)
                  .sort((a, b) => (a.firstNight!) - (b.firstNight!))
                  .map((item, idx) => (
                  <div key={`first-${item.id}-${idx}`} className="flex flex-col items-center">
                    <span className="text-[14pt] text-white/60 mb-2 font-bold">{idx + 1}</span>
                    <RolePill item={item} setHoveredRoleTooltip={setHoveredRoleTooltip} />
                  </div>
                ))}
              </div>
            </div>

            {/* 中央：時間軸箭頭 */}
            <div className="flex items-center w-full my-6 relative px-8 shrink-0 max-w-5xl">
              <span className="text-2xl font-bold text-indigo-400 tracking-widest mr-6 drop-shadow-[0_0_10px_rgba(99,102,241,0.5)] whitespace-nowrap">黑夜</span>
              <div className="flex-1 h-2 bg-gradient-to-r from-indigo-600 via-purple-500 to-yellow-500 relative flex justify-center items-center rounded-full shadow-[0_0_15px_rgba(255,255,255,0.2)]">
                 
                 <span className="absolute -top-8 text-xl font-bold text-indigo-300 tracking-widest drop-shadow-md">首夜</span>
                 <span className="absolute -bottom-8 text-xl font-bold text-indigo-300 tracking-widest drop-shadow-md">其他夜晚</span>
                 
                 {/* 箭頭頭部 */}
                 <div className="absolute right-[-4px] top-1/2 -translate-y-1/2 w-6 h-6 border-t-4 border-r-4 border-yellow-400 transform rotate-45 translate-x-2"></div>
              </div>
              <span className="text-2xl font-bold text-yellow-500 tracking-widest ml-8 drop-shadow-[0_0_10px_rgba(234,179,8,0.5)] whitespace-nowrap">白天</span>
            </div>

            {/* 下方：其他夜晚 */}
            <div className="w-full overflow-x-auto overflow-y-hidden custom-scrollbar mt-2 relative pt-2 pb-1" onWheel={(e) => { e.currentTarget.scrollLeft += e.deltaY; }}>
              <div className="flex items-start gap-3 w-max mx-auto px-4">
                {[...script.roles].filter(r => (r.otherNight ?? 0) > 0).sort((a, b) => (a.otherNight!) - (b.otherNight!))
                  .map((item, idx) => (
                  <div key={`other-${item.id}-${idx}`} className="flex flex-col items-center">
                    <RolePill item={item} isBottom={true} setHoveredRoleTooltip={setHoveredRoleTooltip} />
                    <span className="text-[14pt] text-white/60 mt-2 font-bold">{idx + 1}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      <RoleTooltip hoveredRole={hoveredRoleTooltip} />
    </Modal>
  );
};
