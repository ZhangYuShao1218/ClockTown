import { useState } from "react";
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
      maxWidth="max-w-[80vw]"
      noOverlay={true}
      title={""}
    >
      <div className="relative w-full h-[75vh] flex flex-col -mt-5 -mb-5">

        {/* Floating Title — 隨頁籤變化 */}
        <div className="absolute -top-[15px] right-2 z-50 pointer-events-none drop-shadow-xl text-right">
          <h2 className="text-2xl md:text-3xl font-bold text-[#ff6b6b] opacity-90 drop-shadow-[0_4px_8px_rgba(0,0,0,0.9)] [text-shadow:_1px_2px_4px_rgba(0,0,0,0.8)] whitespace-nowrap">
            {current.title}
          </h2>
        </div>

        {/* Tabs */}
        <div className="flex items-center mt-1 mb-4">
          <div className="flex space-x-3">
            {tabOrder.map(key => (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={`px-6 py-2 text-lg rounded-lg font-bold transition-all ${activeTab === key ? `${groups[key].tabActive} text-white shadow-lg scale-105` : 'bg-white/10 text-white/60 hover:bg-white/20'}`}
              >
                {groups[key].title}
              </button>
            ))}
          </div>
        </div>

        <div className="w-full space-y-4 overflow-y-auto custom-scrollbar flex-1 pb-4">
          <div className="w-full">
            <h3 className={`text-[20px] font-bold ${current.color} border-b-2 ${current.titleBorder} pb-1 mb-3 mt-1 uppercase tracking-widest`}>
              {current.title}
            </h3>
            {current.roles.length === 0 ? (
              <p className="text-white/40 text-sm">目前沒有此類角色</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
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
