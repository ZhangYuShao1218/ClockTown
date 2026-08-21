import { useState, useEffect, useRef } from 'react';
import { ref, push, onValue, serverTimestamp } from 'firebase/database';
import { db } from '../../services/firebase';

interface Message {
  id: string;
  senderUid: string;
  senderName: string;
  text: string;
  timestamp: number;
}

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
}

export const Chat = ({ roomId, userUid, userName, isHost, players, hostPlayer, isEvil, settings, seatCount = 15 }: ChatProps) => {
  const [activeChannel, setActiveChannel] = useState<string>('town_square');
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Build channels
  const availableChannels: { id: string; name: string; disabled?: boolean; isSelf?: boolean; isGroup?: boolean }[] = [];
  
  availableChannels.push({ id: 'town_square', name: '廣場公告', isGroup: true });
  
  if (!isHost && hostPlayer) {
    availableChannels.push({ id: 'host', name: '說書人 (私訊)' });
  }

  if (settings?.evilCanMsg && (isHost || isEvil)) {
    availableChannels.push({ id: 'evil_chat', name: '邪惡陣營 (私聊)', isGroup: true });
  }

  const actualSeatCount = settings?.seatCount || seatCount;
  
  // Create an array for all seats 1 to N
  for (let i = 1; i <= actualSeatCount; i++) {
    const p = players.find(player => player.seat === i);
    
    if (p) {
      if (hostPlayer && p.uid === hostPlayer.uid) continue;
      
      const isSelf = p.uid === userUid;
      const canPrivateMsg = isHost || settings?.allCanMsg;
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
    const canPrivateMsg = isHost || settings?.allCanMsg;
    const disabled = isSelf || !canPrivateMsg;
    
    let nameLabel = p.name;
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

  useEffect(() => {
    if (!roomId) return;
    const channelId = getChannelId(activeChannel);
    const messagesRef = ref(db, `rooms/${roomId}/messages/${channelId}`);
    
    const unsubscribe = onValue(messagesRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const msgs = Object.keys(data).map(key => ({
          id: key,
          ...data[key]
        })).sort((a: any, b: any) => a.timestamp - b.timestamp);
        setMessages(msgs);
      } else {
        setMessages([]);
      }
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 50);
    });
    
    return () => unsubscribe();
  }, [roomId, activeChannel, userUid, isHost, hostPlayer?.uid]);

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

  return (
    <div className="flex flex-col h-full bg-black/40">
      {/* 頻道選擇區 */}
      <div className="p-3 border-b border-white/10 bg-white/5 flex items-center shadow-md relative">
        <label className="text-sm font-bold text-white/50 mr-3 whitespace-nowrap">頻道</label>
        
        <div className="relative flex-1">
          <button 
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="w-full bg-slate-900 border border-white/20 text-white rounded-md px-4 py-2 text-base outline-none focus:border-blue-500 shadow-inner font-medium flex justify-between items-center transition-colors hover:bg-slate-800"
          >
            <span className="truncate">
              {availableChannels.find(c => c.id === activeChannel)?.name || '選擇頻道...'}
            </span>
            <svg className={`w-4 h-4 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
          </button>
          
          {isDropdownOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setIsDropdownOpen(false)} />
              <div className="absolute top-full mt-1 left-0 right-0 bg-slate-900 border border-slate-600 rounded-md shadow-2xl z-50 max-h-60 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-700 py-1">
                {availableChannels.map(ch => (
                  <button
                    key={ch.id}
                    onClick={() => {
                      if (!ch.disabled) {
                        setActiveChannel(ch.id);
                        setIsDropdownOpen(false);
                      }
                    }}
                    disabled={ch.disabled}
                    className={`w-full text-left px-4 py-2 transition-colors flex items-center justify-between ${
                      ch.id === activeChannel ? 'bg-blue-600/30 text-blue-200' : 'hover:bg-slate-800'
                    } ${ch.disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'} ${
                      ch.isSelf ? 'text-green-400 font-bold' : ch.isGroup ? 'text-purple-300 font-bold' : 'text-white'
                    }`}
                  >
                    <span className="truncate">{ch.name}</span>
                    {ch.id === activeChannel && (
                      <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                    )}
                  </button>
                ))}
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
            return (
              <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                <span className="text-xs text-white/40 mb-1 px-1">{msg.senderName}</span>
                <div className={`px-4 py-2 rounded-2xl max-w-[85%] break-words ${
                  isMe ? 'bg-blue-600 text-white rounded-br-sm' : 'bg-slate-700 text-white rounded-bl-sm'
                }`}>
                  {msg.text}
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* 輸入區 */}
      <div className="p-3 border-t border-white/10 bg-white/5 flex gap-2">
        <input 
          type="text" 
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={activeChannel === 'town_square' && !isHost ? '只有說書人可發布公告' : '輸入訊息...'} 
          className="flex-1 bg-black/50 border border-white/10 rounded-md px-3 py-2 text-base focus:outline-none focus:ring-1 focus:ring-blue-500 text-white placeholder-white/20 disabled:opacity-50"
          disabled={activeChannel === 'town_square' && !isHost}
        />
        <button 
          onClick={handleSend}
          disabled={activeChannel === 'town_square' && !isHost || !inputText.trim()}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-900/50 text-white rounded-md font-bold shadow-md transition-colors"
        >
          發送
        </button>
      </div>
    </div>
  );
};
