import { Modal } from '../common/Modal';
import { AllScripts } from '../../data/scripts';
import { RoleIcon } from '../common/RoleIcon';

interface ScriptSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentScriptId: string;
  onSelect?: (scriptId: string) => void;
  readOnly?: boolean;
  onViewRoleInfo?: (scriptId: string) => void;
}

export const ScriptSelectionModal = ({ isOpen, onClose, currentScriptId, onSelect, readOnly, onViewRoleInfo }: ScriptSelectionModalProps) => {
  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="" maxWidth="max-w-[95vw] lg:max-w-6xl">
      <div className="flex flex-wrap justify-center gap-6 p-4 pt-6">
        {Object.keys(AllScripts).map(key => {
          const script = AllScripts[key];
          const isSelected = key === currentScriptId;
          
          return (
            <div 
              key={key} 
              className="relative group/card w-[280px] h-[310px] z-10 hover:z-50"
            >
              {/* Base Card (Front) */}
              <div 
                className={`absolute inset-0 z-30 flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all shadow-xl bg-slate-900 ${!readOnly ? 'cursor-pointer' : 'cursor-default'} ${
                  isSelected 
                    ? 'border-indigo-400 shadow-[0_0_20px_rgba(99,102,241,0.5)]' 
                    : 'border-slate-500 hover:border-slate-300'
                }`}
                onClick={() => { if(!readOnly && onSelect) { onSelect(key); onClose(); } else if (readOnly && onViewRoleInfo) { onViewRoleInfo(key); } }}
              >
                {isSelected && (
                  <div className="absolute top-0 right-0 bg-indigo-500 text-white text-[10px] font-bold px-3 py-1 rounded-bl-xl rounded-tr-xl z-40 shadow-md">
                    目前使用
                  </div>
                )}
                
                <img 
                  src={`/drama/Drama_${key}.png`} 
                  alt={script.name} 
                  className="w-full max-h-[160px] object-contain mb-3 drop-shadow-[0_0_15px_rgba(255,255,255,0.15)] group-hover/card:scale-105 transition-transform duration-300"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    e.currentTarget.nextElementSibling?.classList.remove('hidden');
                  }}
                />
                <svg className="hidden w-full max-h-[160px] text-slate-500 mb-3 opacity-80 group-hover/card:scale-105 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>
                </svg>

                {/* Default Info (Hides on hover) */}
                <div className="flex flex-col items-center transition-all duration-300 overflow-hidden max-h-[100px] opacity-100 group-hover/card:max-h-0 group-hover/card:opacity-0 group-hover/card:m-0">
                  <h3 className="text-lg font-bold text-[#ff6b6b] leading-tight drop-shadow-md text-center mb-2">{script.name}</h3>
                  <div className="flex gap-2">
                    <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-sky-900/60 border border-sky-700/50 text-sky-200 shadow-inner whitespace-nowrap">
                      難易度: {script.category || '基礎'}
                    </span>
                    <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-amber-900/60 border border-amber-700/50 text-amber-200 shadow-inner whitespace-nowrap">
                      {script.playerCount || '5~15人'}
                    </span>
                  </div>
                </div>

                {/* Description (Shows on hover) */}
                <div className="overflow-hidden transition-all duration-300 max-h-0 opacity-0 group-hover/card:max-h-[100px] group-hover/card:opacity-100 w-full px-2 group-hover/card:mt-2">
                  <p className="text-xs text-slate-300 line-clamp-4 leading-relaxed text-center w-full">
                    {script.description}
                  </p>
                </div>
              </div>

              {/* Single Drawer (Roles Slider) */}
              <div className="absolute inset-0 z-20 transition-transform duration-500 ease-[cubic-bezier(0.2,0.8,0.2,1)] group-hover/card:translate-x-[calc(100%-16px)] rounded-2xl pointer-events-none group-hover/card:pointer-events-auto">
                <div className="absolute inset-0 bg-slate-900 border-2 border-slate-600 rounded-2xl p-5 opacity-0 group-hover/card:opacity-100 transition-opacity duration-300 shadow-[20px_0_30px_rgba(0,0,0,0.5)] flex flex-col pt-6 pl-8">
                  <h4 className="text-lg font-bold text-amber-500 mb-3 drop-shadow-[0_4px_8px_rgba(0,0,0,0.9)] [text-shadow:_1px_2px_4px_rgba(0,0,0,0.8)]">出場角色</h4>
                  <div className="flex-1 overflow-y-auto custom-scrollbar pr-1 content-start">
                    <div className="flex gap-2 flex-wrap">
                      {script.roles.filter(Boolean).map((r, idx) => (
                        <div key={r.id || idx} className="w-9 h-9 rounded-full bg-black overflow-hidden border-2 border-slate-700 hover:border-slate-300 transition-colors shadow-sm relative group/tooltip" title={r.name || '未知角色'}>
                          {r.icon ? <RoleIcon icon={r.icon} className="w-full h-full object-cover bg-[radial-gradient(circle_at_center,_#f4e5c5_0%,_#dcb37b_100%)]" /> : null}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

            </div>
          );
        })}
      </div>
    </Modal>
  );
};
