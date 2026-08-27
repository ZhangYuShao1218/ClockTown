import re
with open('src/components/game/RoleSelectionModal.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace('maxWidth="max-w-2xl"', '')

with open('src/components/game/RoleSelectionModal.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
