import { useState, useEffect, useRef } from 'react';
import { ref, push, onValue, serverTimestamp } from 'firebase/database';
import { db } from '../../services/firebase';



interface ChatProps {
  roomId: string;
  userUid: string;
  userName: string;
  isHost: boolean;
  players: any[];
  hostPlayer: any;
  isEvil?: boolean;
  settings?: any;
  seatCount?: number;
  onUnreadCountChange?: (count: number) => void;
  /** 面板實際顯示中（抽屜展開且在聊天分頁）才會把當前頻道標記為已讀 */
  isVisible?: boolean;
}

export const Chat = ({ roomId, userUid, userName, isHost, players, hostPlayer, isEvil, settings, seatCount = 15, onUnreadCountChange, isVisible = true }: ChatProps) => {
  const [activeChannel, setActiveChannel] = useState<string>('town_square');
  const [inputText, setInputText] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Build channels
  const availableChannels: { id: string; name: string; disabled?: boolean; isSelf?: boolean; isGroup?: boolean; colorClass?: string }[] = [];
  
  availableChannels.push({ id: 'town_square', name: '廣場公告', isGroup: true, colorClass: 'text-rose-500 font-bold drop-shadow-sm' });
  
  if (!isHost && hostPlayer) {
    availableChannels.push({ id: 'host', name: '說書人', colorClass: 'text-[#d7b87c] font-bold' });
  }

  if (settings?.evilCanMsg && (isHost || isEvil)) {
    availableChannels.push({ id: 'evil_chat', name: '邪惡陣營 (私聊)', isGroup: true });
  }

  const actualSeatCount = settings?.seatCount || seatCount;

  // 私訊範圍：'none' | 'adjacent' | 'all'（相容舊房的 allCanMsg / adjacentCanMsg）
  const privateMsgMode: 'none' | 'adjacent' | 'all' =
    settings?.privateMsgMode ?? (settings?.allCanMsg ? 'all' : settings?.adjacentCanMsg ? 'adjacent' : 'none');

  const mySeat = players.find(player => player.uid === userUid)?.seat ?? null;
  const isAdjacentSeat = (a: number | null | undefined, b: number | null | undefined) => {
    if (a == null || b == null) return false;
    const d = Math.abs(a - b);
    return d === 1 || d === actualSeatCount - 1;
  };

  // Create an array for all seats 1 to N
  for (let i = 1; i <= actualSeatCount; i++) {
    const p = players.find(player => player.seat === i);

    if (p) {
      if (hostPlayer && p.uid === hostPlayer.uid) continue;

      const isSelf = p.uid === userUid;
      const canPrivateMsg = isHost || privateMsgMode === 'all' || (privateMsgMode === 'adjacent' && isAdjacentSeat(mySeat, p.seat));
      const disabled = isSelf || !canPrivateMsg;
      
      let nameLabel = `${i}. ${p.name}`;
      if (isSelf) nameLabel += ' (你)';
      else if (!canPrivateMsg && !isHost) nameLabel += ' (未開放)';
      
      availableChannels.push({
        id: p.uid,
        name: nameLabel,
        disabled: disabled,
        isSelf: isSelf
      });
    } else {
      // Empty seat
      availableChannels.push({
        id: `empty_${i}`,
        name: `${i}. (空座位)`,
        disabled: true,
        isSelf: false
      });
    }
  }
  
  // Add unseated players at the end
  const unseatedPlayers = players.filter(p => p.seat === null || p.seat === undefined);
  unseatedPlayers.forEach(p => {
    if (hostPlayer && p.uid === hostPlayer.uid) return;
    
    const isSelf = p.uid === userUid;
    const canPrivateMsg = isHost || privateMsgMode === 'all';
    const disabled = isSelf || !canPrivateMsg;

    let nameLabel = `旁觀者 - ${p.name}`;
    if (isSelf) nameLabel += ' (你)';
    else if (!canPrivateMsg && !isHost) nameLabel += ' (未開放)';
    
    availableChannels.push({
      id: p.uid,
      name: nameLabel,
      disabled: disabled,
      isSelf: isSelf
    });
  });

  const getChannelId = (target: string) => {
    if (target === 'town_square') return 'town_square';
    if (target === 'evil_chat') return 'evil_chat';
    if (target === 'host') {
      if (isHost) return 'town_square'; // Fallback for safety
      const uids = [userUid, hostPlayer.uid].sort();
      return `dm_${uids[0]}_${uids[1]}`;
    }
    const targetUid = target;
    const uids = [userUid, targetUid].sort();
    return `dm_${uids[0]}_${uids[1]}`;
  };

  const [messagesByChannel, setMessagesByChannel] = useState<Record<string, any[]>>({});
  const [lastRead, setLastRead] = useState<Record<string, number>>({});

  // Sync availableChannels to string so we can use it in dependency array safely.
  // 一併帶入 disabled 狀態，讓頻道由停用轉為開放時能重新訂閱。
  const availableChannelsStr = availableChannels.map(c => `${c.id}:${c.disabled ? 0 : 1}`).join(',');

  useEffect(() => {
    if (!roomId) return;
    const unsubscribers: (() => void)[] = [];
    
    availableChannels.forEach(ch => {
      if (ch.disabled) return;
      const channelId = getChannelId(ch.id);
      const messagesRef = ref(db, `rooms/${roomId}/messages/${channelId}`);
      
      const unsub = onValue(messagesRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          const msgs = Object.keys(data).map(key => ({
            id: key,
            ...data[key]
          })).sort((a: any, b: any) => a.timestamp - b.timestamp);
          setMessagesByChannel(prev => ({ ...prev, [ch.id]: msgs }));
        } else {
          setMessagesByChannel(prev => ({ ...prev, [ch.id]: [] }));
        }
      });
      unsubscribers.push(unsub);
    });
    
    return () => unsubscribers.forEach(unsub => unsub());
  }, [roomId, availableChannelsStr, userUid, isHost, hostPlayer?.uid]);

  useEffect(() => {
    // 只有面板實際顯示中才標記已讀；抽屜收起時即使停在該頻道也不算已讀。
    // isVisible 由 false→true（抽屜展開）時也會觸發，補標當前頻道為已讀。
    if (!isVisible) return;
    setLastRead(prev => ({ ...prev, [activeChannel]: Date.now() }));
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 50);
  }, [activeChannel, messagesByChannel[activeChannel], isVisible]);

  const [totalUnread, setTotalUnread] = useState(0);

  useEffect(() => {
    let count = 0;
    availableChannels.forEach(ch => {
      const msgs = messagesByChannel[ch.id] || [];
      const readTime = lastRead[ch.id] || 0;
      const unreadCount = msgs.filter(m => m.timestamp > readTime && m.senderUid !== userUid && m.senderUid !== 'system').length;
      count += unreadCount;
    });
    setTotalUnread(count);
    onUnreadCountChange?.(count);
  }, [messagesByChannel, lastRead, availableChannelsStr, userUid, onUnreadCountChange]);

  const messages = messagesByChannel[activeChannel] || [];

  const handleSend = () => {
    if (!inputText.trim()) return;
    
    if (activeChannel === 'town_square' && !isHost) {
      alert("只有說書人可以在廣場公告發言！");
      return;
    }
    
    const channelId = getChannelId(activeChannel);
    const messagesRef = ref(db, `rooms/${roomId}/messages/${channelId}`);
    
    push(messagesRef, {
      senderUid: userUid,
      senderName: userName,
      text: inputText.trim(),
      timestamp: serverTimestamp()
    });
    
    setInputText('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const renderMessageText = (text: string) => {
    if (!text) return null;
    return text.split(/(\[red\][\s\S]*?\[\/red\]|\[blue\][\s\S]*?\[\/blue\])/g).map((part, i) => {
      if (part.startsWith('[red]')) {
        return <span key={i} className="text-red-400 font-bold">{part.replace(/\[\/?red\]/g, '')}</span>;
      }
      if (part.startsWith('[blue]')) {
        return <span key={i} className="text-blue-300 font-bold">{part.replace(/\[\/?blue\]/g, '')}</span>;
      }
      return <span key={i}>{part}</span>;
    });
  };

  return (
    <div className="flex flex-col h-full bg-slate-700/30">
      {/* 頻道選擇區 */}
      <div className="p-3 border-b border-white/10 bg-white/5 flex items-center shadow-md relative">
        <label className="text-sm font-bold text-white mr-3 whitespace-nowrap">頻道</label>
        
        <div className="relative flex-1">
          <button 
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="w-full relative bg-slate-900 border border-white/20 text-white rounded-md px-4 py-2 text-base outline-none focus:border-blue-500 shadow-inner font-medium flex justify-between items-center transition-colors hover:bg-slate-800"
          >
            {totalUnread > 0 && !isDropdownOpen && (
              <div className="absolute -top-[10px] -left-[10px] text-amber-400 animate-pulse drop-shadow-[0_0_8px_rgba(251,191,36,0.9)] z-20 scale-x-[-1]">
                <svg className="w-7 h-7 drop-shadow-[0_0_8px_rgba(251,191,36,0.9)]" fill="currentColor" viewBox="0 0 20 20"><path d="M18 5v8a2 2 0 01-2 2h-5l-5 4v-4H4a2 2 0 01-2-2V5a2 2 0 012-2h12a2 2 0 012 2zM7 8H5v2h2V8zm2 0h2v2H9V8zm6 0h-2v2h2V8z" /></svg>
              </div>
            )}
            <span className={`truncate flex items-center gap-2 ${availableChannels.find(c => c.id === activeChannel)?.colorClass || ''}`}>
              {availableChannels.find(c => c.id === activeChannel)?.name || '選擇頻道...'}
            </span>
            <svg className={`w-4 h-4 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
          </button>
          
          {isDropdownOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setIsDropdownOpen(false)} />
              <div className="absolute top-full mt-1 left-0 right-0 bg-slate-900 border border-slate-600 rounded-md shadow-2xl z-50 max-h-60 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-700 py-1">
                {availableChannels.map(ch => {
                  const unreadCount = (messagesByChannel[ch.id] || []).filter((m: any) => m.timestamp > (lastRead[ch.id] || 0) && m.senderUid !== userUid && m.senderUid !== 'system').length;
                  return (
                    <button
                      key={ch.id}
                      onClick={() => {
                        if (!ch.disabled) {
                          setActiveChannel(ch.id);
                          setIsDropdownOpen(false);
                        }
                      }}
                      disabled={ch.disabled}
                      className={`relative w-full text-left px-4 py-3 transition-colors flex items-center justify-between ${
                        ch.id === activeChannel ? 'bg-blue-600/30 text-blue-200' : 'hover:bg-slate-800'
                      } ${ch.disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'} ${
                        ch.colorClass ? ch.colorClass : ch.isSelf ? 'text-green-400 font-bold' : ch.isGroup ? 'text-purple-300 font-bold' : 'text-white'
                      }`}
                    >
                      {!ch.disabled && unreadCount > 0 && ch.id !== activeChannel && (
                        <div className="absolute -top-2 left-1 text-amber-400 animate-pulse drop-shadow-[0_0_8px_rgba(251,191,36,0.9)] z-20 scale-x-[-1]">
                          <svg className="w-6 h-6 drop-shadow-[0_0_8px_rgba(251,191,36,0.9)]" fill="currentColor" viewBox="0 0 20 20"><path d="M18 5v8a2 2 0 01-2 2h-5l-5 4v-4H4a2 2 0 01-2-2V5a2 2 0 012-2h12a2 2 0 012 2zM7 8H5v2h2V8zm2 0h2v2H9V8zm6 0h-2v2h2V8z" /></svg>
                        </div>
                      )}
                      <span className="truncate flex items-center gap-2">
                        {ch.name}
                      </span>
                      {ch.id === activeChannel && (
                        <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                      )}
                    </button>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>

      {/* 訊息顯示區 */}
      <div className="flex-1 p-4 overflow-y-auto space-y-3 scrollbar-thin scrollbar-thumb-slate-700">
        {messages.length === 0 ? (
          <div className="text-base text-center text-white/30 mt-10">這裡還沒有訊息...</div>
        ) : (
          messages.map(msg => {
            const isMe = msg.senderUid === userUid;
            const senderPlayer = players.find(p => p.uid === msg.senderUid);
            let senderDisplayName = msg.senderUid === hostPlayer?.uid ? '說書人' : msg.senderName;
            if (msg.senderUid !== hostPlayer?.uid && senderPlayer && (senderPlayer.seat === null || senderPlayer.seat === undefined)) {
              senderDisplayName = `旁觀者 - ${senderDisplayName}`;
            }
            return (
              <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                <span className="text-xs text-white mb-1 px-1 font-medium">{senderDisplayName}</span>
                <div 
                  className={`max-w-[85%] rounded-2xl px-4 py-2 break-words whitespace-pre-wrap text-white shadow-md ${
                    isMe ? 'bg-blue-600/70 border border-blue-500/30 rounded-br-sm' : 
                    'bg-slate-600/80 border border-white/20 rounded-bl-sm'
                  }`}
                >
                  {renderMessageText(msg.text)}
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* 輸入區 */}
      {activeChannel === 'town_square' && !isHost ? (
        <div className="p-3 border-t border-white/10 bg-black/40 flex justify-center items-center h-[60px]">
          <span className="text-white/40 text-sm tracking-widest">此頻道僅限說書人發言</span>
        </div>
      ) : (
        <div className="p-3 border-t border-white/10 bg-white/5 flex gap-2">
          <input 
            type="text" 
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="輸入訊息..." 
            className="flex-1 bg-black/50 border border-white/10 rounded-md px-3 py-2 text-base focus:outline-none focus:ring-1 focus:ring-blue-500 text-white placeholder-white/20"
          />
          <button 
            onClick={handleSend}
            disabled={!inputText.trim()}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-900/50 text-white rounded-md font-bold shadow-md transition-colors"
          >
            發送
          </button>
        </div>
      )}
    </div>
  );
};
