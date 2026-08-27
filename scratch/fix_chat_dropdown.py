import re

with open('src/components/game/Chat.tsx', 'r', encoding='utf-8') as f:
    text = f.read()

# Replace availableChannels logic
bad_channels = """  const availableChannels = [
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
  });"""

good_channels = """  // Build channels
  const availableChannels: { id: string; name: string; disabled?: boolean; isSelf?: boolean; isGroup?: boolean }[] = [];
  
  availableChannels.push({ id: 'town_square', name: '廣場公告', isGroup: true });
  
  if (!isHost && hostPlayer) {
    availableChannels.push({ id: 'host', name: '說書人 (私訊)' });
  }

  if (settings?.evilCanMsg && (isHost || isEvil)) {
    availableChannels.push({ id: 'evil_chat', name: '邪惡陣營 (私聊)', isGroup: true });
  }

  // Sort players by seat (or by name if seat is null)
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

text = text.replace(bad_channels, good_channels)

# Replace getChannelId
bad_get = """  const getChannelId = (target: string) => {
    if (target === 'town_square') return 'town_square';
    if (target === 'host') {
      if (isHost) return 'town_square'; // Fallback for safety
      const uids = [userUid, hostPlayer.uid].sort();
      return `dm_${uids[0]}_${uids[1]}`;
    }
    const targetUid = target;
    const uids = [userUid, targetUid].sort();
    return `dm_${uids[0]}_${uids[1]}`;
  };"""

good_get = """  const getChannelId = (target: string) => {
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
  };"""

text = text.replace(bad_get, good_get)

# Replace the channel selection UI
bad_ui = """      {/* 頻道選擇區 */}
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
      </div>"""

good_ui = """      {/* 頻道選擇區 */}
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

text = text.replace(bad_ui, good_ui)

with open('src/components/game/Chat.tsx', 'w', encoding='utf-8') as f:
    f.write(text)
