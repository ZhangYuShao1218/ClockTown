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
}

export const VotingOverlay: React.FC<VotingOverlayProps> = ({
  roomId,
  isHost,
  votingState,
  seatStatus,
  seats,
  getPlayerInSeat,
  userUid,
  totalSeats
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
  if (phase === 'voting' && startTime && nomineeSeat !== null) {
    const elapsed = currentTime - startTime;
    const totalTime = totalSeats * timePerPlayerMs;
    
    if (elapsed >= totalTime) {
      isVotingFinished = true;
      currentAngle = (nomineeSeat / totalSeats) * 360 - 90 - (360 / totalSeats); // Stop before nominee again
    } else {
      const progress = elapsed / totalTime;
      const startAngle = (nomineeSeat / totalSeats) * 360 - 90;
      // Step animation logic
      const currentStep = Math.floor(progress * totalSeats);
      currentAngle = startAngle + (currentStep / totalSeats) * 360;
    }
  }

  // End voting if finished
  useEffect(() => {
    if (isHost && phase === 'voting' && isVotingFinished) {
      updateVotingState(roomId, { phase: 'finished' });
    }
  }, [isHost, phase, isVotingFinished, roomId]);

  const handleStartVoting = () => {
    updateVotingState(roomId, {
      phase: 'voting',
      startTime: Date.now() + 1000, // Start 1s from now to sync
      timePerPlayerMs: timeSetting
    });
  };

  const handleCloseVoting = () => {
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
    if (nomineeSeat !== null) {
      import('../../services/roomService').then(({ updateSeatStatus }) => {
        updateSeatStatus(roomId, nomineeSeat, { pendingExecution: true });
        handleCloseVoting();
      });
    }
  };

  const userSeat = seats.find(s => getPlayerInSeat(s)?.uid === userUid);
  
  // Calculate if player's vote is locked
  let isLocked = false;
  if (phase === 'finished') isLocked = true;
  if (phase === 'voting' && startTime && userSeat !== undefined && nomineeSeat !== null) {
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

  const toggleVote = () => {
    if (!userUid || isLocked) return;
    const currentVote = votes?.[userUid] || false;
    updatePlayerVote(roomId, userUid, !currentVote);
  };

  const currentVoteCount = Object.values(votes || {}).filter(Boolean).length;

  if (!phase || (phase === 'idle' && !nomineeSeat) || (phase === 'selecting_nominee' && !isHost && !nominatorSeat)) return null;

  return (
    <div className="absolute inset-0 z-[60] flex items-center justify-center pointer-events-none">
      
      {/* Nominator Static Pointer (Blue) */}
      {nominatorSeat !== null && (
        <img 
          src="/assets/images/Blue_Pointer_clean.png"
          className="absolute left-1/2 top-1/2 w-auto max-w-none h-[40%] origin-[50%_20%] object-contain z-0 opacity-90 drop-shadow-[0_0_15px_rgba(59,130,246,0.8)]"
          style={{ 
            transform: `translate(-50%, -20%) rotate(${((nominatorSeat / totalSeats) * 360) + 180}deg)`
          }}
          alt="pointer"
        />
      )}

      {/* Sweeping Pointer (Red) */}
      {nominatorSeat !== null && (
        <img 
          src="/assets/images/Red_Pointer_clean.png"
          className="absolute left-1/2 top-1/2 w-auto max-w-none h-[35%] origin-[50%_20%] object-contain z-10 drop-shadow-[0_0_20px_rgba(239,68,68,0.9)]"
          style={{ 
            transform: `translate(-50%, -20%) rotate(${(phase === 'voting' && startTime ? currentAngle : (((nomineeSeat !== null ? nomineeSeat : nominatorSeat) / totalSeats) * 360 - 90)) + 270}deg)`
          }}
          alt="pointer"
        />
      )}

      {/* Central Panel (Transparent background) */}
      <div className="relative z-10 w-full max-w-2xl flex flex-col items-center pointer-events-auto mt-8">
        
        {phase === 'selecting_nominee' && (
          <h2 className="text-3xl font-bold text-white mb-4 font-serif tracking-widest text-center animate-pulse drop-shadow-[0_4px_4px_rgba(0,0,0,1)]">
            {isHost ? '請選擇被提名人...' : '等待發起提名...'}
          </h2>
        )}

        {nominatorSeat !== null && (
          <div className="w-full flex flex-col items-center">
            
            {/* VS Header Text (Line 1) */}
            <div className="text-3xl sm:text-4xl font-bold drop-shadow-[0_4px_4px_rgba(0,0,0,1)] text-white mb-2 text-center whitespace-nowrap">
              <span className="text-blue-500">{nominatorSeat}.{getPlayerInSeat(nominatorSeat)?.name || '未知'}</span>
              <span className="mx-3">提名</span>
              {nomineeSeat !== null ? (
                <span className="text-red-600">{nomineeSeat}.{getPlayerInSeat(nomineeSeat)?.name || '未知'}!</span>
              ) : (
                <span className="text-red-600">？</span>
              )}
            </div>

            {/* Voting Stats (Line 2) */}
            {(phase === 'voting' || phase === 'finished') && (
              <div className="text-2xl sm:text-3xl font-bold drop-shadow-[0_4px_4px_rgba(0,0,0,1)] text-white mb-6 text-center whitespace-nowrap">
                <span className="text-blue-500">{currentVoteCount} 票</span>
                <span className="mx-2">有效</span>
                <span className="text-red-600">(門檻是 {requiredVotes})</span>
              </div>
            )}
            
            {/* Spacing for idle phase */}
            {phase === 'idle' && <div className="h-6" />}

            {/* Actions */}
            {phase === 'idle' && isHost && (
              <div className="flex gap-2 w-full justify-center pointer-events-auto">
                {/* Time Setting (Blue) */}
                <div className="flex bg-gradient-to-b from-blue-700 to-blue-950 rounded-lg border-2 border-black shadow-[0_4px_10px_rgba(0,0,0,0.8)] overflow-hidden">
                  <button onClick={() => setTimeSetting(Math.max(1000, timeSetting - 250))} className="px-3 py-2 text-white font-bold hover:bg-blue-600 transition-colors">-</button>
                  <div className="px-2 py-2 text-white font-bold border-x-2 border-black text-center flex items-center justify-center text-xl whitespace-nowrap bg-blue-800">
                    倒計時 {(timeSetting / 1000).toFixed(1)}s
                  </div>
                  <button onClick={() => setTimeSetting(Math.min(3000, timeSetting + 250))} className="px-3 py-2 text-white font-bold hover:bg-blue-600 transition-colors">+</button>
                </div>
                
                {/* Start Button (Dark Gray) */}
                <button onClick={handleStartVoting} className="px-6 py-2 bg-gradient-to-b from-gray-600 to-gray-900 hover:from-gray-500 hover:to-gray-800 text-white font-bold text-xl rounded-lg shadow-[0_4px_10px_rgba(0,0,0,0.8)] border-2 border-black transition-colors">
                  開始投票
                </button>
                
                {/* Cancel Button (Red) */}
                <button onClick={handleCloseVoting} className="px-6 py-2 bg-gradient-to-b from-red-800 to-red-950 hover:from-red-700 hover:to-red-900 text-white font-bold text-xl rounded-lg shadow-[0_4px_10px_rgba(0,0,0,0.8)] border-2 border-black transition-colors">
                  關閉
                </button>
              </div>
            )}

            {phase === 'voting' && !isHost && userSeat !== undefined && (
              <button 
                onClick={toggleVote}
                disabled={isLocked}
                className={`w-64 py-4 rounded-full font-bold text-3xl transition-all shadow-[0_6px_15px_rgba(0,0,0,0.9)] border-2 border-black ${
                  isLocked ? 'bg-gradient-to-b from-gray-700 to-gray-900 text-gray-500 cursor-not-allowed' :
                  votes?.[userUid!] ? 'bg-gradient-to-b from-amber-500 to-amber-700 text-white' : 'bg-gradient-to-b from-slate-700 to-slate-900 text-white hover:from-slate-600 hover:to-slate-800'
                }`}
              >
                {votes?.[userUid!] ? '放下' : '舉手'}
              </button>
            )}

            {phase === 'finished' && isHost && (
              <div className="flex gap-4 mt-2 pointer-events-auto">
                <button onClick={markPendingAction} className="px-8 py-3 bg-gradient-to-b from-gray-600 to-gray-900 hover:from-gray-500 hover:to-gray-800 text-white font-bold text-xl rounded-full shadow-[0_4px_10px_rgba(0,0,0,0.8)] border-2 border-black transition-colors">
                  標記待處決
                </button>
                <button onClick={handleCloseVoting} className="px-8 py-3 bg-gradient-to-b from-gray-600 to-gray-900 hover:from-gray-500 hover:to-gray-800 text-white font-bold text-xl rounded-full shadow-[0_4px_10px_rgba(0,0,0,0.8)] border-2 border-black transition-colors">
                  清除標記
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
