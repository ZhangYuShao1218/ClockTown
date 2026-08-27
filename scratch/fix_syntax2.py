import re
with open('src/components/game/CenterStage.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

content = re.sub(r'localStorage\.getItem\( otc_role_notes_\);', 'localStorage.getItem(`botc_role_notes_${userUid}`);', content)
content = re.sub(r'localStorage\.setItem\( otc_role_notes_, JSON\.stringify\(newNotes\)\);', 'localStorage.setItem(`botc_role_notes_${userUid}`, JSON.stringify(newNotes));', content)

with open('src/components/game/CenterStage.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print('Fixed it finally')
