import { useState, Fragment } from "react";
import { useElementSize } from "../../hooks/useElementSize";
import { setGrimoireRole, setGrimoireBluff, updateFabledIndex } from "../../services/roomService";
import type { Script } from "../../data/types";
import { RoleIcon } from "../common/RoleIcon";
import { RoleTooltip } from '../common/RoleTooltip';
import { AllRoles } from "../../data/roles";
import { highlightAbility } from "../../lib/highlightAbility";
import { RoleSelectionModal } from "./RoleSelectionModal";
import { SeatTokenModal } from './SeatTokenModal';
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
  const [hoveredRoleTooltip, setHoveredRoleTooltip] = useState<{ role: any, x: number, y: number } | null>(null);
  const [tokenModalOpen, setTokenModalOpen] = useState(false);
  const [tokenTargetSeat, setTokenTargetSeat] = useState<number | null>(null);
  // 窄屏：惡魔偽裝 / 傳奇 / 房間 合併為分頁視窗
  const [infoTab, setInfoTab] = useState<'bluffs' | 'fabled' | 'room'>('bluffs');
  // hover 座位或其筆記時，將該座位的筆記層級提高、壓過其他座位的筆記
  const [hoverSeat, setHoverSeat] = useState<number | null>(null);

  // 圓桌等比縮放：量測外框可用區，取內接正方形當圓桌，座位 = min(桌機上限, 板寬 * 比例)。
  const [boardWrapRef, boardWrap] = useElementSize<HTMLDivElement>();
  const boardPx = Math.min(boardWrap.width, boardWrap.height) || 0;

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

  const getSeatConfig = (count: number) => {
    // frac ≈ 讓相鄰座位相接的比例；radius 是座位離圓心的距離（%）；
    // 6 人與 8 人用相同 frac（手機上不再放大，中間留給筆記）；13 人以上維持原樣。
    if (count <= 6) return { max: 460, frac: 0.248, floor: 58, radius: 34 };
    if (count <= 8) return { max: 500, frac: 0.248, floor: 58, radius: 36 };
    if (count <= 10) return { max: 420, frac: 0.206, floor: 50, radius: 37 };
    if (count <= 12) return { max: 360, frac: 0.177, floor: 46, radius: 38 };
    if (count <= 15) return { max: 300, frac: 0.150, floor: 38, radius: 40 };
    return { max: 232, frac: 0.115, floor: 32, radius: 41 };
  };

  const computeSeatPx = (count: number) => {
    const cfg = getSeatConfig(count);
    // 桌機（板寬 ≥ 560）且 ≤12 人時，座位縮 0.82 → 間隔加大、較不擁擠；窄屏與 13+ 不受影響
    const gf = boardPx >= 560 && count <= 12 ? 0.82 : 1;
    return Math.min(cfg.max, Math.max(cfg.floor, (boardPx || 720) * cfg.frac * gf));
  };

  const seatCfg = getSeatConfig(seatCount);
  const seatPx = computeSeatPx(seatCount);
  // 筆記圈圈基準：座位大小夾在「9 人排版」與「15 人排版」之間，避免少人時太大、多人時太小
  const tokenBaseSeatPx = Math.min(computeSeatPx(9), Math.max(computeSeatPx(15), seatPx));
  const badgePx = Math.max(18, seatPx * 0.32);

  const getSeatStyle = (index: number) => {
    const angleDeg = ((index - 1) / seatCount) * 360 - 90;
    const angleRad = (angleDeg * Math.PI) / 180;
    const { radius } = seatCfg;
    const x = 50 + radius * Math.cos(angleRad);
    const y = 50 + radius * Math.sin(angleRad);
    return {
      left: `${x}%`,
      top: `${y}%`,
      transform: 'translate(-50%, -50%)',
      width: `${seatPx}px`,
      height: `${seatPx}px`
    };
  };

  const [t, o, m, d, v = 0] = distribution || [0, 0, 0, 0, 0];

  return (
    <div className="flex-1 flex flex-col relative overflow-hidden h-full">
      
      {/* 資訊卡：桌機為右側直欄；窄屏 = 陣營(右上) + 分頁視窗(右下) */}
      <div className="contents lg:absolute lg:z-20 lg:pointer-events-none lg:flex lg:flex-col lg:items-stretch lg:gap-4 lg:right-4 lg:top-4 lg:bottom-4 lg:w-64 2xl:w-72">

        {/* 陣營人數與生存資訊（窄屏右上角） */}
        <div className="absolute z-20 top-2.5 right-2.5 w-[160px] lg:static lg:w-full bg-stone-800/80 border-2 border-white/40 rounded-xl py-2 px-2 lg:py-2.5 shadow-lg pointer-events-auto backdrop-blur-md flex flex-col items-center">
          <div className="flex justify-between items-center text-center divide-x divide-white/20 w-full mb-2 lg:mb-3">
            <div className="flex-1"><div className="text-sm lg:text-lg font-bold text-blue-300">民</div><div className="text-sm lg:text-lg font-bold text-white">{t}</div></div>
            <div className="flex-1"><div className="text-sm lg:text-lg font-bold text-blue-300">外</div><div className="text-sm lg:text-lg font-bold text-white">{o}</div></div>
            <div className="flex-1"><div className="text-sm lg:text-lg font-bold text-red-400">爪</div><div className="text-sm lg:text-lg font-bold text-white">{m}</div></div>
            <div className="flex-1"><div className="text-sm lg:text-lg font-bold text-red-400">惡</div><div className="text-sm lg:text-lg font-bold text-white">{d}</div></div>
            {v > 0 && <div className="flex-1"><div className="text-sm lg:text-lg font-bold text-purple-400">旅</div><div className="text-sm lg:text-lg font-bold text-white">{v}</div></div>}
          </div>

          <div className="w-[80%] h-px bg-white/20 mb-2 lg:mb-3" />

          <div className="flex justify-between items-center w-full px-0 lg:px-2 text-center">
            <div className="flex flex-row justify-center items-center gap-1 lg:gap-2 flex-1 group" title="總玩家數">
              <img src="/assets/ui/HumanCount.png" className="w-6 h-6 lg:w-[34px] lg:h-[34px] object-contain drop-shadow-md" alt="總數" />
              <span className="text-base lg:text-xl font-bold text-white group-hover:scale-110 transition-transform">{seats.length}</span>
            </div>
            <div className="w-px h-7 lg:h-10 bg-white/20 mx-1 lg:mx-2"></div>
            <div className="flex flex-row justify-center items-center gap-1 lg:gap-2 flex-1 group" title="存活玩家數">
              <img src="/assets/ui/LiveCount.png" className="w-6 h-6 lg:w-[34px] lg:h-[34px] object-contain drop-shadow-[0_0_4px_rgba(185,28,28,0.6)]" alt="存活" />
              <span className="text-base lg:text-xl font-bold text-white group-hover:scale-110 transition-transform">{seats.length - Object.values(seatStatus).filter(s => s?.isDead).length}</span>
            </div>
            <div className="w-px h-7 lg:h-10 bg-white/20 mx-1 lg:mx-2"></div>
            <div className="flex flex-row justify-center items-center gap-1 lg:gap-2 flex-1 group" title="擁有死亡票數">
              <img src="/assets/ui/DeathVote.png" className="w-6 h-6 lg:w-[34px] lg:h-[34px] object-contain drop-shadow-md" alt="死亡票" />
              <span className="text-base lg:text-xl font-bold text-white group-hover:scale-110 transition-transform">{Object.values(seatStatus).filter(s => s?.isDead && s?.hasGhostVote).length}</span>
            </div>
          </div>
        </div>

        {/* 惡魔偽裝 / 傳奇 / 房間：桌機各自獨立卡；窄屏合併為右下角分頁視窗 */}
        <div className="absolute z-20 bottom-7 right-0.5 w-[236px] flex flex-col lg:static lg:w-auto lg:contents">

        {/* 分頁按鈕（僅窄屏） */}
        <div className="flex lg:hidden rounded-t-xl overflow-hidden border-2 border-b-0 border-white/30 text-sm font-bold pointer-events-auto shadow-lg">
          {([['bluffs', '偽裝'], ['fabled', '傳奇'], ['room', '房間']] as const).map(([k, label]) => (
            <button key={k} onClick={() => setInfoTab(k)} className={`flex-1 py-1.5 transition-colors ${infoTab === k ? 'bg-stone-700 text-white' : 'bg-stone-900/85 text-white/45'}`}>{label}</button>
          ))}
        </div>

        {/* 惡魔的偽裝 */}
        <div className={`${infoTab === 'bluffs' ? 'flex' : 'hidden'} lg:flex flex-col items-center space-y-2 pointer-events-auto bg-stone-800/80 border-2 border-rose-900/80 p-3 pb-2 rounded-b-xl lg:rounded-xl shadow-lg backdrop-blur-md`}>
          <h3 className="hidden lg:block text-lg font-bold text-red-400/90 uppercase tracking-widest border-b border-white/30 pb-1 w-full text-center">惡魔的偽裝</h3>
          <div className="grid grid-cols-3 gap-2 w-full">
            {[0, 1, 2].map(i => {
              const roleId = bluffs[i];
              const role = roleId ? script?.roles.find(r => r.id === roleId) : null;
              return (
                <div
                  key={i}
                  className="flex flex-col items-center cursor-pointer group min-w-0 relative hover:z-[9999]"
                  onClick={() => openModal("bluff", i)}
                >
                  <div className={`w-full aspect-square max-w-[84px] rounded-full border-2 flex flex-col items-center justify-center shadow-lg relative overflow-hidden transition-all ${roleId ? 'border-red-900 bg-black hover:border-red-500' : 'border-red-500/40 border-dashed bg-black/60 hover:border-red-400'}`}>
                    {role ? (
                      <RoleIcon icon={role.icon} className="w-full h-full object-cover bg-[radial-gradient(circle_at_center,_#f4e5c5_0%,_#dcb37b_100%)] group-hover:scale-105 transition-transform" />
                    ) : (
                      <span className="text-red-500/60 text-lg font-bold group-hover:text-red-400">空</span>
                    )}
                  </div>
                  {role && (
                    <div className="absolute top-[110%] right-0 w-64 bg-slate-800/95 border-2 border-slate-500 text-white text-sm leading-relaxed p-3 rounded-lg shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-[100] pointer-events-none text-left cursor-default">
                      <div>{highlightAbility(role.ability)}</div>
                    </div>
                  )}
                  {role && <span className="text-base font-bold text-red-400/90 uppercase tracking-widest mt-1 truncate w-full text-center">{role.name}</span>}
                </div>
              );
            })}
          </div>
        </div>

        {/* 傳奇角色 */}
        <div className={`${infoTab === 'fabled' ? 'flex' : 'hidden'} lg:flex flex-col bg-stone-800/80 border-2 border-yellow-400 rounded-b-xl lg:rounded-xl p-3 shadow-lg pointer-events-auto backdrop-blur-md`}>
          <h3 className="hidden lg:block text-lg font-bold text-yellow-500/80 mb-2 border-b border-yellow-500/20 pb-1 text-center uppercase tracking-widest cursor-pointer hover:text-yellow-400" onClick={() => openModal("fabled")}>傳奇角色</h3>
          <div className="grid grid-cols-3 gap-2 w-full">
            {[0, 1, 2].map(i => {
              const roleId = fabled[i];
              const role = roleId ? Object.values(AllRoles).find(r => r.id === roleId) : null;
              return (
                <div
                  key={i}
                  className="flex flex-col items-center cursor-pointer group min-w-0 relative hover:z-[9999]"
                  onClick={() => openModal("fabled", i)}
                  onMouseEnter={(e) => { if (role) { const rect = e.currentTarget.getBoundingClientRect(); setHoveredRoleTooltip({ role, x: rect.left + rect.width / 2, y: rect.bottom }); } }}
                  onMouseLeave={() => setHoveredRoleTooltip(null)}
                >
                  <div className={`w-full aspect-square max-w-[84px] rounded-full border-2 flex items-center justify-center shadow-lg relative overflow-hidden transition-all ${roleId ? 'border-yellow-500/50 bg-black/80 hover:border-yellow-400' : 'border-yellow-500/40 border-dashed bg-black/50 hover:border-yellow-400'}`}>
                    {role ? (
                      <>
                        <RoleIcon icon={role.icon} className="w-full h-full object-cover bg-[radial-gradient(circle_at_center,_#f4e5c5_0%,_#dcb37b_100%)] group-hover:scale-105 transition-transform" />
                        <div className="absolute inset-0 bg-red-900/80 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity text-xl font-bold" onClick={(e) => { e.stopPropagation(); updateFabledIndex(roomId, i, null); }}>✕</div>
                      </>
                    ) : (
                      <span className="text-yellow-500/60 text-3xl group-hover:text-yellow-400 font-bold">+</span>
                    )}
                  </div>
                  {role && <span className="text-base font-bold text-yellow-400/90 uppercase tracking-widest mt-1 truncate w-full text-center">{role.name}</span>}
                </div>
              );
            })}
          </div>
        </div>
        
        {/* Spacer to push the rest to bottom（僅直欄模式） */}
        <div className="hidden lg:block flex-1 min-h-[1rem]" />

        {/* 房間資訊 */}
        <div className={`${infoTab === 'room' ? 'flex' : 'hidden'} lg:flex flex-col items-center bg-stone-800/80 border-2 border-white/40 rounded-b-xl lg:rounded-xl p-3 shadow-lg pointer-events-auto backdrop-blur-md space-y-3`}>
          <div className="flex justify-start w-full items-center">
            <span className="text-lg text-white/50 tracking-widest uppercase mr-2">Room :</span>
            <span className="font-mono text-white text-lg font-bold">{roomId}</span>
            <button 
              onClick={() => {
                navigator.clipboard.writeText(window.location.href);
                const btn = document.getElementById('copy-url-btn-grim');
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
              id="copy-url-btn-grim"
              className="ml-auto text-sm bg-white/10 hover:bg-white/20 border border-white/20 text-white/80 px-2 py-1 rounded transition-colors"
            >
              複製網址
            </button>
          </div>
          <button 
            onClick={onOpenScriptModal}
            className="w-full py-2 bg-[rgba(68,64,60,0.8)] border border-white/30 text-[#ff6b6b] hover:text-[#ff8b8b] hover:bg-[rgba(68,64,60,0.9)] rounded-lg shadow-md font-bold font-serif transition-colors text-lg px-2 flex items-center justify-center space-x-2 overflow-hidden group"
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
                  <span className="text-base md:text-lg leading-tight w-full text-center break-words">{script.name.split(' ')[0]}</span>
                  {script.name.split(' ').length > 1 && (
                    <span className="text-sm md:text-base leading-tight w-full text-center break-words opacity-80">{script.name.split(' ').slice(1).join(' ')}</span>
                  )}
                </>
              ) : (
                <span className="text-lg text-center leading-tight truncate w-full">未知劇本</span>
              )}
            </div>
          </button>
          <button onClick={onLeaveRoom} className="w-full text-lg px-4 py-2 bg-red-900/80 hover:bg-red-800/90 border border-red-500/50 text-red-200 rounded-md transition-colors font-bold">
            離開房間
          </button>
        </div>
        </div>
      </div>

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
                src={`/drama/Drama_${script.id}.png`} 
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
            return (
              <div
                key={seatIndex}
                className="absolute pointer-events-auto cursor-pointer group z-10"
                style={style}
                onClick={() => openModal("seat", seatIndex)}
                onMouseEnter={() => setHoverSeat(seatIndex)}
                onMouseLeave={() => setHoverSeat(null)}
              >
                {/* Seat Highlighting Badge（局勢紀錄不顯示文字，只留外框閃爍） */}
                {isHighlighted && !isSituationReplay && (replayActorSeat === seatIndex || replayTargetSeats?.includes(seatIndex)) && (
                  <div className={`absolute -top-7 left-1/2 -translate-x-1/2 text-white text-[15px] font-bold px-2.5 py-0.5 rounded-full shadow-lg border border-white/40 whitespace-nowrap animate-bounce z-40 ${replayActorSeat === seatIndex ? 'bg-red-600' : 'bg-sky-600'}`}>
                    {replayActorSeat === seatIndex ? '行動者' : '目標'}
                  </div>
                )}

                <div onMouseEnter={(e) => { if (role) { const rect = e.currentTarget.getBoundingClientRect(); setHoveredRoleTooltip({ role: role, x: rect.left + rect.width / 2, y: rect.bottom }); } }} onMouseLeave={() => setHoveredRoleTooltip(null)}
                    className={`relative w-full h-full rounded-full border-4 flex items-center justify-center shadow-lg transition-transform overflow-hidden cursor-pointer pointer-events-auto ${
                      isHighlighted ? (replayActorSeat === seatIndex
                        ? 'ring-4 ring-red-500 ring-offset-4 ring-offset-black animate-breathe shadow-[0_0_25px_rgba(239,68,68,0.9)] scale-110 z-30 '
                        : 'ring-4 ring-sky-400 ring-offset-4 ring-offset-black animate-breathe shadow-[0_0_25px_rgba(56,189,248,0.9)] scale-110 z-30 ') : ''
                    }${
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
