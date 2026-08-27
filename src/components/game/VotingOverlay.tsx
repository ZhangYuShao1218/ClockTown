import React, { useState, useEffect, useRef } from 'react';
import { updateVotingState, updatePlayerVote } from '../../services/roomService';
import type { VotingState, SeatStatus } from '../../data/types';

interface VotingOverlayProps {
  roomId: string;
  isHost: boolean;
  votingState: VotingState;
  seatStatus: Record<number, SeatStatus>;
  seats: number[];
  getPlayerInSeat: (seatIndex: number) => any;
  userUid?: string;
  totalSeats: number;
  dayNumber?: number;
}

export const VotingOverlay: React.FC<VotingOverlayProps> = ({
  roomId,
  isHost,
  votingState,
  seatStatus,
  seats,
  getPlayerInSeat,
  userUid,
  totalSeats,
  dayNumber = 1
}) => {
  const { phase, nominatorSeat, nomineeSeat, startTime, timePerPlayerMs, votes } = votingState;
  
  const [timeSetting, setTimeSetting] = useState<number>(2000); // Default 2 seconds
  const [currentTime, setCurrentTime] = useState<number>(Date.now());
  const requestRef = useRef<number>(0);

  const aliveCount = seats.filter(s => !seatStatus[s]?.isDead).length;
  const requiredVotes = Math.ceil(aliveCount / 2);

  useEffect(() => {
    if (phase === 'voting' && startTime) {
      const animate = () => {
        setCurrentTime(Date.now());
        requestRef.current = requestAnimationFrame(animate);
      };
      requestRef.current = requestAnimationFrame(animate);
    }
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [phase, startTime]);

  // Compute pointer angle
  let currentAngle = 0;
  let isVotingFinished = false;
  if (phase === 'voting' && startTime && typeof nomineeSeat === 'number') {
    const elapsed = currentTime - startTime;
    const totalTime = totalSeats * timePerPlayerMs;
    const startAngle = (nomineeSeat / totalSeats) * 360 - 90;
    
    if (elapsed >= totalTime) {
      isVotingFinished = true;
      currentAngle = startAngle + 360;
    } else {
      let currentStep = Math.floor(elapsed / timePerPlayerMs) + 1;
      if (elapsed < 0) currentStep = 0;
      currentAngle = startAngle + (currentStep / totalSeats) * 360;
    }
  }

  // End voting if finished
  useEffect(() => {
    if (isHost && phase === 'voting' && isVotingFinished) {
      import('../../services/roomService').then(({ updateVotingState }) => {
        updateVotingState(roomId, { phase: 'finished' });
      });
    }
  }, [isHost, phase, isVotingFinished, roomId]);

  const handleStartVoting = () => {
    updateVotingState(roomId, {
      phase: 'voting',
      startTime: Date.now() + 1000, // Start 1s from now to sync
      timePerPlayerMs: timeSetting
    });
  };

  const saveVoteRecord = () => {
    import('../../services/roomService').then(({ addVoteRecord }) => {
      const totalVotes = Object.values(votes || {}).filter(Boolean).length;
      const timeStr = `第 ${dayNumber} 天`;
      addVoteRecord(roomId, {
        time: timeStr,
        nominatorSeat,
        nomineeSeat,
        totalVotes,
        votes: votes || {}
      });
    });
  };

  const handleCloseVoting = () => {
    if (phase === 'finished') {
      saveVoteRecord();
    }
    import('../../services/roomService').then(({ updateVotingState }) => {
      updateVotingState(roomId, {
        phase: 'idle',
        nominatorSeat: null,
        nomineeSeat: null,
        startTime: null,
        votes: {}
      });
    });
  };

  const markPendingAction = () => {
    if (typeof nomineeSeat === 'number') {
      import('../../services/roomService').then(({ updateSeatStatus }) => {
        updateSeatStatus(roomId, nomineeSeat, { pendingExecution: true });
        handleCloseVoting();
      });
    }
  };

  const handleRevote = () => {
    import('../../services/roomService').then(({ updateVotingState }) => {
      updateVotingState(roomId, {
        phase: 'idle',
        startTime: null,
        votes: {}
      });
    });
  };

  const userSeat = seats.find(s => getPlayerInSeat(s)?.uid === userUid);
  
  // Calculate if player's vote is locked
  let isLocked = false;
  if (phase === 'finished') isLocked = true;
  if (phase === 'voting' && startTime && userSeat !== undefined && typeof nomineeSeat === 'number') {
    const elapsed = Date.now() - startTime;
    
    // Find distance from nomineeSeat to userSeat (clockwise)
    let seatsPassed = userSeat - nomineeSeat;
    if (seatsPassed <= 0) seatsPassed += totalSeats;
    if (userSeat === nomineeSeat) seatsPassed = totalSeats; // Nominee is the VERY LAST person to vote!

    const timeForUser = seatsPassed * timePerPlayerMs;
    if (elapsed >= timeForUser) {
      isLocked = true;
    }
  }

  const castVote = (voteToExecute: boolean) => {
    if (!userUid || isLocked) return;
    updatePlayerVote(roomId, userUid, voteToExecute);
  };

  const currentVoteCount = Object.values(votes || {}).filter(Boolean).length;

  const getSeatRadius = () => {
    const count = totalSeats;
    if (count <= 6) return 40;
    if (count <= 8) return 41.5;
    if (count <= 10) return 42.5;
    if (count <= 12) return 43.5;
    if (count <= 14) return 44.5;
    return 45;
  };

  const radius = getSeatRadius();
  const blueHeight = radius * 1.11;
  const redHeight = radius * 0.86;

  if (!phase || (phase === 'idle' && typeof nomineeSeat !== 'number') || (phase === 'selecting_nominee' && !isHost && typeof nominatorSeat !== 'number')) return null;

  return (
    <div className="absolute inset-0 z-[60] flex items-center justify-center pointer-events-none">
      
      {/* Nominator Static Pointer (Blue) */}
      {typeof nominatorSeat === 'number' && (
        <img 
          src="/assets/images/Blue_Pointer_clean.png"
          className="absolute left-1/2 top-1/2 w-auto max-w-none origin-[50%_20%] object-contain z-0 opacity-90 drop-shadow-md"
          style={{ 
            height: `${blueHeight}%`,
            transform: `translate(-50%, -20%) rotate(${((nominatorSeat / totalSeats) * 360) + 180}deg)`
          }}
          alt="pointer"
        />
      )}

      {/* Sweeping Pointer (Red) */}
      {typeof nominatorSeat === 'number' && (
        <img 
          src="/assets/images/Red_Pointer_clean.png"
          className="absolute left-1/2 top-1/2 w-auto max-w-none origin-[50%_20%] object-contain z-10 drop-shadow-md"
          style={{ 
            height: `${redHeight}%`,
            transform: `translate(-50%, -20%) rotate(${(phase === 'voting' && startTime ? currentAngle : (((typeof nomineeSeat === 'number' ? nomineeSeat : nominatorSeat) / totalSeats) * 360 - 90)) + 270}deg)`,
            transition: phase === 'voting' ? `transform ${Math.max(timePerPlayerMs * 0.5, timePerPlayerMs - 500)}ms ease-in-out` : 'none'
          }}
          alt="pointer"
        />
      )}

      {/* Central Panel (Transparent background) */}
      <div className="relative z-10 w-full max-w-2xl flex flex-col items-center pointer-events-auto mt-8">
        
        {phase === 'selecting_nominee' && (
          <h2 className="text-3xl font-bold text-white mb-4 font-serif tracking-widest text-center animate-pulse drop-shadow-[0_4px_4px_rgba(0,0,0,1)]" style={{ animationDuration: '3s' }}>
            {isHost ? '請選擇被提名人...' : '等待發起提名...'}
          </h2>
        )}

        {typeof nominatorSeat === 'number' && (
          <div className="w-full flex flex-col items-center">
            
            {/* VS Header Text (Line 1) */}
            {typeof nomineeSeat === 'number' && (
              <>
                <div className="text-3xl sm:text-4xl font-bold drop-shadow-[0_4px_6px_rgba(0,0,0,1)] text-white mb-2 text-center whitespace-nowrap font-sans tracking-wide">
                  <span className="text-amber-400">{nominatorSeat}. </span>
                  <span className="text-blue-500">{getPlayerInSeat(nominatorSeat)?.name || '未知'}</span>
                  <span className="mx-5 text-white">提名</span>
                  <span className="text-amber-400">{nomineeSeat}. </span>
                  <span className="text-red-600">{getPlayerInSeat(nomineeSeat)?.name || '未知'}</span>
                </div>
                <div className="text-lg sm:text-xl font-bold drop-shadow-[0_4px_4px_rgba(0,0,0,1)] text-stone-200 mb-2 flex items-center justify-center tracking-widest font-sans w-4/5 mx-auto">
                  <span>存活人數：</span>
                  <span className="text-amber-100">{aliveCount}</span> 
                  <span className="mx-4 text-stone-300">|</span> 
                  <span>處決門檻：</span>
                  <span className="text-amber-500">{requiredVotes}</span>
                </div>
              </>
            )}

            {/* Voting Stats (Line 2) */}
            {(phase === 'voting' || phase === 'finished') && (
              <div className="text-3xl sm:text-4xl font-bold drop-shadow-[0_4px_10px_rgba(0,0,0,1)] text-white mb-2 text-center whitespace-nowrap font-sans">
                <span className="text-amber-400">{currentVoteCount}</span>
                <span className="text-stone-200 text-2xl ml-3 tracking-widest">票有效</span>
              </div>
            )}
            
            {/* Spacing and Divider */}
            {phase === 'idle' && (
              <div className="w-full flex flex-col items-center">
                <div className="w-[85%] h-[3px] bg-gradient-to-r from-transparent via-stone-300 to-transparent my-5 drop-shadow-[0_0_8px_rgba(255,255,255,0.4)]" />
              </div>
            )}

            {/* Actions */}
            {phase === 'idle' && isHost && (
              <div className="flex flex-col gap-4 w-full items-center pointer-events-auto mt-0">
                {/* Time Setting */}
                <div className="flex bg-stone-900/90 backdrop-blur-sm rounded-sm border-2 border-stone-700 shadow-[0_8px_30px_rgba(0,0,0,0.8)] overflow-hidden ring-1 ring-black">
                  <button onClick={() => setTimeSetting(Math.max(750, timeSetting - 250))} className="px-4 py-1.5 text-stone-400 hover:text-amber-500 font-bold hover:bg-stone-800 transition-colors text-xl bg-stone-950/50 shadow-[inset_0_0_8px_rgba(0,0,0,0.6)]">-</button>
                  <div className="w-24 py-1.5 text-amber-500/90 font-mono font-bold border-x-2 border-stone-700 text-center flex items-center justify-center text-lg bg-stone-900 shadow-[inset_0_0_10px_rgba(0,0,0,0.8)] tracking-widest">
                    {(timeSetting / 1000).toFixed(2)}s
                  </div>
                  <button onClick={() => setTimeSetting(Math.min(3000, timeSetting + 250))} className="px-4 py-1.5 text-stone-400 hover:text-amber-500 font-bold hover:bg-stone-800 transition-colors text-xl bg-stone-950/50 shadow-[inset_0_0_8px_rgba(0,0,0,0.6)]">+</button>
                </div>
                
                <div className="flex gap-4">
                  {/* Start Button */}
                  <button onClick={handleStartVoting} className="px-6 py-2 bg-gradient-to-b from-stone-800 to-stone-950 hover:from-stone-700 hover:to-stone-900 text-amber-500/90 hover:text-amber-400 font-sans font-bold text-lg rounded-sm shadow-[0_6px_20px_rgba(0,0,0,0.9)] border-2 border-stone-600 transition-all duration-300 tracking-[0.2em] hover:-translate-y-0.5 ring-1 ring-black flex items-center justify-center">
                    <span className="ml-[0.2em]">開始投票</span>
                  </button>
                  
                  {/* Cancel Button */}
                  <button onClick={handleCloseVoting} className="px-6 py-2 bg-gradient-to-b from-zinc-900 to-black hover:from-zinc-800 hover:to-zinc-950 text-stone-400 hover:text-stone-300 font-sans font-bold text-lg rounded-sm shadow-[0_6px_20px_rgba(0,0,0,0.9)] border-2 border-zinc-700 transition-all duration-300 tracking-[0.2em] hover:-translate-y-0.5 ring-1 ring-black flex items-center justify-center">
                    <span className="ml-[0.2em]">關閉</span>
                  </button>
                </div>
              </div>
            )}

            {(phase === 'voting' || phase === 'idle') && !isHost && userSeat !== undefined && typeof nomineeSeat === 'number' && (
              <div className="flex gap-4 mt-2 pointer-events-auto">
                <button 
                  onClick={() => castVote(true)}
                  disabled={isLocked || votes?.[userUid!] === true}
                  className={`w-28 py-2.5 rounded-sm font-sans font-bold text-lg tracking-[0.15em] transition-all duration-300 flex items-center justify-center border-2 ring-1 ring-black ${
                    isLocked 
                      ? 'bg-stone-950 text-stone-700 border-stone-800 cursor-not-allowed shadow-none'
                      : votes?.[userUid!] === true
                        ? 'bg-gradient-to-b from-red-900 to-black text-red-200 border-red-700 shadow-[0_0_20px_rgba(185,28,28,0.5)] cursor-default'
                        : 'bg-gradient-to-b from-stone-800 to-stone-950 text-stone-400 hover:text-red-400 hover:border-red-900/80 border-stone-700 hover:shadow-[0_4px_15px_rgba(153,27,27,0.5)] hover:-translate-y-0.5'
                  }`}
                >
                  <span className="ml-[0.15em]">處決！</span>
                </button>

                <button 
                  onClick={() => castVote(false)}
                  disabled={isLocked || !votes?.[userUid!]}
                  className={`w-28 py-2.5 rounded-sm font-sans font-bold text-lg tracking-[0.15em] transition-all duration-300 flex items-center justify-center border-2 ring-1 ring-black ${
                    isLocked 
                      ? 'bg-stone-950 text-stone-700 border-stone-800 cursor-not-allowed shadow-none'
                      : !votes?.[userUid!]
                        ? 'bg-gradient-to-b from-cyan-900 to-black text-cyan-200 border-cyan-700 shadow-[0_0_20px_rgba(8,145,178,0.3)] cursor-default'
                        : 'bg-gradient-to-b from-stone-800 to-stone-950 text-stone-400 hover:text-cyan-400 hover:border-cyan-900/80 border-stone-700 hover:shadow-[0_4px_15px_rgba(8,145,178,0.3)] hover:-translate-y-0.5'
                  }`}
                >
                  <span className="ml-[0.15em]">饒恕</span>
                </button>
              </div>
            )}

            {phase === 'finished' && isHost && (
              <div className="flex gap-4 mt-2 pointer-events-auto">
                <button onClick={markPendingAction} className="px-4 py-2 bg-gradient-to-b from-red-950 to-black hover:from-red-900 hover:to-red-950 text-red-500/90 hover:text-red-400 font-sans font-bold text-base rounded-sm shadow-[0_6px_20px_rgba(0,0,0,0.9)] border-2 border-red-900/50 transition-all duration-300 tracking-[0.1em] hover:-translate-y-0.5 ring-1 ring-black flex items-center justify-center">
                  <span className="ml-[0.1em]">標記為待處決</span>
                </button>
                <button onClick={handleRevote} className="px-4 py-2 bg-gradient-to-b from-stone-800 to-stone-950 hover:from-stone-700 hover:to-stone-900 text-amber-500/90 hover:text-amber-400 font-sans font-bold text-base rounded-sm shadow-[0_6px_20px_rgba(0,0,0,0.9)] border-2 border-stone-600 transition-all duration-300 tracking-[0.1em] hover:-translate-y-0.5 ring-1 ring-black flex items-center justify-center">
                  <span className="ml-[0.1em]">重新投票</span>
                </button>
                <button onClick={handleCloseVoting} className="px-4 py-2 bg-gradient-to-b from-zinc-900 to-black hover:from-zinc-800 hover:to-zinc-950 text-stone-400 hover:text-stone-300 font-sans font-bold text-base rounded-sm shadow-[0_6px_20px_rgba(0,0,0,0.9)] border-2 border-zinc-700 transition-all duration-300 tracking-[0.1em] hover:-translate-y-0.5 ring-1 ring-black flex items-center justify-center">
                  <span className="ml-[0.1em]">關閉</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
