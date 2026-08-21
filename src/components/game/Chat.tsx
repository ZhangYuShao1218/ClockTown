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
}

export const Chat = ({ roomId, userUid, userName, isHost, players, hostPlayer }: ChatProps) => {
  const [activeChannel, setActiveChannel] = useState<string>('town_square');
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const availableChannels = [
    { id: 'town_square', name: '廣場公告' },
  ];
  
  if (!isHost && hostPlayer) {
    availableChannels.push({ id: 'host', name: '說書人' });
  }

  // Other players
  players.forEach(p => {
    if (p.uid === userUid) return;
    if (isHost) {
      availableChannels.push({ id: p.uid, name: p.name });
    } else {
      // 根據劇本設定決定，但使用者說「必定能和說書人聊天 並且查看廣場公告」，
      // 「除此之外 要實作能夠分別和所有玩家一對一聊天的功能」。
      // 防止說書人重複出現（因為前面已經加了 'host'）
      if (hostPlayer && p.uid === hostPlayer.uid) return;
      availableChannels.push({ id: p.uid, name: p.name });
    }
  });

  const getChannelId = (target: string) => {
    if (target === 'town_square') return 'town_square';
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
      <div className="flex items-center space-x-2 overflow-x-auto p-2 border-b border-white/10 bg-white/5 scrollbar-thin scrollbar-thumb-slate-700">
        {availableChannels.map(ch => (
          <button
            key={ch.id}
            onClick={() => setActiveChannel(ch.id)}
            className={`whitespace-nowrap px-3 py-1.5 rounded-full text-sm font-bold transition-colors ${
              activeChannel === ch.id 
                ? 'bg-blue-600 text-white shadow-md' 
                : 'bg-black/50 text-white/50 hover:bg-white/10 hover:text-white/80'
            }`}
          >
            {ch.name}
          </button>
        ))}
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
