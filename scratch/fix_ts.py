import re

# 1. Fix CenterStage.tsx
with open('src/components/game/CenterStage.tsx', 'r', encoding='utf-8') as f:
    text = f.read()

# Fix import
text = text.replace('import { useState, useEffect } from "react";', 'import { useState, useEffect } from "react";\nimport { createPortal } from "react-dom";')

# Fix seatCount error
text = text.replace("const count = typeof totalSeats !== 'undefined' ? totalSeats : seatCount;", "const count = totalSeats;")

# Remove unused
text = re.sub(r'const openNoteModal.*?\n', '', text)
text = re.sub(r'const handleNoteChange.*?\n', '', text)
text = re.sub(r'const isEmpty = !player;\n', '', text)

# Add mouse enter for tooltip
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

# 2. Fix Grimoire.tsx
with open('src/components/game/Grimoire.tsx', 'r', encoding='utf-8') as f:
    text = f.read()

# Fix totalSeats error
text = text.replace("const count = typeof totalSeats !== 'undefined' ? totalSeats : seatCount;", "const count = seatCount;")

# Add mouse enter for tooltip
bad_circle = """                  <div className={`w-full h-full rounded-full border-4 flex items-center justify-center shadow-2xl relative overflow-hidden bg-black/90 transition-colors ${role ? (isEvil ? 'border-red-900 hover:border-red-500 shadow-[0_0_15px_rgba(220,38,38,0.3)]' : 'border-blue-900 hover:border-blue-500 shadow-[0_0_15px_rgba(37,99,235,0.3)]') : 'border-white/20 hover:border-white/50'}`}>"""
good_circle = """                  <div 
                    onMouseEnter={(e) => {
                      if (role) {
                        const rect = e.currentTarget.getBoundingClientRect();
                        setHoveredRoleTooltip({ role: role, x: rect.left + rect.width / 2, y: rect.bottom });
                      }
                    }}
                    onMouseLeave={() => setHoveredRoleTooltip(null)}
                    className={`w-full h-full rounded-full border-4 flex items-center justify-center shadow-2xl relative overflow-hidden bg-black/90 transition-colors ${role ? (isEvil ? 'border-red-900 hover:border-red-500 shadow-[0_0_15px_rgba(220,38,38,0.3)]' : 'border-blue-900 hover:border-blue-500 shadow-[0_0_15px_rgba(37,99,235,0.3)]') : 'border-white/20 hover:border-white/50'}`}>"""
text = text.replace(bad_circle, good_circle)

with open('src/components/game/Grimoire.tsx', 'w', encoding='utf-8') as f:
    f.write(text)

# 3. Fix Room.tsx
with open('src/components/game/Room.tsx', 'r', encoding='utf-8') as f:
    text = f.read()

text = re.sub(r'const \[rightTab, setRightTab\] = useState<\'observers\' \| \'chat\'>\(\'chat\'\);\n', '', text)
text = text.replace("players={Object.entries(players).map(([uid, p]: [string, any]) => ({ uid, ...p }))}", "players={Object.entries(players).map(([uid_str, p]: [string, any]) => ({ uid: uid_str, ...p }))}")
with open('src/components/game/Room.tsx', 'w', encoding='utf-8') as f:
    f.write(text)

# 4. Fix Chat.tsx
with open('src/components/game/Chat.tsx', 'r', encoding='utf-8') as f:
    text = f.read()

text = text.replace(
    """  const messages = allMessages[activeChannelId] 
    ? Object.keys(allMessages[activeChannelId]).map(key => ({
        id: key,
        ...allMessages[activeChannelId][key]
      })).sort((a: any, b: any) => a.timestamp - b.timestamp)
    : [];""",
    """  const messages = allMessages[activeChannelId] 
    ? Object.keys(allMessages[activeChannelId]).map(key => ({
        ...allMessages[activeChannelId][key],
        id: key
      })).sort((a: any, b: any) => a.timestamp - b.timestamp)
    : [];"""
)

with open('src/components/game/Chat.tsx', 'w', encoding='utf-8') as f:
    f.write(text)

# 5. Fix Lobby.tsx & roomService.ts & testUtils
with open('src/components/layout/Lobby.tsx', 'r', encoding='utf-8') as f:
    t = f.read()
t = t.replace("import { ref, get, query, orderByChild } from \"firebase/database\";", "import { ref, get, query } from \"firebase/database\";")
with open('src/components/layout/Lobby.tsx', 'w', encoding='utf-8') as f:
    f.write(t)

with open('src/services/roomService.ts', 'r', encoding='utf-8') as f:
    t = f.read()
t = re.sub(r'const currentPlayersCount =.*?\n', '', t)
with open('src/services/roomService.ts', 'w', encoding='utf-8') as f:
    f.write(t)

with open('src/lib/testUtils.ts', 'r', encoding='utf-8') as f:
    t = f.read()
t = t.replace("import { ref, push, set, update, get } from \"firebase/database\";", "import { ref, set, update, get } from \"firebase/database\";")
with open('src/lib/testUtils.ts', 'w', encoding='utf-8') as f:
    f.write(t)
