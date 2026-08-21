import re

with open('src/components/game/Grimoire.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

content = re.sub(r'  const onDragOver = .*?;\n', '', content)
content = re.sub(r'  const onDrop = .*?;\n  };\n', '', content, flags=re.DOTALL)
content = re.sub(r'  const onRemoveRole = .*?;\n  };\n', '', content, flags=re.DOTALL)
content = re.sub(r'  const onDropBluff = .*?;\n  };\n', '', content, flags=re.DOTALL)
content = re.sub(r'  const onRemoveBluff = .*?;\n  };\n', '', content, flags=re.DOTALL)
content = re.sub(r'  const onDropFabled = .*?;\n  };\n', '', content, flags=re.DOTALL)

with open('src/components/game/Grimoire.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print('Cleaned up unused functions in Grimoire.tsx')
