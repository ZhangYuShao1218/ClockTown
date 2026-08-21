import re

with open('src/components/game/Grimoire.tsx', 'r', encoding='utf-8') as f:
    c = f.read()

c = c.replace('const isDead = grimoireState?.[seatIndex]?.isDead;', 'const isDead = (grimoireState?.[seatIndex] as any)?.isDead;')

with open('src/components/game/Grimoire.tsx', 'w', encoding='utf-8') as f:
    f.write(c)
