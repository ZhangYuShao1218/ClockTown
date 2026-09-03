import { onSchedule } from "firebase-functions/v2/scheduler";
import { logger } from "firebase-functions/v2";
import { initializeApp } from "firebase-admin/app";
import { getDatabase } from "firebase-admin/database";

initializeApp({
  // RTDB 在 asia-southeast1，明確指定避免 Admin SDK 連到 us 預設實例
  databaseURL:
    "https://clocktown-8b847-default-rtdb.asia-southeast1.firebasedatabase.app",
});

/** 超過這個時間沒有任何寫入（public/lastActivityAt）的房間視為死房 */
const STALE_MS = 8 * 60 * 60 * 1000;

/** 要掃描的資料環境命名空間（對應前端 VITE_DB_ENV） */
const ENVS = ["prod", "dev"];

/**
 * 每 4 小時掃一次所有房間，刪掉「8 小時內沒有任何活動」的房。
 * 不看房裡有沒有人、不看 lobby/playing/finished，一律照 lastActivityAt 判斷。
 */
export const cleanupStaleRooms = onSchedule(
  {
    schedule: "every 4 hours",
    timeZone: "Asia/Taipei",
    region: "asia-southeast1",
  },
  async () => {
    const db = getDatabase();
    const now = Date.now();
    let totalRemoved = 0;

    for (const env of ENVS) {
      const roomsRef = db.ref(`envs/${env}/rooms`);
      const snap = await roomsRef.get();
      if (!snap.exists()) continue;

      const rooms = snap.val() || {};
      const deletions = {};

      for (const [roomId, room] of Object.entries(rooms)) {
        const pub = (room && room.public) || {};
        const lastActive = pub.lastActivityAt ?? pub.createdAt ?? 0;
        if (now - lastActive > STALE_MS) {
          deletions[roomId] = null;
        }
      }

      const count = Object.keys(deletions).length;
      if (count > 0) {
        await roomsRef.update(deletions);
        totalRemoved += count;
        logger.info(`[cleanupStaleRooms] envs/${env}: 刪除 ${count} 間死房`, {
          roomIds: Object.keys(deletions),
        });
      }
    }

    logger.info(`[cleanupStaleRooms] 完成，共刪除 ${totalRemoved} 間`);
  }
);
