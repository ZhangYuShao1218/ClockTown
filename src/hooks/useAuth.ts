import { useState, useEffect } from "react";
import type { User } from "firebase/auth";
import { auth, loginAnonymously } from "../services/firebase";

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 監聽 Firebase 登入狀態變化
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        setLoading(false);
      } else {
        // 若未登入，自動觸發匿名登入
        loginAnonymously().catch((err) => {
          console.error("匿名登入失敗:", err);
          setLoading(false);
        });
      }
    });

    // 遵守 Firebase Best Practices: 清除監聽器
    return () => unsubscribe();
  }, []);

  return { user, loading };
};
