import { useState, useEffect, useRef } from 'react';
import { push, onValue, serverTimestamp, query, limitToLast, update } from 'firebase/database';
import { nref } from '../../services/firebase';
import { readFileAsDataUrl, resizeChatImage } from '../../lib/imageResize';
import { AllRoles } from '../../data/roles';
import type { Script } from '../../data/types';
import {
  EldritchDiceIcon,
  ScrollImageIcon,
} from '../common/CthulhuIcons';

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
  script?: Script;
  grimoireState?: Record<string, { roleId?: string }> | null;
  bluffs?: (string | null)[];
  onUnreadCountChange?: (count: number) => void;
  /** 面板實際顯示中（抽屜展開且在聊天分頁）才會把當前頻道標記為已讀 */
  isVisible?: boolean;
}

export const Chat = ({ roomId, userUid, userName, isHost, players, hostPlayer, isEvil, settings, seatCount = 15, script, grimoireState, onUnreadCountChange, isVisible = true }: ChatProps) => {
  const [activeChannel, setActiveChannel] = useState<string>('town_square');
  const [inputText, setInputText] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isPlusOpen, setIsPlusOpen] = useState(false);
  const [openTplMenu, setOpenTplMenu] = useState<'none' | 'num' | 'bool' | 'seat' | 'role'>('none');
  const [lightboxImg, setLightboxImg] = useState<string | null>(null);
  const [isUploadingImg, setIsUploadingImg] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Build channels
  // 順序：① 廣場公告（固定第一） ② 說書人（固定第二） ③ 其他群組頻道
  //      ④ 可使用的私聊頻道 ⑤ 不可使用的私聊頻道；自己的頻道不顯示。
  type ChannelItem = { id: string; name: string; disabled?: boolean; isSelf?: boolean; isGroup?: boolean; colorClass?: string };
  const availableChannels: ChannelItem[] = [];
  const usableChannels: ChannelItem[] = [];
  const unusableChannels: ChannelItem[] = [];

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
      if (p.uid === userUid) continue; // 自己的頻道不顯示

      const canPrivateMsg = isHost || privateMsgMode === 'all' || (privateMsgMode === 'adjacent' && isAdjacentSeat(mySeat, p.seat));

      let nameLabel = `${i}. ${p.name}`;
      if (!canPrivateMsg && !isHost) nameLabel += ' (未開放)';

      (canPrivateMsg ? usableChannels : unusableChannels).push({
        id: p.uid,
        name: nameLabel,
        disabled: !canPrivateMsg,
        isSelf: false
      });
    } else {
      // Empty seat（歸類為不可使用）
      unusableChannels.push({
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
    if (p.uid === userUid) return; // 自己的頻道不顯示

    const canPrivateMsg = isHost || privateMsgMode === 'all';

    let nameLabel = `旁觀者 - ${p.name}`;
    if (!canPrivateMsg && !isHost) nameLabel += ' (未開放)';

    (canPrivateMsg ? usableChannels : unusableChannels).push({
      id: p.uid,
      name: nameLabel,
      disabled: !canPrivateMsg,
      isSelf: false
    });
  });

  availableChannels.push(...usableChannels, ...unusableChannels);

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
      // 只訂閱最近 200 則，避免長局時每來一則新訊息就重抓整包歷史（流量隨訊息數平方成長）。
      const messagesRef = query(nref(`rooms/${roomId}/messages/${channelId}`), limitToLast(200));

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
      const unreadCount = msgs.filter(m => m.timestamp > readTime && m.senderUid !== userUid && !(isHost && m.senderUid === 'system' && !m.kind)).length;
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
    const messagesRef = nref(`rooms/${roomId}/messages/${channelId}`);
    
    push(messagesRef, {
      senderUid: userUid,
      senderName: userName,
      text: inputText.trim(),
      timestamp: serverTimestamp()
    });
    // 聊天也算活動，更新 lastActivityAt 讓排程清理不會誤刪進行中的房
    update(nref(), { [`rooms/${roomId}/public/lastActivityAt`]: serverTimestamp() });

    setInputText('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const sendSystemInfo = (text: string) => {
    if (activeChannel === 'town_square' && !isHost) {
      alert('只有說書人可以在廣場公告發言！');
      return;
    }
    const channelId = getChannelId(activeChannel);
    const messagesRef = nref(`rooms/${roomId}/messages/${channelId}`);
    push(messagesRef, {
      senderUid: 'system',
      senderName: '系統',
      kind: 'info',
      text,
      timestamp: serverTimestamp(),
    });
    update(nref(), { [`rooms/${roomId}/public/lastActivityAt`]: serverTimestamp() });
  };

  const sendImageFile = async (file: File) => {
    if (!isHost) return;
    if (activeChannel === 'town_square' && !isHost) return;
    try {
      setIsUploadingImg(true);
      const dataUrl = await readFileAsDataUrl(file);
      const compressed = await resizeChatImage(dataUrl, 720, 0.72);
      const channelId = getChannelId(activeChannel);
      const messagesRef = nref(`rooms/${roomId}/messages/${channelId}`);
      await push(messagesRef, {
        senderUid: userUid,
        senderName: userName,
        text: '',
        imageUrl: compressed,
        timestamp: serverTimestamp(),
      });
      await update(nref(), { [`rooms/${roomId}/public/lastActivityAt`]: serverTimestamp() });
    } catch (err) {
      console.error('圖片傳送失敗:', err);
      alert('圖片處理失敗，請換一張圖片再試。');
    } finally {
      setIsUploadingImg(false);
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    if (!isHost) return;
    const items = e.clipboardData?.items;
    if (!items) return;
    for (const item of Array.from(items)) {
      if (item.type.startsWith('image/')) {
        const file = item.getAsFile();
        if (file) {
          e.preventDefault();
          sendImageFile(file);
          return;
        }
      }
    }
  };

  const targetPlayer = players.find((p) => p.uid === activeChannel);
  const showHostTemplates = isHost && activeChannel !== 'town_square' && activeChannel !== 'evil_chat' && !!targetPlayer;

  const lookupRole = (roleId?: string | null) => {
    if (!roleId) return undefined;
    return script?.roles.find((r) => r.id === roleId) || AllRoles[roleId];
  };

  const fillOpeningRoleTemplate = () => {
    if (!targetPlayer?.seat) {
      setInputText('你目前尚未入座，無法讀取魔典角色。');
      return;
    }
    const roleId = grimoireState?.[targetPlayer.seat]?.roleId || grimoireState?.[String(targetPlayer.seat)]?.roleId;
    const role = lookupRole(roleId);
    if (!role) {
      setInputText(`【${targetPlayer.seat}號】魔典尚未配置角色。`);
      return;
    }
    const isEvilRole = role.type === 'minion' || role.type === 'demon';
    const teamTag = isEvilRole ? '[red]邪惡[/red]' : '[blue]善良[/blue]';
    setInputText(`你的角色是【${role.name}】（${teamTag}）。\n能力：${role.ability}`);
  };

  const renderMessageText = (text: string) => {
    if (!text) return null;
    return text.split(/(\[red\][\s\S]*?\[\/red\]|\[blue\][\s\S]*?\[\/blue\]|\[yellow\][\s\S]*?\[\/yellow\])/g).map((part, i) => {
      if (part.startsWith('[red]')) {
        return <span key={i} className="text-red-400 font-bold">{part.replace(/\[\/?red\]/g, '')}</span>;
      }
      if (part.startsWith('[blue]')) {
        return <span key={i} className="text-blue-300 font-bold">{part.replace(/\[\/?blue\]/g, '')}</span>;
      }
      if (part.startsWith('[yellow]')) {
        return <span key={i} className="text-amber-300 font-bold">{part.replace(/\[\/?yellow\]/g, '')}</span>;
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
                  const unreadCount = (messagesByChannel[ch.id] || []).filter((m: any) => m.timestamp > (lastRead[ch.id] || 0) && m.senderUid !== userUid && !(isHost && m.senderUid === 'system' && !m.kind)).length;
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

            // 系統自動公告（時間變更 / 提名 / 死亡生存）：置中橫幅
            if (msg.senderUid === 'system' && msg.kind) {
              // 底板顏色維持不變
              const kindStyle: Record<string, string> = {
                time: 'bg-amber-500/15 border-amber-400/60 text-amber-200',
                nomination: 'bg-sky-500/15 border-sky-400/50 text-sky-200',
                death: 'bg-rose-600/15 border-rose-500/50 text-rose-200',
                info: 'bg-white/10 border-white/25 text-white/80',
              };
              const NAME_CLS = 'text-emerald-300 font-extrabold';
              const phaseTxt = (p: string) => (p === 'night' ? '黑夜' : '白天');
              const phaseCls = (p: string) => (p === 'night' ? 'text-indigo-300 font-extrabold' : 'text-orange-300 font-extrabold');
              // 只替「名字」換色，前面的「NN. 」座位編號維持原本顏色
              const renderSeatName = (label: string) => {
                const m = /^(\s*\d+\s*[.．]\s*)([\s\S]*)$/.exec(label);
                if (!m) return <span className={NAME_CLS}>{label}</span>;
                return <>{m[1]}<span className={NAME_CLS}>{m[2]}</span></>;
              };

              let body: React.ReactNode = msg.text;
              if (msg.kind === 'time' && msg.day) {
                body = <>時間推進至，第 {msg.day} 天，<span className={phaseCls(msg.phase)}>{phaseTxt(msg.phase)}</span></>;
              } else if (msg.kind === 'nomination' && msg.nominator) {
                body = <>{renderSeatName(msg.nominator)} 提名 {renderSeatName(msg.nominee)}，{msg.count ?? 0} 票</>;
              } else if (msg.kind === 'death' && msg.name) {
                body = <>{renderSeatName(msg.name)} 於第 {msg.day} 天<span className={phaseCls(msg.phase)}>{phaseTxt(msg.phase)}</span>{msg.dead ? '死亡' : '被標記為存活'}</>;
              }
              return (
                <div key={msg.id} className="flex justify-center my-1">
                  <div className={`max-w-[90%] text-center text-sm font-bold tracking-wide rounded-lg border px-4 py-2 shadow-md whitespace-pre-wrap ${kindStyle[msg.kind] || kindStyle.info}`}>
                    {body}
                  </div>
                </div>
              );
            }

            const senderPlayer = players.find(p => p.uid === msg.senderUid);
            let senderDisplayName = msg.senderUid === hostPlayer?.uid ? '說書人' : msg.senderName;
            if (msg.senderUid !== hostPlayer?.uid && senderPlayer && (senderPlayer.seat === null || senderPlayer.seat === undefined)) {
              senderDisplayName = `旁觀者 - ${senderDisplayName}`;
            }
            const hasText = Boolean(msg.text && msg.text.trim());
            const isImageOnly = Boolean(msg.imageUrl && !hasText);
            return (
              <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                <span className="text-xs text-white mb-1 px-1 font-medium">{senderDisplayName}</span>
                {isImageOnly ? (
                  <img
                    src={msg.imageUrl}
                    alt="說書人傳送的圖片"
                    onClick={() => setLightboxImg(msg.imageUrl)}
                    className="max-w-[85%] max-h-56 rounded-xl cursor-zoom-in object-contain shadow-lg"
                  />
                ) : (
                  <div 
                    className={`max-w-[85%] rounded-2xl px-4 py-2 break-words whitespace-pre-wrap text-white shadow-md ${
                      isMe ? 'bg-blue-600/70 border border-blue-500/30 rounded-br-sm' : 
                      'bg-slate-600/80 border border-white/20 rounded-bl-sm'
                    }`}
                  >
                    {msg.imageUrl && (
                      <img
                        src={msg.imageUrl}
                        alt="說書人傳送的圖片"
                        onClick={() => setLightboxImg(msg.imageUrl)}
                        className="max-w-full max-h-56 rounded-lg cursor-zoom-in mb-1 object-contain"
                      />
                    )}
                    {renderMessageText(msg.text)}
                  </div>
                )}
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
        <div className="border-t border-white/10 bg-white/5 flex flex-col">
          {/* 說書人常用私訊／資訊快捷模板列 */}
          {showHostTemplates && (
            <div className="px-3 pt-2 pb-1.5 relative border-b border-white/5 bg-black/20">
              {openTplMenu !== 'none' && (
                <div className="fixed inset-0 z-40" onClick={() => setOpenTplMenu('none')} />
              )}

              <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-thin scrollbar-thumb-slate-700 text-xs">
                <button
                  type="button"
                  onClick={() => { fillOpeningRoleTemplate(); setOpenTplMenu('none'); }}
                  className="px-2.5 py-1 rounded bg-amber-900/50 hover:bg-amber-800/70 border border-amber-500/40 text-amber-200 font-bold shrink-0 transition-colors"
                >
                  開局身分
                </button>

                <button
                  type="button"
                  onClick={() => setOpenTplMenu(openTplMenu === 'num' ? 'none' : 'num')}
                  className={`px-2.5 py-1 rounded border font-bold shrink-0 transition-colors flex items-center gap-1 ${openTplMenu === 'num' ? 'bg-blue-600/60 border-blue-400 text-white' : 'bg-slate-900 hover:bg-slate-800 border-white/20 text-slate-200'}`}
                >
                  <span>得知數字</span>
                  <span className="text-[10px] opacity-60">▾</span>
                </button>

                <button
                  type="button"
                  onClick={() => setOpenTplMenu(openTplMenu === 'bool' ? 'none' : 'bool')}
                  className={`px-2.5 py-1 rounded border font-bold shrink-0 transition-colors flex items-center gap-1 ${openTplMenu === 'bool' ? 'bg-blue-600/60 border-blue-400 text-white' : 'bg-slate-900 hover:bg-slate-800 border-white/20 text-slate-200'}`}
                >
                  <span>是/否</span>
                  <span className="text-[10px] opacity-60">▾</span>
                </button>

                <button
                  type="button"
                  onClick={() => setOpenTplMenu(openTplMenu === 'seat' ? 'none' : 'seat')}
                  className={`px-2.5 py-1 rounded border font-bold shrink-0 transition-colors flex items-center gap-1 ${openTplMenu === 'seat' ? 'bg-amber-600/50 border-amber-400 text-amber-100' : 'bg-slate-900 hover:bg-slate-800 border-white/20 text-amber-200'}`}
                >
                  <span>座位</span>
                  <span className="text-[10px] opacity-60">▾</span>
                </button>

                <button
                  type="button"
                  onClick={() => setOpenTplMenu(openTplMenu === 'role' ? 'none' : 'role')}
                  className={`px-2.5 py-1 rounded border font-bold shrink-0 transition-colors flex items-center gap-1 ${openTplMenu === 'role' ? 'bg-blue-700/70 border-blue-400 text-blue-100' : 'bg-blue-950/70 hover:bg-blue-900/70 border-blue-500/40 text-blue-400'}`}
                >
                  <span>角色</span>
                  <span className="text-[10px] opacity-60">▾</span>
                </button>
              </div>

              {/* 彈出選單（按鈕本身不作為選項） */}
              {openTplMenu === 'num' && (
                <div className="absolute bottom-full left-3 mb-1.5 z-50 bg-slate-900 border border-slate-600 rounded-lg shadow-2xl p-1.5 flex items-center gap-1.5">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => { setInputText(`今晚你得知的數字為：${n}`); setOpenTplMenu('none'); }}
                      className="w-8 h-8 rounded bg-slate-800 hover:bg-blue-600/60 border border-white/15 text-white font-bold text-sm transition-colors"
                    >
                      {n}
                    </button>
                  ))}
                </div>
              )}

              {openTplMenu === 'bool' && (
                <div className="absolute bottom-full left-24 mb-1.5 z-50 bg-slate-900 border border-slate-600 rounded-lg shadow-2xl p-1.5 flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => { setInputText('你得知 : 是'); setOpenTplMenu('none'); }}
                    className="px-4 py-1.5 rounded bg-red-900/60 hover:bg-red-700 border border-red-500/40 text-white font-bold text-xs transition-colors"
                  >
                    是
                  </button>
                  <button
                    type="button"
                    onClick={() => { setInputText('你得知 : 否'); setOpenTplMenu('none'); }}
                    className="px-4 py-1.5 rounded bg-blue-900/60 hover:bg-blue-700 border border-blue-500/40 text-white font-bold text-xs transition-colors"
                  >
                    否
                  </button>
                </div>
              )}

              {openTplMenu === 'seat' && (
                <div className="absolute bottom-full left-3 right-3 mb-1.5 z-50 bg-slate-900 border border-slate-600 rounded-lg shadow-2xl p-2 grid grid-cols-2 sm:grid-cols-3 gap-1.5 max-h-48 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-700">
                  {Array.from({ length: actualSeatCount }, (_, i) => i + 1).map((s) => {
                    const p = players.find((pl) => pl.seat === s);
                    const label = p?.name ? `${s}號 - ${p.name}` : `${s}號`;
                    const tag = `[yellow]${label}[/yellow]`;
                    return (
                      <button
                        key={s}
                        type="button"
                        onClick={() => {
                          setInputText((prev) => (prev ? `${prev} ${tag}` : tag));
                          setOpenTplMenu('none');
                        }}
                        className="px-2 py-1.5 rounded bg-slate-800 hover:bg-amber-600/30 border border-white/10 text-amber-300 font-bold text-xs truncate text-left transition-colors"
                        title={label}
                      >
                        {label}
                      </button>
                    );
                  })}
                </div>
              )}

              {openTplMenu === 'role' && (
                <div className="absolute bottom-full left-3 right-3 mb-1.5 z-50 bg-slate-900 border border-slate-600 rounded-lg shadow-2xl p-2 grid grid-cols-2 sm:grid-cols-3 gap-1.5 max-h-52 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-700">
                  {(script?.roles || []).map((r) => {
                    const roleMenuColor =
                      r.type === 'townsfolk'
                        ? 'text-blue-400 hover:bg-blue-900/40'
                        : r.type === 'outsider'
                        ? 'text-sky-300 hover:bg-sky-900/40'
                        : r.type === 'minion'
                        ? 'text-rose-300 hover:bg-rose-900/40'
                        : r.type === 'demon'
                        ? 'text-red-500 hover:bg-red-900/40'
                        : r.type === 'traveler'
                        ? 'text-purple-300 hover:bg-purple-900/40'
                        : 'text-amber-300 hover:bg-amber-900/40';
                    const isEvilRole = r.type === 'minion' || r.type === 'demon';
                    const tag = isEvilRole ? `[red]【${r.name}】[/red]` : `[blue]【${r.name}】[/blue]`;
                    return (
                      <button
                        key={r.id}
                        type="button"
                        onClick={() => {
                          setInputText((prev) => (prev ? `${prev} ${tag}` : tag));
                          setOpenTplMenu('none');
                        }}
                        className={`px-2 py-1.5 rounded bg-slate-800 border border-white/10 font-bold text-xs truncate text-left transition-colors ${roleMenuColor}`}
                      >
                        {r.name}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* 隱藏圖片上傳 input（僅限說書人） */}
          {isHost && (
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) sendImageFile(file);
                e.target.value = '';
              }}
            />
          )}

          <div className="p-3 flex gap-2 items-center relative">
            {/* 輸入框（左側內嵌 + 按鈕） */}
            <div className="flex-1 relative flex items-center bg-black/50 border border-white/10 rounded-md focus-within:ring-1 focus-within:ring-blue-500">
              <button
                type="button"
                onClick={() => setIsPlusOpen(!isPlusOpen)}
                className="ml-1.5 w-7 h-7 rounded flex items-center justify-center text-white/70 hover:text-white hover:bg-white/15 font-bold text-lg transition-colors shrink-0"
                title="更多功能"
              >
                +
              </button>

              {isPlusOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setIsPlusOpen(false)} />
                  <div className="absolute bottom-full left-0 mb-2 z-50 bg-slate-900 border border-slate-600 rounded-xl shadow-2xl overflow-hidden w-56 divide-y divide-white/10">
                    <button
                      type="button"
                      onClick={() => {
                        const roll = Math.floor(Math.random() * 100) + 1;
                        sendSystemInfo(`${userName} Roll 點結果：${roll}（1~100）`);
                        setIsPlusOpen(false);
                      }}
                      className="w-full text-left px-3.5 py-2.5 hover:bg-white/10 text-sm text-stone-200 font-bold flex items-center gap-3 transition-colors"
                    >
                      <EldritchDiceIcon className="w-5 h-5 text-amber-300 shrink-0" />
                      <span>Roll 點（1~100）</span>
                    </button>
                    {isHost && (
                      <button
                        type="button"
                        onClick={() => {
                          setIsPlusOpen(false);
                          fileInputRef.current?.click();
                        }}
                        disabled={isUploadingImg}
                        className="w-full text-left px-3.5 py-2.5 hover:bg-white/10 text-sm text-stone-200 font-bold flex items-center gap-3 transition-colors disabled:opacity-40"
                      >
                        <ScrollImageIcon className="w-5 h-5 text-amber-300 shrink-0" />
                        <span>{isUploadingImg ? '圖片處理中...' : '傳送圖片'}</span>
                      </button>
                    )}
                  </div>
                </>
              )}

              <input 
                type="text" 
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={handleKeyDown}
                onPaste={handlePaste}
                placeholder={isHost ? '輸入訊息或貼上圖片...' : '輸入訊息...'}
                className="flex-1 bg-transparent px-2.5 py-2 text-base focus:outline-none text-white placeholder-white/20 min-w-0"
              />
            </div>

            <button 
              onClick={handleSend}
              disabled={!inputText.trim()}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-900/50 text-white rounded-md font-bold shadow-md transition-colors shrink-0"
            >
              發送
            </button>
          </div>
        </div>
      )}

      {/* 圖片放大燈箱 */}
      {lightboxImg && (
        <div
          onClick={() => setLightboxImg(null)}
          className="fixed inset-0 z-[120] bg-black/90 flex items-center justify-center p-4 cursor-zoom-out"
        >
          <img src={lightboxImg} alt="放大圖片" className="max-w-full max-h-full rounded-lg shadow-2xl object-contain" />
        </div>
      )}
    </div>
  );
};
