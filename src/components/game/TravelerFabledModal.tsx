import { useRef, useState } from "react";
import { Modal } from "../common/Modal";
import type { Script, Role } from "../../data/types";
import { RoleIcon } from "../common/RoleIcon";
import { AllRoles } from "../../data/roles";
import { highlightAbility } from "../../lib/highlightAbility";

interface TravelerFabledModalProps {
  isOpen: boolean;
  onClose: () => void;
  script: Script | undefined;
}

type ExtraTab = 'traveler' | 'fabled' | 'loric';

export const TravelerFabledModal = ({ isOpen, onClose, script }: TravelerFabledModalProps) => {
  const [activeTab, setActiveTab] = useState<ExtraTab>('traveler');
  const listRef = useRef<HTMLDivElement | null>(null);
  const switchTab = (t: ExtraTab) => { setActiveTab(t); listRef.current?.scrollTo({ top: 0 }); };
  if (!isOpen || !script) return null;

  const allRolesList = Object.values(AllRoles) as Role[];

  const groups: Record<ExtraTab, { title: string; roles: Role[]; color: string; bg: string; border: string; titleBorder: string; tabActive: string }> = {
    traveler: { title: "旅行者", roles: allRolesList.filter(r => r.type === 'traveler'), color: "text-purple-400", bg: "bg-purple-900/20", border: "border-purple-900/50", titleBorder: "border-purple-500/80", tabActive: "bg-purple-600" },
    fabled: { title: "傳奇角色", roles: allRolesList.filter(r => r.type === 'fabled'), color: "text-amber-400", bg: "bg-amber-900/20", border: "border-amber-900/50", titleBorder: "border-amber-500/80", tabActive: "bg-amber-600" },
    loric: { title: "奇遇角色", roles: allRolesList.filter(r => r.type === 'loric'), color: "text-emerald-400", bg: "bg-emerald-900/20", border: "border-emerald-900/50", titleBorder: "border-emerald-500/80", tabActive: "bg-emerald-600" },
  };

  const tabOrder: ExtraTab[] = ['traveler', 'fabled', 'loric'];
  const current = groups[activeTab];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="max-w-[95vw] sm:max-w-lg lg:max-w-2xl"
      noOverlay={true}
      fullBleedOnMobile={true}
      title={""}
    >
      <div className="relative w-full h-[70svh] sm:h-auto sm:max-h-[78vh] flex flex-col">

        {/* 標題：置中、暖金色、下方淺分隔線 */}
        <h2 className="text-sm sm:text-2xl font-bold text-center tracking-[0.12em] pb-1.5 mb-2 sm:mb-3 border-b border-amber-400/20 shrink-0 text-amber-200/95 [text-shadow:0_2px_8px_rgba(0,0,0,0.55)]">
          額外角色
        </h2>

        {/* Tabs（同一列、完整顯示、不捲動、不換行） */}
        <div className="flex items-center gap-1 sm:gap-2 mb-3 sm:mb-4 shrink-0">
          {tabOrder.map(key => (
            <button
              key={key}
              onClick={() => switchTab(key)}
              className={`shrink-0 px-2 sm:px-6 py-1 sm:py-2 text-xs sm:text-lg rounded-lg font-bold whitespace-nowrap transition-all ${activeTab === key ? `${groups[key].tabActive} text-white shadow-lg sm:scale-105` : 'bg-white/10 text-white/60 hover:bg-white/20'}`}
            >
              {groups[key].title}
            </button>
          ))}
        </div>

        <div ref={listRef} className="w-full space-y-4 overflow-y-auto custom-scrollbar flex-1 min-h-0 pb-2 -mr-[10px] pr-[10px]">
          <div className="w-full">
            <h3 className={`text-[20px] font-bold ${current.color} border-b-2 ${current.titleBorder} pb-1 mb-3 mt-1 uppercase tracking-widest`}>
              {current.title}
            </h3>
            {current.roles.length === 0 ? (
              <p className="text-white/40 text-sm">目前沒有此類角色</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {current.roles.map(role => (
                  <div key={role.id} className={`flex items-start p-1.5 rounded-lg border ${current.border} ${current.bg} shadow-sm relative z-10 group/tooltip`}>
                    <div className="w-[44px] h-[44px] shrink-0 rounded-full border border-white/30 bg-black overflow-hidden mr-2 flex items-center justify-center">
                      <RoleIcon icon={role.icon} className="w-full h-full object-cover bg-[radial-gradient(circle_at_center,_#f4e5c5_0%,_#dcb37b_100%)]" />
                    </div>
                    <div className="flex flex-col min-w-0 flex-1 justify-center">
                      <span className={`text-[16px] leading-tight font-bold ${current.color} whitespace-nowrap mb-0.5`}>{role.name}</span>
                      <span className="text-[13px] leading-snug text-white/80">{highlightAbility(role.ability)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
};
