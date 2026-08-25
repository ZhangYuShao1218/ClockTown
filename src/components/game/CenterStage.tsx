import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import type { Script } from "../../data/scripts";
import { RoleIcon } from "../common/RoleIcon";
import { RoleSelectionModal } from "./RoleSelectionModal";
import { loadSeatRoleNotes, saveSeatRoleNotes, clearSeatRoleNotes } from "../../lib/localData";
import { AllRoles } from "../../data/roles";

interface CenterStageProps {
  seats: number[];
  getPlayerInSeat: (seatIndex: number) => any;
  handleTakeSeat: (seatIndex: number) => void;
  handleLeaveSeat: () => void;
  userUid: string | undefined;
  script: Script | undefined;
  bluffs: (string | null)[];
  canSeeBluffs: boolean;
  distribution: number[];
  roomId: string;
  onLeaveRoom: () => void;
  onOpenScriptModal: () => void;
  fabled?: string[];
  hostPlayer?: any;
}

export const CenterStage = ({ 
  seats, 
  getPlayerInSeat, 
  handleTakeSeat, 
  handleLeaveSeat, 
  userUid, 
  script,
  bluffs = [null, null, null],
  canSeeBluffs,
  distribution,
  onLeaveRoom,
  onOpenScriptModal,
  roomId,
  fabled = [],
  hostPlayer
}: CenterStageProps) => {

  const [modalOpen, setModalOpen] = useState(false);
  const [targetSeat, setTargetSeat] = useState<number | null>(null);
  const [seatRoleNotes, setSeatRoleNotes] = useState<Record<number, string>>({});

  useEffect(() => {
    const handleClear = () => {
      setSeatRoleNotes({});
      if (userUid && roomId) {
        clearSeatRoleNotes(roomId, userUid);
      }
    };
    window.addEventListener('clear-local-notes', handleClear);
    return () => window.removeEventListener('clear-local-notes', handleClear);
  }, [userUid]);

  useEffect(() => {
    if (!userUid || !roomId) return;
    const saved = loadSeatRoleNotes(roomId, userUid);
    setSeatRoleNotes(saved);
  }, [userUid, roomId]);


  const handleModalSelect = (roleId: string | null) => {
    if (targetSeat === null) return;
    const newNotes = { ...seatRoleNotes };
    if (roleId) {
      newNotes[targetSeat] = roleId;
    } else {
      delete newNotes[targetSeat];
    }
    setSeatRoleNotes(newNotes);
    if (userUid) saveSeatRoleNotes(roomId, userUid, newNotes);
    setModalOpen(false);
  };

    const [activeDropdownSeat, setActiveDropdownSeat] = useState<number | null>(null);
  const [hoveredRoleTooltip, setHoveredRoleTooltip] = useState<{ role: any, x: number, y: number } | null>(null);

  useEffect(() => {
    const handleGlobalClick = () => setActiveDropdownSeat(null);
    window.addEventListener('click', handleGlobalClick);
    return () => window.removeEventListener('click', handleGlobalClick);
  }, []);

  useEffect(() => {
    if (!userUid) return;
      }, [userUid]);

  const totalSeats = seats.length;

  const getSeatConfig = () => {
    const count = totalSeats;
    if (count <= 6) return { size: 170, radius: 36, badgeClass: 'w-11 h-11 text-xl' };
    if (count <= 8) return { size: 160, radius: 38, badgeClass: 'w-10 h-10 text-lg' };
    if (count <= 10) return { size: 150, radius: 40, badgeClass: 'w-9 h-9 text-base' };
    if (count <= 12) return { size: 140, radius: 42, badgeClass: 'w-9 h-9 text-base' };
    if (count <= 14) return { size: 130, radius: 43.5, badgeClass: 'w-8 h-8 text-sm' };
    return { size: 120, radius: 45, badgeClass: 'w-8 h-8 text-sm' };
  };

  const getSeatStyle = (index: number) => {
    const angleDeg = (index / totalSeats) * 360 - 90;
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
                <div key={i} className="flex flex-col items-center flex-1 group relative hover:z-[9999]">
                  <div 
                    className="w-full aspect-square max-w-[84px] rounded-full border-2 border-white/60 bg-black/80 flex flex-col items-center justify-center shadow-lg relative overflow-hidden group-hover:scale-105 group-hover:border-red-400 transition-all"
                  >
                    {canSeeBluffs ? (
                      role ? (
                        <RoleIcon icon={role.icon} className="w-full h-full object-cover bg-[radial-gradient(circle_at_center,_#f4e5c5_0%,_#dcb37b_100%)]" />
                      ) : (
                        <span className="text-white/20 text-xs">空</span>
                      )
                    ) : (
                      <span className="text-white/20 text-xl font-bold">?</span>
                    )}
                  </div>
                  {canSeeBluffs && role && (
                    <div className="absolute top-[110%] right-0 w-64 bg-slate-800/95 border-2 border-slate-500 text-white text-sm leading-relaxed p-3 rounded-lg shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-[100] pointer-events-none text-left cursor-default">
                      <div dangerouslySetInnerHTML={{ __html: role.abilityHTML || role.ability }} />
                    </div>
                  )}
                  {canSeeBluffs && role && <span className="text-base font-bold text-red-400/90 uppercase tracking-widest mt-1 truncate w-full text-center">{role.name}</span>}
                </div>
              );
            })}
          </div>
        </div>

        {/* 傳奇角色 */}
        {fabled.length > 0 && (
          <div className="bg-black/60 border-2 border-yellow-400 rounded-xl p-3 shadow-lg pointer-events-auto backdrop-blur-md flex flex-col w-full shrink-0 relative z-20">
            <h3 className="text-lg font-bold text-yellow-500/80 mb-2 border-b border-yellow-500/20 pb-1 text-center uppercase tracking-widest">傳奇角色</h3>
            <div className="flex flex-wrap gap-2 justify-center">
              {fabled.map(fId => {
                const role = Object.values(AllRoles).find(r => r.id === fId);
                if (!role) return null;
                return (
                  <div key={fId} className="flex flex-col items-center flex-1 min-w-[30%] group relative hover:z-[9999]">
                    <div className="w-full aspect-square max-w-[84px] rounded-full border-2 border-yellow-500/50 flex items-center justify-center shadow-lg relative overflow-hidden bg-black/80 group-hover:scale-105 group-hover:border-yellow-400 transition-all">
                      <RoleIcon icon={role.icon} className="w-full h-full object-cover bg-[radial-gradient(circle_at_center,_#f4e5c5_0%,_#dcb37b_100%)]" />
                    </div>
                    <div className="absolute top-[110%] right-0 w-64 bg-slate-800/95 border-2 border-slate-500 text-white text-sm leading-relaxed p-3 rounded-lg shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-[100] pointer-events-none text-left cursor-default">
                      <div dangerouslySetInnerHTML={{ __html: role.abilityHTML || role.ability }} />
                    </div>
                    <span className="text-base font-bold text-yellow-400/90 uppercase tracking-widest mt-1 truncate w-full text-center">{role.name}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

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
            const player = getPlayerInSeat(seatIndex);
            const style = getSeatStyle(seatIndex);
                        
            const angleDeg = (seatIndex / totalSeats) * 360 - 90;
            const angleRad = (angleDeg * Math.PI) / 180;
              const { radius } = getSeatConfig();
              const x = 50 + radius * Math.cos(angleRad);
              const y = 50 + radius * Math.sin(angleRad);
            
            let tooltipClass = "top-[110%] mt-2 ";
            if (y > 75) tooltipClass = "bottom-[110%] mb-2 ";
            
            if (x < 25) tooltipClass += "left-0";
            else if (x > 75) tooltipClass += "right-0";
            else tooltipClass += "left-1/2 -translate-x-1/2";

            const isDead = false;
            
            // In CenterStage, we show guesses from seatRoleNotes
            const guessedRoleId = seatRoleNotes[seatIndex] || null;
            const guessedRole = guessedRoleId ? Object.values(AllRoles).find(r => r.id === guessedRoleId) : null;
            const isEvil = guessedRole?.type === "demon" || guessedRole?.type === "minion";

            return (
              <div 
                key={seatIndex}
                className="absolute group z-10"
                style={style}
              >
                
                <div 
                  onMouseEnter={(e) => { if (guessedRole) { const rect = e.currentTarget.getBoundingClientRect(); setHoveredRoleTooltip({ role: guessedRole, x: rect.left + rect.width / 2, y: rect.bottom }); } }} onMouseLeave={() => setHoveredRoleTooltip(null)}
                    className={`relative w-full h-full rounded-full border-4 flex items-center justify-center shadow-lg transition-transform overflow-hidden cursor-pointer pointer-events-auto ${
                    guessedRole 
                      ? (isEvil ? 'border-red-900 bg-black/90' : 'border-blue-900 bg-black/90')
                      : 'border-white/30 bg-black/80 hover:border-white/50'
                  }`}
                  onClick={() => {
                    setTargetSeat(seatIndex);
                    setModalOpen(true);
                  }}
                >
                  {player && player.uid === userUid && (
                    <div className="absolute top-2 right-2 w-3 h-3 bg-green-500 rounded-full border border-black shadow-[0_0_8px_rgba(34,197,94,0.8)] z-10"></div>
                  )}

                  {guessedRole ? (
                    <div className="w-full h-full relative flex flex-col items-center justify-start bg-[radial-gradient(circle_at_center,_#f4e5c5_0%,_#dcb37b_100%)]">
                        <div className="w-full h-[70%] relative mt-2">
                          <RoleIcon icon={guessedRole.icon} className={`w-full h-full object-contain ${isDead ? 'opacity-40 grayscale sepia' : ''}`} />
                        </div>
                        <div className="absolute inset-0 pointer-events-none">
                          <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible drop-shadow-md">
                            <path id={`curve-${seatIndex}`} d="M 15 78 A 43 43 0 0 0 85 78" fill="transparent" />
                            <text fill="rgba(80,50,20,0.9)" fontSize="16" fontWeight="bold" textAnchor="middle" letterSpacing="3">
                              <textPath href={`#curve-${seatIndex}`} startOffset="50%">
                                {guessedRole.name}
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
              const guessedRoleId = seatRoleNotes[seatIndex] || null;
              const guessedRole = guessedRoleId ? Object.values(AllRoles).find(r => r.id === guessedRoleId) : null;
              if (!guessedRole) return null;

              const fIdx = script?.firstNight?.findIndex(x => x.id === guessedRole.id);
              const oIdx = script?.otherNight?.findIndex(x => x.id === guessedRole.id);
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
                <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-max flex flex-col items-center justify-center pointer-events-auto">
                  <div 
                    className="cursor-pointer text-white font-bold bg-black/80 px-2.5 py-1 rounded-md text-base whitespace-nowrap border border-white/30 shadow-[0_0_10px_rgba(0,0,0,1)] hover:bg-black hover:border-white/50 transition-colors"
                    onClick={(e) => { e.stopPropagation(); setActiveDropdownSeat(activeDropdownSeat === seatIndex ? null : seatIndex); }}
                  >
                    {seatIndex}. {player ? player.name : '空座位'}
                  </div>
                  
                  {activeDropdownSeat === seatIndex && (
                    <div className={`absolute ${parseInt(style.top as string) > 50 ? 'bottom-full mb-1' : 'top-full mt-1'} w-24 bg-slate-900 border border-slate-600 rounded-md shadow-xl overflow-hidden z-[100]`}>
                      {player && player.uid === userUid ? (
                        <button 
                          onClick={(e) => { e.stopPropagation(); handleLeaveSeat(); setActiveDropdownSeat(null); }}
                          className="w-full px-4 py-2 text-red-400 hover:bg-red-900/30 hover:text-red-300 text-sm font-bold text-center transition-colors border-none"
                        >
                          起身
                        </button>
                      ) : !player ? (
                        <button 
                          onClick={(e) => { e.stopPropagation(); handleTakeSeat(seatIndex); setActiveDropdownSeat(null); }}
                          className="w-full px-4 py-2 text-blue-400 hover:bg-blue-900/30 hover:text-blue-300 text-sm font-bold text-center transition-colors border-none"
                        >
                          坐下
                        </button>
                      ) : (
                        <button disabled className="w-full px-4 py-2 text-gray-500 bg-gray-800 text-sm font-bold text-center cursor-not-allowed border-none">
                          已入座
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {hoveredRoleTooltip && document.body && createPortal(
        <div className="fixed z-[99999] w-64 bg-slate-900/95 p-3 text-sm border-2 border-slate-500 rounded-xl shadow-2xl pointer-events-none text-left"
            style={{ left: hoveredRoleTooltip.x, top: hoveredRoleTooltip.y + 10, transform: 'translateX(-50%)' }}
          >
            <div className="text-white/80 font-bold leading-relaxed" dangerouslySetInnerHTML={{ __html: hoveredRoleTooltip.role.abilityHTML || hoveredRoleTooltip.role.ability }} />
          </div>,
        document.body
      )}
      <RoleSelectionModal 
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSelect={handleModalSelect}
        script={script || null}
        noOverlay={true}
      />
    </div>
  );
};
