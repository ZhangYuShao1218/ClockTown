import { useState, useEffect } from "react";
import { onValue } from "firebase/database";
import { nref } from "../services/firebase";

export const useGameState = (roomId: string | undefined) => {
  const [gameState, setGameState] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!roomId) {
      setLoading(false);
      return;
    }

    const roomRef = nref(`rooms/${roomId}`);
    
    // 遵守 Firebase Best Practices: 綁定 onValue
    const unsubscribe = onValue(
      roomRef,
      (snapshot) => {
        if (snapshot.exists()) {
          setGameState(snapshot.val());
          setError(null);
        } else {
          setGameState(null);
          setError("房間不存在");
        }
        setLoading(false);
      },
      (err) => {
        console.error("讀取房間狀態失敗:", err);
        setError(err.message);
        setLoading(false);
      }
    );

    // 遵守 Firebase Best Practices: 清除監聽器防止 Memory Leak
    return () => unsubscribe();
  }, [roomId]);

  return { gameState, loading, error };
};
