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

export const applySetupToRoom = async (roomId: string, setup: any, setupId?: string) => {
  const updates: any = {};
  
  updates[`rooms/${roomId}/public/scriptId`] = setup.scriptId;
  updates[`rooms/${roomId}/public/seatCount`] = setup.seatCount;
  updates[`rooms/${roomId}/public/distribution`] = setup.distribution;
  updates[`rooms/${roomId}/public/customScript`] = setup.customScript !== undefined ? setup.customScript : null;
  updates[`rooms/${roomId}/public/settings`] = setup.settings || {
    evilKnowsEachOther: true,
    evilCanMsg: false,
    allCanMsg: false,
    adjacentCanMsg: false
  };
  updates[`rooms/${roomId}/public/fabled`] = setup.fabled || [];
  
  if (setupId) {
    updates[`rooms/${roomId}/public/activeSetupId`] = setupId;
  }
  
  updates[`rooms/${roomId}/private/bluffs`] = setup.bluffs !== undefined ? setup.bluffs : null;
  updates[`rooms/${roomId}/private/grimoire`] = setup.grimoire !== undefined ? setup.grimoire : null;
  
  await update(ref(db), updates);
};

export const updateRoomSettings = async (roomId: string, settings: any) => {
  await update(ref(db), { [`rooms/${roomId}/public/settings`]: settings });
};

export const updateFabled = async (roomId: string, fabled: string[]) => {
  await update(ref(db), { [`rooms/${roomId}/public/fabled`]: fabled });
};


export const distributeRoles = async (roomId: string, players: Record<string, any>, grimoire: any, bluffs: any[], script: any, settings: any) => {
  const updates: Record<string, any> = {};
  
  const evilPlayers: {uid: string, name: string, roleId: string, type: string, seat: number}[] = [];
  
  Object.entries(players).forEach(([uid, p]) => {
    const seat = p.seat;
    if (seat && grimoire[seat]) {
      const roleId = grimoire[seat].roleId;
      const roleDef = script?.roles.find((r: any) => r.id === roleId);
      if (roleDef && (roleDef.type === 'demon' || roleDef.type === 'minion')) {
        evilPlayers.push({ uid, name: p.name, roleId, type: roleDef.type, seat });
      }
    }
  });

  const hostSnapshot = await get(ref(db, `rooms/${roomId}/public/hostId`));
  const hostId = hostSnapshot.val();

  Object.entries(players).forEach(([uid, p]) => {
    const seat = p.seat;
    if (seat && grimoire[seat]) {
      const roleId = grimoire[seat].roleId;
      const roleDef = script?.roles.find((r: any) => r.id === roleId);
      
      updates[`rooms/${roomId}/players/${uid}/roleId`] = roleId;
      
      if (roleDef) {
        let flavor = "";
        let colorTag = "";
        if (roleDef.type === 'demon' || roleDef.type === 'minion') {
          flavor = roleDef.flavor || `你是黑鍾鎮隱藏的邪惡存在 一段被遺忘的過去\n人們是如此稱呼你 ${roleDef.name}`;
          colorTag = "red";
        } else {
          flavor = roleDef.flavor || `你是這迷霧重重的黑鍾鎮中，尋求真相與希望的光芒\n人們是如此稱呼你 ${roleDef.name}`;
          colorTag = "blue";
        }

        let chatMsg = `[${colorTag}]${flavor}[/${colorTag}]\n\n你是黑鍾鎮的 - ${roleDef.name}\n\n你的能力是 - ${roleDef.ability}`;

        if (settings?.evilKnowsEachOther && (roleDef.type === 'demon' || roleDef.type === 'minion')) {
          chatMsg += `\n\n【邪惡陣營資訊】\n`;
          evilPlayers.forEach(e => {
             const eRole = script?.roles.find((r: any) => r.id === e.roleId);
             chatMsg += `第 ${e.seat} 號座位：${e.name} (${eRole ? eRole.name : '未知'})\n`;
          });
          if (roleDef.type === 'demon' && bluffs && bluffs.length > 0) {
             const bluffNames = bluffs.map(b => script?.roles.find((r:any)=>r.id===b)?.name || b).filter(Boolean);
             chatMsg += `\n你的偽裝牌是：${bluffNames.join('、')}`;
          }
        }
        
        // Also send this chatMsg to the DM channel between hostId and uid
        if (hostId && hostId !== uid) {
          const uids = [uid, hostId].sort();
          const channelId = `dm_${uids[0]}_${uids[1]}`;
          updates[`rooms/${roomId}/messages/${channelId}/${Date.now()}_sys`] = {
            senderUid: 'system',
            senderName: '說書人',
            text: chatMsg,
            timestamp: Date.now()
          };
        }
        
        // Auto-populate the player's own seat note with their role
        updates[`rooms/${roomId}/private/notes/${uid}/${seat}`] = roleId;
      }
    } else {
      updates[`rooms/${roomId}/players/${uid}/roleId`] = null;
    }
  });
  
  await update(ref(db), updates);
};

export const recallRoles = async (roomId: string, players: Record<string, any>) => {
  const updates: Record<string, any> = {};
  Object.keys(players).forEach(uid => {
    updates[`rooms/${roomId}/players/${uid}/roleId`] = null;
    updates[`rooms/${roomId}/private/notes/${uid}`] = null; // Clear all notes or just their own seat? Let's just clear roleId. Wait, better clear all notes? The user said "玩家的座位也自動放上...". If we recall roles, maybe they want to clear their role from the notes. I'll just clear the roleId from players so it counts as recalled.
  });
  await update(ref(db), updates);
};

export const updateSeatStatus = async (roomId: string, seatIndex: number, status: Partial<import('../data/types').SeatStatus>) => {
  const currentRef = ref(db, `rooms/${roomId}/public/seatStatus/${seatIndex}`);
  const snapshot = await get(currentRef);
  const current = snapshot.val() || {};
  await update(ref(db), { [`rooms/${roomId}/public/seatStatus/${seatIndex}`]: { ...current, ...status } });
};

export const updateVotingState = async (roomId: string, stateUpdate: Partial<import('../data/types').VotingState>) => {
  const currentRef = ref(db, `rooms/${roomId}/public/votingState`);
  const snapshot = await get(currentRef);
  const current = snapshot.val() || {};
  await update(ref(db), { [`rooms/${roomId}/public/votingState`]: { ...current, ...stateUpdate } });
};

export const updatePlayerVote = async (roomId: string, userUid: string, vote: boolean) => {
  await update(ref(db), { [`rooms/${roomId}/public/votingState/votes/${userUid}`]: vote });
};


export const addVoteRecord = async (roomId: string, record: any) => {
  const currentRef = ref(db, `rooms/${roomId}/public/voteHistory`);
  const snapshot = await get(currentRef);
  const history = snapshot.val() || [];
  history.push(record);
  await update(ref(db), { [`rooms/${roomId}/public/voteHistory`]: history });
};
