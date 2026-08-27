import re

# 1. CenterStage.tsx
with open('src/components/game/CenterStage.tsx', 'r', encoding='utf-8') as f:
    text = f.read()

# Fix seatNotes unused
text = re.sub(r'const \[seatNotes, setSeatNotes\] = useState<Record<number, string>>\(\{\}\);\n', '', text)
text = re.sub(r'const saved = localStorage\.getItem\(`botc_notes_\$\{userUid\}`\);\n\s*if \(saved\) \{\n\s*try \{ setSeatNotes\(JSON\.parse\(saved\)\); \} catch \(e\) \{\}\n\s*\}\n', '', text)

# Fix hoveredRole unused -> apply onMouseEnter to circle
bad_circle = """                  <div 
                    className={`relative w-full h-full rounded-full border-4 flex items-center justify-center shadow-lg transition-transform overflow-hidden cursor-pointer pointer-events-auto ${"""
good_circle = """                  <div 
                    onMouseEnter={(e) => {
                      if (guessedRole) {
                        const rect = e.currentTarget.getBoundingClientRect();
                        setHoveredRoleTooltip({ role: guessedRole, x: rect.left + rect.width / 2, y: rect.bottom });
                      }
                    }}
                    onMouseLeave={() => setHoveredRoleTooltip(null)}
                    className={`relative w-full h-full rounded-full border-4 flex items-center justify-center shadow-lg transition-transform overflow-hidden cursor-pointer pointer-events-auto ${"""
text = text.replace(bad_circle, good_circle)

with open('src/components/game/CenterStage.tsx', 'w', encoding='utf-8') as f:
    f.write(text)

# 2. Grimoire.tsx
with open('src/components/game/Grimoire.tsx', 'r', encoding='utf-8') as f:
    text = f.read()
bad_circle_g = """                  <div className={`w-full h-full rounded-full border-4 flex items-center justify-center shadow-2xl relative overflow-hidden bg-black/90 transition-colors ${role ? (isEvil ? 'border-red-900 hover:border-red-500 shadow-[0_0_15px_rgba(220,38,38,0.3)]' : 'border-blue-900 hover:border-blue-500 shadow-[0_0_15px_rgba(37,99,235,0.3)]') : 'border-white/20 hover:border-white/50'}`}>"""
good_circle_g = """                  <div 
                    onMouseEnter={(e) => {
                      if (role) {
                        const rect = e.currentTarget.getBoundingClientRect();
                        setHoveredRoleTooltip({ role: role, x: rect.left + rect.width / 2, y: rect.bottom });
                      }
                    }}
                    onMouseLeave={() => setHoveredRoleTooltip(null)}
                    className={`w-full h-full rounded-full border-4 flex items-center justify-center shadow-2xl relative overflow-hidden bg-black/90 transition-colors ${role ? (isEvil ? 'border-red-900 hover:border-red-500 shadow-[0_0_15px_rgba(220,38,38,0.3)]' : 'border-blue-900 hover:border-blue-500 shadow-[0_0_15px_rgba(37,99,235,0.3)]') : 'border-white/20 hover:border-white/50'}`}>"""
text = text.replace(bad_circle_g, good_circle_g)

with open('src/components/game/Grimoire.tsx', 'w', encoding='utf-8') as f:
    f.write(text)

# 3. Room.tsx
with open('src/components/game/Room.tsx', 'r', encoding='utf-8') as f:
    text = f.read()
text = text.replace("Object.entries(players).map(([uid, p]: [string, any]) => ({ uid, ...p }))", "Object.entries(players).map(([uid_str, p]: [string, any]) => ({ uid: uid_str, ...(p || {}) }))")
with open('src/components/game/Room.tsx', 'w', encoding='utf-8') as f:
    f.write(text)

# 4. Lobby.tsx
with open('src/components/layout/Lobby.tsx', 'r', encoding='utf-8') as f:
    text = f.read()
text = text.replace("import { ref, get, query, orderByChild } from \"firebase/database\";", "import { ref, get, query } from \"firebase/database\";")
with open('src/components/layout/Lobby.tsx', 'w', encoding='utf-8') as f:
    f.write(text)

# 5. testUtils.ts
with open('src/lib/testUtils.ts', 'r', encoding='utf-8') as f:
    text = f.read()
text = text.replace("import { ref, push, set, update, get } from \"firebase/database\";", "import { ref, set, update, get } from \"firebase/database\";")
with open('src/lib/testUtils.ts', 'w', encoding='utf-8') as f:
    f.write(text)
