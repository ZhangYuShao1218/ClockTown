import { useState } from "react";
import { Modal } from "../common/Modal";
import type { Script, Role } from "../../data/types";
import { RoleIcon } from "../common/RoleIcon";

interface RoleInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  script: Script | undefined;
}

export const RoleInfoModal = ({ isOpen, onClose, script }: RoleInfoModalProps) => {
  const [activeTab, setActiveTab] = useState<'good'|'evil'|'other'>('good');
  const [isImageViewOpen, setIsImageViewOpen] = useState(false);
  if (!isOpen || !script) return null;

  const validRoles = script.roles.filter(Boolean);
  const townsfolk = validRoles.filter(r => r.type === 'townsfolk');
  const outsider = validRoles.filter(r => r.type === 'outsider');
  const minion = validRoles.filter(r => r.type === 'minion');
  const demon = validRoles.filter(r => r.type === 'demon');
  const traveler = validRoles.filter(r => r.type === 'traveler');
  const fabled = validRoles.filter(r => r.type === 'fabled');
  const loric = validRoles.filter(r => r.type === 'loric');
  const hasOther = traveler.length > 0 || fabled.length > 0 || loric.length > 0;

  let renderGroups: { title: string, roles: Role[], color: string, bg: string, border: string, titleBorder: string }[] = [];

  if (activeTab === 'good') {
    renderGroups = [
      { title: "鎮民", roles: townsfolk, color: "text-blue-300", bg: "bg-blue-900/20", border: "border-blue-900/50", titleBorder: "border-blue-500/80" },
      { title: "外來者", roles: outsider, color: "text-blue-200", bg: "bg-blue-800/20", border: "border-blue-800/50", titleBorder: "border-blue-400/80" }
    ];
  } else if (activeTab === 'evil') {
    renderGroups = [
      { title: "爪牙", roles: minion, color: "text-red-400", bg: "bg-red-900/20", border: "border-red-900/50", titleBorder: "border-red-500/80" },
      { title: "惡魔", roles: demon, color: "text-red-500", bg: "bg-rose-900/20", border: "border-rose-900/50", titleBorder: "border-red-600/80" }
    ];
  } else if (activeTab === 'other') {
    renderGroups = [
      { title: "傳奇角色", roles: fabled, color: "text-yellow-400", bg: "bg-yellow-900/20", border: "border-yellow-700/50", titleBorder: "border-yellow-500/80" },
      { title: "旅行者", roles: traveler, color: "text-purple-300", bg: "bg-purple-900/20", border: "border-purple-800/50", titleBorder: "border-purple-500/80" },
      { title: "奇遇角色", roles: loric, color: "text-teal-300", bg: "bg-teal-900/20", border: "border-teal-800/50", titleBorder: "border-teal-500/80" }
    ];
  }

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
            {script.name} - 角色資訊
          </h2>
        </div>

        {/* Tabs and Image Button */}
        <div className="flex items-center mt-1 mb-4">
          <div className="flex space-x-3">
            <button onClick={() => setActiveTab('good')} className={`px-6 py-2 text-lg rounded-lg font-bold transition-all ${activeTab === 'good' ? 'bg-blue-600 text-white shadow-lg scale-105' : 'bg-white/10 text-white/60 hover:bg-white/20'}`}>善良</button>
            <button onClick={() => setActiveTab('evil')} className={`px-6 py-2 text-lg rounded-lg font-bold transition-all ${activeTab === 'evil' ? 'bg-red-600 text-white shadow-lg scale-105' : 'bg-white/10 text-white/60 hover:bg-white/20'}`}>邪惡</button>
            {hasOther && (
              <button onClick={() => setActiveTab('other')} className={`px-6 py-2 text-lg rounded-lg font-bold transition-all ${activeTab === 'other' ? 'bg-amber-600 text-white shadow-lg scale-105' : 'bg-white/10 text-white/60 hover:bg-white/20'}`}>其他</button>
            )}
          </div>
          <button onClick={() => setIsImageViewOpen(true)} className="ml-[30px] px-4 py-2 text-base rounded-lg font-bold transition-all bg-emerald-600/80 hover:bg-emerald-500 text-white shadow-md flex items-center gap-2 border border-emerald-400/30">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            圖片版
          </button>
        </div>

        <div className="w-full space-y-4 overflow-y-auto custom-scrollbar flex-1 pb-4">
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
      
        {/* Image Modal */}
        {isImageViewOpen && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/95 backdrop-blur-sm" onClick={() => setIsImageViewOpen(false)}>
            <div className="relative max-w-[95vw] max-h-[95vh]" onClick={(e) => e.stopPropagation()}>
              <img 
                src={`/drama/Drama_${script.id}_info.png`} 
                alt={`${script.name} 劇本圖片`} 
                className="max-w-full max-h-[95vh] object-contain rounded-lg shadow-[0_0_30px_rgba(0,0,0,0.8)]"
                onError={(e) => { 
                  // If info image doesn't exist, fallback to regular logo or a placeholder
                  e.currentTarget.src = `/drama/Drama_${script.id}.png`; 
                }}
              />
              <button 
                onClick={() => setIsImageViewOpen(false)}
                className="absolute -top-5 -right-5 w-10 h-10 bg-red-900/90 rounded-full flex items-center justify-center text-white shadow-lg hover:bg-red-700 transition-colors border-2 border-red-400/50 text-xl font-bold"
              >
                ✕
              </button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};
