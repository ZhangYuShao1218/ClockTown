import re
with open('tsconfig.app.json', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace('"ignoreDeprecations": "5.0",', '"ignoreDeprecations": "6.0",')

with open('tsconfig.app.json', 'w', encoding='utf-8') as f:
    f.write(content)
print("fixed again")
