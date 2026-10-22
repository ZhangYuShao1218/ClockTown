import { useState, useEffect, useMemo } from "react";
import { onValue } from "firebase/database";
import { nref } from "../services/firebase";

// RTDB 節點內容尚未建模，沿用既有寬鬆型別
type Node = Record<string, any>;

/**
 * 組回與舊版「整間房 onValue」相同形狀的 gameState，讓呼叫端不需更動。
 * private 底下只會有「自己能用到」的節點（他人的筆記 / 標記不在其中）。
 */
export interface GameState {
  public: Node;
  players: Node;
  private: {
    bluffs?: any;
    grimoire?: Node;
    notes?: Node;
    seatTokens?: Node;
    grimoireTokens?: Node;
  };
}

/** 監聽單一路徑，回傳 [值, 是否已收到第一次快照]；path 為 null 時不監聽。 */
const useNode = (path: string | null, onError?: (msg: string) => void) => {
  const [state, setState] = useState<{ path: string | null; value: any; loaded: boolean }>({
    path: null,
    value: null,
    loaded: false,
  });

  useEffect(() => {
    if (!path) return;
    // 遵守 Firebase Best Practices: 綁定 onValue，並在 cleanup 註銷
    const unsubscribe = onValue(
      nref(path),
      (snapshot) => setState({ path, value: snapshot.val(), loaded: true }),
      (err) => {
        console.error(`讀取 ${path} 失敗:`, err);
        onError?.(err.message);
        setState({ path, value: null, loaded: true });
      }
    );
    return () => unsubscribe();
    // onError 只用於回報，不需因其變動而重新訂閱
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [path]);

  // 路徑切換後、新快照到達前，不回傳舊路徑的值
  const current = state.path === path;
  return [current ? state.value : null, current && state.loaded] as const;
};

/**
 * 分節點訂閱房間狀態，取代過去對 rooms/{id} 整包 onValue：
 * 聊天 (messages) 與覆盤時間軸 (replay) 由各自元件監聽，這裡不再重複下載；
 * 他人的 private 筆記也不會再推送給每個人。
 *
 * @param uid 目前使用者；未提供時只訂閱 public 與 players（例如只看投票紀錄的元件）。
 */
export const useGameState = (roomId: string | undefined, uid?: string | null) => {
  const [error, setError] = useState<string | null>(null);
  const base = roomId ? `rooms/${roomId}` : null;

  const [pub, pubLoaded] = useNode(base && `${base}/public`, setError);
  const [players, playersLoaded] = useNode(base && `${base}/players`, setError);

  const mine = base && uid ? uid : null;
  const [bluffs] = useNode(mine && `${base}/private/bluffs`);
  const [notes] = useNode(mine && `${base}/private/notes/${mine}`);
  const [seatTokens] = useNode(mine && `${base}/private/seatTokens/${mine}`);
  const [grimoireTokens] = useNode(mine && `${base}/private/grimoireTokens/${mine}`);

  // 魔典（全場真實角色）只有說書人需要
  const isHost = !!mine && pub?.hostId === mine;
  const [grimoire] = useNode(isHost ? `${base}/private/grimoire` : null);

  const gameState = useMemo<GameState | null>(() => {
    if (!pub) return null;
    return {
      public: pub,
      players: players || {},
      private: {
        bluffs,
        grimoire: grimoire || undefined,
        notes: mine && notes ? { [mine]: notes } : undefined,
        seatTokens: mine && seatTokens ? { [mine]: seatTokens } : undefined,
        grimoireTokens: mine && grimoireTokens ? { [mine]: grimoireTokens } : undefined,
      },
    };
  }, [pub, players, bluffs, grimoire, notes, seatTokens, grimoireTokens, mine]);

  const loading = !!roomId && !(pubLoaded && playersLoaded);
  const notFound = !!roomId && pubLoaded && !pub;

  return {
    gameState,
    loading,
    error: error ?? (notFound ? "房間不存在" : null),
  };
};
