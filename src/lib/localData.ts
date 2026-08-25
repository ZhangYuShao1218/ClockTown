const MAX_HISTORY = 10;

export const loadSeatRoleNotes = (roomId: string, userUid: string) => {
  const key = `botc_role_notes_${roomId}_${userUid}`;
  const saved = localStorage.getItem(key);
  if (saved) {
    try { return JSON.parse(saved); } catch (e) { return {}; }
  }
  return {};
};

export const saveSeatRoleNotes = (roomId: string, userUid: string, notes: any) => {
  const key = `botc_role_notes_${roomId}_${userUid}`;
  localStorage.setItem(key, JSON.stringify(notes));
  
  // Update history
  const historyKey = `botc_room_history_${userUid}`;
  let history: string[] = [];
  try { history = JSON.parse(localStorage.getItem(historyKey) || "[]"); } catch (e) {}
  
  if (!history.includes(roomId)) {
    history.push(roomId);
    if (history.length > MAX_HISTORY) {
      const oldestRoom = history.shift();
      localStorage.removeItem(`botc_role_notes_${oldestRoom}_${userUid}`);
    }
    localStorage.setItem(historyKey, JSON.stringify(history));
  }
};

export const clearSeatRoleNotes = (roomId: string, userUid: string) => {
  const key = `botc_role_notes_${roomId}_${userUid}`;
  localStorage.removeItem(key);
};
