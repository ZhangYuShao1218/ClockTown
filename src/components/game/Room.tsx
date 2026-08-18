import { useParams, useNavigate } from "react-router-dom";
import { useGameState } from "../../hooks/useGameState";
import { useAuth } from "../../hooks/useAuth";

export const Room = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { gameState, loading, error } = useGameState(id);

  if (loading) {
    return <div className="flex h-screen items-center justify-center text-muted-foreground">讀取房間中...</div>;
  }

  if (error || !gameState) {
    return (
      <div className="flex flex-col h-screen items-center justify-center space-y-4">
        <div className="text-destructive font-medium">{error || "找不到房間狀態"}</div>
        <button 
          onClick={() => navigate("/")}
          className="rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          返回大廳
        </button>
      </div>
    );
  }

  const isHost = gameState.public.hostId === user?.uid;
  
  // 找出說書人資料
  const hostPlayer = gameState.players && gameState.players[gameState.public.hostId];

  return (
    <div className="min-h-screen bg-background text-foreground p-6 flex flex-col">
      {/* 頂部資訊列 */}
      <header className="mb-6 flex items-center justify-between border-b border-border pb-4 shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-primary tracking-wide">房號：{id}</h1>
          <p className="text-sm text-muted-foreground mt-1">
            階段：<span className="font-semibold text-foreground">{gameState.public.phase === 'setup' ? '遊戲準備中' : gameState.public.phase}</span>
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="text-sm px-3 py-1 bg-muted rounded-full">
            你的身分：<span className={isHost ? "text-accent-foreground font-bold" : "text-foreground font-bold"}>{isHost ? "說書人" : "玩家"}</span>
          </div>
        </div>
      </header>

      <div className="flex-1 grid grid-cols-1 xl:grid-cols-4 gap-6 min-h-0">
        
        {/* 中央核心區 - 長桌 */}
        <div className="xl:col-span-3 rounded-xl border border-border bg-card p-6 flex flex-col relative overflow-hidden">
          
          <div className="flex-1 flex flex-col items-center justify-center space-y-12">
            {/* 上排座位 */}
            <div className="w-full flex justify-around px-8">
              <div className="w-20 h-24 border border-dashed border-muted-foreground/50 rounded flex items-center justify-center text-xs text-muted-foreground">玩家座位</div>
              <div className="w-20 h-24 border border-dashed border-muted-foreground/50 rounded flex items-center justify-center text-xs text-muted-foreground">玩家座位</div>
              <div className="w-20 h-24 border border-dashed border-muted-foreground/50 rounded flex items-center justify-center text-xs text-muted-foreground">玩家座位</div>
            </div>

            {/* 桌子中間的公共資訊區 (例如時鐘或特殊公告) */}
            <div className="w-full max-w-2xl h-16 bg-muted/30 rounded-full flex items-center justify-center">
              <span className="text-muted-foreground text-sm tracking-widest">TOWN SQUARE</span>
            </div>

            {/* 下排座位 */}
            <div className="w-full flex justify-around px-8">
              <div className="w-20 h-24 border border-dashed border-muted-foreground/50 rounded flex items-center justify-center text-xs text-muted-foreground">玩家座位</div>
              <div className="w-20 h-24 border border-dashed border-muted-foreground/50 rounded flex items-center justify-center text-xs text-muted-foreground">玩家座位</div>
              <div className="w-20 h-24 border border-dashed border-muted-foreground/50 rounded flex items-center justify-center text-xs text-muted-foreground">玩家座位</div>
            </div>
          </div>

          {/* 說書人區塊 (左下角) */}
          <div className="absolute bottom-4 left-4 flex items-center space-x-3 bg-background/80 backdrop-blur-sm p-3 rounded-lg border border-border shadow-sm">
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center border border-primary/50 text-primary font-bold">
              ST
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">說書人</p>
              <p className="text-sm font-medium">{hostPlayer?.name || "未知"}</p>
            </div>
          </div>

          {/* 全局標記/特殊效果保留區 (右下角) */}
          <div className="absolute bottom-4 right-4 flex space-x-2">
            <div className="w-12 h-12 rounded-lg border border-dashed border-border flex items-center justify-center bg-muted/50 text-[10px] text-muted-foreground text-center">
              全局<br/>標記
            </div>
            <div className="w-12 h-12 rounded-lg border border-dashed border-border flex items-center justify-center bg-muted/50 text-[10px] text-muted-foreground text-center">
              劇本<br/>特效
            </div>
          </div>
        </div>

        {/* 右側邊欄 - 資訊與聊天 */}
        <div className="flex flex-col space-y-4 min-h-0">
          
          {/* 自己真實身分 (只有自己/說書人看得到) */}
          <div className="rounded-xl border border-border bg-card p-4 shrink-0 shadow-sm">
            <h2 className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-3">你的角色</h2>
            {isHost ? (
              <div className="bg-accent/50 text-accent-foreground p-3 rounded text-sm text-center font-medium border border-border">
                你是說書人，掌控全域。
              </div>
            ) : (
              <div className="bg-muted p-4 rounded text-center border border-border">
                <div className="w-16 h-16 bg-background rounded-full mx-auto mb-2 flex items-center justify-center border border-border shadow-inner">
                  ?
                </div>
                <p className="text-sm font-bold">尚未分配角色</p>
              </div>
            )}
          </div>

          {/* 遊戲紀錄 / 私訊 (復盤系統預留) */}
          <div className="rounded-xl border border-border bg-card flex-1 flex flex-col shadow-sm overflow-hidden">
            <div className="p-3 border-b border-border bg-muted/30">
              <h2 className="text-xs uppercase tracking-wider font-semibold">系統訊息與私訊</h2>
            </div>
            <div className="flex-1 p-4 overflow-y-auto space-y-3">
              <div className="text-xs text-center text-muted-foreground">遊戲尚未開始</div>
              {/* 這裡未來會實作：說書人私訊、死亡通知、復盤紀錄 */}
            </div>
            {/* 聊天輸入框 */}
            <div className="p-3 border-t border-border bg-background">
              <input 
                type="text" 
                placeholder="發送文字..." 
                className="w-full bg-muted border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                disabled
              />
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
