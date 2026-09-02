import { ref, get, update, push, remove } from "firebase/database";
import { db } from "./firebase";

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

/**
 * Capture current game board state snapshot
 */
export const captureBoardSnapshot = async (roomId: string): Promise<BoardSnapshot> => {
  try {
    const roomSnap = await get(ref(db, `rooms/${roomId}`));
    const data = roomSnap.val() || {};

    const seatRoles: Record<number, string> = {};
    const grimoire = data.private?.grimoire || {};
    const players = data.players || {};

    // Get roles from grimoire or players
    Object.entries(players).forEach(([_, p]: [string, any]) => {
      if (p?.seat && p?.roleId) {
        seatRoles[p.seat] = p.roleId;
      }
    });
    Object.entries(grimoire).forEach(([seat, g]: [string, any]) => {
      if (g?.roleId) {
        seatRoles[Number(seat)] = g.roleId;
      }
    });

    const seatStatus = data.public?.seatStatus || {};
    const hostId = data.public?.hostId;
    const seatTokens = (hostId && data.private?.seatTokens?.[hostId]) || 
                       (hostId && data.private?.grimoireTokens?.[hostId]) || {};

    return {
      seatRoles,
      seatStatus,
      seatTokens
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

    const timelineRef = ref(db, `rooms/${roomId}/replay/timeline`);
    const newEventRef = push(timelineRef);
    await update(ref(db), {
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
    await remove(ref(db, `rooms/${roomId}/replay/timeline/${eventId}`));
  } catch (e) {
    console.error("Failed to delete replay event", e);
  }
};

/**
 * Clear all replay events in room
 */
export const clearReplayTimeline = async (roomId: string) => {
  try {
    await remove(ref(db, `rooms/${roomId}/replay/timeline`));
    await update(ref(db), {
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
    const snap = await get(ref(db, `rooms/${roomId}`));
    if (!snap.exists()) return null;

    const data = snap.val();
    const rawTimeline = data.replay?.timeline || {};
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

  await update(ref(db), {
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
 * Stop in-room replay mode and return to live game
 */
export const stopRoomReplay = async (roomId: string) => {
  await update(ref(db), {
    [`rooms/${roomId}/public/replayMode/isActive`]: false,
    [`rooms/${roomId}/public/replayMode/highlightedSeats`]: []
  });
};
