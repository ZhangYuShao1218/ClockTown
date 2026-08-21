import re
with open('src/data/roles.ts', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace('className=\\"text-[#1F497D] font-bold\\"', 'style=\\"color: #1F497D; font-weight: bold;\\"')
content = content.replace('className=\\"text-[#C00000] font-bold\\"', 'style=\\"color: #C00000; font-weight: bold;\\"')

with open('src/data/roles.ts', 'w', encoding='utf-8') as f:
    f.write(content)
print('Updated roles.ts with inline styles.')
