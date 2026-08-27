import re

with open('src/components/game/CenterStage.tsx', 'r', encoding='utf-8') as f:
    text = f.read()

# Fix setSeatNotes error
text = text.replace('setSeatNotes({});\n', '')

# Fix setHoveredRoleTooltip unused (means the circle didn't match!)
# Let's just use a more robust regex for CenterStage
pattern = r'(className=\{`relative w-full h-full rounded-full border-4 flex items-center justify-center shadow-lg transition-transform overflow-hidden cursor-pointer pointer-events-auto \$\{)'
replacement = r'onMouseEnter={(e) => { if (guessedRole) { const rect = e.currentTarget.getBoundingClientRect(); setHoveredRoleTooltip({ role: guessedRole, x: rect.left + rect.width / 2, y: rect.bottom }); } }} onMouseLeave={() => setHoveredRoleTooltip(null)}\n                    \1'
text = re.sub(pattern, replacement, text)
with open('src/components/game/CenterStage.tsx', 'w', encoding='utf-8') as f:
    f.write(text)

with open('src/components/game/Grimoire.tsx', 'r', encoding='utf-8') as f:
    text = f.read()
pattern_g = r'(className=\{`w-full h-full rounded-full border-4 flex items-center justify-center shadow-2xl relative overflow-hidden bg-black/90 transition-colors \$\{role \?)'
replacement_g = r'onMouseEnter={(e) => { if (role) { const rect = e.currentTarget.getBoundingClientRect(); setHoveredRoleTooltip({ role: role, x: rect.left + rect.width / 2, y: rect.bottom }); } }} onMouseLeave={() => setHoveredRoleTooltip(null)}\n                    \1'
text = re.sub(pattern_g, replacement_g, text)
with open('src/components/game/Grimoire.tsx', 'w', encoding='utf-8') as f:
    f.write(text)

with open('src/components/game/Room.tsx', 'r', encoding='utf-8') as f:
    text = f.read()
text = re.sub(r'const uid =.*?\n', '', text)
text = re.sub(r'const p =.*?\n', '', text)
text = text.replace("Object.entries(players).map(([uid, p]: [string, any]) => ({ uid, ...p }))", "Object.entries(players).map(([uid_str, p]: [string, any]) => ({ uid: uid_str, ...(p || {}) }))")
with open('src/components/game/Room.tsx', 'w', encoding='utf-8') as f:
    f.write(text)
    
with open('src/components/layout/Lobby.tsx', 'r', encoding='utf-8') as f:
    text = f.read()
text = text.replace("import { ref, get, query, orderByChild } from \"firebase/database\";", "import { ref, get, query } from \"firebase/database\";")
with open('src/components/layout/Lobby.tsx', 'w', encoding='utf-8') as f:
    f.write(text)
    
with open('src/lib/testUtils.ts', 'r', encoding='utf-8') as f:
    text = f.read()
text = text.replace("import { ref, push, set, update, get } from \"firebase/database\";", "import { ref, set, update, get } from \"firebase/database\";")
with open('src/lib/testUtils.ts', 'w', encoding='utf-8') as f:
    f.write(text)
