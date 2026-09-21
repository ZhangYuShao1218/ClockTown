import { useState, Fragment } from "react";
import { useSeatLayout } from "../../hooks/useSeatLayout";
import { setGrimoireRole, setGrimoireBluff, updateFabledIndex } from "../../services/roomService";
import type { Script } from "../../data/types";
import { RoleIcon } from "../common/RoleIcon";
import { RoleTooltip } from '../common/RoleTooltip';
import { AllRoles } from "../../data/roles";
import { scriptLogoSrc } from "../../lib/scriptAssets";
import { RoleSelectionModal } from "./RoleSelectionModal";
import { SeatTokenModal } from './SeatTokenModal';
import { InfoSidebar, CampStatsCard, BluffsCard, FabledCard, RoomInfoCard, RoleSlot, InfoSpacer } from './info-panel/InfoPanels';
import type { InfoTab, HoveredRole } from './info-panel/InfoPanels';
import type { SeatToken } from './SeatTokenModal';

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
  seatStatus?: Record<number, import('../../data/types').SeatStatus>;
  userUid: string | undefined;
  seatTokens?: Record<number, SeatToken[]>;
  highlightedSeats?: number[];
  replayActorSeat?: number | null;
  replayTargetSeats?: number[];
  replayEventType?: string;
}

export const Grimoire = ({ 
  roomId, 
  seatCount, 
  script, 
  grimoireState = {}, 
  bluffs = [null, null, null],
  distribution,
  seats,
  getPlayerInSeat,
  fabled = [],
  onLeaveRoom,
  onOpenScriptModal,
  hostPlayer,
  seatStatus = {},
  userUid,
  seatTokens = {},
  highlightedSeats = [],
  replayActorSeat = null,
  replayTargetSeats = [],
  replayEventType
}: GrimoireProps) => {
  // 局勢紀錄：座位只閃爍外框、不顯示「目標」文字標籤
  const isSituationReplay = replayEventType === 'SITUATION_LOG';
  const [modalOpen, setModalOpen] = useState(false);
  const [target, setTarget] = useState<{ type: 'seat'|'bluff'|'fabled', index?: number } | null>(null);
  const [hoveredRoleTooltip, setHoveredRoleTooltip] = useState<HoveredRole | null>(null);
  const [tokenModalOpen, setTokenModalOpen] = useState(false);
  const [tokenTargetSeat, setTokenTargetSeat] = useState<number | null>(null);
  // 窄屏：惡魔偽裝 / 傳奇 / 房間 合併為分頁視窗
  const [infoTab, setInfoTab] = useState<InfoTab>('bluffs');
  // hover 座位或其筆記時，將該座位的筆記層級提高、壓過其他座位的筆記
  const [hoverSeat, setHoverSeat] = useState<number | null>(null);

  const { boardWrapRef, boardPx, seatPx, seatCfg, tokenBaseSeatPx, badgePx, getSeatStyle } = useSeatLayout(seatCount);

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
    } else if (target.type === 'fabled' && target.index !== undefined) {
      await updateFabledIndex(roomId, target.index, roleId);
    }
    setModalOpen(false);
  };

  const handleSaveSeatToken = async (token: SeatToken) => {
    if (tokenTargetSeat === null || !userUid || !roomId) return;
    try {
      const currentTokens = (seatTokens || {})[tokenTargetSeat] || [];
      if (currentTokens.length >= 3) return;
      const newTokens = [...currentTokens, token];
      const { update } = await import("firebase/database");
      const { nref } = await import("../../services/firebase");
      await update(nref(), { [`rooms/${roomId}/private/grimoireTokens/${userUid}/${tokenTargetSeat}`]: newTokens });
    } catch (e) { console.error(e); }
  };

  const handleRemoveSeatToken = async (seatIdx: number, tokenId: string) => {
    if (!userUid || !roomId) return;
    try {
      const currentTokens = (seatTokens || {})[seatIdx] || [];
      const newTokens = currentTokens.filter(t => t.id !== tokenId);
      const { update } = await import("firebase/database");
      const { nref } = await import("../../services/firebase");
      await update(nref(), { [`rooms/${roomId}/private/grimoireTokens/${userUid}/${seatIdx}`]: newTokens });
    } catch (e) { console.error(e); }
  };

  return (
    <div className="flex-1 flex flex-col relative overflow-hidden h-full">
      
      <InfoSidebar
        activeTab={infoTab}
        onTabChange={setInfoTab}
        stats={
          <CampStatsCard
            distribution={distribution}
            totalPlayers={seats.length}
            alivePlayers={seats.length - Object.values(seatStatus).filter(s => s?.isDead).length}
            deathVotes={Object.values(seatStatus).filter(s => s?.isDead && s?.hasGhostVote).length}
          />
        }
      >
        <BluffsCard activeTab={infoTab}>
          {[0, 1, 2].map(i => {
            const roleId = bluffs[i];
            const role = roleId ? script?.roles.find(r => r.id === roleId) : null;
            return <RoleSlot key={i} variant="bluff" role={role} onHoverRole={setHoveredRoleTooltip} onClick={() => openModal("bluff", i)} />;
          })}
        </BluffsCard>

        <FabledCard
          editable
          slots={[0, 1, 2].map(i => (fabled[i] ? Object.values(AllRoles).find(r => r.id === fabled[i]) : null))}
          onHoverRole={setHoveredRoleTooltip}
          onOpenPicker={(i) => openModal("fabled", i)}
          onRemove={(i) => updateFabledIndex(roomId, i, null)}
          activeTab={infoTab}
        />

        <InfoSpacer />

        <RoomInfoCard roomId={roomId} script={script} onOpenScriptModal={onOpenScriptModal} onLeaveRoom={onLeaveRoom} activeTab={infoTab} />
      </InfoSidebar>

      {/* 座位區 */}
      <div ref={boardWrapRef} className="absolute left-0 right-0 top-[82px] bottom-[150px] lg:left-0 lg:right-[17rem] 2xl:right-[19rem] lg:top-2 lg:bottom-1 flex items-center justify-center pointer-events-none">
        <div
          className="relative flex items-center justify-center pointer-events-none"
          style={{ width: `${boardPx}px`, height: `${boardPx}px` }}
        >
          
          {/* 中央劇本圖示 */}
          {script?.id && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0 opacity-80">
              <img 
                src={scriptLogoSrc(script)} 
                alt="Script Logo" 
                className="w-1/3 h-1/3 object-contain drop-shadow-2xl mix-blend-screen"
                onError={(e) => { e.currentTarget.style.display = 'none'; }} 
              />
            </div>
          )}

          {seats.map((seatIndex) => {
            const style = getSeatStyle(seatIndex);
            
            const roleId = grimoireState?.[seatIndex]?.roleId;
            const isDead = (grimoireState?.[seatIndex] as any)?.isDead;
            const role = roleId ? script.roles.find(r => r.id === roleId) : null;
            const isEvil = role?.type === "demon" || role?.type === "minion";

            const isHighlighted = highlightedSeats?.includes(seatIndex);
            const isReplayActor = replayActorSeat === seatIndex;
            const isReplayTarget = replayTargetSeats?.includes(seatIndex);
            // 復盤中有座位被強調時，其餘座位淡化為 60% 透明度
            const dimForReplay = (highlightedSeats?.length ?? 0) > 0 && !isHighlighted;
            let highlightLabel: string | null = null;
            if (isHighlighted && !isSituationReplay && (isReplayActor || isReplayTarget)) {
              if (replayEventType === 'DEATH_TOGGLE') highlightLabel = '死亡';
              else if (replayEventType === 'VOTE_RESULT') highlightLabel = isReplayActor ? '被提名者' : '提名者';
              else highlightLabel = isReplayActor ? '行動者' : '目標';
            }
            return (
              <div
                key={seatIndex}
                className={`absolute pointer-events-auto cursor-pointer group transition-opacity duration-300 ${isHighlighted ? 'z-[60]' : 'z-10'} ${dimForReplay ? 'opacity-60' : ''}`}
                style={style}
                onClick={() => openModal("seat", seatIndex)}
                onMouseEnter={() => setHoverSeat(seatIndex)}
                onMouseLeave={() => setHoverSeat(null)}
              >
                {/* Seat Highlighting Badge（局勢紀錄不顯示文字，只留外框閃爍） */}
                {highlightLabel && (
                  <div className={`absolute -top-7 left-1/2 -translate-x-1/2 text-white text-[15px] font-bold px-2.5 py-0.5 rounded-full shadow-lg border border-white/40 whitespace-nowrap animate-bounce z-40 ${isReplayActor ? 'bg-red-600' : 'bg-sky-600'}`}>
                    {highlightLabel}
                  </div>
                )}

                {/* 復盤強調外框：呼吸效果只套在這個外框，不影響座位角色本身 */}
                {isHighlighted && (
                  <div className={`absolute inset-0 rounded-full ring-4 ring-offset-4 ring-offset-black animate-breathe pointer-events-none z-30 ${isReplayActor ? 'ring-red-500 shadow-[0_0_25px_rgba(239,68,68,0.9)]' : 'ring-sky-400 shadow-[0_0_25px_rgba(56,189,248,0.9)]'}`} />
                )}

                <div onMouseEnter={(e) => { if (role) { const rect = e.currentTarget.getBoundingClientRect(); setHoveredRoleTooltip({ role: role, x: rect.left + rect.width / 2, y: rect.bottom }); } }} onMouseLeave={() => setHoveredRoleTooltip(null)}
                    className={`relative w-full h-full rounded-full border-4 flex items-center justify-center shadow-lg transition-transform overflow-hidden cursor-pointer pointer-events-auto ${
                      role
                        ? (isEvil ? 'border-red-900/80 bg-black/90' : 'border-blue-900/80 bg-black/90')
                        : 'border-amber-600/80 bg-black/80 hover:border-amber-400 shadow-[0_0_12px_rgba(217,119,6,0.3)]'
                    }`}>
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
                        <div className="w-full h-full relative flex flex-col items-center justify-center bg-[radial-gradient(circle_at_center,_#f4e5c5_0%,_#dcb37b_100%)]">
                          <span className="text-[#503214]/30 font-bold leading-none" style={{ fontSize: `${seatPx * 0.38}px` }}>{seatIndex}</span>
                        </div>
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

          {/* Grimoire Seat Tokens Render */}
            {seats.map((seatIndex) => {
              const { radius } = seatCfg;
              const size = seatPx;
              const tokenSize = tokenBaseSeatPx * 0.5;
              const angleDeg = ((seatIndex - 1) / seatCount) * 360 - 90;
              const angleRad = (angleDeg * Math.PI) / 180;

              const currentTokens = (seatTokens || {})[seatIndex] || [];
              const elements: React.ReactNode[] = [];
              const seatRadiusPx = size / 2;
              const tokenRadiusPx = tokenSize / 2;
              const tokz = hoverSeat === seatIndex ? 'z-40' : 'z-20';
              const tokHover = { onMouseEnter: () => setHoverSeat(seatIndex), onMouseLeave: () => setHoverSeat(null) };

              const getPosition = (i: number) => {
                const distPx = seatRadiusPx + 5 + tokenRadiusPx + (i * (tokenSize + 1));
                const baseX = 50 + radius * Math.cos(angleRad);
                const baseY = 50 + radius * Math.sin(angleRad);
                const offsetX = distPx * Math.cos(angleRad);
                const offsetY = distPx * Math.sin(angleRad);
                return { left: `calc(${baseX}% - ${offsetX}px)`, top: `calc(${baseY}% - ${offsetY}px)` };
              };

              for(let i = 0; i < currentTokens.length; i++) {
                const pos = getPosition(i);
                elements.push(
                  <div
                    key={`token-${seatIndex}-${currentTokens[i].id}`}
                    onClick={(e) => { e.stopPropagation(); handleRemoveSeatToken(seatIndex, currentTokens[i].id); }}
                    {...tokHover}
                    className={`absolute rounded-full bg-slate-800 border-2 border-slate-500 shadow-[0_2px_6px_rgba(0,0,0,0.6)] flex items-center justify-center cursor-pointer hover:bg-red-900/90 hover:border-red-500 hover:text-white transition-all ${tokz} pointer-events-auto group/token overflow-hidden`}
                    style={{ left: pos.left, top: pos.top, width: `${tokenSize}px`, height: `${tokenSize}px`, transform: 'translate(-50%, -50%)' }}
                    title={currentTokens[i].text || currentTokens[i].content || "移除標記"}
                  >
                    {currentTokens[i].type === 'image' && currentTokens[i].image ? (
                      <div className="relative w-full h-full flex flex-col items-center justify-center group-hover/token:opacity-0 transition-opacity">
                        <img src={currentTokens[i].image} alt={currentTokens[i].text} className="w-[85%] h-[85%] object-contain -mt-[16%]" />
                        <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full pointer-events-none drop-shadow-md">
                          <path id={`grim-curve-${seatIndex}-${i}`} d="M 12 55 A 38 38 0 0 0 88 55" fill="transparent" />
                          <text className="fill-amber-200 font-bold tracking-[4px]" style={{ fontSize: '21px', filter: 'drop-shadow(0px 2px 2px rgba(0,0,0,0.8))' }}>
                            <textPath href={`#grim-curve-${seatIndex}-${i}`} startOffset="50%" textAnchor="middle">
                              {currentTokens[i].text}
                            </textPath>
                          </text>
                        </svg>
                      </div>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center group-hover/token:hidden absolute inset-0">
                        <span className="text-center font-extrabold leading-none w-[90%] break-all" style={{ fontSize: `${tokenSize * 0.24}px`, color: '#ffffff', WebkitTextStroke: '0.3px #000000', textShadow: '0 1px 3px rgba(0,0,0,0.8)', lineHeight: '1.2' }}>
                          {currentTokens[i].content}
                        </span>
                      </div>
                    )}
                    <span className="absolute inset-0 hidden group-hover/token:flex items-center justify-center font-bold text-white bg-transparent rounded-full" style={{ fontSize: `${tokenSize * 0.4}px` }}>X</span>
                  </div>
                );
              }
              if (currentTokens.length < 3) {
                const pos = getPosition(currentTokens.length);
                elements.push(
                  <div
                    key={`plus-${seatIndex}`}
                    onClick={(e) => { e.stopPropagation(); setTokenTargetSeat(seatIndex); setTokenModalOpen(true); }}
                    {...tokHover}
                    className={`absolute rounded-full bg-slate-800 border-2 border-slate-500 border-solid flex items-center justify-center text-slate-500 font-bold cursor-pointer hover:bg-indigo-600 hover:border-indigo-400 hover:text-white hover:scale-110 shadow-[0_2px_6px_rgba(0,0,0,0.6)] opacity-50 hover:opacity-100 transition-all ${tokz} pointer-events-auto`}
                    style={{ left: pos.left, top: pos.top, width: `${tokenSize}px`, height: `${tokenSize}px`, transform: 'translate(-50%, -50%)' }}
                    title="新增筆記標記"
                  >
                    <svg className="w-1/2 h-1/2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                    </svg>
                  </div>
                );
              }
              return <Fragment key={`grim-tokens-${seatIndex}`}>{elements}</Fragment>;
            })}


          {/* Night Order Badges */}
          {(() => {
            const firstWeights = new Set<number>();
            const otherWeights = new Set<number>();
            seats.forEach(i => {
              const rId = grimoireState?.[i]?.roleId;
              if (rId) {
                const r = script.roles.find(x => x.id === rId);
                if (r && r.firstNight && r.firstNight > 0) firstWeights.add(r.firstNight);
                if (r && r.otherNight && r.otherNight > 0) otherWeights.add(r.otherNight);
              }
            });
            const sortedFirst = Array.from(firstWeights).sort((a, b) => a - b);
            const sortedOther = Array.from(otherWeights).sort((a, b) => a - b);

            return seats.map((seatIndex) => {
              const roleId = grimoireState?.[seatIndex]?.roleId;
              const role = roleId ? script.roles.find(r => r.id === roleId) : null;
              if (!role) return null;

              const firstNum = role.firstNight && role.firstNight > 0 ? sortedFirst.indexOf(role.firstNight) + 1 : null;
              const otherNum = role.otherNight && role.otherNight > 0 ? sortedOther.indexOf(role.otherNight) + 1 : null;

              if (!firstNum && !otherNum) return null;

              const style = getSeatStyle(seatIndex);
              const badgeStyle = { width: `${badgePx}px`, height: `${badgePx}px`, fontSize: `${badgePx * 0.55}px` };

              return (
                <div
                  key={`badge-${seatIndex}`}
                  className="absolute pointer-events-none z-30"
                  style={style}
                >
                  {firstNum && (
                    <div className="absolute left-[-10px] top-1/2 -translate-y-1/2 rounded-full bg-blue-900 border-2 border-blue-400 text-blue-100 flex items-center justify-center font-bold shadow-xl" style={badgeStyle}>
                      {firstNum}
                    </div>
                  )}
                  {otherNum && (
                    <div className="absolute right-[-10px] top-1/2 -translate-y-1/2 rounded-full bg-red-900 border-2 border-red-400 text-red-100 flex items-center justify-center font-bold shadow-xl" style={badgeStyle}>
                      {otherNum}
                    </div>
                  )}
                </div>
              );
            });
          })()}

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
                <div
                  className="absolute left-1/2 -translate-x-1/2 w-max text-center z-50"
                  style={{ top: `calc(100% + ${Math.max(1, seatPx * 0.04)}px)`, fontSize: `${Math.max(11, Math.min(20, seatPx * 0.15))}px` }}
                >
                  <div className={`font-bold bg-black/80 px-2 py-0.5 rounded-md max-w-[38vw] lg:max-w-none truncate border shadow-[0_0_10px_rgba(0,0,0,1)] ${
                    player
                      ? 'border-sky-500 text-sky-100 shadow-[0_0_15px_rgba(56,189,248,0.5)]'
                      : 'border-white/30 text-white'
                  }`}>
                    <span className="text-amber-400 mr-1 tracking-wider">{seatIndex}.</span>
                    <span className="text-gray-100">{player ? player.name : '空座位'}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 左下角說書人資訊 */}
      <div className="absolute left-0.5 bottom-7 lg:left-[36px] lg:bottom-[1px] z-20 w-[220px] pointer-events-none lg:pb-6 hidden lg:flex flex-col justify-end">
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
        script={script}
        filterType={target?.type === 'fabled' ? 'fabled' : 'normal'}
        selectedFabled={fabled}
      />
      <SeatTokenModal
        isOpen={tokenModalOpen}
        onClose={() => setTokenModalOpen(false)}
        onSave={handleSaveSeatToken}
      />
    </div>
  );
};
