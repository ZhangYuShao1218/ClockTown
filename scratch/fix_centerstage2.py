import re

with open('src/components/game/CenterStage.tsx', 'r', encoding='utf-8') as f:
    text = f.read()

# Fix handleClear
bad_clear = """  useEffect(() => {
    const handleClear = () => {
      setSeatRoleNotes({});
            if (userUid) {
        localStorage.removeItem(`botc_role_notes_${userUid}`);
        localStorage.removeItem(`botc_notes_${userUid}`);
      }
    };"""

good_clear = """  useEffect(() => {
    const handleClear = () => {
      setSeatRoleNotes({});
      if (userUid && roomId) {
        clearSeatRoleNotes(roomId, userUid);
      }
    };"""
text = text.replace(bad_clear, good_clear)

# Fix saveSeatRoleNotes userUid type
text = text.replace('saveSeatRoleNotes(roomId, userUid, newNotes);', 'if (userUid) saveSeatRoleNotes(roomId, userUid, newNotes);')

with open('src/components/game/CenterStage.tsx', 'w', encoding='utf-8') as f:
    f.write(text)
