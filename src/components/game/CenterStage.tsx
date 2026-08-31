import { useState, useEffect } from "react";
import type { Script } from "../../data/types";
import { RoleIcon } from "../common/RoleIcon";
import { RoleSelectionModal } from "./RoleSelectionModal";
import { loadSeatRoleNotes, saveSeatRoleNotes, clearSeatRoleNotes } from "../../lib/localData";
import { updateSeatStatus, updateVotingState } from "../../services/roomService";
import { VotingOverlay } from "./VotingOverlay";
import { RoleTooltip } from "../common/RoleTooltip";
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
  privateNotes?: Record<number, string>;
  isHost?: boolean;
  seatStatus?: Record<number, import('../../data/types').SeatStatus>;
  votingState?: import('../../data/types').VotingState;
  dayNumber?: number;
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
  hostPlayer,
  privateNotes = {},
  isHost = false,
  seatStatus = {},
  votingState,
  dayNumber = 1
}: CenterStageProps) => {

  const [modalOpen, setModalOpen] = useState(false);
  const [targetSeat, setTargetSeat] = useState<number | null>(null);
  const [seatRoleNotes, setSeatRoleNotes] = useState<Record<number, string>>({});

  const toggleDead = (seatIndex: number) => {
    const isCurrentlyDead = seatStatus[seatIndex]?.isDead || false;
    updateSeatStatus(roomId, seatIndex, { 
      isDead: !isCurrentlyDead, 
      hasGhostVote: !isCurrentlyDead // Automatically give ghost vote when they die, remove when resurrected
    });
    setActiveDropdownSeat(null);
  };

  const togglePendingExecution = (seatIndex: number) => {
    const isCurrentlyPending = seatStatus[seatIndex]?.pendingExecution || false;
    updateSeatStatus(roomId, seatIndex, { pendingExecution: !isCurrentlyPending });
    setActiveDropdownSeat(null);
  };

  const initiateNominationAction = (seatIndex: number) => {
    updateVotingState(roomId, {
      phase: 'selecting_nominee',
      nominatorSeat: seatIndex,
      nomineeSeat: null,
      startTime: null,
      votes: {}
    });
    setActiveDropdownSeat(null);
  };

  const selectNomineeAction = (seatIndex: number) => {
    if (votingState?.phase === 'selecting_nominee') {
      updateVotingState(roomId, {
        phase: 'idle', // Host will see "Start Voting" next
        nomineeSeat: seatIndex
      });
    }
  };

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
  }, [roomId, userUid]);

  useEffect(() => {
    if (privateNotes !== undefined) {
      setSeatRoleNotes(prev => {
        const next = privateNotes || {};
        if (JSON.stringify(prev) === JSON.stringify(next)) {
          return prev;
        }
        return next;
      });
      if (roomId && userUid) saveSeatRoleNotes(roomId, userUid, privateNotes || {});
    }
  }, [privateNotes, roomId, userUid]);




  const handleModalSelect = async (roleId: string | null) => {
    if (targetSeat === null) return;
    const newNotes = { ...seatRoleNotes };
    if (roleId) {
      newNotes[targetSeat] = roleId;
    } else {
      delete newNotes[targetSeat];
    }
    setSeatRoleNotes(newNotes);
    if (userUid) {
      saveSeatRoleNotes(roomId, userUid, newNotes);
      const { update, ref } = await import("firebase/database");
      const { db } = await import("../../services/firebase");
      await update(ref(db), { [`rooms/${roomId}/private/notes/${userUid}/${targetSeat}`]: roleId || null });
    }
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
    if (count <= 6) return { size: 170, radius: 40, badgeClass: 'w-11 h-11 text-xl' };
    if (count <= 8) return { size: 160, radius: 41.5, badgeClass: 'w-10 h-10 text-lg' };
    if (count <= 10) return { size: 150, radius: 42.5, badgeClass: 'w-9 h-9 text-base' };
    if (count <= 12) return { size: 140, radius: 43.5, badgeClass: 'w-9 h-9 text-base' };
    if (count <= 14) return { size: 130, radius: 44.5, badgeClass: 'w-8 h-8 text-sm' };
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

  const [t, o, m, d, v = 0] = distribution || [0, 0, 0, 0, 0];

  return (
    <div className="flex-1 flex flex-col relative overflow-hidden h-full">
      
      {/* 右側浮動資訊柱 (佔據 20% 寬度) */}
      <div className="absolute right-0 top-4 bottom-4 flex flex-col space-y-4 items-end pointer-events-none z-20 overflow-visible pb-6 w-[20%] pr-4 pl-4">
        
        {/* 陣營人數與生存資訊 */}
        <div className="bg-stone-800/80 border-2 border-white/40 rounded-xl py-3 px-2 shadow-lg pointer-events-auto backdrop-blur-md w-full shrink-0 flex flex-col items-center z-30 relative">
          <div className="flex justify-between items-center text-center divide-x divide-white/20 w-full mb-3">
            <div className="flex-1"><div className="text-lg font-bold text-blue-300">民</div><div className="text-lg font-bold text-white">{t}</div></div>
            <div className="flex-1"><div className="text-lg font-bold text-blue-300">外</div><div className="text-lg font-bold text-white">{o}</div></div>
            <div className="flex-1"><div className="text-lg font-bold text-red-400">爪</div><div className="text-lg font-bold text-white">{m}</div></div>
            <div className="flex-1"><div className="text-lg font-bold text-red-400">惡</div><div className="text-lg font-bold text-white">{d}</div></div>
            {v > 0 && <div className="flex-1"><div className="text-lg font-bold text-purple-400">旅</div><div className="text-lg font-bold text-white">{v}</div></div>}
          </div>

          <div className="w-[80%] h-px bg-white/20 mb-3" />

          <div className="flex justify-between items-center w-full px-2 text-center">
            <div className="flex flex-row justify-center items-center gap-2 flex-1 group" title="總玩家數">
              <img src="/assets/ui/HumanCount.png" className="w-[34px] h-[34px] object-contain drop-shadow-md" alt="總數" />
              <span className="text-xl font-bold text-white group-hover:scale-110 transition-transform">{seats.length}</span>
            </div>
            <div className="w-px h-10 bg-white/20 mx-2"></div>
            <div className="flex flex-row justify-center items-center gap-2 flex-1 group" title="存活玩家數">
              <img src="/assets/ui/LiveCount.png" className="w-[34px] h-[34px] object-contain drop-shadow-[0_0_4px_rgba(185,28,28,0.6)]" alt="存活" />
              <span className="text-xl font-bold text-white group-hover:scale-110 transition-transform">{seats.length - seats.filter(s => seatStatus[s]?.isDead).length}</span>
            </div>
            <div className="w-px h-10 bg-white/20 mx-2"></div>
            <div className="flex flex-row justify-center items-center gap-2 flex-1 group" title="擁有死亡票數">
              <img src="/assets/ui/DeathVote.png" className="w-[34px] h-[34px] object-contain drop-shadow-md" alt="死亡票" />
              <span className="text-xl font-bold text-white group-hover:scale-110 transition-transform">{seats.filter(s => seatStatus[s]?.isDead && seatStatus[s]?.hasGhostVote).length}</span>
            </div>
          </div>
        </div>

        {/* 惡魔的偽裝 */}
        <div className="flex flex-col items-center space-y-2 pointer-events-auto bg-stone-800/80 border-2 border-rose-900/80 p-3 pb-2 rounded-xl shadow-lg backdrop-blur-md w-full shrink-0 relative z-30">
          <h3 className="text-lg font-bold text-red-400/90 uppercase tracking-widest border-b border-white/30 pb-1 w-full text-center">惡魔的偽裝</h3>
          <div className="flex justify-center w-full gap-2">
            {[0, 1, 2].map(i => {
              const roleId = bluffs[i];
              const role = roleId ? script?.roles.find(r => r.id === roleId) : null;
              return (
                <div key={i} className="flex flex-col items-center flex-1 group relative hover:z-[9999]">
                  <div 
                    className={`w-full aspect-square max-w-[84px] rounded-full border-2 flex flex-col items-center justify-center shadow-lg relative overflow-hidden hover:scale-105 transition-all cursor-help ${canSeeBluffs && !roleId ? 'border-red-500/40 border-dashed bg-black/60 hover:border-red-400' : 'border-red-900 bg-black hover:border-red-500'}`}
                    onMouseEnter={(e) => {
                      if (canSeeBluffs && role) {
                        const rect = e.currentTarget.getBoundingClientRect();
                        setHoveredRoleTooltip({ role: role, x: rect.left + rect.width / 2, y: rect.bottom });
                      }
                    }}
                    onMouseLeave={() => setHoveredRoleTooltip(null)}
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
                  {canSeeBluffs && role && <span className="text-base font-bold text-red-400/90 uppercase tracking-widest mt-1 truncate w-full text-center">{role.name}</span>}
                </div>
              );
            })}
          </div>
        </div>

        {/* 傳奇角色 */}
        {fabled.filter(f => f).length > 0 && (
          <div className="bg-stone-800/80 border-2 border-yellow-400 rounded-xl p-3 shadow-lg pointer-events-auto backdrop-blur-md flex flex-col w-full shrink-0 relative z-20">
            <h3 className="text-lg font-bold text-yellow-500/80 mb-2 border-b border-yellow-500/20 pb-1 text-center uppercase tracking-widest">傳奇角色</h3>
            <div className="flex flex-wrap gap-2 justify-center">
              {fabled.filter(f => f).map(fId => {
                const role = Object.values(AllRoles).find(r => r.id === fId);
                if (!role) return null;
                return (
                  <div 
                    key={fId} 
                    className="flex flex-col items-center flex-1 min-w-[30%] group relative hover:z-[9999]"
                    onMouseEnter={(e) => { const rect = e.currentTarget.getBoundingClientRect(); setHoveredRoleTooltip({ role, x: rect.left + rect.width / 2, y: rect.bottom }); }}
                    onMouseLeave={() => setHoveredRoleTooltip(null)}
                  >
                    <div className="w-full aspect-square max-w-[84px] rounded-full border-2 border-yellow-500/50 flex items-center justify-center shadow-lg relative overflow-hidden bg-black/80 group-hover:scale-105 group-hover:border-yellow-400 transition-all">
                      <RoleIcon icon={role.icon} className="w-full h-full object-cover bg-[radial-gradient(circle_at_center,_#f4e5c5_0%,_#dcb37b_100%)]" />
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
        {/* 房間資訊 */}
        <div className="bg-stone-800/80 border-2 border-white/40 rounded-xl p-3 shadow-lg pointer-events-auto backdrop-blur-md flex flex-col items-center w-full space-y-3 shrink-0">
          <div className="flex justify-start w-full items-center">
            <span className="text-lg text-white/50 tracking-widest uppercase mr-2">Room :</span>
            <span className="font-mono text-white text-lg font-bold">{roomId}</span>
            <button 
              onClick={() => {
                navigator.clipboard.writeText(window.location.href);
                const btn = document.getElementById('copy-url-btn');
                if (btn) {
                  const originalText = btn.innerText;
                  btn.innerText = '已複製';
                  btn.classList.add('text-green-400');
                  setTimeout(() => {
                    btn.innerText = originalText;
                    btn.classList.remove('text-green-400');
                  }, 2000);
                }
              }}
              id="copy-url-btn"
              className="ml-auto text-sm bg-white/10 hover:bg-white/20 border border-white/20 text-white/80 px-2 py-1 rounded transition-colors"
            >
              複製網址
            </button>
          </div>
          <button 
            onClick={onOpenScriptModal}
            className="w-full py-1 backdrop-blur-md border border-white/40 rounded-lg shadow-md font-bold font-serif transition-colors text-lg px-1 flex items-center justify-center space-x-1 overflow-hidden group"
            style={{ backgroundColor: 'var(--script-bg)' }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--script-bg-hover)')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'var(--script-bg)')}
          >
            {script?.id && (
              <img 
                src={`/drama/Drama_${script.id}.png`} 
                alt="Script" 
                className="w-24 h-auto max-h-20 object-contain shrink-0 drop-shadow-md py-1" 
                onError={(e) => { e.currentTarget.style.display = 'none'; }} 
              />
            )}
            <div className="flex flex-col items-center justify-center min-w-0 flex-1">
              {script?.name ? (
                <>
                  <span className="text-base md:text-lg leading-tight truncate w-full text-center" style={{ color: 'var(--script-text-color, #ffffff)' }}>{script.name.split(' ')[0]}</span>
                  {script.name.split(' ').length > 1 && (
                    <span className="text-sm md:text-base leading-tight truncate w-full text-center" style={{ color: 'var(--script-text-color, #ffffff)' }}>{script.name.split(' ').slice(1).join(' ')}</span>
                  )}
                </>
              ) : <span className="text-lg" style={{ color: 'var(--script-text-color, #ffffff)' }}>未知劇本</span>}
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
          {/* 中央劇本圖示 */}
          {script?.id && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0 opacity-80">
              <img 
                src={`/drama/Drama_${script.id}.png`} 
                alt="Script Logo" 
                className="w-1/3 h-1/3 object-contain drop-shadow-2xl mix-blend-screen"
                onError={(e) => { e.currentTarget.style.display = 'none'; }} 
              />
            </div>
          )}
          
          {/* Seats and Voting Overlay Wrapper */}
          <div className="absolute inset-0 z-10">
            {votingState && (
              <VotingOverlay 
                roomId={roomId}
                isHost={isHost}
                votingState={votingState}
                seatStatus={seatStatus}
                seats={seats}
                getPlayerInSeat={getPlayerInSeat}
                userUid={userUid}
                totalSeats={totalSeats}
                dayNumber={dayNumber}
              />
            )}

            {seats.map((seatIndex) => {
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

            const isDead = seatStatus[seatIndex]?.isDead || false;
            const hasGhostVote = seatStatus[seatIndex]?.hasGhostVote || false;
            const pendingExecution = seatStatus[seatIndex]?.pendingExecution || false;
            
            // In CenterStage, we show guesses from seatRoleNotes
            const playerInSeat = getPlayerInSeat(seatIndex);
            const guessedRoleId = seatRoleNotes[seatIndex] || (isHost && playerInSeat?.roleId ? playerInSeat.roleId : null) || null;
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
                      ? (isEvil ? 'border-red-900/80 bg-black/90' : 'border-blue-900/80 bg-black/90')
                      : 'border-amber-600/80 bg-black/80 hover:border-amber-400 shadow-[0_0_12px_rgba(217,119,6,0.3)]'
                  }`}
                  onClick={() => {
                    if (isHost && votingState?.phase === 'selecting_nominee') {
                      selectNomineeAction(seatIndex);
                      return;
                    }
                    setTargetSeat(seatIndex);
                    setModalOpen(true);
                  }}
                >
                  {guessedRole ? (
                    <div className="w-full h-full relative flex flex-col items-center justify-start bg-[radial-gradient(circle_at_center,_#f4e5c5_0%,_#dcb37b_100%)]">
                        <div className="w-full h-[70%] relative mt-2">
                          <RoleIcon icon={guessedRole.icon} className="w-full h-full object-contain" />
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
                    <div className="w-full h-full relative flex flex-col items-center justify-center bg-[radial-gradient(circle_at_center,_#f4e5c5_0%,_#dcb37b_100%)]">
                      <span className="text-[#503214]/30 text-4xl font-bold">{seatIndex}</span>
                    </div>
                  )}
                  
                  {isDead && (
                    <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
                      <img src="/assets/ui/DeathMark.png" className="absolute top-[-12%] w-[110%] h-auto object-contain opacity-95 drop-shadow-[0_4px_10px_rgba(0,0,0,0.9)] z-10" alt="Dead" />
                    </div>
                  )}
                </div>
                
                {isDead && hasGhostVote && (
                  <div className="absolute -bottom-[5%] -right-[5%] w-[31%] h-[31%] flex items-center justify-center z-20 pointer-events-none">
                    <img src="/assets/ui/DeathVote.png" className="w-full h-full object-contain drop-shadow-[0_4px_6px_rgba(0,0,0,0.8)]" alt="Ghost Vote" />
                  </div>
                )}

                {pendingExecution && (
                  <div className="absolute inset-0 flex items-center justify-center z-[900] pointer-events-none opacity-80">
                    <img src="/assets/ui/WaitExecute.png" className="w-[70%] h-[70%] object-contain" alt="Pending Execution" />
                  </div>
                )}

                {votingState?.votes?.[playerInSeat?.uid] === true && (
                  <div className="absolute inset-0 flex items-center justify-center z-[999] pointer-events-none">
                    <img 
                      src="/assets/ui/Execute.png" 
                      className="w-[90%] h-[90%] object-contain" 
                      alt="Voted Execute" 
                      style={{ filter: 'brightness(0) saturate(100%) invert(17%) sepia(45%) saturate(3000%) hue-rotate(345deg) brightness(75%) contrast(95%)' }}
                    />
                  </div>
                )}
              </div>
            );
          })}

            {/* Night Order Badges */}
            {(() => {
              const firstWeights = new Set<number>();
              const otherWeights = new Set<number>();
              seats.forEach(i => {
                const p = getPlayerInSeat(i);
                const rId = seatRoleNotes[i] || (isHost && p?.roleId ? p.roleId : null) || null;
                if (rId) {
                  const r = Object.values(AllRoles).find(x => x.id === rId);
                  if (r && r.firstNight && r.firstNight > 0) firstWeights.add(r.firstNight);
                  if (r && r.otherNight && r.otherNight > 0) otherWeights.add(r.otherNight);
                }
              });
              const sortedFirst = Array.from(firstWeights).sort((a, b) => a - b);
              const sortedOther = Array.from(otherWeights).sort((a, b) => a - b);

              return seats.map((seatIndex) => {
                const playerInSeat = getPlayerInSeat(seatIndex);
                const guessedRoleId = seatRoleNotes[seatIndex] || (isHost && playerInSeat?.roleId ? playerInSeat.roleId : null) || null;
                const guessedRole = guessedRoleId ? Object.values(AllRoles).find(r => r.id === guessedRoleId) : null;
                if (!guessedRole) return null;

                const firstNum = guessedRole.firstNight && guessedRole.firstNight > 0 ? sortedFirst.indexOf(guessedRole.firstNight) + 1 : null;
                const otherNum = guessedRole.otherNight && guessedRole.otherNight > 0 ? sortedOther.indexOf(guessedRole.otherNight) + 1 : null;

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
            }); })()}

          {/* Render seat text independently so it stays on top of all circles */}
          {seats.map((seatIndex) => {
            const player = getPlayerInSeat(seatIndex);
            const style = getSeatStyle(seatIndex);
            
            return (
              <div 
                key={`text-${seatIndex}`}
                className={`absolute pointer-events-none ${activeDropdownSeat === seatIndex ? 'z-[1000]' : 'z-50'}`}
                style={style}
              >
                <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-max flex flex-col items-center justify-center pointer-events-auto">
                  <div 
                    className={`cursor-pointer font-bold bg-black/80 px-2.5 py-1 rounded-md text-base whitespace-nowrap border shadow-[0_0_10px_rgba(0,0,0,1)] hover:bg-black transition-colors ${
                      player && player.uid === userUid 
                        ? 'border-emerald-500 text-emerald-100 shadow-[0_0_15px_rgba(16,185,129,0.5)]' 
                        : 'border-white/30 text-white hover:border-white/50'
                    }`}
                    onClick={(e) => { e.stopPropagation(); setActiveDropdownSeat(activeDropdownSeat === seatIndex ? null : seatIndex); }}
                  >
                    <span className="text-amber-400 text-lg mr-1 tracking-wider">{seatIndex}.</span>
                    <span className="text-gray-100 text-lg">{player ? player.name : '空座位'}</span>
                  </div>
                  
                  {activeDropdownSeat === seatIndex && (
                    <div className={`absolute ${parseInt(style.top as string) > 50 ? 'bottom-full mb-1' : 'top-full mt-1'} w-32 bg-slate-900 border border-slate-600 rounded-md shadow-xl overflow-hidden z-[100]`}>
                      {isHost ? (
                        <>
                          <button 
                            onClick={(e) => { e.stopPropagation(); toggleDead(seatIndex); }}
                            className="w-full px-4 py-2 text-white hover:bg-slate-800 text-sm font-bold text-center transition-colors border-b border-white/10"
                          >
                            {seatStatus[seatIndex]?.isDead ? '取消標記死亡' : '標記死亡'}
                          </button>
                          <button 
                            onClick={(e) => { e.stopPropagation(); togglePendingExecution(seatIndex); }}
                            className="w-full px-4 py-2 text-red-400 hover:bg-slate-800 text-sm font-bold text-center transition-colors border-b border-white/10"
                          >
                            {seatStatus[seatIndex]?.pendingExecution ? '取消待處決' : '標記待處決'}
                          </button>
                          {seatStatus[seatIndex]?.isDead && (
                            <button 
                              onClick={(e) => { e.stopPropagation(); updateSeatStatus(roomId, seatIndex, { hasGhostVote: !seatStatus[seatIndex]?.hasGhostVote }); setActiveDropdownSeat(null); }}
                              className="w-full px-4 py-2 text-gray-300 hover:bg-slate-800 text-sm font-bold text-center transition-colors border-b border-white/10"
                            >
                              {seatStatus[seatIndex]?.hasGhostVote ? '移除遺言票' : '給予遺言票'}
                            </button>
                          )}
                          <button 
                            onClick={(e) => { e.stopPropagation(); initiateNominationAction(seatIndex); }}
                            className="w-full px-4 py-2 text-blue-400 hover:bg-slate-800 text-sm font-bold text-center transition-colors border-none"
                          >
                            發起提名
                          </button>
                        </>
                      ) : (
                        player && player.uid === userUid ? (
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
                        )
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
          </div> {/* End of Moonlight Wrapper */}
        </div>
      </div>

      {/* 左下角說書人資訊 */}
      <div className="absolute left-[36px] bottom-[1px] z-20 w-[220px] pointer-events-none pb-6 flex flex-col justify-end">
        <div className="bg-stone-800/80 border-2 border-white/40 rounded-xl p-3 shadow-lg pointer-events-auto backdrop-blur-md flex w-full space-x-3 items-center shrink-0">
           <div className="w-12 h-12 rounded-full border-2 border-blue-400/50 shadow-md flex items-center justify-center bg-blue-900/40 shrink-0">
             <span className="text-xl font-serif text-blue-200">GM</span>
           </div>
           <div className="flex flex-col items-start overflow-hidden w-full">
             <span className="text-base text-[#d7b87c] font-bold tracking-widest uppercase">說書人</span>
             <span className="text-base font-bold text-white truncate w-full">{hostPlayer?.name || "未知"}</span>
           </div>
        </div>
      </div>

      <RoleTooltip hoveredRole={hoveredRoleTooltip} />
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
