import React from 'react';
import { useGameState } from '../../hooks/useGameState';
import { Modal } from '../common/Modal';

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
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title={<span className="text-amber-500 drop-shadow-sm">投票紀錄</span>} 
      maxWidth="max-w-3xl"
      noOverlay={true}
    >
      <div className="flex flex-col max-h-[60vh] text-lg">
        <div className="flex-1 overflow-y-auto custom-scrollbar pr-2">
          {history.length === 0 ? (
            <div className="text-center text-white font-serif py-10 tracking-widest text-lg">目前尚無投票紀錄</div>
          ) : (
            <div className="flex flex-col min-w-[500px]">
              {/* Header */}
              <div className="grid grid-cols-5 gap-2 border-b-2 border-white/20 pb-3 mb-2 text-amber-200/80 text-lg font-bold text-center tracking-widest uppercase drop-shadow-sm">
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
                  
                  const isSuccess = record.totalVotes > (seatCount / 2); // Extremely simplified logic for color

                  return (
                    <div 
                      key={idx} 
                      className={`grid grid-cols-5 gap-2 items-center p-3 rounded-lg border text-center transition-colors ${
                        isSuccess 
                          ? 'bg-rose-900/20 border-rose-900/50 hover:bg-rose-900/30 text-rose-100/90' 
                          : 'bg-white/5 border-white/10 hover:bg-white/10 text-white/80'
                      }`}
                    >
                      <div className="font-bold truncate text-blue-300 drop-shadow-sm" title={nominatorName}>
                        <span className="text-white text-base font-bold mr-1.5 font-sans">{record.nominatorSeat}.</span>
                        {nominatorName}
                      </div>
                      <div className="font-bold truncate text-red-400 drop-shadow-sm" title={nomineeName}>
                        <span className="text-white text-base font-bold mr-1.5 font-sans">{record.nomineeSeat}.</span>
                        {nomineeName}
                      </div>
                      <div className={`font-sans text-2xl font-bold ${isSuccess ? 'text-red-400' : 'text-blue-300'}`}>
                        {record.totalVotes}
                      </div>
                      <div className="text-base px-2 py-1 bg-black/40 rounded border border-white/10 min-h-[2rem] flex items-center justify-center break-all font-sans text-white font-bold tracking-wider">
                        {supporterSeats.length > 0 ? supporterSeats.join(', ') : '-'}
                      </div>
                      <div className="text-base font-sans tracking-widest">{record.time || '-'}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};
