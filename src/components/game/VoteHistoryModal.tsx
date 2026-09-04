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
      title={<span className="text-amber-500 drop-shadow-[0_4px_8px_rgba(0,0,0,0.9)] [text-shadow:_1px_2px_4px_rgba(0,0,0,0.8)]">投票紀錄</span>} 
      maxWidth="max-w-[95vw] sm:max-w-3xl"
      noOverlay={true}
    >
      <div className="flex flex-col max-h-[72svh] sm:max-h-[60vh] text-lg">
        <div className="flex-1 overflow-y-auto custom-scrollbar pr-1">
          {history.length === 0 ? (
            <div className="text-center text-white font-serif py-10 tracking-widest text-lg">目前尚無投票紀錄</div>
          ) : (
            <div className="flex flex-col">
              {/* Header（桌機表格用） */}
              <div className="hidden sm:grid grid-cols-5 gap-2 border-b-2 border-white/20 pb-3 mb-2 text-amber-200/80 text-lg font-bold text-center tracking-widest uppercase drop-shadow-[0_4px_8px_rgba(0,0,0,0.9)] [text-shadow:_1px_2px_4px_rgba(0,0,0,0.8)]">
                <div>提名人</div>
                <div>被提名人</div>
                <div>有效票數</div>
                <div>處決玩家</div>
                <div>時間</div>
              </div>

              {/* Rows */}
              <div className="flex flex-col gap-1.5 sm:gap-1">
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

                  const isSuccess = record.totalVotes > (seatCount / 2);
                  const supStr = supporterSeats.length > 0 ? supporterSeats.join(', ') : '-';
                  const cardBg = isSuccess ? 'bg-rose-900/20 border-rose-900/50 text-rose-100/90' : 'bg-white/5 border-white/10 text-white/80';

                  return (
                    <div key={idx} className={`rounded-lg border transition-colors ${cardBg}`}>
                      {/* 桌機：表格列 */}
                      <div className="hidden sm:grid grid-cols-5 gap-2 items-center p-3 text-center">
                        <div className="font-bold truncate text-blue-300 [text-shadow:_1px_2px_4px_rgba(0,0,0,0.8)]" title={nominatorName}>
                          <span className="text-white text-base font-bold mr-1.5 font-sans">{record.nominatorSeat}.</span>{nominatorName}
                        </div>
                        <div className="font-bold truncate text-red-400 [text-shadow:_1px_2px_4px_rgba(0,0,0,0.8)]" title={nomineeName}>
                          <span className="text-white text-base font-bold mr-1.5 font-sans">{record.nomineeSeat}.</span>{nomineeName}
                        </div>
                        <div className={`font-sans text-2xl font-bold ${isSuccess ? 'text-red-400' : 'text-blue-300'}`}>{record.totalVotes}</div>
                        <div className="text-base px-2 py-1 bg-black/40 rounded border border-white/10 min-h-[2rem] flex items-center justify-center break-all font-sans text-white font-bold tracking-wider">{supStr}</div>
                        <div className="text-base font-sans tracking-widest">{record.time || '-'}</div>
                      </div>

                      {/* 手機：卡片 */}
                      <div className="sm:hidden p-2.5 text-sm">
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-1.5 min-w-0 font-bold">
                            <span className="text-blue-300 truncate"><span className="text-white/70 font-sans">{record.nominatorSeat}.</span>{nominatorName}</span>
                            <span className="text-white/40 shrink-0">→</span>
                            <span className="text-red-400 truncate"><span className="text-white/70 font-sans">{record.nomineeSeat}.</span>{nomineeName}</span>
                          </div>
                          <span className="text-xs text-white/45 font-sans shrink-0">{record.time || '-'}</span>
                        </div>
                        <div className="flex items-center gap-2 mt-1.5 text-xs">
                          <span className="shrink-0">有效票 <b className={`font-sans text-lg ${isSuccess ? 'text-red-400' : 'text-blue-300'}`}>{record.totalVotes}</b></span>
                          <span className="min-w-0 flex-1 text-white/70 font-sans tracking-wide truncate">處決票：{supStr}</span>
                        </div>
                      </div>
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
