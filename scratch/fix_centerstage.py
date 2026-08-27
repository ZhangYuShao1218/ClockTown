import re

with open('src/components/game/CenterStage.tsx', 'r', encoding='utf-8') as f:
    text = f.read()

# Import
text = text.replace('import { RoleSelectionModal } from "./RoleSelectionModal";', 'import { RoleSelectionModal } from "./RoleSelectionModal";\nimport { loadSeatRoleNotes, saveSeatRoleNotes, clearSeatRoleNotes } from "../../lib/localData";')

# Handle clear
clear_logic = """      const handleClear = () => {
      setSeatRoleNotes({});
      if (userUid && roomId) {
        clearSeatRoleNotes(roomId, userUid);
      }
    };"""
text = re.sub(r'      const handleClear = \(\) => \{\n\s*setSeatRoleNotes\(\{\}\);\n\s*if \(userUid\) \{\n\s*localStorage\.removeItem\(`botc_role_notes_\$\{userUid\}`\);\n\s*localStorage\.removeItem\(`botc_notes_\$\{userUid\}`\);\n\s*\}\n\s*\};', clear_logic, text)

# Handle load
load_logic = """  useEffect(() => {
    if (!userUid || !roomId) return;
    const saved = loadSeatRoleNotes(roomId, userUid);
    setSeatRoleNotes(saved);
  }, [userUid, roomId]);"""
text = re.sub(r'  useEffect\(\(\) => \{\n\s*if \(\!userUid\) return;\n\s*const saved = localStorage\.getItem\(`botc_role_notes_\$\{userUid\}`\);\n\s*if \(saved\) \{\n\s*try \{ setSeatRoleNotes\(JSON\.parse\(saved\)\); \} catch \(e\) \{\}\n\s*\}\n\s*\}, \[userUid\]\);', load_logic, text)

# Handle save
text = text.replace('localStorage.setItem(`botc_role_notes_${userUid}`, JSON.stringify(newNotes));', 'saveSeatRoleNotes(roomId, userUid, newNotes);')

with open('src/components/game/CenterStage.tsx', 'w', encoding='utf-8') as f:
    f.write(text)
