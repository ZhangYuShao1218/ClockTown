import React from 'react';
import { useGameState } from '../../hooks/useGameState';

interface VoteHistoryModalProps {
  roomId: string;
  isOpen: boolean;
  onClose: () => void;
  getPlayerInSeat: (seatIndex: number) => any;
}

export const VoteHistoryModal: React.FC<VoteHistoryModalProps> = ({ roomId, isOpen, onClose, getPlayerInSeat }) => {
  const { gameState } = useGameState(roomId);
  
  if (!isOpen) return null;

  const history = gameState?.public?.voteHistory || [];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 pointer-events-auto">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative bg-stone-900 border-2 border-stone-700 rounded-xl shadow-2xl w-full max-w-lg flex flex-col max-h-[80vh]">
        <div className="flex justify-between items-center p-4 border-b border-white/10 bg-black/40 rounded-t-xl">
          <h2 className="text-xl font-bold text-white tracking-widest">投票紀錄</h2>
          <button onClick={onClose} className="text-white/60 hover:text-white transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
          {history.length === 0 ? (
            <div className="text-center text-white/40 py-8">目前尚無投票紀錄</div>
          ) : (
            history.map((record: any, idx: number) => (
              <div key={idx} className="bg-black/40 border border-white/10 rounded-lg p-4">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-blue-400 font-bold text-sm">第 {idx + 1} 次投票</span>
                  <span className="text-white/40 text-xs">{record.time}</span>
                </div>
                
                <div className="text-white font-bold mb-3 flex items-center gap-2">
                  <span className="text-amber-400">{record.nominatorSeat}.</span>
                  <span>{getPlayerInSeat(record.nominatorSeat)?.name || '未知'}</span>
                  <span className="text-white/50 mx-2 text-sm">提名</span>
                  <span className="text-amber-400">{record.nomineeSeat}.</span>
                  <span className="text-red-400">{getPlayerInSeat(record.nomineeSeat)?.name || '未知'}</span>
                </div>
                
                <div className="flex justify-between items-center bg-white/5 rounded p-2 px-3">
                  <span className="text-white/70 text-sm">有效票數</span>
                  <span className="text-lg font-bold text-blue-400">{record.totalVotes} 票</span>
                </div>
                
                {record.votes && Object.keys(record.votes).length > 0 && (
                  <div className="mt-3 text-xs text-white/50">
                    <span className="mr-2">舉手玩家:</span>
                    {Object.entries(record.votes)
                      .filter(([_, voted]) => voted)
                      .map(([uid, _]) => {
                        const seats = gameState?.public?.seats || [];
                        const seat = seats.find((s: number) => getPlayerInSeat(s)?.uid === uid);
                        const player = getPlayerInSeat(seat);
                        return seat !== undefined ? `${seat}. ${player?.name || '未知'}` : '未知';
                      })
                      .join(' , ')}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
