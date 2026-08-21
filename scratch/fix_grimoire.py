import re
with open('src/components/game/Grimoire.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace('onRemoveBluff(i)', 'setGrimoireBluff(roomId, i, null)')

with open('src/components/game/Grimoire.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
