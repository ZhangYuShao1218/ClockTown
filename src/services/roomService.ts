import { ref, set, get, update } from "firebase/database";
import { db } from "./firebase";

// 產生隨機 4 位英數房號
const generateRoomId = () => {
  return Math.random().toString(36).substring(2, 6).toUpperCase();
};

export const createRoom = async (hostId: string, hostName: string): Promise<string> => {
  const roomId = generateRoomId();
  const roomRef = ref(db, `rooms/${roomId}`);
  
  // 檢查房號是否重複 (極小機率)
  const snapshot = await get(roomRef);
  if (snapshot.exists()) {
    return createRoom(hostId, hostName); 
  }

  // 遵循 Firebase 規則：扁平化資料結構
  const initialRoomState = {
    public: {
      status: "lobby", // lobby, playing, finished
      phase: "setup",  // setup, day, night
      hostId: hostId,
      createdAt: Date.now()
    },
    players: {
      [hostId]: {
        name: hostName,
        isHost: true,
        isAlive: true,
        hasGhostVote: true,
        seat: 0
      }
    },
    private: {
      // 之後可配合 Security Rules 隱藏此路徑下的資料
      [hostId]: { role: "storyteller" }
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
  if (roomData.public.status !== "lobby") {
    throw new Error("遊戲已經開始，無法加入。");
  }

  // 如果玩家已經在裡面（例如重新整理網頁），直接回傳成功
  if (roomData.players && roomData.players[userId]) {
    return roomId;
  }

  const currentPlayersCount = roomData.players ? Object.keys(roomData.players).length : 0;

  // 使用 update 更新，避免覆蓋其他玩家的資料
  const updates: Record<string, any> = {};
  updates[`rooms/${roomId}/players/${userId}`] = {
    name: userName,
    isHost: false,
    isAlive: true,
    hasGhostVote: true,
    seat: currentPlayersCount
  };

  await update(ref(db), updates);
  return roomId;
};
