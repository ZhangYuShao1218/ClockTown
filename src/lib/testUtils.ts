import { ref, set, push } from "firebase/database";
import { db } from "../services/firebase";

// 隨機產生假玩家名稱
const fakeNames = ["艾莉絲", "鮑伯", "克萊兒", "大衛", "伊芙", "弗蘭克", "格蕾絲", "漢斯", "艾比", "傑克", "凱文", "莉莉"];

export const generateMockRoom = async () => {
  const roomId = Math.random().toString(36).substring(2, 6).toUpperCase();
  const roomRef = ref(db, `rooms/${roomId}`);
  
  const hostId = "mock-host-" + Date.now();
  
  // 建立房主與基本資料
  const players: Record<string, any> = {
    [hostId]: {
      name: "神秘說書人",
      isHost: true,
      isAlive: true,
      hasGhostVote: true,
      seat: 0
    }
  };

  // 加入 5-10 個隨機假玩家
  const playerCount = Math.floor(Math.random() * 6) + 5; 
  for (let i = 1; i <= playerCount; i++) {
    const fakeId = "mock-player-" + i + "-" + Date.now();
    players[fakeId] = {
      name: fakeNames[i % fakeNames.length] + (Math.floor(Math.random() * 100)),
      isHost: false,
      isAlive: Math.random() > 0.3, // 70% 機率活著
      hasGhostVote: true,
      seat: i
    };
  }

  const mockRoomState = {
    public: {
      status: "lobby", // 保持 lobby 這樣才能顯示在列表
      phase: "setup",
      hostId: hostId,
      createdAt: Date.now()
    },
    players: players,
    private: {
      [hostId]: { role: "storyteller" }
    }
  };

  await set(roomRef, mockRoomState);
  return roomId;
};

// 清空所有房間 (測試用)
export const clearAllRooms = async () => {
  const roomsRef = ref(db, "rooms");
  await set(roomsRef, null);
};
