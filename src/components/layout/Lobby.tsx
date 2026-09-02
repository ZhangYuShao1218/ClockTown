import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ref, onValue, query, limitToLast } from "firebase/database";
import { db } from "../../services/firebase";
import { createRoom, joinRoom } from "../../services/roomService";
import { useAuth } from "../../hooks/useAuth";
import { Modal } from "../common/Modal";
import { generateMockRoom } from "../../lib/testUtils";

export const Lobby = () => {
  const navigate = useNavigate();
  const location = useLocation();
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
            return { id: room.id, hostName, playerCount, createdAt: room.public.createdAt, scriptId: room.public.scriptId };
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
      setError("請輸入你的玩家名稱");
      return;
    }
    localStorage.setItem("botc_player_name", playerName.trim());
    setIsEditingName(false);
    setError("");
    
    const searchParams = new URLSearchParams(location.search);
    const returnUrl = searchParams.get('returnUrl');
    if (returnUrl) {
      navigate(returnUrl);
    }
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
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat blur-[1pt]"
        style={{ backgroundImage: "url('/BackgroundRoom.jpg')" }}
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
                onClick={() => navigate('/script-tool')}
                className="rounded-md border border-indigo-500/50 bg-indigo-950/50 py-2.5 text-xs font-bold text-indigo-200 hover:bg-indigo-900/60 hover:text-white transition-all shadow-md flex items-center justify-center gap-1 group"
              >
                <span>劇本工具</span>
              </button>
              <button 
                onClick={() => setModalContent({ title: "遊戲介紹", content: [
                  "《血染鐘樓》(Blood on the Clocktower) 是一款多人社交推理遊戲，由一位「說書人」主持，其餘玩家分屬兩大陣營：",
                  "",
                  "• 善良陣營：鎮民 (Townsfolk) 與外來者 (Outsider)。目標是找出並處決惡魔。",
                  "• 邪惡陣營：爪牙 (Minion) 與惡魔 (Demon)。目標是活到只剩兩人，或讓好人潰散。",
                  "",
                  "【遊戲流程】",
                  "夜晚：所有人閉眼，說書人依「夜晚順序」逐一喚醒角色。惡魔選擇獵殺目標，資訊型角色獲得線索（可能被下毒或被醉，導致資訊錯誤）。",
                  "白天：眾人睜眼，得知昨夜死者。玩家自由討論、交換資訊、互相盤問。",
                  "提名與處決：每位存活玩家每天可提名一人，得票數過半且為當日最高者被處決。若被處決的是惡魔，善良陣營獲勝。",
                  "",
                  "【勝負判定】",
                  "• 惡魔死亡 → 善良陣營勝。",
                  "• 存活玩家僅剩 2 人 → 邪惡陣營勝。",
                  "• 特定角色亦有專屬的勝利／落敗條件。",
                  "",
                  "死亡的玩家仍留在場上，可以繼續發言，並保有「一張」幽靈票，直到遊戲結束。",
                ].join("\n") })}
                className="rounded-md border border-white/10 bg-black/40 py-2 text-xs font-medium text-white/70 hover:bg-white/10 hover:text-white transition-all"
              >
                遊戲介紹
              </button>
              <button 
                onClick={() => setModalContent({ title: "新手技巧", content: [
                  "【給善良陣營】",
                  "1. 好人死於沉默：盡早、清楚地分享你的角色與資訊，讓大家能交叉驗證。",
                  "2. 小心假資訊：你可能被下毒或被酒鬼影響，資訊未必為真；也要提防惡魔的偽裝。",
                  "3. 建立資訊網：把大家的資訊串起來，尋找互相矛盾的說法。",
                  "4. 別急著處決：第一天資訊少，隨意處決往往幫了壞人。",
                  "",
                  "【給邪惡陣營】",
                  "1. 想好假身分：開局就決定要假扮的角色，並讓故事前後一致。",
                  "2. 融入好人：積極參與推理、提供「看似有用」的資訊。",
                  "3. 保護惡魔：爪牙要適時吸引火力，必要時為惡魔擋刀。",
                  "4. 控制節奏：製造混亂與對立，拖到剩 2 人即獲勝。",
                  "",
                  "【通用】",
                  "• 不要怕死：死後仍能發言，且保有一張幽靈票，能繼續影響戰局。",
                  "• 注意提名順序與投票數，票型常常透露立場。",
                  "• 有疑問就問說書人規則（規則問題可公開問，不會洩漏身分）。",
                ].join("\n") })}
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
                      className="flex justify-between items-center rounded-md border border-white/10 bg-white/5 p-3 hover:bg-white/10 cursor-pointer transition-colors group relative overflow-hidden" 
                      onClick={() => handleJoinRoom(room.id)}
                    >
                      <div className="flex items-center space-x-3 z-10">
                        {room.scriptId && (
                          <img 
                            src={`/drama/Drama_${room.scriptId}.png`} 
                            alt="Script" 
                            className="w-10 h-10 object-contain shrink-0 drop-shadow-md" 
                            onError={(e) => { e.currentTarget.style.display = 'none'; }} 
                          />
                        )}
                        <span className="text-sm font-medium text-white/90 group-hover:text-white">{room.hostName} <span className="text-white/40 font-normal">的局</span></span>
                      </div>
                      <div className="flex items-center space-x-3 z-10">
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
