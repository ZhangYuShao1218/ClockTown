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
      <div className="absolute inset-0 bg-transparent" onClick={onClose}></div>
      <div className="relative bg-stone-900/95 backdrop-blur-md border-2 border-stone-600/80 rounded-xl shadow-[0_0_50px_rgba(0,0,0,0.9)] w-full max-w-3xl flex flex-col max-h-[80vh] ring-1 ring-black">
        <div className="flex justify-center items-center p-4 border-b-2 border-stone-700/80 bg-gradient-to-b from-stone-800/50 to-transparent rounded-t-xl shrink-0">
          <h2 className="text-xl font-bold text-stone-200 tracking-widest font-serif drop-shadow-md">投票紀錄</h2>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
          {history.length === 0 ? (
            <div className="text-center text-stone-500 font-serif py-10 tracking-widest">目前尚無投票紀錄</div>
          ) : (
            <div className="flex flex-col min-w-[500px]">
              {/* Header */}
              <div className="grid grid-cols-5 gap-2 border-b-2 border-stone-700 pb-3 mb-2 text-stone-400 text-base font-bold text-center tracking-widest font-serif">
                <div>提名人</div>
                <div>被提名人</div>
                <div>有效票數</div>
                <div>處決玩家</div>
                <div>時間</div>
              </div>

              {/* Rows */}
              <div className="flex flex-col space-y-1">
                {history.map((record: any, idx: number) => {
                  const nominatorName = getPlayerInSeat(record.nominatorSeat)?.name || '未知';
                  const nomineeName = getPlayerInSeat(record.nomineeSeat)?.name || '未知';

                  const seatCount = gameState?.public?.seatCount || 12;
                  const allSeats = Array.from({ length: seatCount }, (_, i) => i + 1);
                  const supporterSeats = Object.entries(record.votes || {})
                    .filter(([_, voted]) => voted)
                    .map(([uid, _]) => allSeats.find(s => getPlayerInSeat(s)?.uid === uid))
                    .filter(s => s !== undefined)
                    .sort((a, b) => (a as number) - (b as number));

                  return (
                    <div key={idx} className="grid grid-cols-5 gap-2 items-center bg-black/40 border-b border-stone-800/50 p-2.5 text-center hover:bg-stone-800/40 transition-all duration-300 group">
                      <div className="text-amber-500/90 font-bold text-base truncate px-1 drop-shadow-sm group-hover:text-amber-400" title={nominatorName}>
                        <span className="text-stone-500 text-sm mr-1 font-sans">{record.nominatorSeat}.</span>
                        {nominatorName}
                      </div>
                      <div className="text-red-500/90 font-bold text-base truncate px-1 drop-shadow-sm group-hover:text-red-400" title={nomineeName}>
                        <span className="text-stone-500 text-sm mr-1 font-sans">{record.nomineeSeat}.</span>
                        {nomineeName}
                      </div>
                      <div className="text-cyan-600/90 font-bold text-lg font-mono drop-shadow-sm group-hover:text-cyan-400">
                        {record.totalVotes}
                      </div>
                      <div className="text-stone-300/80 font-bold text-base truncate px-1 font-sans tracking-widest group-hover:text-white" title={supporterSeats.join(', ')}>
                        {supporterSeats.length > 0 ? supporterSeats.join(', ') : '-'}
                      </div>
                      <div className="text-stone-500 text-sm font-mono group-hover:text-stone-400">
                        {record.time}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
