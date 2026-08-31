import { Modal } from "../common/Modal";
import type { Script, Role } from "../../data/types";
import { RoleIcon } from "../common/RoleIcon";
import { AllRoles } from "../../data/roles";

interface TravelerFabledModalProps {
  isOpen: boolean;
  onClose: () => void;
  script: Script | undefined;
}

export const TravelerFabledModal = ({ isOpen, onClose, script }: TravelerFabledModalProps) => {
  if (!isOpen || !script) return null;

  const allRolesList = Object.values(AllRoles) as Role[];
  const travelers = allRolesList.filter(r => r.type === 'traveler');
  const fabled = allRolesList.filter(r => r.type === 'fabled');

  const renderGroups = [
    { title: "旅行者", roles: travelers, color: "text-purple-400", bg: "bg-purple-900/20", border: "border-purple-900/50", titleBorder: "border-purple-500/80" },
    { title: "傳奇角色", roles: fabled, color: "text-amber-400", bg: "bg-amber-900/20", border: "border-amber-900/50", titleBorder: "border-amber-500/80" }
  ];

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      maxWidth="max-w-[80vw]" 
      noOverlay={true}
      title={""}
    >
      <div className="relative w-full h-[75vh] flex flex-col -mt-5 -mb-5">
        
        {/* Floating Title */}
        <div className="absolute -top-[15px] right-2 z-50 pointer-events-none drop-shadow-xl text-right">
          <h2 className="text-2xl md:text-3xl font-bold text-[#ff6b6b] opacity-90 drop-shadow-[0_4px_8px_rgba(0,0,0,0.9)] [text-shadow:_1px_2px_4px_rgba(0,0,0,0.8)] whitespace-nowrap">
            旅行者 & 傳奇角色
          </h2>
        </div>

        <div className="w-full space-y-4 mt-8 overflow-y-auto custom-scrollbar flex-1 pb-4">
          {renderGroups.map((group, idx) => {
            if (group.roles.length === 0) return null;
            return (
              <div key={idx} className="w-full">
                <h3 className={`text-[20px] font-bold ${group.color} border-b-2 ${group.titleBorder} pb-1 mb-3 mt-1 uppercase tracking-widest`}>
                  {group.title}
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {group.roles.map(role => (
                    <div key={role.id} className={`flex items-start p-1.5 rounded-lg border ${group.border} ${group.bg} shadow-sm relative z-10 group/tooltip`}>
                      <div className="w-[44px] h-[44px] shrink-0 rounded-full border border-white/30 bg-black overflow-hidden mr-2 flex items-center justify-center">
                        <RoleIcon icon={role.icon} className="w-full h-full object-cover bg-[radial-gradient(circle_at_center,_#f4e5c5_0%,_#dcb37b_100%)]" />
                      </div>
                      <div className="flex flex-col min-w-0 flex-1 justify-center">
                        <span className={`text-[16px] leading-tight font-bold ${group.color} whitespace-nowrap mb-0.5`}>{role.name}</span>
                        {role.abilityHTML ? (
                          <span className="text-[13px] leading-snug text-white/80" dangerouslySetInnerHTML={{ __html: role.abilityHTML }} />
                        ) : (
                          <span className="text-[13px] leading-snug text-white/80">{role.ability}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Modal>
  );
};
