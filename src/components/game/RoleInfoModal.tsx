import { Modal } from "../common/Modal";
import type { Script } from "../../data/types";
import { RoleIcon } from "../common/RoleIcon";

interface RoleInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  script: Script | undefined;
}

export const RoleInfoModal = ({ isOpen, onClose, script }: RoleInfoModalProps) => {
  if (!isOpen || !script) return null;

  // Group roles
  const townsfolk = script.roles.filter(r => r.type === 'townsfolk');
  const outsider = script.roles.filter(r => r.type === 'outsider');
  const minion = script.roles.filter(r => r.type === 'minion');
  const demon = script.roles.filter(r => r.type === 'demon');

  const groups = [
    { title: "鎮民", roles: townsfolk, color: "text-blue-300", bg: "bg-blue-900/20", border: "border-blue-900/50", titleBorder: "border-blue-500/80" },
    { title: "外來者", roles: outsider, color: "text-blue-200", bg: "bg-blue-800/20", border: "border-blue-800/50", titleBorder: "border-blue-400/80" },
    { title: "爪牙", roles: minion, color: "text-red-400", bg: "bg-red-900/20", border: "border-red-900/50", titleBorder: "border-red-500/80" },
    { title: "惡魔", roles: demon, color: "text-red-500", bg: "bg-rose-900/20", border: "border-rose-900/50", titleBorder: "border-red-600/80" },
  ];

  const flatList: any[] = [];
  groups.forEach(group => {
    if (group.roles.length > 0) {
      flatList.push({ type: 'header', title: group.title, color: group.color, border: group.border, titleBorder: group.titleBorder });
      group.roles.forEach(role => {
        flatList.push({ type: 'role', role, group });
      });
    }
  });

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      maxWidth="max-w-[80vw]" 
      noOverlay={true}
      title={`${script.name} - 角色資訊`}
    >
      <div className="p-2 w-full h-auto max-h-[85vh] overflow-hidden flex flex-col">
        <div 
          className="flex-1 w-full"
          style={{ columnCount: 4, columnGap: '1.5rem', columnRule: '2px solid rgba(255,255,255,0.3)' }}
        >
          {flatList.map((item, idx) => {
            if (item.type === 'header') {
              return (
                <h3 key={`h-${idx}`} className={`break-inside-avoid text-lg font-bold ${item.color} border-b-2 ${item.titleBorder} pb-1 mb-3 mt-1 uppercase tracking-widest`}>
                  {item.title}
                </h3>
              );
            }

            const { role, group } = item;
            return (
              <div key={role.id} className={`break-inside-avoid mb-2 flex items-start p-1.5 rounded-lg border ${group.border} ${group.bg} shadow-sm`}>
                <div className="w-10 h-10 shrink-0 rounded-full border border-white/30 bg-black overflow-hidden mr-2 flex items-center justify-center">
                  <RoleIcon icon={role.icon} className="w-full h-full object-cover bg-[radial-gradient(circle_at_center,_#f4e5c5_0%,_#dcb37b_100%)]" />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className={`text-sm font-bold ${group.color} whitespace-nowrap`}>{role.name}</span>
                  {role.abilityHTML ? (
                    <span className="text-[11px] leading-snug text-white/80" dangerouslySetInnerHTML={{ __html: role.abilityHTML }} />
                  ) : (
                    <span className="text-[11px] leading-snug text-white/80">{role.ability}</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Modal>
  );
};
