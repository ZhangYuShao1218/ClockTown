import { Modal } from "../common/Modal";
import type { Script } from "../../data/types";
import { RoleIcon } from "../common/RoleIcon";

interface ScriptInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  script: Script | undefined;
}

export const ScriptInfoModal = ({ isOpen, onClose, script }: ScriptInfoModalProps) => {
  if (!script) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={script.name}>
      <div className="max-h-[60vh] overflow-y-auto pr-2 space-y-6 text-white/90">
        <p className="text-sm text-white/60 pb-4 border-b border-white/20 leading-[1.5] text-left">
          {script.description}
        </p>

        {(['townsfolk', 'outsider', 'minion', 'demon'] as const).map(type => {
          const roles = script.roles.filter(r => r.type === type);
          if (roles.length === 0) return null;
          
          const typeName = type === 'townsfolk' ? '鎮民' : type === 'outsider' ? '外來者' : type === 'minion' ? '爪牙' : '惡魔';
          const colorClass = (type === 'demon' || type === 'minion') ? 'text-red-400' : 'text-blue-300';

          return (
            <div key={type} className="space-y-3">
              <h3 className={`text-lg font-bold ${colorClass} border-l-4 border-current pl-2`}>{typeName}</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {roles.map(role => {
                  const isEvil = role.alignment === 'evil';
                  return (
                    <div key={role.id} className="bg-white/5 border border-white/10 rounded p-3 flex space-x-3 items-start">
                      <div className="w-10 h-10 shrink-0 bg-[radial-gradient(circle_at_center,_#f4e5c5_0%,_#dcb37b_100%)] rounded-full flex items-center justify-center shadow-md">
                        <RoleIcon icon={role.icon} className="w-full h-full object-cover rounded-full" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className={`text-sm font-bold ${isEvil ? 'text-red-400' : 'text-blue-300'}`}>{role.name}</span>
                        </div>
                        {role.abilityHTML ? (
                          <p className="text-xs text-white/70 leading-[1.5] text-left" dangerouslySetInnerHTML={{ __html: role.abilityHTML }} />
                        ) : (
                          <p className="text-xs text-white/70 leading-[1.5] text-left">{role.ability}</p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </Modal>
  );
};
