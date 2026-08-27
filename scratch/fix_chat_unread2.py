import re

with open('src/components/game/Chat.tsx', 'r', encoding='utf-8') as f:
    text = f.read()

# Add onUnreadCountChange to props
text = text.replace(
    '  seatCount?: number;\n}',
    '  seatCount?: number;\n  onUnreadCountChange?: (count: number) => void;\n}'
)
text = text.replace(
    'export const Chat = ({ roomId, userUid, userName, isHost, players, hostPlayer, isEvil, settings, seatCount = 15 }: ChatProps) => {',
    'export const Chat = ({ roomId, userUid, userName, isHost, players, hostPlayer, isEvil, settings, seatCount = 15, onUnreadCountChange }: ChatProps) => {'
)

# Modify state definitions and data fetching
bad_state = """  const [activeChannel, setActiveChannel] = useState<string>('town_square');
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);"""

good_state = """  const [activeChannel, setActiveChannel] = useState<string>('town_square');
  const [allMessages, setAllMessages] = useState<Record<string, Record<string, Message>>>({});
  const [inputText, setInputText] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const [lastReadTimes, setLastReadTimes] = useState<Record<string, number>>(() => {
    try {
      const saved = localStorage.getItem(`botc_chat_read_${roomId}_${userUid}`);
      return saved ? JSON.parse(saved) : {};
    } catch { return {}; }
  });"""
text = text.replace(bad_state, good_state)

bad_fetch = """  useEffect(() => {
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
  }, [roomId, activeChannel, userUid, isHost, hostPlayer?.uid]);"""

good_fetch = """  useEffect(() => {
    if (!roomId) return;
    const messagesRef = ref(db, `rooms/${roomId}/messages`);
    const unsubscribe = onValue(messagesRef, (snapshot) => {
      setAllMessages(snapshot.val() || {});
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 50);
    });
    return () => unsubscribe();
  }, [roomId]);"""

text = text.replace(bad_fetch, good_fetch)

unread_logic = """
  // Compute unread counts per channel
  const unreadCounts: Record<string, number> = {};
  let totalUnread = 0;

  availableChannels.forEach(ch => {
    if (ch.disabled) return;
    const cid = getChannelId(ch.id);
    const msgs = allMessages[cid];
    let count = 0;
    if (msgs) {
      const lastRead = lastReadTimes[cid] || 0;
      Object.values(msgs).forEach(m => {
        if (m.timestamp > lastRead && m.senderUid !== userUid) {
          count++;
        }
      });
    }
    unreadCounts[ch.id] = count;
    if (ch.id !== activeChannel) totalUnread += count;
  });

  useEffect(() => {
    if (onUnreadCountChange) onUnreadCountChange(totalUnread);
  }, [totalUnread, onUnreadCountChange]);

  // Mark current channel as read
  useEffect(() => {
    const channelId = getChannelId(activeChannel);
    const msgs = allMessages[channelId];
    if (msgs) {
      const msgList = Object.values(msgs);
      if (msgList.length > 0) {
        const lastMsg = msgList.sort((a: any, b: any) => a.timestamp - b.timestamp)[msgList.length - 1];
        if (lastMsg) {
          setLastReadTimes(prev => {
            const current = prev[channelId] || 0;
            if (lastMsg.timestamp > current) {
              const next = { ...prev, [channelId]: lastMsg.timestamp };
              localStorage.setItem(`botc_chat_read_${roomId}_${userUid}`, JSON.stringify(next));
              return next;
            }
            return prev;
          });
        }
      }
    }
  }, [activeChannel, allMessages, roomId, userUid]);

  const activeChannelId = getChannelId(activeChannel);
  const messages = allMessages[activeChannelId] 
    ? Object.keys(allMessages[activeChannelId]).map(key => ({
        id: key,
        ...allMessages[activeChannelId][key]
      })).sort((a: any, b: any) => a.timestamp - b.timestamp)
    : [];

  return ("""

text = text.replace('  return (', unread_logic, 1)

# Replace dropdown items to show unread count
bad_dropdown_item = """                  <button
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
                  </button>"""

good_dropdown_item = """                  <button
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
                    <span className="truncate flex items-center">
                      {ch.name}
                      {unreadCounts[ch.id] > 0 && ch.id !== activeChannel && (
                        <span className="ml-2 px-1.5 py-0.5 bg-red-600 text-white text-[10px] font-bold rounded-full leading-none">
                          {unreadCounts[ch.id] > 99 ? '99+' : unreadCounts[ch.id]}
                        </span>
                      )}
                    </span>
                    {ch.id === activeChannel && (
                      <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                    )}
                  </button>"""
text = text.replace(bad_dropdown_item, good_dropdown_item)


with open('src/components/game/Chat.tsx', 'w', encoding='utf-8') as f:
    f.write(text)
