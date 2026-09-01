import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getGameReplay, type GameReplay, type ReplayEvent } from '../../services/replayService';
import { AllRoles } from '../../data/roles';
import { RoleIcon } from '../common/RoleIcon';

export const ReplayViewer: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [replay, setReplay] = useState<GameReplay | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playSpeed, setPlaySpeed] = useState(2000); // ms per step

  const timerRef = useRef<any>(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    getGameReplay(id).then((data) => {
      setReplay(data);
      setLoading(false);
    }).catch((err) => {
      console.error(err);
      setLoading(false);
    });
  }, [id]);

  // Auto-play timer
  useEffect(() => {
    if (isPlaying && replay && replay.timeline.length > 0) {
      timerRef.current = setInterval(() => {
        setCurrentStepIndex((prev) => {
          if (prev >= replay.timeline.length - 1) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, playSpeed);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, replay, playSpeed]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-black text-slate-400">
        載入遊戲復盤紀錄中...
      </div>
    );
  }

  if (!replay || replay.timeline.length === 0) {
    return (
      <div className="flex flex-col h-screen items-center justify-center bg-black text-slate-300 space-y-4">
        <div className="text-xl font-bold">此房間尚未有足夠的遊戲復盤事件紀錄</div>
        <p className="text-sm text-slate-500">
          當說書人開始分配角色、進行投票與推進日夜時，系統會自動生成詳細的復盤時間軸。
        </p>
        <button
          onClick={() => navigate('/')}
          className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-lg text-sm transition-colors"
        >
          返回大廳
        </button>
      </div>
    );
  }

  const currentEvent: ReplayEvent = replay.timeline[currentStepIndex] || replay.timeline[0];
  const snapshot = currentEvent.snapshot || { seatRoles: {}, seatStatus: {}, seatTokens: {} };

  // Calculate seats layout
  const totalSeats = Math.max(
    10,
    ...Object.keys(snapshot.seatRoles || {}).map(Number),
    ...Object.values(replay.players || {}).map(p => p.seat || 0)
  );

  const seats = Array.from({ length: totalSeats }, (_, i) => i + 1);

  const getSeatConfig = () => {
    const count = totalSeats;
    if (count <= 6) return { size: 140, radius: 40 };
    if (count <= 8) return { size: 130, radius: 41.5 };
    if (count <= 10) return { size: 120, radius: 42.5 };
    if (count <= 12) return { size: 110, radius: 43.5 };
    if (count <= 14) return { size: 100, radius: 44.5 };
    return { size: 90, radius: 45 };
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

  const getPlayerInSeat = (seatIndex: number) => {
    return Object.values(replay.players || {}).find(p => p.seat === seatIndex);
  };

  return (
    <div className="min-h-screen bg-black text-slate-100 flex flex-col relative overflow-hidden font-sans">
      {/* Background Graphic */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat opacity-40 mix-blend-luminosity pointer-events-none blur-[2px]"
        style={{ backgroundImage: "url('/BackgroundRoom.jpg')" }}
      />
      <div className="absolute inset-0 z-0 bg-black/80 backdrop-blur-[2px]" />

      {/* Top Header */}
      <header className="relative z-10 bg-slate-900/90 border-b border-slate-700/80 px-4 py-3 flex items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-lg text-xs font-bold text-slate-200 transition-colors shadow"
          >
            <span>← 返回大廳</span>
          </button>
          <div>
            <h1 className="text-lg font-bold text-white tracking-widest font-serif flex items-center gap-2">
              <span>🎮 鐘樓遊戲復盤 (Replay)</span>
              <span className="text-xs px-2.5 py-0.5 bg-amber-900/80 text-amber-200 border border-amber-500/50 rounded-full font-bold">
                房號 #{replay.roomId}
              </span>
              <span className="text-[10px] px-2 py-0.5 bg-indigo-900/80 text-indigo-200 border border-indigo-500/50 rounded-full font-bold">
                👁️ 統一上帝視角
              </span>
            </h1>
          </div>
        </div>

        {/* Current Event Summary Badge */}
        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="text-xs text-amber-400 font-bold">
              第 {currentEvent.dayNumber} 天 - {currentEvent.timePhase === 'night' ? '黑夜' : '白天'}
            </div>
            <div className="text-[11px] text-slate-400 font-mono">
              進度：{currentStepIndex + 1} / {replay.timeline.length}
            </div>
          </div>
        </div>
      </header>

      {/* Main Body */}
      <div className="relative z-10 flex-1 grid grid-cols-1 lg:grid-cols-12 gap-4 p-4 min-h-0 overflow-hidden">
        
        {/* Left/Center: Dynamic Circular Board Reconstruction (8 Cols) */}
        <div className="lg:col-span-8 flex flex-col bg-slate-900/80 border border-slate-700 rounded-xl overflow-hidden shadow-2xl relative p-4">
          
          {/* Phase Badge */}
          <div className="absolute top-4 left-4 z-20 flex items-center gap-2 bg-black/70 border border-white/20 px-3 py-1.5 rounded-lg backdrop-blur-md">
            <span className={`w-3 h-3 rounded-full ${currentEvent.timePhase === 'night' ? 'bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,1)]' : 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,1)]'}`} />
            <span className="text-sm font-bold tracking-wider text-white">
              第 {currentEvent.dayNumber} 天 ({currentEvent.timePhase === 'night' ? '黑夜階段' : '白天公聊'})
            </span>
          </div>

          {/* Board Arena */}
          <div className="flex-1 flex items-center justify-center relative min-h-[450px]">
            <div className="relative w-full h-full max-w-[75vh] max-h-[75vh] aspect-square flex items-center justify-center">
              
              {/* Seats in Snapshot */}
              {seats.map((seatIndex) => {
                const style = getSeatStyle(seatIndex);
                const roleId = snapshot.seatRoles?.[seatIndex];
                const role = roleId ? Object.values(AllRoles).find(r => r.id === roleId) || { id: roleId, name: roleId, icon: `/icons/${roleId}.png`, type: 'townsfolk' } : null;
                const isDead = snapshot.seatStatus?.[seatIndex]?.isDead || false;
                const hasGhostVote = snapshot.seatStatus?.[seatIndex]?.hasGhostVote || false;
                const player = getPlayerInSeat(seatIndex);
                const isEvil = role?.type === 'demon' || role?.type === 'minion';

                return (
                  <div
                    key={`replay-seat-${seatIndex}`}
                    className="absolute z-10 transition-all duration-300"
                    style={style}
                  >
                    {/* Role Circle */}
                    <div
                      className={`relative w-full h-full rounded-full border-4 flex items-center justify-center shadow-lg transition-transform overflow-hidden ${
                        role
                          ? (isEvil ? 'border-red-900/90 bg-black' : 'border-blue-900/90 bg-black')
                          : 'border-slate-700 bg-black/60'
                      }`}
                    >
                      {role ? (
                        <div className="w-full h-full relative flex flex-col items-center justify-start bg-[radial-gradient(circle_at_center,_#f4e5c5_0%,_#dcb37b_100%)]">
                          <div className="w-full h-[70%] relative mt-2">
                            <RoleIcon icon={role.icon} className="w-full h-full object-contain" />
                          </div>
                          <div className="absolute inset-0 pointer-events-none">
                            <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible drop-shadow-md">
                              <path id={`replay-curve-${seatIndex}`} d="M 15 78 A 43 43 0 0 0 85 78" fill="transparent" />
                              <text fill="rgba(80,50,20,0.9)" fontSize="16" fontWeight="bold" textAnchor="middle" letterSpacing="3">
                                <textPath href={`#replay-curve-${seatIndex}`} startOffset="50%">
                                  {role.name}
                                </textPath>
                              </text>
                            </svg>
                          </div>
                        </div>
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-500 font-bold text-2xl">
                          {seatIndex}
                        </div>
                      )}

                      {/* Death Curtain */}
                      {isDead && (
                        <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
                          <img src="/assets/ui/DeathMark.png" className="absolute top-[-12%] w-[110%] h-auto object-contain opacity-95 drop-shadow-[0_4px_10px_rgba(0,0,0,0.9)] z-10" alt="Dead" />
                        </div>
                      )}
                    </div>

                    {/* Ghost Vote Badge */}
                    {isDead && hasGhostVote && (
                      <div className="absolute -bottom-[5%] -right-[5%] w-[31%] h-[31%] flex items-center justify-center z-20 pointer-events-none">
                        <img src="/assets/ui/DeathVote.png" className="w-full h-full object-contain drop-shadow-[0_4px_6px_rgba(0,0,0,0.8)]" alt="Ghost Vote" />
                      </div>
                    )}

                    {/* Seat Label */}
                    <div className="absolute -bottom-7 left-1/2 -translate-x-1/2 w-max text-center z-30 pointer-events-none">
                      <div className="font-bold bg-black/85 px-2 py-0.5 rounded text-xs whitespace-nowrap border border-white/20 shadow text-white">
                        <span className="text-amber-400 mr-1">{seatIndex}.</span>
                        <span>{player ? player.name : '空座'}</span>
                      </div>
                    </div>
                  </div>
                );
              })}

            </div>
          </div>

          {/* Bottom Timeline Controls */}
          <div className="bg-black/60 border border-slate-700/80 rounded-xl p-3 space-y-2 mt-auto shrink-0">
            {/* Scrubber Slider */}
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-slate-400">1</span>
              <input
                type="range"
                min={0}
                max={replay.timeline.length - 1}
                value={currentStepIndex}
                onChange={(e) => {
                  setCurrentStepIndex(Number(e.target.value));
                  setIsPlaying(false);
                }}
                className="flex-1 cursor-pointer accent-indigo-500"
              />
              <span className="text-xs font-bold text-slate-400">{replay.timeline.length}</span>
            </div>

            {/* Playback Buttons */}
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => { setCurrentStepIndex(0); setIsPlaying(false); }}
                  className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 rounded text-xs font-bold transition-colors"
                  title="回到起點"
                >
                  ⏮️
                </button>
                <button
                  onClick={() => { setCurrentStepIndex(p => Math.max(0, p - 1)); setIsPlaying(false); }}
                  disabled={currentStepIndex <= 0}
                  className="px-3 py-1 bg-slate-800 hover:bg-slate-700 disabled:opacity-30 rounded text-xs font-bold transition-colors"
                >
                  ◀ 上一步
                </button>
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className={`px-4 py-1 rounded text-xs font-bold transition-colors shadow ${
                    isPlaying ? 'bg-amber-600 text-white' : 'bg-indigo-600 hover:bg-indigo-500 text-white'
                  }`}
                >
                  {isPlaying ? '⏸️ 暫停' : '▶️ 播放'}
                </button>
                <button
                  onClick={() => { setCurrentStepIndex(p => Math.min(replay.timeline.length - 1, p + 1)); setIsPlaying(false); }}
                  disabled={currentStepIndex >= replay.timeline.length - 1}
                  className="px-3 py-1 bg-slate-800 hover:bg-slate-700 disabled:opacity-30 rounded text-xs font-bold transition-colors"
                >
                  下一步 ▶
                </button>
                <button
                  onClick={() => { setCurrentStepIndex(replay.timeline.length - 1); setIsPlaying(false); }}
                  className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 rounded text-xs font-bold transition-colors"
                  title="跳至結尾"
                >
                  ⏭️
                </button>
              </div>

              {/* Speed Selector */}
              <div className="flex items-center gap-2 text-xs">
                <span className="text-slate-400">播放速度：</span>
                <select
                  value={playSpeed}
                  onChange={(e) => setPlaySpeed(Number(e.target.value))}
                  className="bg-slate-800 border border-slate-600 rounded px-2 py-1 text-white text-xs focus:outline-none"
                >
                  <option value={3000}>0.5x (慢速)</option>
                  <option value={2000}>1.0x (正常)</option>
                  <option value={1000}>2.0x (快速)</option>
                </select>
              </div>
            </div>
          </div>

        </div>

        {/* Right: Chronological Event Log Stream (4 Cols) */}
        <div className="lg:col-span-4 flex flex-col bg-slate-900/90 border border-slate-700 rounded-xl overflow-hidden shadow-2xl">
          {/* Current Event Spotlight */}
          <div className="p-4 bg-indigo-950/40 border-b border-indigo-900/60 shrink-0 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold px-2 py-0.5 rounded bg-indigo-600 text-white uppercase tracking-wider">
                {currentEvent.type}
              </span>
              <span className="text-xs text-slate-400 font-mono">
                {new Date(currentEvent.timestamp).toLocaleTimeString()}
              </span>
            </div>
            <h3 className="text-base font-bold text-white tracking-wide">
              {currentEvent.title}
            </h3>
            <p className="text-xs text-indigo-200/90 leading-relaxed bg-black/40 p-2.5 rounded-lg border border-indigo-500/20">
              {currentEvent.description}
            </p>
          </div>

          {/* Timeline Event List */}
          <div className="flex-1 overflow-y-auto p-3 custom-scrollbar space-y-2">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 px-1">
              完整事件時間軸 (Timeline)
            </h4>

            {replay.timeline.map((ev, idx) => {
              const isCurrent = idx === currentStepIndex;
              return (
                <div
                  key={`event-${idx}`}
                  onClick={() => {
                    setCurrentStepIndex(idx);
                    setIsPlaying(false);
                  }}
                  className={`p-2.5 rounded-lg border transition-all cursor-pointer text-left ${
                    isCurrent
                      ? 'bg-indigo-900/60 border-indigo-400 shadow-md translate-x-1'
                      : 'bg-slate-800/60 border-slate-700/60 hover:bg-slate-800 hover:border-slate-500'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className={`font-bold ${isCurrent ? 'text-indigo-200' : 'text-slate-300'}`}>
                      #{idx + 1} {ev.title}
                    </span>
                    <span className="text-[10px] text-slate-500">
                      第{ev.dayNumber}天
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 line-clamp-2">
                    {ev.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
};
