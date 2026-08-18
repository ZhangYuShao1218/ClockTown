---
name: "Firebase Realtime DB Best Practices"
description: "Rules for interacting with Firebase Realtime Database."
trigger: "always_on"
---

# Firebase Best Practices
1. **防止記憶體流失 (Memory Leaks)**:
   - 在使用 Firebase Realtime Database 監聽器 (`onValue`, `onChildAdded` 等) 時，**絕對必須**在 `useEffect` 的 Cleanup Function 中進行註銷 (`off()` 或呼叫 unsubscribe function)。
   - 錯誤範例：只寫 `onValue` 不處理 unmount。
   - 正確範例：`const unsubscribe = onValue(...); return () => unsubscribe();`

2. **扁平化資料結構 (Flat Data Structure)**:
   - Realtime Database 是 JSON 樹，避免過深的巢狀結構以優化效能並簡化 Security Rules。
   - 將玩家資料、房間狀態、聊天訊息分成各自扁平的列表儲存，使用 ID 進行關聯，而不是將所有東西包在一個巨大的 Room Object 內。

3. **環境變數管理**:
   - 永遠不要在程式碼中硬編碼 Firebase 配置字串。使用 `import.meta.env` (Vite) 讀取 `.env` 變數。

4. **安全防護 (Security by Obscurity/Auth)**:
   - 對於隱私資料，強制透過 `public` 與 `private` 路徑區隔，並為未來的 Firebase Anonymous Auth 與 Security Rules 預留設計空間。
