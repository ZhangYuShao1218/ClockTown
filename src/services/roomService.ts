import { ref, set, get, update, remove } from "firebase/database";
import { db } from "./firebase";

const generateRoomId = () => {
  return Math.random().toString(36).substring(2, 6).toUpperCase();
};

export const createRoom = async (hostId: string, hostName: string): Promise<string> => {
  const roomId = generateRoomId();
  const roomRef = ref(db, `rooms/${roomId}`);
  
  const snapshot = await get(roomRef);
  if (snapshot.exists()) {
    return createRoom(hostId, hostName); 
  }

  const initialRoomState = {
    public: {
      status: "lobby", // lobby, playing, finished
      phase: "setup", 
      hostId: hostId,
      scriptId: "trouble_brewing",
      customScript: null,
      seatCount: 12,
      distribution: [7, 2, 2, 1], // Default for 12 players
      createdAt: Date.now()
    },
    players: {
      [hostId]: {
        name: hostName,
        isHost: true,
        isAlive: true,
        hasGhostVote: true,
        isOnline: true,
        seat: null
      }
    },
    private: {
      [hostId]: { role: "storyteller" },
      grimoire: {}, // seatIndex -> { roleId }
      bluffs: [null, null, null] // 3 Demon Bluffs
    }
  };

  await set(roomRef, initialRoomState);
  return roomId;
};

export const joinRoom = async (roomId: string, userId: string, userName: string): Promise<string> => {
  const roomRef = ref(db, `rooms/${roomId}`);
  const snapshot = await get(roomRef);
  
  if (!snapshot.exists()) {
    throw new Error("找不到該房間，請確認房號是否正確。");
  }

  const roomData = snapshot.val();

  // 如果玩家已經在裡面（斷線重連）
  if (roomData.players && roomData.players[userId]) {
    // 標記為上線並允許進入，即使遊戲已經開始
    await update(ref(db), { [`rooms/${roomId}/players/${userId}/isOnline`]: true });
    return roomId;
  }

  // 若為新玩家，但遊戲已經開始，則拒絕加入
  if (roomData.public.status !== "lobby") {
    throw new Error("遊戲已經開始，無法加入。");
  }

  const currentPlayersCount = roomData.players ? Object.keys(roomData.players).length : 0;

  const updates: Record<string, any> = {};
  updates[`rooms/${roomId}/players/${userId}`] = {
    name: userName,
    isHost: false,
    isAlive: true,
    hasGhostVote: true,
    isOnline: true,
    seat: null
  };

  await update(ref(db), updates);
  return roomId;
};

export const leaveRoom = async (roomId: string, userId: string) => {
  const roomRef = ref(db, `rooms/${roomId}`);
  const snapshot = await get(roomRef);
  if (!snapshot.exists()) return;

  const roomData = snapshot.val();
  
  // 如果在 lobby 階段，且離開的是最後一個玩家或房主，可以直接刪除房間來維持乾淨
  // 為了簡化，如果是房主離開且還在 lobby，直接解散房間
  if (roomData.public.status === "lobby" && roomData.public.hostId === userId) {
    await remove(roomRef);
    return;
  }

  // 否則僅標記為離線
  await update(ref(db), { [`rooms/${roomId}/players/${userId}/isOnline`]: false });
};

export const setPlayerSeat = async (roomId: string, userId: string, seatIndex: number | null) => {
  await update(ref(db), { [`rooms/${roomId}/players/${userId}/seat`]: seatIndex });
};

export const updateRoomScript = async (roomId: string, scriptId: string) => {
  await update(ref(db), { [`rooms/${roomId}/public/scriptId`]: scriptId });
};

export const updateSeatCount = async (roomId: string, seatCount: number) => {
  await update(ref(db), { [`rooms/${roomId}/public/seatCount`]: seatCount });
};

export const setGrimoireRole = async (roomId: string, seatIndex: number, roleId: string | null) => {
  const path = `rooms/${roomId}/private/grimoire/${seatIndex}`;
  if (roleId === null) {
    await remove(ref(db, path));
  } else {
    await update(ref(db), { [path]: { roleId } });
  }
};

export const setGrimoireBluff = async (roomId: string, index: number, roleId: string | null) => {
  await update(ref(db), { [`rooms/${roomId}/private/bluffs/${index}`]: roleId });
};

export const setCustomScript = async (roomId: string, scriptData: any) => {
  await update(ref(db), { 
    [`rooms/${roomId}/public/scriptId`]: "custom",
    [`rooms/${roomId}/public/customScript`]: scriptData
  });
};

export const updateDistribution = async (roomId: string, distribution: number[]) => {
  await update(ref(db), { [`rooms/${roomId}/public/distribution`]: distribution });
};

export const applySetupToRoom = async (roomId: string, setup: any) => {
  const updates: any = {};
  
  updates[`rooms/${roomId}/public/scriptId`] = setup.scriptId;
  updates[`rooms/${roomId}/public/seatCount`] = setup.seatCount;
  updates[`rooms/${roomId}/public/distribution`] = setup.distribution;
  updates[`rooms/${roomId}/public/customScript`] = setup.customScript;
  updates[`rooms/${roomId}/public/settings`] = setup.settings || {
    evilKnowsEachOther: true,
    evilCanMsg: false,
    allCanMsg: false,
    adjacentCanMsg: false
  };
  updates[`rooms/${roomId}/public/fabled`] = setup.fabled || [];
  
  updates[`rooms/${roomId}/private/bluffs`] = setup.bluffs;
  updates[`rooms/${roomId}/private/grimoire`] = setup.grimoire;
  
  await update(ref(db), updates);
};

export const updateRoomSettings = async (roomId: string, settings: any) => {
  await update(ref(db), { [`rooms/${roomId}/public/settings`]: settings });
};

export const updateFabled = async (roomId: string, fabled: string[]) => {
  await update(ref(db), { [`rooms/${roomId}/public/fabled`]: fabled });
};
