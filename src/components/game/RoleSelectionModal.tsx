import { useState } from "react";
import { createPortal } from "react-dom";
import { Modal } from "../common/Modal";
import type { Script } from "../../data/scripts";
import type { Role } from "../../data/roles";
import { AllRoles } from "../../data/roles";
import { RoleIcon } from "../common/RoleIcon";

interface RoleSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (roleId: string | null) => void;
  script: Script | null;
  filterType?: 'fabled' | 'normal';
  selectedFabled?: string[];
}

export const RoleSelectionModal = ({ isOpen, onClose, onSelect, script, filterType = 'normal', selectedFabled = [] }: RoleSelectionModalProps) => {
  const [hoveredRole, setHoveredRole] = useState<{role: Role, x: number, y: number} | null>(null);

  if (!isOpen) return null;

  const handleSelect = (roleId: string | null) => {
    onSelect(roleId);
    if (filterType !== 'fabled') {
      onClose();
    }
  };

  const handleMouseEnter = (e: React.MouseEvent, role: Role) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setHoveredRole({ role, x: rect.left + rect.width / 2, y: rect.bottom });
  };

  const renderRoleGroup = (title: string, roles: Role[], isEvil: boolean, isFabled: boolean = false) => {
    if (roles.length === 0) return null;
    return (
      <div className="mb-6">
        <h4 className={`text-lg font-bold mb-3 border-b pb-2 px-3 pt-2 rounded-t-md ${isFabled ? 'text-yellow-400 border-yellow-600/50 bg-yellow-900/40' : isEvil ? 'text-red-300 border-red-900/50 bg-red-900/40' : 'text-blue-200 border-blue-900/50 bg-blue-900/40'}`}>
          {title}
        </h4>
        <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-2">
          {roles.map(role => {
            const isSelected = isFabled && selectedFabled.includes(role.id);
            return (
              <div key={role.id} className="relative flex flex-col items-center group">
                <button
                  onClick={() => handleSelect(role.id)}
                  onMouseEnter={(e) => handleMouseEnter(e, role)}
                  onMouseLeave={() => setHoveredRole(null)}
                  className="flex flex-col items-center focus:outline-none w-full relative"
                >
                  <div className="relative transition-transform group-hover:scale-110">
                    <div className={`w-[116px] h-[116px] rounded-full border-[2px] flex items-center justify-center overflow-hidden bg-[radial-gradient(circle_at_center,_#f4e5c5_0%,_#dcb37b_100%)] shadow-md ${
                      isSelected 
                        ? 'border-yellow-400 shadow-[0_0_15px_rgba(250,204,21,0.6)]' 
                        : isFabled 
                          ? 'border-yellow-600/80' 
                          : isEvil 
                            ? 'border-red-900/80' 
                            : 'border-blue-900/80'
                    }`}>
                      <RoleIcon icon={role.icon} className="w-full h-full object-cover" />
                    </div>
                    {isSelected && (
                      <div className="absolute -bottom-1 -left-1 w-8 h-8 bg-green-500 rounded-full border-2 border-black flex items-center justify-center shadow-[0_0_10px_rgba(34,197,94,0.6)] z-10">
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                      </div>
                    )}
                  </div>
                  <span className={`text-base mt-1.5 text-center truncate w-full ${isFabled ? 'text-yellow-200' : isEvil ? 'text-red-200' : 'text-blue-100'}`}>
                    {role.name}
                  </span>
                </button>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  let content;
  if (filterType === 'fabled') {
    const fabledRoles = Object.values(AllRoles).filter(r => r.type === 'fabled');
    content = renderRoleGroup("傳奇角色", fabledRoles as Role[], false, true);
  } else {
    if (!script) return null;
    const townsfolk = script.roles.filter(r => r.type === 'townsfolk');
    const outsider = script.roles.filter(r => r.type === 'outsider');
    const minion = script.roles.filter(r => r.type === 'minion');
    const demon = script.roles.filter(r => r.type === 'demon');

    content = (
      <>
        {renderRoleGroup("鎮民", townsfolk, false)}
        {renderRoleGroup("外來者", outsider, false)}
        {renderRoleGroup("爪牙", minion, true)}
        {renderRoleGroup("惡魔", demon, true)}
      </>
    );
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="max-w-5xl" title={filterType === 'fabled' ? "選擇傳奇角色" : "選擇角色"}>
      <div className="relative">
        <div className="max-h-[70vh] overflow-y-auto px-2 pb-8">
          {content}
        </div>
      </div>
      {hoveredRole && document.body && createPortal(
        <div className="fixed z-[99999] w-64 bg-slate-900/95 p-3 text-sm border-2 border-slate-500 rounded-xl shadow-2xl pointer-events-none text-left"
            style={{ left: hoveredRole.x, top: hoveredRole.y + 15, transform: 'translateX(-50%)' }}
          >
            <div className="text-white/80 font-bold leading-relaxed" dangerouslySetInnerHTML={{ __html: hoveredRole.role.abilityHTML || hoveredRole.role.ability }} />
          </div>,
        document.body
      )}
    </Modal>
  );
};
