import { Modal } from "../common/Modal";
import type { Script } from "../../data/types";
import { RoleIcon } from "../common/RoleIcon";
import { highlightAbility } from "../../lib/highlightAbility";

interface ScriptInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  script: Script | undefined;
}

export const ScriptInfoModal = ({ isOpen, onClose, script }: ScriptInfoModalProps) => {
  if (!script) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={""}>
      <div className="relative max-h-[70vh] overflow-y-auto pr-2 space-y-8 text-white/90">
        
        {/* Floating Title */}
        <div className="absolute -top-4 right-0 z-50 pointer-events-none drop-shadow-xl text-right">
          <h2 className="text-2xl md:text-3xl font-bold text-slate-200 opacity-90 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
            {script.name} - 角色資訊
          </h2>
        </div>

        <p className="text-sm text-white/60 pb-4 border-b border-white/20 leading-[1.5] text-left relative z-10">
          {script.description}
        </p>

        {(['townsfolk', 'outsider', 'minion', 'demon'] as const).map(type => {
          const roles = script.roles.filter(r => r.type === type);
          if (roles.length === 0) return null;
          
          const typeName = type === 'townsfolk' ? '鎮民' : type === 'outsider' ? '外來者' : type === 'minion' ? '爪牙' : '惡魔';
          const colorClass = (type === 'demon' || type === 'minion') ? 'text-red-400' : 'text-blue-300';

          return (
            <div key={type} className="space-y-3 relative z-10">
              <h3 className={`text-lg font-bold ${colorClass} border-l-4 border-current pl-2`}>{typeName}</h3>
              <div className="flex flex-wrap gap-4 items-start">
                {roles.map(role => {
                  const isEvil = role.alignment === 'evil';
                  return (
                    <div key={role.id} className="flex flex-col items-center w-16 sm:w-20 group relative cursor-help">
                      <div className="w-14 h-14 shrink-0 bg-[radial-gradient(circle_at_center,_#f4e5c5_0%,_#dcb37b_100%)] rounded-full flex items-center justify-center shadow-md border-2 border-white/20 relative">
                        <RoleIcon icon={role.icon} className="w-full h-full object-cover rounded-full transition-transform group-hover:scale-110" />
                      </div>
                      <span className={`mt-2 text-xs font-bold text-center leading-tight ${isEvil ? 'text-red-400' : 'text-blue-300'}`}>
                        {role.name}
                      </span>
                      
                      {/* Tooltip for ability */}
                      <div className="absolute top-[105%] left-1/2 -translate-x-1/2 mt-1 w-56 bg-slate-900 border border-slate-500 text-white p-3 rounded-lg shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50 pointer-events-none">
                        <div className={`font-bold mb-1 ${isEvil ? 'text-red-400' : 'text-blue-300'}`}>{role.name}</div>
                        <div className="text-xs text-white/90 leading-relaxed text-left">{highlightAbility(role.ability)}</div>
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
