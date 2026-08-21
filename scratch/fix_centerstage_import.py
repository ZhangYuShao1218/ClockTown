import re

with open('src/components/game/CenterStage.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace('import { RoleSelectionModal } from "./RoleSelectionModal";', 'import { RoleSelectionModal } from "./RoleSelectionModal";\nimport { AllRoles } from "../../data/roles";')

with open('src/components/game/CenterStage.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
