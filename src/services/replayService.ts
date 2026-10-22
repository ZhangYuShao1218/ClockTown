import { get, update, push, remove } from "firebase/database";
import { nref } from "./firebase";

export interface BoardSnapshot {
  seatRoles: Record<number, string>;
  seatStatus: Record<number, { isDead: boolean; hasGhostVote: boolean; pendingExecution?: boolean }>;
  seatTokens: Record<number, any[]>;
}

export type ReplayEventType =
  | 'GAME_START'
  | 'ROLE_ASSIGNED'
  | 'PHASE_CHANGE'
  | 'ACTION_LOG'
  | 'SITUATION_LOG'
  | 'NOMINATION'
  | 'VOTE_RESULT'
  | 'EXECUTION'
  | 'DEATH_TOGGLE'
  | 'GAME_END';

export interface ReplayEvent {
  id?: string;
  timestamp: number;
  dayNumber: number;
  timePhase: 'day' | 'night';
  type: ReplayEventType;
  title: string;
  description: string;
  actorSeat?: number | string;
  actorRole?: string;
  actionType?: string;
  targetSeats?: number[];
  resultText?: string;
  highlightedSeats?: number[];
  details?: any;
  snapshot: BoardSnapshot;
}

export interface GameReplay {
  roomId: string;
  scriptId?: string;
  scriptName?: string;
  createdAt: number;
  winner?: 'good' | 'evil' | null;
  players: Record<string, { uid: string; name: string; seat?: number; roleId?: string }>;
  timeline: ReplayEvent[];
}

/** RTDB 以座位號為 key 的節點可能回傳陣列（含 null 洞）或物件，統一轉成 [seat, value] */
const seatEntries = <T,>(node: Record<string, T | null> | (T | null)[] | null | undefined): [number, T][] =>
  Object.entries(node || {})
    .filter(([, v]) => v !== null && v !== undefined)
    .map(([seat, v]) => [Number(seat), v as T]);

/**
 * Capture current game board state snapshot
 * 復盤時全場看到的是說書人「舞台中央」頁面的樣子：舞台上的角色筆記與標記，不取鐘樓真相（魔典）的資料。
 * 只讀需要的節點，不抓整間房（聊天、覆盤時間軸可能很大）。
 */
export const captureBoardSnapshot = async (roomId: string): Promise<BoardSnapshot> => {
  try {
    const base = `rooms/${roomId}`;
    const [hostSnap, statusSnap] = await Promise.all([
      get(nref(`${base}/public/hostId`)),
      get(nref(`${base}/public/seatStatus`)),
    ]);
    const hostId = hostSnap.val() as string | null;
    const [notesSnap, stageTokensSnap] = hostId
      ? await Promise.all([
          get(nref(`${base}/private/notes/${hostId}`)),
          get(nref(`${base}/private/seatTokens/${hostId}`)),
        ])
      : [null, null];

    const seatRoles: Record<number, string> = {};
    seatEntries<string>(notesSnap?.val()).forEach(([seat, roleId]) => {
      seatRoles[seat] = roleId;
    });

    const seatTokens: Record<number, any[]> = {};
    seatEntries<any[]>(stageTokensSnap?.val()).forEach(([seat, tokens]) => {
      const list = Object.values(tokens || {}).filter(Boolean);
      if (list.length > 0) seatTokens[seat] = list;
    });

    return {
      seatRoles,
      seatStatus: statusSnap.val() || {},
      seatTokens,
    };
  } catch (e) {
    console.error("Failed to capture board snapshot", e);
    return {
      seatRoles: {},
      seatStatus: {},
      seatTokens: {}
    };
  }
};

/**
 * Record a game event with a state snapshot to the replay timeline
 */
export const recordReplayEvent = async (
  roomId: string,
  event: Omit<ReplayEvent, 'snapshot' | 'timestamp'> & { snapshot?: BoardSnapshot; timestamp?: number }
) => {
  try {
    const snapshot = event.snapshot || await captureBoardSnapshot(roomId);
    const fullEvent: ReplayEvent = {
      ...event,
      timestamp: event.timestamp || Date.now(),
      snapshot
    };

    const timelineRef = nref(`rooms/${roomId}/replay/timeline`);
    const newEventRef = push(timelineRef);
    await update(nref(), {
      [`rooms/${roomId}/replay/timeline/${newEventRef.key}`]: {
        ...fullEvent,
        id: newEventRef.key
      }
    });
    return newEventRef.key;
  } catch (e) {
    console.error("Failed to record replay event", e);
    return null;
  }
};

/**
 * Delete a specific replay event
 */
export const deleteReplayEvent = async (roomId: string, eventId: string) => {
  try {
    await remove(nref(`rooms/${roomId}/replay/timeline/${eventId}`));
  } catch (e) {
    console.error("Failed to delete replay event", e);
  }
};

/**
 * Reorder replay events by rewriting their timestamps to match the given id order
 * (timeline 的排序完全依賴 timestamp，拖曳排序只需要依新順序重新分配遞增的 timestamp)
 */
export const reorderReplayTimeline = async (roomId: string, orderedIds: string[]) => {
  try {
    const base = Date.now() - orderedIds.length * 1000;
    const updates: Record<string, number> = {};
    orderedIds.forEach((id, index) => {
      updates[`rooms/${roomId}/replay/timeline/${id}/timestamp`] = base + index * 1000;
    });
    await update(nref(), updates);
  } catch (e) {
    console.error("Failed to reorder replay timeline", e);
  }
};

/**
 * Clear all replay events in room
 */
export const clearReplayTimeline = async (roomId: string) => {
  try {
    await remove(nref(`rooms/${roomId}/replay/timeline`));
    await update(nref(), {
      [`rooms/${roomId}/public/replayMode`]: null
    });
  } catch (e) {
    console.error("Failed to clear replay timeline", e);
  }
};

/**
 * Fetch full game replay from room data
 */
export const getGameReplay = async (roomId: string): Promise<GameReplay | null> => {
  try {
    // 只讀覆盤需要的節點；整間房含聊天紀錄，覆盤每走一步都抓會很浪費
    const base = `rooms/${roomId}`;
    const [publicSnap, playersSnap, timelineSnap] = await Promise.all([
      get(nref(`${base}/public`)),
      get(nref(`${base}/players`)),
      get(nref(`${base}/replay/timeline`)),
    ]);
    if (!publicSnap.exists()) return null;

    const data = { public: publicSnap.val(), players: playersSnap.val() };
    const rawTimeline = timelineSnap.val() || {};
    const timeline: ReplayEvent[] = Object.entries(rawTimeline).map(([key, ev]: [string, any]) => ({
      id: key,
      ...ev
    })).sort((a, b) => a.timestamp - b.timestamp);

    return {
      roomId,
      scriptId: data.public?.scriptId,
      scriptName: data.public?.currentScript,
      createdAt: data.public?.createdAt || Date.now(),
      winner: data.public?.winner || null,
      players: data.players || {},
      timeline
    };
  } catch (e) {
    console.error("Failed to get game replay", e);
    return null;
  }
};

/**
 * Start synchronous in-room replay mode
 */
export const startRoomReplay = async (roomId: string) => {
  const replay = await getGameReplay(roomId);
  if (!replay || replay.timeline.length === 0) {
    // If no timeline events exist yet, create a baseline snapshot event
    const snap = await captureBoardSnapshot(roomId);
    await recordReplayEvent(roomId, {
      dayNumber: 1,
      timePhase: 'day',
      type: 'GAME_START',
      title: '遊戲初始配置',
      description: '全場座位與角色的初始配置狀態。',
      snapshot: snap
    });
    const updated = await getGameReplay(roomId);
    if (updated && updated.timeline.length > 0) {
      return setRoomReplayStep(roomId, 0, updated.timeline);
    }
    return;
  }
  await setRoomReplayStep(roomId, 0, replay.timeline);
};

/**
 * Update current replay step for all players in room
 */
export const setRoomReplayStep = async (roomId: string, stepIndex: number, timeline: ReplayEvent[]) => {
  if (stepIndex < 0 || stepIndex >= timeline.length) return;
  const event = timeline[stepIndex];

  await update(nref(), {
    [`rooms/${roomId}/public/replayMode`]: {
      isActive: true,
      currentStepIndex: stepIndex,
      totalSteps: timeline.length,
      eventTitle: event.title || '',
      eventDescription: event.description || '',
      eventType: event.type || '',
      actorSeat: typeof event.actorSeat === 'number' ? event.actorSeat : null,
      targetSeats: event.targetSeats || [],
      dayNumber: event.dayNumber || 1,
      timePhase: event.timePhase || 'day',
      highlightedSeats: event.highlightedSeats || [],
      snapshot: event.snapshot || null
    }
  });
};

/**
 * Step the in-room replay forward/backward by one, fetching the timeline itself.
 * Used by the storyteller's floating replay controls.
 */
export const stepRoomReplay = async (roomId: string, direction: 1 | -1, currentStepIndex: number) => {
  const replay = await getGameReplay(roomId);
  if (!replay || replay.timeline.length === 0) return;
  const next = Math.max(0, Math.min(replay.timeline.length - 1, currentStepIndex + direction));
  await setRoomReplayStep(roomId, next, replay.timeline);
};

/**
 * Stop in-room replay mode and return to live game
 */
export const stopRoomReplay = async (roomId: string) => {
  await update(nref(), {
    [`rooms/${roomId}/public/replayMode/isActive`]: false,
    [`rooms/${roomId}/public/replayMode/highlightedSeats`]: []
  });
};
