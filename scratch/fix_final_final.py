import re

with open('src/components/game/RoleSelectionModal.tsx', 'r', encoding='utf-8') as f:
    c = f.read()
c = re.sub(r' maxWidth="max-w-[a-z0-9]+"', '', c)
with open('src/components/game/RoleSelectionModal.tsx', 'w', encoding='utf-8') as f:
    f.write(c)

with open('src/components/game/GrimoireSettings.tsx', 'r', encoding='utf-8') as f:
    c = f.read()
c = c.replace('import { AllRoles } from "../../data/roles";', '')
with open('src/components/game/GrimoireSettings.tsx', 'w', encoding='utf-8') as f:
    f.write(c)

with open('src/components/game/Room.tsx', 'r', encoding='utf-8') as f:
    c = f.read()
c = c.replace('<Grimoire \n                roomId={id!}', '<Grimoire \n                roomId={id!}\n                seatCount={seatCount}')
c = c.replace('<GrimoireSettings \n              roomId={id!}', '<GrimoireSettings \n              roomId={id!}\n              seatCount={seatCount}')
with open('src/components/game/Room.tsx', 'w', encoding='utf-8') as f:
    f.write(c)
