with open('src/components/game/CenterStage.tsx', 'r', encoding='utf-8') as f:
    c = f.read()
c = c.replace('.strip()', '.trim()')
with open('src/components/game/CenterStage.tsx', 'w', encoding='utf-8') as f:
    f.write(c)

with open('src/components/game/Grimoire.tsx', 'r', encoding='utf-8') as f:
    c = f.read()
c = c.replace('.strip()', '.trim()')
with open('src/components/game/Grimoire.tsx', 'w', encoding='utf-8') as f:
    f.write(c)
