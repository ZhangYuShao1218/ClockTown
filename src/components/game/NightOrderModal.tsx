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

/** 手機用：只保留角色 Icon + 底板依陣營上色，外側寫「順序. 名字」 */
const factionRowStyle = (type: string) => {
  if (type === 'townsfolk' || type === 'outsider') return 'bg-blue-800/75 border-blue-300/45';
  if (type === 'minion' || type === 'demon') return 'bg-red-800/75 border-red-300/45';
  if (type === 'traveler') return 'bg-purple-800/75 border-purple-300/45';
  if (type === 'fabled') return 'bg-amber-700/75 border-amber-300/45';
  if (type === 'loric') return 'bg-emerald-800/75 border-emerald-300/45';
  return 'bg-slate-700/80 border-slate-300/40'; // info（爪牙/惡魔資訊）
};

const MobileNightRow = ({ item, idx, iconSide, isBottom, setHoveredRoleTooltip }: { item: any; idx: number; iconSide: 'left' | 'right'; isBottom?: boolean; setHoveredRoleTooltip: any }) => {
  const role = AllRoles[item.id as keyof typeof AllRoles];
  const type = role?.type || item.type || 'info';
  const name = role?.name || item.name;
  let reminderText = isBottom
    ? (role?.otherNightReminder || item.otherNightReminder || '')
    : (role?.firstNightReminder || item.firstNightReminder || '');
  if (!reminderText) reminderText = role?.ability || item.ability || '';
  const tooltipRole = { ...(role || item), ability: reminderText };

  const icon = (
    <div className="w-[52px] h-[52px] shrink-0 rounded-full bg-[#1c1408] border-2 border-amber-200/40 overflow-hidden flex items-center justify-center">
      {role
        ? <RoleIcon icon={role.icon} className="w-full h-full object-cover bg-[radial-gradient(circle_at_center,_#f4e5c5_0%,_#dcb37b_100%)]" />
        : <span className="text-lg font-bold font-serif text-amber-100/90">{item.id === 'minion_info' ? 'M' : 'D'}</span>}
    </div>
  );
  const label = (
    <div className={`min-w-0 flex-1 leading-tight ${iconSide === 'left' ? 'text-left pr-0.5' : 'text-right pl-0.5'}`}>
      <span className="text-amber-200/90 font-bold text-[14px] mr-0.5">{idx + 1}.</span>
      <span className="text-white font-bold text-[13px] break-all">{name}</span>
    </div>
  );

  return (
    <div
      className={`flex items-center gap-1.5 w-full rounded-lg border px-1.5 py-1 shrink-0 shadow ${factionRowStyle(type)}`}
      onClick={(e) => { const r = (e.currentTarget as HTMLElement).getBoundingClientRect(); setHoveredRoleTooltip({ role: tooltipRole, x: r.left + r.width / 2, y: r.bottom }); }}
    >
      {iconSide === 'left' ? <>{icon}{label}</> : <>{label}{icon}</>}
    </div>
  );
};

const MINION_INFO = { id: 'minion_info', name: '爪牙資訊', type: 'info', firstNight: 5.5, firstNightReminder: '如果場上有7名或更多玩家：喚醒所有爪牙。向他們展示「這是惡魔」資訊標記，然後指出惡魔玩家。讓爪牙重新閉眼。' };
const DEMON_INFO = { id: 'demon_info', name: '惡魔資訊', type: 'info', firstNight: 6.5, firstNightReminder: '如果場上有7名或更多玩家：喚醒惡魔。向其展示「這些是你的爪牙」資訊標記，然後指出所有爪牙玩家。向其展示「這些角色不在場」資訊標記，然後向其展示3個不在場的善良角色標記。讓惡魔重新閉眼。' };

export const NightOrderModal = ({ isOpen, onClose, script }: NightOrderModalProps) => {
  const [hoveredRoleTooltip, setHoveredRoleTooltip] = useState<{ role: any, x: number, y: number } | null>(null);

  if (!isOpen || !script) return null;

  const firstNightList = [MINION_INFO, DEMON_INFO, ...script.roles]
    .filter(r => (r.firstNight ?? 0) > 0)
    .sort((a, b) => (a.firstNight!) - (b.firstNight!));
  const otherNightList = [...script.roles]
    .filter(r => (r.otherNight ?? 0) > 0)
    .sort((a, b) => (a.otherNight!) - (b.otherNight!));

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="max-w-[calc(100vw-20px)] sm:max-w-2xl lg:max-w-3xl xl:max-w-4xl" noOverlay={true} fullBleedOnMobile={true} bodyPad="p-2.5 sm:p-4" title={""}>
      <div className="relative w-full h-[70svh] sm:h-auto sm:max-h-[85vh] flex flex-col">

        {/* 標題：置中、暖金色、下方淺分隔線（與角色資訊 / 額外角色一致） */}
        <h2 className="text-sm sm:text-2xl font-bold text-center tracking-[0.12em] pb-1.5 mb-2 border-b border-amber-400/20 shrink-0 text-amber-200/95 [text-shadow:0_2px_8px_rgba(0,0,0,0.55)]">
          {script.name} - 角色順序表
        </h2>

        {/* 手機：左首夜 / 右其他夜，中間垂直箭頭 */}
        <div className="flex sm:hidden gap-1 flex-1 min-h-0">
          <div className="flex-1 min-w-0 flex flex-col">
            <div className="text-center text-sm font-bold pb-1 shrink-0 text-indigo-300">首夜</div>
            <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar flex flex-col gap-1.5 py-1 pr-0.5">
              {firstNightList.map((item, idx) => (
                <MobileNightRow key={`m-first-${item.id}-${idx}`} item={item} idx={idx} iconSide="right" setHoveredRoleTooltip={setHoveredRoleTooltip} />
              ))}
            </div>
          </div>

          <div className="w-2.5 shrink-0 flex flex-col items-center pt-6 pb-2">
            <div className="w-1 flex-1 bg-gradient-to-b from-indigo-500 via-purple-500 to-yellow-500 rounded-full shadow-[0_0_8px_rgba(255,255,255,0.2)]" />
            <div className="w-2.5 h-2.5 border-b-2 border-r-2 border-yellow-400 rotate-45 -mt-1.5" />
          </div>

          <div className="flex-1 min-w-0 flex flex-col">
            <div className="text-center text-sm font-bold pb-1 shrink-0 text-yellow-400">其他夜晚</div>
            <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar flex flex-col gap-1.5 py-1 pl-0.5">
              {otherNightList.map((item, idx) => (
                <MobileNightRow key={`m-other-${item.id}-${idx}`} item={item} idx={idx} iconSide="left" isBottom setHoveredRoleTooltip={setHoveredRoleTooltip} />
              ))}
            </div>
          </div>
        </div>

        {/* 桌機：上首夜 / 下其他夜，中間橫向箭頭 */}
        <div className="hidden sm:flex flex-col items-center w-full px-2.5 pt-1 overflow-hidden">
          <div className="w-full overflow-x-auto overflow-y-hidden custom-scrollbar mb-2 relative pb-2 pt-1" onWheel={(e) => { e.currentTarget.scrollLeft += e.deltaY; }}>
            <div className="flex items-end gap-3 w-max mx-auto px-2.5">
              {firstNightList.map((item, idx) => (
                <div key={`first-${item.id}-${idx}`} className="flex flex-col items-center">
                  <span className="text-[14pt] text-white/60 mb-2 font-bold">{idx + 1}</span>
                  <RolePill item={item} setHoveredRoleTooltip={setHoveredRoleTooltip} />
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center w-full my-4 relative px-8 shrink-0 max-w-5xl">
            <span className="text-2xl font-bold text-indigo-400 tracking-widest mr-6 drop-shadow-[0_0_10px_rgba(99,102,241,0.5)] whitespace-nowrap">黑夜</span>
            <div className="flex-1 h-2 bg-gradient-to-r from-indigo-600 via-purple-500 to-yellow-500 relative flex justify-center items-center rounded-full shadow-[0_0_15px_rgba(255,255,255,0.2)]">
              <span className="absolute -top-8 text-xl font-bold text-indigo-300 tracking-widest drop-shadow-md">首夜</span>
              <span className="absolute -bottom-8 text-xl font-bold text-indigo-300 tracking-widest drop-shadow-md">其他夜晚</span>
              <div className="absolute right-[-4px] top-1/2 -translate-y-1/2 w-6 h-6 border-t-4 border-r-4 border-yellow-400 transform rotate-45 translate-x-2"></div>
            </div>
            <span className="text-2xl font-bold text-yellow-500 tracking-widest ml-8 drop-shadow-[0_0_10px_rgba(234,179,8,0.5)] whitespace-nowrap">白天</span>
          </div>

          <div className="w-full overflow-x-auto overflow-y-hidden custom-scrollbar mt-1 relative pt-1 pb-0" onWheel={(e) => { e.currentTarget.scrollLeft += e.deltaY; }}>
            <div className="flex items-start gap-3 w-max mx-auto px-2.5">
              {otherNightList.map((item, idx) => (
                <div key={`other-${item.id}-${idx}`} className="flex flex-col items-center">
                  <RolePill item={item} isBottom={true} setHoveredRoleTooltip={setHoveredRoleTooltip} />
                  <span className="text-[14pt] text-white/60 mt-2 font-bold">{idx + 1}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <RoleTooltip hoveredRole={hoveredRoleTooltip} />
    </Modal>
  );
};
