import { useState } from "react";
import { setGrimoireRole, setGrimoireBluff, updateFabled } from "../../services/roomService";
import type { Script } from "../../data/scripts";
import { RoleIcon } from "../common/RoleIcon";
import { AllRoles } from "../../data/roles";
import { RoleSelectionModal } from "./RoleSelectionModal";

interface GrimoireProps {
  roomId: string;
  script: Script | undefined;
  seatCount: number;
  grimoireState: Record<string, { roleId: string }> | undefined;
  bluffs: (string | null)[];
  distribution: number[];
  seats: number[];
  getPlayerInSeat: (seatIndex: number) => any;
  fabled?: string[];
  onLeaveRoom: () => void;
  onOpenScriptModal: () => void;
  hostPlayer?: any;
}

export const Grimoire = ({ roomId, script, seatCount, grimoireState, bluffs = [null, null, null], distribution, seats, getPlayerInSeat, fabled = [], onLeaveRoom, onOpenScriptModal, hostPlayer }: GrimoireProps) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [target, setTarget] = useState<{ type: 'seat'|'bluff'|'fabled', index?: number } | null>(null);

  if (!script) return null;

  const openModal = (type: 'seat'|'bluff'|'fabled', index?: number) => {
    setTarget({ type, index });
    setModalOpen(true);
  };

  const handleModalSelect = async (roleId: string | null) => {
    if (!target) return;
    if (target.type === 'seat' && target.index !== undefined) {
      await setGrimoireRole(roomId, target.index, roleId);
    } else if (target.type === 'bluff' && target.index !== undefined) {
      await setGrimoireBluff(roomId, target.index, roleId);
    } else if (target.type === 'fabled' && roleId) {
      if (fabled.includes(roleId)) {
        await updateFabled(roomId, fabled.filter(id => id !== roleId));
      } else if (fabled.length < 3) {
        await updateFabled(roomId, [...fabled, roleId]);
      }
      return;
    }
    setModalOpen(false);
  };

  const onRemoveFabled = async (roleId: string) => {
    await updateFabled(roomId, fabled.filter(id => id !== roleId));
  };

  const getSeatConfig = () => {
    const count = typeof totalSeats !== 'undefined' ? totalSeats : seatCount;
    if (count <= 6) return { size: 170, radius: 36, badgeClass: 'w-11 h-11 text-xl' };
    if (count <= 8) return { size: 160, radius: 38, badgeClass: 'w-10 h-10 text-lg' };
    if (count <= 10) return { size: 150, radius: 40, badgeClass: 'w-9 h-9 text-base' };
    if (count <= 12) return { size: 140, radius: 42, badgeClass: 'w-9 h-9 text-base' };
    if (count <= 14) return { size: 130, radius: 43.5, badgeClass: 'w-8 h-8 text-sm' };
    return { size: 120, radius: 45, badgeClass: 'w-8 h-8 text-sm' };
  };

  const getSeatStyle = (index: number) => {
    const angleDeg = (index / seatCount) * 360 - 90;
    const angleRad = (angleDeg * Math.PI) / 180;
    const { size, radius } = getSeatConfig(); 
    const x = 50 + radius * Math.cos(angleRad);
    const y = 50 + radius * Math.sin(angleRad);
    return { 
      left: `${x}%`, 
      top: `${y}%`, 
      transform: 'translate(-50%, -50%)',
      width: `${size}px`,
      height: `${size}px`
    };
  };

  const [t, o, m, d] = distribution || [0, 0, 0, 0];

  return (
    <div className="flex-1 flex flex-col relative overflow-hidden h-full">
      
      {/* 右側浮動資訊柱 (佔據 20% 寬度) */}
      <div className="absolute right-0 top-4 bottom-4 flex flex-col space-y-4 items-end pointer-events-none z-20 overflow-visible pb-6 w-[20%] pr-4 pl-4">
        
        {/* 陣營人數 */}
        <div className="bg-black/60 border-2 border-white/40 rounded-xl py-2 px-1 shadow-lg pointer-events-auto backdrop-blur-md w-full shrink-0">
          <div className="flex justify-between items-center text-center divide-x divide-white/20">
            <div className="flex-1"><div className="text-lg font-bold text-blue-300">鎮民</div><div className="text-lg font-bold text-white">{t}</div></div>
            <div className="flex-1"><div className="text-lg font-bold text-blue-300">外來者</div><div className="text-lg font-bold text-white">{o}</div></div>
            <div className="flex-1"><div className="text-lg font-bold text-red-400">爪牙</div><div className="text-lg font-bold text-white">{m}</div></div>
            <div className="flex-1"><div className="text-lg font-bold text-red-400">惡魔</div><div className="text-lg font-bold text-white">{d}</div></div>
          </div>
        </div>

        {/* 惡魔的偽裝 */}
        <div className="flex flex-col items-center space-y-2 pointer-events-auto bg-black/60 border-2 border-rose-900/80 p-3 pb-2 rounded-xl shadow-lg backdrop-blur-md w-full shrink-0 relative z-30">
          <h3 className="text-lg font-bold text-red-400/90 uppercase tracking-widest border-b border-white/30 pb-1 w-full text-center">惡魔的偽裝</h3>
          <div className="flex justify-center w-full gap-2">
            {[0, 1, 2].map(i => {
              const roleId = bluffs[i];
              const role = roleId ? script?.roles.find(r => r.id === roleId) : null;
              return (
                <div 
                  key={i} 
                  className="flex flex-col items-center cursor-pointer group flex-1 relative hover:z-[9999]"
                  onClick={() => openModal("bluff", i)}
                >
                  <div className={`w-full aspect-square max-w-[84px] rounded-full border-2 flex flex-col items-center justify-center shadow-lg relative overflow-hidden transition-all ${roleId ? 'border-red-900 bg-black hover:border-red-500' : 'border-white/20 bg-black/80 hover:border-white/50'}`}>
                    {role ? (
                      <RoleIcon icon={role.icon} className="w-full h-full object-cover bg-[radial-gradient(circle_at_center,_#f4e5c5_0%,_#dcb37b_100%)] group-hover:scale-105 transition-transform" />
                    ) : (
                      <span className="text-white/20 text-xs">空</span>
                    )}
                  </div>
                  {role && (
                    <div className="absolute top-[110%] right-0 w-64 bg-slate-800/95 border-2 border-slate-500 text-white text-sm leading-relaxed p-3 rounded-lg shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-[100] pointer-events-none text-left cursor-default">
                      <div dangerouslySetInnerHTML={{ __html: role.abilityHTML || role.ability }} />
                    </div>
                  )}
                  {role && <span className="text-base font-bold text-red-400/90 uppercase tracking-widest mt-1 truncate w-full text-center">{role.name}</span>}
                </div>
              );
            })}
          </div>
        </div>

        {/* 傳奇角色 */}
        <div className="bg-black/60 border-2 border-yellow-400 rounded-xl p-3 shadow-lg pointer-events-auto backdrop-blur-md flex flex-col w-full shrink-0 relative z-20">
          <h3 className="text-lg font-bold text-yellow-500/80 mb-2 border-b border-yellow-500/20 pb-1 text-center uppercase tracking-widest cursor-pointer hover:text-yellow-400" onClick={() => openModal("fabled")}>傳奇角色</h3>
          <div className="flex flex-wrap gap-2 justify-center">
            {fabled.map(fId => {
              const role = Object.values(AllRoles).find(r => r.id === fId);
              if (!role) return null;
              return (
                <div key={fId} className="flex flex-col items-center flex-1 min-w-[30%] cursor-pointer group relative hover:z-[9999]" onClick={(e) => { e.stopPropagation(); onRemoveFabled(fId); }}>
                  <div className="w-full aspect-square max-w-[84px] rounded-full border-2 border-yellow-500/50 flex items-center justify-center shadow-lg relative overflow-hidden bg-black/80 group-hover:scale-105 group-hover:border-yellow-400 transition-all">
                    <RoleIcon icon={role.icon} className="w-full h-full object-cover bg-[radial-gradient(circle_at_center,_#f4e5c5_0%,_#dcb37b_100%)]" />
                    <div className="absolute inset-0 bg-red-900/80 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity text-xl font-bold">✕</div>
                  </div>
                  {role && (
                    <div className="absolute top-[110%] right-0 w-64 bg-slate-800/95 border-2 border-slate-500 text-white text-sm leading-relaxed p-3 rounded-lg shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-[100] pointer-events-none text-left cursor-default">
                      <div dangerouslySetInnerHTML={{ __html: role.abilityHTML || role.ability }} />
                    </div>
                  )}
                  <span className="text-base font-bold text-yellow-400/90 uppercase tracking-widest mt-1 truncate w-full text-center">{role.name}</span>
                </div>
              );
            })}
            <div 
              className="flex flex-col items-center flex-1 min-w-[30%] cursor-pointer group relative hover:z-[9999]"
              onClick={() => openModal("fabled")}
            >
              <div className="w-full aspect-square max-w-[84px] rounded-full border-2 border-white/20 border-dashed flex flex-col items-center justify-center shadow-lg relative overflow-hidden transition-all group-hover:border-yellow-400 bg-black/50">
                <span className="text-white/30 text-2xl group-hover:text-yellow-400 font-bold">+</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Spacer to push the rest to bottom */}
        <div className="flex-1 min-h-[1rem]" />

        {/* 說書人 */}
        <div className="bg-black/60 border-2 border-white/40 rounded-xl p-3 shadow-lg pointer-events-auto backdrop-blur-md flex w-full space-x-3 items-center shrink-0">
           <div className="w-14 h-14 rounded-full border-2 border-blue-400/50 shadow-md flex items-center justify-center bg-blue-900/40 shrink-0">
             <span className="text-2xl font-serif text-blue-200">GM</span>
           </div>
           <div className="flex flex-col items-start overflow-hidden w-full">
             <span className="text-lg text-white/70 font-bold tracking-widest uppercase">說書人</span>
             <span className="text-lg font-bold text-white truncate w-full">{hostPlayer?.name || "未知"}</span>
           </div>
        </div>

        {/* 房間資訊 */}
        <div className="bg-black/60 border-2 border-white/40 rounded-xl p-3 shadow-lg pointer-events-auto backdrop-blur-md flex flex-col items-center w-full space-y-3 shrink-0">
          <div className="flex justify-start w-full items-center">
            <span className="text-lg text-white/50 tracking-widest uppercase mr-2">Room :</span>
            <span className="font-mono text-white text-lg font-bold">{roomId}</span>
          </div>
          <button 
            onClick={onOpenScriptModal}
            className="w-full py-1.5 bg-black/80 border border-white/30 text-yellow-400 hover:text-white hover:bg-white/10 rounded-lg shadow-md font-bold font-serif transition-colors text-lg px-1"
          >
            <div className="flex flex-col items-center justify-center">
              {(script?.name || "").includes('(') ? (
                <>
                  <span>{(script?.name || "").split('(')[0].trim()}</span>
                  <span className="text-lg text-yellow-500/80">({(script?.name || "").split('(')[1]}</span>
                </>
              ) : <span>{script?.name || "未知劇本"}</span>}
            </div>
          </button>
          <button onClick={onLeaveRoom} className="w-full text-lg px-4 py-2 bg-red-900/80 hover:bg-red-800/90 border border-red-500/50 text-red-200 rounded-md transition-colors font-bold">
            離開房間
          </button>
        </div>
      </div>

      {/* 座位區 (左側 80% 置中計算，保留 5% 邊距，無底盤) */}
      <div className="absolute left-0 top-0 bottom-0 w-[80%] flex items-center justify-center pointer-events-none p-0 pt-6 pb-16">
        <div className="relative w-full h-full max-w-[95vh] max-h-[95vh] aspect-square flex items-center justify-center pointer-events-none">
          {seats.map((seatIndex) => {
            const style = getSeatStyle(seatIndex);
            
            const roleId = grimoireState?.[seatIndex]?.roleId;
            const isDead = (grimoireState?.[seatIndex] as any)?.isDead;
            const role = roleId ? script.roles.find(r => r.id === roleId) : null;
            const isEvil = role?.type === "demon" || role?.type === "minion";

            const angleDeg = (seatIndex / seatCount) * 360 - 90;
            const angleRad = (angleDeg * Math.PI) / 180;
              const { radius } = getSeatConfig();
              const x = 50 + radius * Math.cos(angleRad);
              const y = 50 + radius * Math.sin(angleRad);
            
            let tooltipClass = "top-[110%] mt-2 ";
            if (y > 75) tooltipClass = "bottom-[110%] mb-2 ";
            
            if (x < 25) tooltipClass += "left-0";
            else if (x > 75) tooltipClass += "right-0";
            else tooltipClass += "left-1/2 -translate-x-1/2";

            return (
              <div 
                key={seatIndex} 
                className="absolute pointer-events-auto cursor-pointer group z-10"
                style={style}
                onClick={() => openModal("seat", seatIndex)}
              >
                {role && (
                    <div className={`absolute ${tooltipClass} w-64 bg-slate-800/95 border-2 border-slate-500 text-white text-sm leading-relaxed p-3 rounded-lg shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-[100] pointer-events-none text-left cursor-default`}>
                      <div dangerouslySetInnerHTML={{ __html: role.abilityHTML || role.ability }} />
                    </div>
                )}
                <div className={`w-full h-full rounded-full border-4 flex items-center justify-center shadow-2xl relative overflow-hidden bg-black/90 transition-colors ${role ? (isEvil ? 'border-red-900 hover:border-red-500 shadow-[0_0_15px_rgba(220,38,38,0.3)]' : 'border-blue-900 hover:border-blue-500 shadow-[0_0_15px_rgba(37,99,235,0.3)]') : 'border-white/20 hover:border-white/50'}`}>
                   {role ? (
                       <div className="w-full h-full relative flex flex-col items-center justify-start bg-[radial-gradient(circle_at_center,_#f4e5c5_0%,_#dcb37b_100%)]">
                         <div className="w-full h-[70%] relative mt-2">
                           <RoleIcon icon={role.icon} className={`w-full h-full object-contain ${isDead ? 'opacity-40 grayscale sepia' : ''}`} />
                         </div>
                         <div className="absolute inset-0 pointer-events-none">
                          <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible drop-shadow-md">
                            <path id={`curve-grimoire-${seatIndex}`} d="M 15 78 A 43 43 0 0 0 85 78" fill="transparent" />
                            <text fill="rgba(80,50,20,0.9)" fontSize="16" fontWeight="bold" textAnchor="middle" letterSpacing="3">
                              <textPath href={`#curve-grimoire-${seatIndex}`} startOffset="50%">
                                {role.name}
                              </textPath>
                            </text>
                          </svg>
                         </div>
                       </div>
                     ) : (
                       <span className="text-white/20 text-3xl font-bold">{seatIndex}</span>
                     )}
                    {isDead && (
                      <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
                        <div className="w-20 h-1 bg-red-600/80 rotate-45 absolute shadow-lg" />
                        <div className="w-20 h-1 bg-red-600/80 -rotate-45 absolute shadow-lg" />
                      </div>
                    )}
                </div>
              </div>
            );
          })}

          {/* Night Order Badges */}
          {seats.map((seatIndex) => {
            const roleId = grimoireState?.[seatIndex]?.roleId;
            const role = roleId ? script.roles.find(r => r.id === roleId) : null;
            if (!role) return null;

            const fIdx = script?.firstNight?.findIndex(x => x.id === role.id);
            const oIdx = script?.otherNight?.findIndex(x => x.id === role.id);
            const firstNum = fIdx !== undefined && fIdx !== -1 ? fIdx + 1 : null;
            const otherNum = oIdx !== undefined && oIdx !== -1 ? oIdx + 1 : null;

            if (!firstNum && !otherNum) return null;

            const style = getSeatStyle(seatIndex);
            const { badgeClass } = getSeatConfig();

            return (
              <div 
                key={`badge-${seatIndex}`}
                className="absolute pointer-events-none z-30"
                style={style}
              >
                {firstNum && (
                  <div className={`absolute left-[-10px] top-1/2 -translate-y-1/2 ${badgeClass} rounded-full bg-blue-900 border-2 border-blue-400 text-blue-100 flex items-center justify-center font-bold shadow-xl`}>
                    {firstNum}
                  </div>
                )}
                {otherNum && (
                  <div className={`absolute right-[-10px] top-1/2 -translate-y-1/2 ${badgeClass} rounded-full bg-red-900 border-2 border-red-400 text-red-100 flex items-center justify-center font-bold shadow-xl`}>
                    {otherNum}
                  </div>
                )}
              </div>
            );
          })}

          {/* Render seat text independently so it stays on top of all circles */}
          {seats.map((seatIndex) => {
            const player = getPlayerInSeat(seatIndex);
            const style = getSeatStyle(seatIndex);
            
            return (
              <div 
                key={`text-${seatIndex}`}
                className="absolute z-50 pointer-events-none"
                style={style}
              >
                <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-max text-center z-50">
                  <span className="text-white font-bold bg-black/80 px-2.5 py-1 rounded-md text-base whitespace-nowrap border border-white/30 shadow-[0_0_10px_rgba(0,0,0,1)]">
                    {player ? player.name : `座位 ${seatIndex}`}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <RoleSelectionModal 
        isOpen={modalOpen} 
        onClose={() => setModalOpen(false)} 
        onSelect={handleModalSelect} 
        script={script}
        filterType={target?.type === 'fabled' ? 'fabled' : 'normal'}
        selectedFabled={fabled}
      />
    </div>
  );
};
