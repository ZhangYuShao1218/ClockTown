import { get, onValue, orderByChild, limitToLast, query, remove, update } from "firebase/database";
import { nref } from "./firebase";

/**
 * 大廳用的房間摘要：rooms/{id} 的精簡投影，存在 roomIndex/{id}。
 * 大廳只監聽這裡，不再下載完整房間（聊天、魔典、覆盤…），也不會收到進行中遊戲的每一次變動。
 * 由說書人端（useRoomIndexSync）依房間狀態維護。
 */
export interface RoomSummary {
  hostName: string;
  playerCount: number;
  status: string;
  scriptId: string | null;
  scriptLogo: string | null;
  createdAt: number;
  /** 說書人同步時的房間活動時間，粒度較粗（見 ACTIVITY_SYNC_MS），死房判斷前會再查 rooms 本體確認 */
  lastActivityAt: number;
}

export interface PublicRoom extends RoomSummary {
  id: string;
}

/** lastActivityAt 變動不足這個間隔就不回寫索引，避免每個動作都推一次給所有大廳訪客 */
export const ACTIVITY_SYNC_MS = 10 * 60 * 1000;

/** 超過這個時間沒有任何寫入（lastActivityAt）的房間視為死房 */
const STALE_MS = 8 * 60 * 60 * 1000;

/** 劇本 logo 只收網址；自訂劇本的 base64 圖片太大，不放進索引 */
const MAX_LOGO_URL_LENGTH = 500;

export const toScriptLogo = (logo: unknown): string | null =>
  typeof logo === "string" && !logo.startsWith("data:") && logo.length <= MAX_LOGO_URL_LENGTH ? logo : null;

export const writeRoomIndex = (roomId: string, summary: Partial<RoomSummary>) => {
  const updates: Record<string, unknown> = {};
  Object.entries(summary).forEach(([k, v]) => {
    updates[`roomIndex/${roomId}/${k}`] = v ?? null;
  });
  return update(nref(), updates);
};

/**
 * 刪除房間本體與其索引。分兩次寫：索引刪除失敗（例如規則尚未部署）不能連帶讓刪房失敗；
 * 殘留的索引會在大廳清掃時因本體不存在而被移除。
 */
export const deleteRoom = async (roomId: string) => {
  await remove(nref(`rooms/${roomId}`));
  await remove(nref(`roomIndex/${roomId}`)).catch((err) => console.error("刪除大廳索引失敗:", err));
};

/**
 * 索引看起來是死房時，先讀房間本體的活動時間確認（說書人離線時索引不會更新，房內玩家可能仍在玩）。
 * 本體也過期或已不存在 → 刪除；否則把較新的時間補回索引。
 */
const sweepIfStale = async (roomId: string, now: number) => {
  const [activitySnap, createdSnap] = await Promise.all([
    get(nref(`rooms/${roomId}/public/lastActivityAt`)),
    get(nref(`rooms/${roomId}/public/createdAt`)),
  ]);
  const last = (activitySnap.val() as number | null) ?? (createdSnap.val() as number | null) ?? 0;
  if (now - last > STALE_MS) {
    await deleteRoom(roomId);
  } else {
    await writeRoomIndex(roomId, { lastActivityAt: last });
  }
};

/** 訂閱大廳房間列表（最新建立的 50 間，只回傳等待中的房），順手清掃死房。回傳 unsubscribe。 */
export const subscribePublicRooms = (onRooms: (rooms: PublicRoom[]) => void) => {
  const roomsQuery = query(nref("roomIndex"), orderByChild("createdAt"), limitToLast(50));
  return onValue(roomsQuery, (snapshot) => {
    const data = (snapshot.val() || {}) as Record<string, RoomSummary>;
    const now = Date.now();
    const rooms: PublicRoom[] = [];

    Object.entries(data).forEach(([id, summary]) => {
      const last = summary?.lastActivityAt ?? summary?.createdAt ?? 0;
      if (now - last > STALE_MS) {
        sweepIfStale(id, now).catch(() => {});
        return;
      }
      if (summary?.status === "lobby") rooms.push({ ...summary, id });
    });

    onRooms(rooms.sort((a, b) => b.createdAt - a.createdAt)); // 最新建立的在上面
  });
};
