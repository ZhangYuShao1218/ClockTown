import re
with open('src/components/game/GrimoireSettings.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace('}\n            \n            {renderSettingsBlock()}', '{renderSettingsBlock()}')

with open('src/components/game/GrimoireSettings.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
print("Fixed rogue }")
