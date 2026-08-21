import re

with open('src/components/game/GrimoireSettings.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

content = re.sub(r'  const onDragStart = .*?;\n  };\n\n', '', content, flags=re.DOTALL)
content = re.sub(r'        {script && \([\s\S]*?\n        \)}\n\n', '', content)

with open('src/components/game/GrimoireSettings.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print('Removed role library from GrimoireSettings')
