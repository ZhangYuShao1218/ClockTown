import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createRoom, joinRoom } from "../../services/roomService";
import { useAuth } from "../../hooks/useAuth";

export const Lobby = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  
  // 嘗試從 localStorage 讀取暱稱
  const [playerName, setPlayerName] = useState(() => {
    return localStorage.getItem("botc_player_name") || "";
  });
  
  const [roomIdInput, setRoomIdInput] = useState("");
  const [error, setError] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  
  // 控制是否在「設定暱稱」的畫面
  const [isEditingName, setIsEditingName] = useState(!playerName);

  // 取得目前所有公開房間的 Placeholder (後續可串接 Firebase onValue 監聽 'rooms')
  const [publicRooms, setPublicRooms] = useState<any[]>([]);

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

  if (loading) {
    return <div className="flex h-screen items-center justify-center text-muted-foreground">連線中...</div>;
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4 text-foreground">
      <div className="w-full max-w-lg space-y-8 rounded-xl border border-border bg-card p-8 shadow-md">
        
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight text-primary">血染鐘樓</h1>
          <p className="mt-2 text-sm text-muted-foreground">Web 版線上開局工具</p>
        </div>

        {/* 錯誤訊息 */}
        {error && (
          <div className="rounded-md bg-destructive/10 p-3 text-sm font-medium text-destructive">
            {error}
          </div>
        )}

        {/* 狀態一：輸入/修改暱稱 */}
        {isEditingName ? (
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">玩家暱稱</label>
              <input
                type="text"
                autoFocus
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                placeholder="輸入你在遊戲中的名字"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && saveName()}
              />
            </div>
            <button
              onClick={saveName}
              className="w-full rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              確定
            </button>
          </div>
        ) : (
          /* 狀態二：大廳與房間列表 */
          <div className="space-y-8">
            
            {/* 個人資訊列 */}
            <div className="flex items-center justify-between rounded-lg bg-muted p-4">
              <div>
                <span className="text-sm text-muted-foreground">目前暱稱：</span>
                <span className="ml-2 font-bold">{playerName}</span>
              </div>
              <button 
                onClick={() => setIsEditingName(true)}
                className="text-sm text-primary hover:underline"
              >
                更換暱稱
              </button>
            </div>

            {/* 功能保留區 (劇本/規則介紹) */}
            <div className="grid grid-cols-3 gap-2">
              <button className="rounded-md border border-border bg-background py-2 text-xs font-medium hover:bg-accent hover:text-accent-foreground">
                查看各劇本
              </button>
              <button className="rounded-md border border-border bg-background py-2 text-xs font-medium hover:bg-accent hover:text-accent-foreground">
                遊戲介紹
              </button>
              <button className="rounded-md border border-border bg-background py-2 text-xs font-medium hover:bg-accent hover:text-accent-foreground">
                新手技巧
              </button>
            </div>

            <div className="border-t border-border pt-6 space-y-4">
              <button
                onClick={handleCreateRoom}
                disabled={isProcessing}
                className="w-full rounded-md bg-primary px-4 py-3 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90 disabled:opacity-50"
              >
                建立新房間
              </button>

              <div className="flex space-x-2 pt-2">
                <input
                  type="text"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm uppercase focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  placeholder="輸入 4 碼房號"
                  maxLength={4}
                  value={roomIdInput}
                  onChange={(e) => setRoomIdInput(e.target.value)}
                  disabled={isProcessing}
                />
                <button
                  onClick={() => handleJoinRoom(roomIdInput)}
                  disabled={isProcessing || !roomIdInput.trim()}
                  className="rounded-md bg-secondary px-6 py-2 text-sm font-medium text-secondary-foreground shadow-sm hover:bg-secondary/80 disabled:opacity-50"
                >
                  加入
                </button>
              </div>
            </div>

            {/* 公開房間列表區塊 (未來可實作) */}
            <div className="space-y-2 pt-4">
              <h3 className="text-sm font-semibold text-muted-foreground">等待中的房間</h3>
              {publicRooms.length === 0 ? (
                <div className="rounded-md border border-dashed border-border p-4 text-center text-sm text-muted-foreground">
                  目前沒有公開房間
                </div>
              ) : (
                <ul className="space-y-2">
                  {publicRooms.map(room => (
                    <li key={room.id} className="flex justify-between items-center rounded-md border border-border p-3 hover:bg-accent cursor-pointer" onClick={() => handleJoinRoom(room.id)}>
                      <span className="text-sm font-medium">{room.hostName} 的房間</span>
                      <span className="text-xs bg-muted px-2 py-1 rounded">{room.playerCount} 人</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

          </div>
        )}
      </div>
    </div>
  );
};
