import re

with open('src/services/roomService.ts', 'r', encoding='utf-8') as f:
    text = f.read()

# Replace EVERYTHING after the new distributeRoles with nothing if it's the duplicate
match = re.search(r'};\n\s*// First collect evil players\n', text)
if match:
    text = text[:match.start() + 3]

with open('src/services/roomService.ts', 'w', encoding='utf-8') as f:
    f.write(text)
