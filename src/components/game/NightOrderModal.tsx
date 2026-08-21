import { Modal } from "../common/Modal";
import type { Script } from "../../data/scripts";
import { RoleIcon } from "../common/RoleIcon";
import { AllRoles } from "../../data/roles";

interface NightOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  script: Script | undefined;
}



const RolePill = ({ item, isBottom }: { item: any; isBottom?: boolean }) => {
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

  let abilityHTML = role?.abilityHTML || role?.ability || '';
  if (item.id === 'minion_info') {
    abilityHTML = '如果場上有爪牙玩家，你得知<span class="highlight-evil">惡魔</span>以及其他爪牙偽裝的身分。';
  } else if (item.id === 'demon_info') {
    abilityHTML = '如果場上有爪牙玩家，惡魔會得知<span class="highlight-evil">爪牙</span>，並得知三個不在場的<span class="highlight-good">善良陣營</span>角色。';
  }

  return (
    <div className={`p-[2px] rounded-lg w-[80px] shrink-0 shadow-lg group hover:-translate-y-1 transition-transform relative ${style.outer}`}>
      <div className={`flex flex-col items-center px-[3px] pt-[3px] pb-2 rounded-[6px] w-full h-full ${style.inner}`}>
        
        {/* Tooltip */}
        <div className={`absolute ${isBottom ? 'top-full mt-2' : 'bottom-full mb-2'} left-1/2 -translate-x-1/2 w-48 bg-slate-800/95 border-2 border-slate-500 text-white text-xs leading-relaxed p-3 rounded-lg shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-[100] pointer-events-none`}>
          <div dangerouslySetInnerHTML={{ __html: abilityHTML }} />
        </div>

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
  if (!isOpen || !script) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="max-w-[80vw]" noOverlay={true} title={`${script.name} - 角色順序表`}>
      <div className="w-full py-6">
        <div className="flex flex-col items-center">
          
          {/* 上方：首夜 */}
          <div className="flex items-end gap-3 mb-6">
            {script.firstNight?.map((item, idx) => (
              <div key={`first-${idx}`} className="flex flex-col items-center">
                <span className="text-[14pt] text-white/60 mb-2 font-bold">{idx + 1}</span>
                <RolePill item={item} />
              </div>
            ))}
          </div>

          {/* 中央：時間軸箭頭 */}
          <div className="flex items-center w-full my-6 relative px-8">
            <span className="text-3xl font-bold text-indigo-400 tracking-widest mr-6 drop-shadow-[0_0_10px_rgba(99,102,241,0.5)]">黑夜</span>
            <div className="flex-1 h-2 bg-gradient-to-r from-indigo-600 via-purple-500 to-yellow-500 relative flex justify-center items-center rounded-full shadow-[0_0_15px_rgba(255,255,255,0.2)]">
               
               <span className="absolute -top-10 text-2xl font-bold text-indigo-300 tracking-widest drop-shadow-md">首夜</span>
               <span className="absolute -bottom-10 text-2xl font-bold text-indigo-300 tracking-widest drop-shadow-md">其他夜晚</span>
               
               {/* 箭頭頭部 */}
               <div className="absolute right-[-4px] top-1/2 -translate-y-1/2 w-6 h-6 border-t-4 border-r-4 border-yellow-400 transform rotate-45 translate-x-2"></div>
            </div>
            <span className="text-3xl font-bold text-yellow-500 tracking-widest ml-8 drop-shadow-[0_0_10px_rgba(234,179,8,0.5)]">白天</span>
          </div>

          {/* 下方：其他夜晚 */}
          <div className="flex items-start gap-3 mt-6">
            {script.otherNight?.map((item, idx) => (
              <div key={`other-${idx}`} className="flex flex-col items-center">
                <RolePill item={item} isBottom={true} />
                <span className="text-[14pt] text-white/60 mt-2 font-bold">{idx + 1}</span>
              </div>
            ))}
          </div>

        </div>
      </div>
    </Modal>
  );
};
