import { useEffect, useRef } from "react";
import type { GameState } from "./useGameState";
import { ACTIVITY_SYNC_MS, toScriptLogo, writeRoomIndex, type RoomSummary } from "../services/roomIndexService";

/**
 * 說書人端：把房間狀態投影成 roomIndex/{id} 摘要，供大廳列表使用。
 * 摘要欄位有變才寫；lastActivityAt 只在前進超過 ACTIVITY_SYNC_MS 時才寫，降低大廳訪客收到的推送量。
 */
export const useRoomIndexSync = (roomId: string | undefined, gameState: GameState | null, isHost: boolean) => {
  const lastWritten = useRef<{ key: string; activity: number } | null>(null);

  const pub = gameState?.public;
  const players = gameState?.players;
  const summary: Omit<RoomSummary, "lastActivityAt"> | null = pub
    ? {
        hostName: players?.[pub.hostId]?.name || "未知說書人",
        playerCount: players ? Object.keys(players).length : 0,
        status: pub.status || "lobby",
        scriptId: pub.scriptId ?? null,
        scriptLogo: toScriptLogo(pub.customScript?.logo),
        createdAt: pub.createdAt || Date.now(),
      }
    : null;
  const summaryKey = summary ? JSON.stringify(summary) : null;
  const activity: number = typeof pub?.lastActivityAt === "number" ? pub.lastActivityAt : 0;

  useEffect(() => {
    if (!roomId || !isHost || !summaryKey) return;
    const prev = lastWritten.current;
    const summaryChanged = prev?.key !== summaryKey;
    const activityAdvanced = !prev || activity - prev.activity >= ACTIVITY_SYNC_MS;
    if (!summaryChanged && !activityAdvanced) return;

    const nextActivity = activityAdvanced ? activity || Date.now() : prev!.activity;
    lastWritten.current = { key: summaryKey, activity: nextActivity };
    writeRoomIndex(roomId, {
      ...(JSON.parse(summaryKey) as Omit<RoomSummary, "lastActivityAt">),
      lastActivityAt: nextActivity,
    }).catch((err) => {
      console.error("同步大廳索引失敗:", err);
      lastWritten.current = prev; // 失敗則下次重試
    });
  }, [roomId, isHost, summaryKey, activity]);
};
