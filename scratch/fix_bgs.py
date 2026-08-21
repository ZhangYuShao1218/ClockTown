import re
import os

files_to_update = [
    'src/components/game/Grimoire.tsx',
    'src/components/game/CenterStage.tsx',
    'src/components/game/GrimoireSettings.tsx',
    'src/components/game/ScriptInfoModal.tsx'
]

for filepath in files_to_update:
    if os.path.exists(filepath):
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        content = content.replace('bg-[#E6B94E]', 'bg-[radial-gradient(circle_at_center,_#f4e5c5_0%,_#dcb37b_100%)]')
        
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
print('Updated backgrounds to parchment style.')
