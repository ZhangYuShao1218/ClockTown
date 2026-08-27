import re

with open('src/components/game/Chat.tsx', 'r', encoding='utf-8') as f:
    text = f.read()

# Replace <select> with a custom dropdown
bad_ui = """      {/* 頻道選擇區 */}
      <div className="p-3 border-b border-white/10 bg-white/5 flex items-center shadow-md">
        <label className="text-sm font-bold text-white/50 mr-3 whitespace-nowrap">頻道</label>
        <select
          value={activeChannel}
          onChange={(e) => setActiveChannel(e.target.value)}
          className="flex-1 bg-slate-900 border border-white/20 text-white rounded-md px-3 py-2 text-base outline-none focus:border-blue-500 shadow-inner font-medium"
        >
          {availableChannels.map(ch => (
            <option 
              key={ch.id} 
              value={ch.id} 
              disabled={ch.disabled}
              className={`${ch.isSelf ? 'text-green-400 font-bold' : ch.isGroup ? 'text-purple-300 font-bold' : 'text-white'} ${ch.disabled ? 'text-white/20' : ''}`}
            >
              {ch.name}
            </option>
          ))}
        </select>
      </div>"""

good_ui = """      {/* 頻道選擇區 */}
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
      </div>"""

text = text.replace(bad_ui, good_ui)

# Add isDropdownOpen state
text = text.replace(
    'const [inputText, setInputText] = useState(\'\');',
    'const [inputText, setInputText] = useState(\'\');\n  const [isDropdownOpen, setIsDropdownOpen] = useState(false);'
)

# Fix empty seats iteration:
# "即使座位是空的沒有玩家坐下 也要能看到選項 (但不能互動)"
# We need to map over seat indices 1~N (e.g., settings.seatCount or Room's players length?)
# The ChatProps doesn't have `seatCount`. We can compute it from `players` or we can just pass `seatCount` to `ChatProps`.
# Wait, let's just find the max seat number in `players`? No, if game is not fully seated, max seat number might be wrong.
# Let's add `seatCount: number` to `ChatProps`!
bad_props = "interface ChatProps {\n  roomId: string;\n  userUid: string;\n  userName: string;\n  isHost: boolean;\n  players: any[];\n  hostPlayer: any;\n  isEvil?: boolean;\n  settings?: any;\n}"
good_props = "interface ChatProps {\n  roomId: string;\n  userUid: string;\n  userName: string;\n  isHost: boolean;\n  players: any[];\n  hostPlayer: any;\n  isEvil?: boolean;\n  settings?: any;\n  seatCount?: number;\n}"
text = text.replace(bad_props, good_props)

text = text.replace(
    'export const Chat = ({ roomId, userUid, userName, isHost, players, hostPlayer, isEvil, settings }: ChatProps) => {',
    'export const Chat = ({ roomId, userUid, userName, isHost, players, hostPlayer, isEvil, settings, seatCount = 15 }: ChatProps) => {'
)

# Rebuild players mapping logic for the Chat
bad_sort = """  // Sort players by seat (or by name if seat is null)
  const sortedPlayers = [...players].sort((a, b) => {
    if (a.seat !== null && b.seat !== null) return a.seat - b.seat;
    if (a.seat !== null) return -1;
    if (b.seat !== null) return 1;
    return a.name.localeCompare(b.name);
  });

  sortedPlayers.forEach(p => {
    if (hostPlayer && p.uid === hostPlayer.uid) return; // Skip host in player list
    
    const isSelf = p.uid === userUid;
    // If not host, and we are not self, we check if private messaging is allowed
    const canPrivateMsg = isHost || settings?.allCanMsg;
    const disabled = isSelf || !canPrivateMsg;
    
    let nameLabel = p.seat !== null ? `${p.seat}. ${p.name}` : p.name;
    if (isSelf) nameLabel += ' (你)';
    else if (!canPrivateMsg && !isHost) nameLabel += ' (未開放)';

    availableChannels.push({ 
      id: p.uid, 
      name: nameLabel,
      disabled: disabled,
      isSelf: isSelf
    });
  });"""

good_sort = """  const actualSeatCount = settings?.seatCount || seatCount;
  
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
  });"""

text = text.replace(bad_sort, good_sort)

with open('src/components/game/Chat.tsx', 'w', encoding='utf-8') as f:
    f.write(text)
