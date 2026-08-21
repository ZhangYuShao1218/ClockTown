import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ref, onValue, query, limitToLast } from "firebase/database";
import { db } from "../../services/firebase";
import { createRoom, joinRoom } from "../../services/roomService";
import { useAuth } from "../../hooks/useAuth";
import { Modal } from "../common/Modal";
import { generateMockRoom } from "../../lib/testUtils";

export const Lobby = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  
  const [playerName, setPlayerName] = useState(() => {
    return localStorage.getItem("botc_player_name") || "";
  });
  
  const [roomIdInput, setRoomIdInput] = useState("");
  const [error, setError] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isEditingName, setIsEditingName] = useState(!playerName);
  const [publicRooms, setPublicRooms] = useState<any[]>([]);

  // Modal 狀態
  const [modalContent, setModalContent] = useState<{ title: string; content: string } | null>(null);

  useEffect(() => {
    // 監聽房間列表 (抓取最新的 50 個房間)
    const roomsRef = query(ref(db, "rooms"), limitToLast(50));
    const unsubscribe = onValue(roomsRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const availableRooms = Object.keys(data)
          .map(key => ({
            id: key,
            ...data[key]
          }))
          .filter(room => room.public?.status === "lobby") // 只顯示等待中的房間
          .map(room => {
            const hostName = room.players?.[room.public.hostId]?.name || "未知說書人";
            const playerCount = room.players ? Object.keys(room.players).length : 0;
            return { id: room.id, hostName, playerCount, createdAt: room.public.createdAt };
          })
          .sort((a, b) => b.createdAt - a.createdAt); // 最新建立的在上面

        setPublicRooms(availableRooms);
      } else {
        setPublicRooms([]);
      }
    });

    return () => unsubscribe();
  }, []);

  const saveName = () => {
    if (!playerName.trim()) {
      setError("請輸入一個有效的暱稱");
      return;
    }
    localStorage.setItem("botc_player_name", playerName.trim());
    setIsEditingName(false);
    setError("");
  };

  const handleCreateRoom = async () => {
    if (!user) return;
    try {
      setIsProcessing(true);
      setError("");
      const newRoomId = await createRoom(user.uid, playerName);
      navigate(`/room/${newRoomId}`);
    } catch (err: any) {
      setError(err.message || "建立房間失敗");
      setIsProcessing(false);
    }
  };

  const handleJoinRoom = async (targetRoomId: string) => {
    if (!user) return;
    try {
      setIsProcessing(true);
      setError("");
      const joinedRoomId = await joinRoom(targetRoomId.toUpperCase(), user.uid, playerName);
      navigate(`/room/${joinedRoomId}`);
    } catch (err: any) {
      setError(err.message || "加入房間失敗");
      setIsProcessing(false);
    }
  };

  const handleMockRoom = async () => {
    try {
      setIsProcessing(true);
      await generateMockRoom();
      setIsProcessing(false);
    } catch (err: any) {
      setError(err.message || "建立測試房間失敗");
      setIsProcessing(false);
    }
  };

  if (loading) {
    return <div className="flex h-screen items-center justify-center bg-black text-muted-foreground">喚醒中...</div>;
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center p-4 text-foreground">
      {/* 黑暗奇幻克蘇魯背景圖 */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/background.jpg')" }}
      />
      {/* 背景遮罩讓 UI 更好閱讀 */}
      <div className="absolute inset-0 z-0 bg-black/30 backdrop-blur-[2px]" />

      <div className="relative z-10 w-full max-w-lg space-y-8 rounded-xl border border-white/10 bg-black/60 backdrop-blur-md p-8 shadow-2xl">
        
        <div className="text-center">
          <h1 className="text-4xl font-extrabold tracking-widest text-white/90 drop-shadow-md font-serif">血染鐘樓</h1>
          <p className="mt-4 text-sm text-white/60 tracking-wider leading-relaxed">
            「霧氣籠罩著古老的鐘樓，不可名狀的恐懼正在鎮上蔓延...<br/>
            不要相信你身邊的任何人，因為惡魔可能就隱藏在你們之中。」
          </p>
        </div>

        {error && (
          <div className="rounded-md bg-destructive/20 border border-destructive/50 p-3 text-sm font-medium text-red-400 text-center shadow-inner">
            {error}
          </div>
        )}

        {isEditingName ? (
          <div className="space-y-4">
            <div className="space-y-2 text-center">
              <label className="text-sm font-medium text-white/80 tracking-widest uppercase">說出你的名字，旅人</label>
              <input
                type="text"
                autoFocus
                className="flex h-12 w-full rounded-md border border-white/20 bg-black/50 px-4 py-2 text-center text-lg text-white placeholder:text-white/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 transition-all"
                placeholder="輸入你在鎮上的名字"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && saveName()}
              />
            </div>
            <button
              onClick={saveName}
              className="w-full rounded-md bg-white/10 border border-white/20 px-4 py-3 text-sm font-bold text-white hover:bg-white/20 transition-all shadow-lg"
            >
              踏入鐘樓鎮
            </button>
          </div>
        ) : (
          <div className="space-y-8">
            
            <div className="flex items-center justify-between rounded-lg bg-black/40 border border-white/10 p-4 shadow-inner">
              <div className="text-white/80">
                <span className="text-sm">目前身分：</span>
                <span className="ml-2 font-bold text-white">{playerName}</span>
              </div>
              <button 
                onClick={() => setIsEditingName(true)}
                className="text-sm text-white/50 hover:text-white transition-colors underline underline-offset-4"
              >
                更換身分
              </button>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <button 
                onClick={() => setModalContent({ title: "劇本庫", content: "這裡未來會列出所有可用的劇本（如：暗流湧動、黯月馬戲團等），供說書人與玩家查閱每個角色的詳細技能與互動關係。" })}
                className="rounded-md border border-white/10 bg-black/40 py-2 text-xs font-medium text-white/70 hover:bg-white/10 hover:text-white transition-all"
              >
                查看各劇本
              </button>
              <button 
                onClick={() => setModalContent({ title: "遊戲介紹", content: "《血染鐘樓》是一款社交推理遊戲。白天，玩家們互相交談、交換資訊並處決嫌疑人；夜晚，惡魔會殺人，而鎮民們則運用特殊能力收集線索。不要相信任何人。" })}
                className="rounded-md border border-white/10 bg-black/40 py-2 text-xs font-medium text-white/70 hover:bg-white/10 hover:text-white transition-all"
              >
                遊戲介紹
              </button>
              <button 
                onClick={() => setModalContent({ title: "新手技巧", content: "1. 如果你是好人，請盡量分享資訊，好人死於沉默。\n2. 如果你是壞人，請準備好一個假身分。\n3. 不要怕死，即使死了你仍有最後一張『幽靈票』可以扭轉戰局。" })}
                className="rounded-md border border-white/10 bg-black/40 py-2 text-xs font-medium text-white/70 hover:bg-white/10 hover:text-white transition-all"
              >
                新手技巧
              </button>
            </div>

            <div className="border-t border-white/10 pt-6 space-y-4">
              <button
                onClick={handleCreateRoom}
                disabled={isProcessing}
                className="w-full rounded-md bg-white/90 px-4 py-3 text-sm font-bold text-black shadow-lg hover:bg-white transition-all disabled:opacity-50"
              >
                建立新房間
              </button>

              <div className="flex space-x-2 pt-2">
                <input
                  type="text"
                  className="flex h-12 w-full rounded-md border border-white/20 bg-black/50 px-4 py-2 text-center text-lg uppercase tracking-widest text-white placeholder:text-white/30 placeholder:tracking-normal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 transition-all"
                  placeholder="輸入 4 碼房號"
                  maxLength={4}
                  value={roomIdInput}
                  onChange={(e) => setRoomIdInput(e.target.value)}
                  disabled={isProcessing}
                />
                <button
                  onClick={() => handleJoinRoom(roomIdInput)}
                  disabled={isProcessing || !roomIdInput.trim()}
                  className="rounded-md bg-white/20 border border-white/30 px-6 py-2 text-sm font-bold text-white shadow-sm hover:bg-white/30 transition-all disabled:opacity-50"
                >
                  加入
                </button>
              </div>
            </div>

            <div className="space-y-3 pt-4">
              <div className="flex justify-between items-end">
                <h3 className="text-sm font-bold tracking-wider text-white/70">鐘樓廣場 (等待中的房間)</h3>
                
                {/* 開發測試用按鈕 */}
                {import.meta.env.DEV && (
                  <div className="flex space-x-2">
                    <button 
                      onClick={async () => {
                        setIsProcessing(true);
                        const { clearAllRooms } = await import("../../lib/testUtils");
                        await clearAllRooms();
                        setIsProcessing(false);
                      }}
                      disabled={isProcessing}
                      className="text-[10px] bg-red-900/50 text-red-200 px-2 py-1 rounded hover:bg-red-800/50 border border-red-500/30"
                    >
                      清空所有房間
                    </button>
                    <button 
                      onClick={handleMockRoom}
                      disabled={isProcessing}
                      className="text-[10px] bg-green-900/50 text-green-200 px-2 py-1 rounded hover:bg-green-800/50 border border-green-500/30"
                    >
                      + 產生假房間
                    </button>
                  </div>
                )}
              </div>

              {publicRooms.length === 0 ? (
                <div className="rounded-md border border-dashed border-white/20 bg-black/20 p-6 text-center text-sm text-white/40">
                  目前廣場上沒有聚集的人群
                </div>
              ) : (
                <ul className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {publicRooms.map(room => (
                    <li 
                      key={room.id} 
                      className="flex justify-between items-center rounded-md border border-white/10 bg-white/5 p-3 hover:bg-white/10 cursor-pointer transition-colors group" 
                      onClick={() => handleJoinRoom(room.id)}
                    >
                      <span className="text-sm font-medium text-white/90 group-hover:text-white">{room.hostName} <span className="text-white/40 font-normal">的局</span></span>
                      <div className="flex items-center space-x-3">
                        <span className="text-xs bg-black/50 border border-white/10 text-white/70 px-2 py-1 rounded">
                          {room.playerCount} 人
                        </span>
                        <span className="text-xs font-mono text-white/30 group-hover:text-white/60">
                          #{room.id}
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

          </div>
        )}
      </div>

      <Modal 
        isOpen={!!modalContent} 
        onClose={() => setModalContent(null)}
        title={modalContent?.title || ""}
      >
        <p className="whitespace-pre-line text-white/80 leading-relaxed text-base">
          {modalContent?.content}
        </p>
      </Modal>

    </div>
  );
};
