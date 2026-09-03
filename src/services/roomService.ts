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
      settings: {
        evilKnowsEachOther: true,
        evilCanMsg: false,
        demonKnowsBluffs: true,
        minionKnowsBluffs: true,
        privateMsgMode: 'none', // 'none' | 'adjacent' | 'all'
      },
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
    // 標記為上線並允許進入，即使遊戲已經開始；
    // 順便補寫名字 —— 若先前的 entry 是被 sitDown 等操作建立、沒有 name，會導致座位空白 / 顯示「未知玩家」
    const patch: Record<string, any> = { [`rooms/${roomId}/players/${userId}/isOnline`]: true };
    if (userName && roomData.players[userId].name !== userName) {
      patch[`rooms/${roomId}/players/${userId}/name`] = userName;
    }
    await update(ref(db), patch);
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
    demonKnowsBluffs: true,
    minionKnowsBluffs: true,
    privateMsgMode: 'none', // 'none' | 'adjacent' | 'all'
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

export const updateFabledIndex = async (roomId: string, index: number, roleId: string | null) => {
  await update(ref(db), { [`rooms/${roomId}/public/fabled/${index}`]: roleId });
};

export const rotateGrimoireRoles = async (roomId: string, grimoireState: any, seatCount: number, direction: 'cw' | 'ccw') => {
  const updates: Record<string, any> = {};
  for (let i = 1; i <= seatCount; i++) {
    const sourceSeat = direction === 'cw' ? (i === 1 ? seatCount : i - 1) : (i === seatCount ? 1 : i + 1);
    updates[`rooms/${roomId}/private/grimoire/${i}`] = grimoireState[sourceSeat] || null;
  }
  await update(ref(db), updates);
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
        }

        // 偽裝牌：依「惡魔/爪牙得知偽裝」設定決定（不再依人數），預設開啟
        const knowsBluffs =
          (roleDef.type === 'demon' && settings?.demonKnowsBluffs !== false) ||
          (roleDef.type === 'minion' && settings?.minionKnowsBluffs !== false);
        if (knowsBluffs && bluffs && bluffs.length > 0) {
          const bluffNames = bluffs.map(b => script?.roles.find((r: any) => r.id === b)?.name || b).filter(Boolean);
          if (bluffNames.length > 0) {
            chatMsg += `\n\n你的偽裝牌是：${bluffNames.join('、')}`;
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

  // 如果有說書人，將鐘樓真相的角色與筆記帶入說書人的舞台中央
  if (hostId) {
    const hostNotes: Record<number, string> = {};
    Object.entries(grimoire || {}).forEach(([seat, g]: [string, any]) => {
      if (g?.roleId) {
        hostNotes[Number(seat)] = g.roleId;
      }
    });
    updates[`rooms/${roomId}/private/notes/${hostId}`] = hostNotes;

    // 複製說書人在真相的筆記標記到舞台中央
    const grimoireTokensSnapshot = await get(ref(db, `rooms/${roomId}/private/grimoireTokens/${hostId}`));
    const hostGrimoireTokens = grimoireTokensSnapshot.val() || null;
    updates[`rooms/${roomId}/private/seatTokens/${hostId}`] = hostGrimoireTokens;
  }
  
  // 標記角色已分配（鎖定會影響排版的說書人操作，直到收回角色）
  updates[`rooms/${roomId}/public/rolesDistributed`] = true;

  await update(ref(db), updates);

  // 記錄復盤事件
  import("./replayService").then(({ recordReplayEvent }) => {
    recordReplayEvent(roomId, {
      dayNumber: 1,
      timePhase: 'day',
      type: 'ROLE_ASSIGNED',
      title: '說書人分配角色',
      description: '說書人已完成全場座位角色與身分資訊發放。'
    }).catch(console.error);
  });
};

export const recallRoles = async (roomId: string, players: Record<string, any>) => {
  const updates: Record<string, any> = {};
  Object.keys(players).forEach(uid => {
    updates[`rooms/${roomId}/players/${uid}/roleId`] = null;
    updates[`rooms/${roomId}/private/notes/${uid}`] = null; // Clear all notes or just their own seat? Let's just clear roleId. Wait, better clear all notes? The user said "玩家的座位也自動放上...". If we recall roles, maybe they want to clear their role from the notes. I'll just clear the roleId from players so it counts as recalled.
  });
  updates[`rooms/${roomId}/public/rolesDistributed`] = false;
  await update(ref(db), updates);
};

export const updateSeatStatus = async (roomId: string, seatIndex: number, status: Partial<import('../data/types').SeatStatus>) => {
  const currentRef = ref(db, `rooms/${roomId}/public/seatStatus/${seatIndex}`);
  const snapshot = await get(currentRef);
  const current = snapshot.val() || {};
  await update(ref(db), { [`rooms/${roomId}/public/seatStatus/${seatIndex}`]: { ...current, ...status } });

  // 記錄復盤事件 (若生死狀態改變)
  if (status.isDead !== undefined) {
    import("./replayService").then(async ({ recordReplayEvent }) => {
      const [playersSnap, pubSnap] = await Promise.all([
        get(ref(db, `rooms/${roomId}/players`)),
        get(ref(db, `rooms/${roomId}/public`)),
      ]);
      const players = playersSnap.val() || {};
      const pub = pubSnap.val() || {};
      const seatLabel = String(seatIndex).padStart(2, '0');
      const player = Object.values(players).find((p: any) => p?.seat === seatIndex) as any;
      const name = player?.name || `${seatLabel} 號座位`;
      const day = pub.dayNumber || 1;
      const isNight = pub.timePhase === 'night';
      const phaseText = isNight ? '黑夜' : '白天';
      recordReplayEvent(roomId, {
        dayNumber: day,
        timePhase: isNight ? 'night' : 'day',
        type: 'DEATH_TOGGLE',
        title: status.isDead
          ? `${seatLabel}. ${name} 於第 ${day} 天${phaseText}死亡`
          : `${seatLabel}. ${name} 復活`,
        description: status.isDead
          ? `${seatLabel}. ${name} 於第 ${day} 天${phaseText}死亡。`
          : `${seatLabel}. ${name} 於第 ${day} 天${phaseText}被標記為存活。`,
      }).catch(console.error);
    });
  }
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

  // 記錄復盤事件
  import("./replayService").then(({ recordReplayEvent }) => {
    recordReplayEvent(roomId, {
      dayNumber: record.dayNumber || 1,
      timePhase: 'day',
      type: 'VOTE_RESULT',
      title: `投票結果：${record.nomineeName} (${record.totalVotes} 票)`,
      description: `${record.nominatorName} 提名 ${record.nomineeName}\n得票數：${record.totalVotes} 票。`
    }).catch(console.error);
  });
};

export const updateGameTime = async (roomId: string, dayNumber: number, timePhase: 'day' | 'night') => {
  await update(ref(db), { 
    [`rooms/${roomId}/public/dayNumber`]: dayNumber,
    [`rooms/${roomId}/public/timePhase`]: timePhase,
    [`rooms/${roomId}/public/isNight`]: timePhase === 'night' 
  });

  // 記錄復盤事件
  import("./replayService").then(({ recordReplayEvent }) => {
    recordReplayEvent(roomId, {
      dayNumber,
      timePhase,
      type: 'PHASE_CHANGE',
      title: `進入第 ${dayNumber} 天 - ${timePhase === 'night' ? '黑夜' : '白天'}`,
      description: `時間推進至第 ${dayNumber} 天 (${timePhase === 'night' ? '黑夜行動' : '白天公聊'})。`
    }).catch(console.error);
  });
};
