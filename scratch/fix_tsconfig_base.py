import re

with open('tsconfig.app.json', 'r', encoding='utf-8') as f:
    text = f.read()

text = text.replace('    "baseUrl": ".",\n', '')
text = text.replace('    "ignoreDeprecations": "6.0",\n', '')

with open('tsconfig.app.json', 'w', encoding='utf-8') as f:
    f.write(text)
